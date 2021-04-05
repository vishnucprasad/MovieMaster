const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');
const mailer = require('../utils/mailer');

module.exports = {
    doLogin: ({ email, password }) => {
        return new Promise(async (resolve, reject) => {
            const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email });
            if (admin) {
                bcrypt.compare(password, admin.password).then((status) => {
                    if (status) {
                        delete admin.password
                        resolve({ status: true, admin });
                    } else {
                        reject({ status: false, errMessage: 'Incorrect password.' });
                    }
                });
            } else {
                reject({ status: false, errMessage: 'Cannot find admin.' });
            }
        });
    },
    updateProfilePicture: (adminId, profilePicStatus) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({
                _id: ObjectID(adminId)
            }, {
                $set: {
                    profilePic: profilePicStatus
                }
            }).then(async (response) => {
                const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(adminId) });
                delete admin.password;
                resolve({ admin, alertMessage: 'Success.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Faild to update profile picture.' });
            });
        });
    },
    updateAdminDetails: ({ name, email, description }, adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({
                _id: ObjectID(adminId)
            }, {
                $set: {
                    name,
                    email,
                    description
                }
            }).then(async (response) => {
                const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(adminId) });
                delete admin.password;
                resolve({ status: true, admin, alertMessage: 'Updated successfully.' });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to update admin details.' });
            });
        });
    },
    changePassword: ({ password, newPassword, confirmPassword }, adminId) => {
        return new Promise(async (resolve, reject) => {
            const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(adminId) });
            bcrypt.compare(password, admin.password).then(async (status) => {
                if (status) {
                    if (newPassword === confirmPassword) {
                        newPassword = await bcrypt.hash(newPassword, 10);
                        db.get().collection(collection.ADMIN_COLLECTION).updateOne({
                            _id: ObjectID(adminId)
                        }, {
                            $set: {
                                password: newPassword
                            }
                        }).then((response) => {
                            resolve({ status: true, alertMessage: 'Password changed successfully' });
                        })
                    } else {
                        reject({ status: false, errMessage: "Entered passwords dosen't match" });
                    }
                } else {
                    reject({ status: false, errMessage: 'Incorrect password.' });
                }
            });
        });
    },
    addOwners: (ownerDetails) => {
        return new Promise(async (resolve, reject) => {
            const existingUser = await db.get().collection(collection.THEATRE_COLLECTION).findOne({ email: ownerDetails.email });

            if (existingUser) {
                reject({ errMessage: 'Already have an owner with this email, Please choose another email.' });
            } else {
                const password = Math.floor(100000 + Math.random() * 900000).toString();

                ownerDetails.password = await bcrypt.hash(password, 10);
                ownerDetails.dateCreated = new Date();
                ownerDetails.theatre = true;
                ownerDetails.status = 'Active';

                mailer.sendMail({
                    from: process.env.USER_EMAIL,
                    to: ownerDetails.email,
                    subject: 'Added your theatre to MovieMaster',
                    html: `<h1>Hello ${ownerDetails.ownerName},</h1><p>We added your theatre ${ownerDetails.theatreName} to MovieMaster. You can now login to your theatre panel using the following credentials.</p><h3>EMAIL: ${ownerDetails.email}</h3><h3>PASSWORD: ${password}</h3>`
                }).then((response) => {
                    db.get().collection(collection.THEATRE_COLLECTION).insertOne(ownerDetails).then((response) => {
                        resolve({ response, alertMessage: 'Successfully added and send credentials to owner.' });
                    }).catch((error) => {
                        reject({ error, errMessage: 'Failed to add owner details.' });
                    });
                }).catch((error) => {
                    reject({ error, errMessage: 'Failed to send credentials to owner.' });
                });
            }
        });
    },
    getOwners: () => {
        return new Promise(async (resolve, reject) => {
            const owners = await db.get().collection(collection.THEATRE_COLLECTION).find().toArray();
            resolve(owners);
        });
    },
    getOwner: (ownerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.THEATRE_COLLECTION).findOne({ _id: ObjectID(ownerId) }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject({ error, errMessage: 'Details not found.' });
            });
        });
    },
    editOwner: (ownerDetails) => {
        return new Promise(async (resolve, reject) => {
            const owner = await db.get().collection(collection.THEATRE_COLLECTION).findOne({ _id: ObjectID(ownerDetails.ownerId) });
            delete ownerDetails.ownerId;

            if (owner.email !== ownerDetails.email) {
                const password = Math.floor(100000 + Math.random() * 900000).toString();
                ownerDetails.password = await bcrypt.hash(password, 10);

                mailer.sendMail({
                    from: process.env.USER_EMAIL,
                    to: ownerDetails.email,
                    subject: 'Added your theatre to MovieMaster',
                    html: `<h1>Hello ${ownerDetails.ownerName},</h1><p>We added your theatre ${ownerDetails.theatreName} to MovieMaster. You can now login to your theatre panel using the following credentials.</p><h3>EMAIL: ${ownerDetails.email}</h3><h3>PASSWORD: ${password}</h3>`
                }).then((response) => {
                    db.get().collection(collection.THEATRE_COLLECTION).updateOne({
                        _id: ObjectID(owner._id)
                    }, {
                        $set: ownerDetails
                    }).then((response) => {
                        resolve({ response, alertMessage: 'Successfully updated and send credentials to owner.' });
                    }).catch((error) => {
                        reject({ error, errMessage: 'Failed to update.' });
                    });
                }).catch((error) => {
                    reject({ error, errMessage: 'Failed to send credentials to owner.' });
                });
            } else {
                db.get().collection(collection.THEATRE_COLLECTION).updateOne({
                    _id: ObjectID(owner._id)
                }, {
                    $set: ownerDetails
                }).then((response) => {
                    resolve({ response, alertMessage: 'Successfully updated.' });
                }).catch((error) => {
                    reject({ error, errMessage: 'Failed to update.' });
                });
            }
        });
    },
    deleteOwner: (ownerId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.THEATRE_COLLECTION).removeOne({ _id: ObjectID(ownerId) }).then((response) => {
                resolve({ status: true, alertMessage: 'Deleted Successfully.' });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to delete owner.' });
            })
        });
    },
    getNumberOfUsers: () => {
        return new Promise(async (resolve, reject) => {
            const totalUsers = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalUsers: { '$sum': '$sum' }
                    }
                }
            ]).toArray();
            if (totalUsers[0]) {
                resolve(totalUsers[0].totalUsers);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfTheaters: () => {
        return new Promise(async (resolve, reject) => {
            const totalTheaters = await db.get().collection(collection.THEATRE_COLLECTION).aggregate([
                {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTheaters: { '$sum': '$sum' }
                    }
                }
            ]).toArray();
            if (totalTheaters[0]) {
                resolve(totalTheaters[0].totalTheaters);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfActiveTheaters: () => {
        return new Promise(async (resolve, reject) => {
            const totalActiveTheaters = await db.get().collection(collection.THEATRE_COLLECTION).aggregate([
                {
                    $match: {
                        status: 'Active'
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalActiveTheaters: { '$sum': '$sum' }
                    }
                }
            ]).toArray();
            if (totalActiveTheaters[0]) {
                resolve(totalActiveTheaters[0].totalActiveTheaters);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfTheatersOnHold: () => {
        return new Promise(async (resolve, reject) => {
            const totalTheatersOnHold = await db.get().collection(collection.THEATRE_COLLECTION).aggregate([
                {
                    $match: {
                        status: 'Hold'
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalTheatersOnHold: { '$sum': '$sum' }
                    }
                }
            ]).toArray();
            if (totalTheatersOnHold[0]) {
                resolve(totalTheatersOnHold[0].totalTheatersOnHold);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfOrders: () => {
        return new Promise(async (resolve, reject) => {
            const totalOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { '$sum': '$sum' }
                    }
                }
            ]).toArray();
            if (totalOrders[0]) {
                resolve(totalOrders[0].totalOrders);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfPaidOrders: () => {
        return new Promise(async (resolve, reject) => {
            const totalPaidOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        status: 'booked'
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPaidOrders: { '$sum': '$sum' }
                    }
                }
            ]).toArray();
            if (totalPaidOrders[0]) {
                resolve(totalPaidOrders[0].totalPaidOrders);
            } else {
                resolve(0);
            }
        });
    },
    getUserData: () => {
        return new Promise(async (resolve, reject) => {
            const userData = await db.get().collection(collection.USER_COLLECTION).find().toArray();

            resolve(userData);
        });
    },
    deleteUser: ({ userId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).removeOne({ _id: ObjectID(userId) }).then((response) => {
                resolve({ status: true, alertMessage: 'Deleted successfully.', response });
            }).catch((error) => {
                reject({ status: false, errMessage: 'Failed to delete user.', error });
            });
        });
    },
    blockUser: ({ userId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $set: {
                    blocked: true
                }
            }).then((response) => {
                resolve({ status: true, alertMessage: 'Blocked successfully.', response });
            }).catch((error) => {
                reject({ status: false, errMessage: 'Failed to block user.', error });
            });
        });
    },
    unblockUser: ({ userId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $unset: {
                    blocked: true
                }
            }).then((response) => {
                resolve({ status: true, alertMessage: 'Unblocked successfully.', response });
            }).catch((error) => {
                reject({ status: false, errMessage: 'Failed to Unblock user.', error });
            });
        });
    },
    getUsers: () => {
        return new Promise(async (resolve, reject) => {
            const users = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.ORDER_COLLECTION,
                        let: { userList: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$userId', '$$userList']
                                    }
                                }
                            }, {
                                $sort: { orderDate: -1 }
                            }
                        ],
                        as: 'orderDetails'
                    }
                }
            ]).toArray();

            resolve(users);
        });
    },
    getNumberOfShows: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const totalShows = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        theatre: ObjectID(theatreId)
                    }
                }, {
                    $unwind: '$shows'
                }, {
                    $project: {
                        shows: '$shows'
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalShows: { '$sum': '$sum' }
                    }
                }
            ]).toArray();

            if (totalShows[0]) {
                resolve(totalShows[0].totalShows);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfScreens: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const totalScreens = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        theatre: ObjectID(theatreId)
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalScreens: { '$sum': '$sum' }
                    }
                }
            ]).toArray();

            if (totalScreens[0]) {
                resolve(totalScreens[0].totalScreens);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfBookings: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const totalBookings = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        'theatreDetails._id': ObjectID(theatreId)
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalBookings: { '$sum': '$sum' }
                    }
                }
            ]).toArray();

            if (totalBookings[0]) {
                resolve(totalBookings[0].totalBookings);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfPayedBookings: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const paidBookings = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        'theatreDetails._id': ObjectID(theatreId),
                        status: "booked"
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPayedBookings: { '$sum': '$sum' }
                    }
                }
            ]).toArray();

            if (paidBookings[0]) {
                resolve(paidBookings[0].totalPayedBookings);
            } else {
                resolve(0);
            }
        });
    },
    getNumberOfUnpayedBookings: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const paidBookings = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        'theatreDetails._id': ObjectID(theatreId),
                        status: "Payment Failed"
                    }
                }, {
                    $group: {
                        _id: '$_id',
                        'sum': { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPayedBookings: { '$sum': '$sum' }
                    }
                }
            ]).toArray();

            if (paidBookings[0]) {
                resolve(paidBookings[0].totalPayedBookings);
            } else {
                resolve(0);
            }
        });
    },
    getBookings: (year, month, day) => {
        console.log(year, month, day);
        return new Promise(async (resolve, reject) => {
            let bookings = [];
            for (i = 1; i <= parseInt(day); i++) {
                currentDay = i < 10 ? `0${i}` : i;

                const booking = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            orderDate: `${year}/${month}/${currentDay}`
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            'sum': { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalOrders: { '$sum': '$sum' }
                        }
                    }
                ]).toArray();
                if (booking[0]) {
                    bookings.push(booking[0].totalOrders);
                } else {
                    bookings.push(0);
                }
            };
            console.log(bookings);
            resolve(bookings);
        });
    },
    getTheatreBookings: (theatreId, year, month, day) => {
        console.log(year, month, day);
        return new Promise(async (resolve, reject) => {
            let bookings = [];
            for (i = 1; i <= parseInt(day); i++) {
                currentDay = i < 10 ? `0${i}` : i;

                const booking = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            'theatreDetails._id': ObjectID(theatreId),
                            orderDate: `${year}/${month}/${currentDay}`
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            'sum': { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalOrders: { '$sum': '$sum' }
                        }
                    }
                ]).toArray();
                if (booking[0]) {
                    bookings.push(booking[0].totalOrders);
                } else {
                    bookings.push(0);
                }
            };
            console.log(bookings);
            resolve(bookings);
        });
    }
}