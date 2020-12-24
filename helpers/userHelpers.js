const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');
const mailer = require('../utils/mailer')
const { sendVerificationToken, checkVerificationToken } = require('../utils/verify');
var paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});
const Razorpay = require('razorpay');
const { resolve } = require('path');
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    doSignup: ({ name, contryCode, mobile }) => {
        return new Promise(async (resolve, reject) => {
            const mobileNumber = `${contryCode}${mobile}`
            const existingUser = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber });
            if (!existingUser) {
                sendVerificationToken(mobileNumber).then((verification) => {
                    db.get().collection(collection.USER_COLLECTION).insertOne({ name, mobileNumber }).then((response) => {
                        resolve(response.ops[0]);
                    }).catch((error) => {
                        reject({ error, errMessage: 'Signup Failed.' });
                    });
                }).catch((error) => {
                    reject({ error, errMessage: 'Failed to send verification code.' });
                });
            } else {
                reject({ errMessage: 'This number is already registered.' });
            }
        });
    },
    doLogin: ({ contryCode, mobile }) => {
        return new Promise(async (resolve, reject) => {
            const mobileNumber = `${contryCode}${mobile}`;
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber });

            if (user) {
                sendVerificationToken(mobileNumber).then((verification) => {
                    resolve(user);
                }).catch((error) => {
                    reject({ error, errMessage: 'Failed to send verification code.' });
                })
            } else {
                reject({ errMessage: 'Cannot find user.' });
            }
        });
    },
    verifyAccount: ({ mobile, OTP }) => {
        return new Promise((resolve, reject) => {
            checkVerificationToken({ mobile, OTP }).then((verification_check) => {
                if (verification_check.status === 'approved') {
                    db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber: mobile }).then((user) => {
                        resolve(user);
                    }).catch((error) => {
                        reject({ error, mobile, errMessage: 'Failed to get userDetails.' });
                    });
                } else if (verification_check.status === 'pending') {
                    reject({ error, mobile, errMessage: 'Invalid verification code.' });
                }
            }).catch((error) => {
                console.log(error);
                reject({ error, mobile, errMessage: 'Failed to check verification code.' });
            });
        });
    },
    getMovies: () => {
        return new Promise(async (resolve, reject) => {
            const movies = await db.get().collection(collection.MOVIE_COLLECTION).find().sort({ releaseDate: -1 }).limit(4).toArray();
            resolve(movies);
        });
    },
    getUpcomingMovies: () => {
        return new Promise(async (resolve, reject) => {
            const upcomingMovies = await db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).find().sort({ releaseDate: 1 }).limit(4).toArray();
            resolve(upcomingMovies);
        });
    },
    getallMovies: () => {
        return new Promise(async (resolve, reject) => {
            const movies = await db.get().collection(collection.MOVIE_COLLECTION).find().sort({ releaseDate: -1 }).toArray();
            resolve(movies);
        });
    },
    getallUpcomingMovies: () => {
        return new Promise(async (resolve, reject) => {
            const upcomingMovies = await db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).find().sort({ releaseDate: 1 }).toArray();
            resolve(upcomingMovies);
        });
    },
    getUpcomingMovie: (movieId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).findOne({ _id: ObjectID(movieId) }).then((movie) => {
                resolve(movie);
            }).catch((error) => {
                reject({ error, errMessage: 'Cannot find movie.' });
            })
        });
    },
    getMovie: (movieId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MOVIE_COLLECTION).findOne({ _id: ObjectID(movieId) }).then((movie) => {
                resolve(movie);
            }).catch((error) => {
                reject({ error, errMessage: 'Cannot find movie.' });
            })
        });
    },
    getMovieShows: (movieId, date) => {
        return new Promise(async (resolve, reject) => {
            const shows = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        'shows.movie': ObjectID(movieId)
                    }
                }, {
                    $unwind: '$shows'
                }, {
                    $match: {
                        'shows.movie': ObjectID(movieId),
                        'shows.date': date
                    }
                }, {
                    $project: {
                        theatre: '$theatre',
                        screen: '$_id',
                        screenName: '$screenName',
                        show: '$shows._id',
                        movie: '$shows.movie',
                        date: '$shows.date',
                        showTime: '$shows.showTime',
                        vip: '$shows.vip',
                        premium: '$shows.premium',
                        executive: '$shows.executive',
                        normal: '$shows.normal'
                    }
                }, {
                    $lookup: {
                        from: collection.THEATRE_COLLECTION,
                        localField: 'theatre',
                        foreignField: '_id',
                        as: 'theatreDetails'
                    }
                }, {
                    $lookup: {
                        from: collection.MOVIE_COLLECTION,
                        localField: 'movie',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                }
            ]).sort({ showTime: 1 }).toArray();
            resolve(shows);
        });
    },
    getShow: ({ showId, screenId }) => {
        return new Promise(async (resolve, reject) => {
            const show = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectID(screenId)
                    }
                }, {
                    $unwind: '$shows'
                }, {
                    $match: {
                        'shows._id': ObjectID(showId)
                    }
                }, {
                    $project: {
                        theatre: '$theatre',
                        screen: '$_id',
                        screenName: '$screenName',
                        seatArrangement: {
                            totalSeats: '$seats',
                            columns: '$seatColumn',
                            vipRows: '$vipRows',
                            premiumRows: '$premiumRows',
                            executiveRows: '$exicutiveRows'
                        },
                        show: '$shows._id',
                        movie: '$shows.movie',
                        date: '$shows.date',
                        showTime: '$shows.showTime',
                        vip: '$shows.vip',
                        premium: '$shows.premium',
                        executive: '$shows.executive',
                        normal: '$shows.normal',
                        reservedSeats: '$shows.reservedSeats'
                    }
                }, {
                    $lookup: {
                        from: collection.THEATRE_COLLECTION,
                        localField: 'theatre',
                        foreignField: '_id',
                        as: 'theatreDetails'
                    }
                }, {
                    $lookup: {
                        from: collection.MOVIE_COLLECTION,
                        localField: 'movie',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                }
            ]).toArray();
            resolve(show);
        });
    },
    searchMovie: ({ searchQuery }) => {
        return new Promise(async (resolve, reject) => {
            searchResult = await db.get().collection(collection.MOVIE_COLLECTION).find({
                movieTitle: {
                    $regex: new RegExp(searchQuery, 'i')
                }
            }).toArray();
            resolve(searchResult);
        });
    },
    placeOrder: ({ screenId, numberOfSeats, seats, totalAmount }, show, userId, { paymentMethod }) => {
        return new Promise((resolve, reject) => {
            const orderObject = {
                userId: ObjectID(userId),
                screenId: ObjectID(screenId),
                showDetails: {
                    _id: show[0].show,
                    screenName: show[0].screenName,
                    date: show[0].date,
                    showTime: show[0].showTime
                },
                theatreDetails: show[0].theatreDetails[0],
                movieDetails: show[0].movieDetails[0],
                numberOfSeats,
                seats: seats.split(','),
                totalAmount,
                paymentMethod,
                orderDate: new Date(),
                status: 'pending'
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObject).then((response) => {
                resolve(response.ops[0]);
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to place order.' });
            })
        });
    },
    getOrder: (orderId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({
                _id: ObjectID(orderId),
                userId: ObjectID(userId)
            }).then((order) => {
                resolve(order);
            }).catch((error) => {
                reject({ error, errMessage: 'Cannot find order.' })
            });
        });
    },
    generateRazorpay: (orderId, totalAmount) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalAmount * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId.toString()
            };
            instance.orders.create(options, function (error, order) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(order);
                    resolve(order)
                }
            });
        });
    },
    verifyRazorpayPayment: (paymentDetails) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');

            let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(paymentDetails['payment[razorpay_order_id]'] + '|' + paymentDetails['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex');

            if (hmac === paymentDetails['payment[razorpay_signature]']) {
                resolve({ status: true });
            } else {
                reject({ status: false, errMessage: 'Payment falied' });
            }
        });
    },
    createPaypal: (show, order) => {
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "ORDER",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": process.env.PAYPAL_RETURN_URL,
                    "cancel_url": process.env.PAYPAL_CANCEL_URL
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "001",
                            "price": order.totalAmount / order.numberOfSeats,
                            "currency": "INR",
                            "quantity": order.numberOfSeats
                        }]
                    },
                    "amount": {
                        "currency": "INR",
                        "total": order.totalAmount
                    },
                    "description": "MovieMaster ticket booking."
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    reject({ error, errMessage: 'Unable to make payment. Please Try again.' });
                } else {
                    db.get().collection(collection.ORDER_COLLECTION).updateOne({
                        _id: ObjectID(order._id)
                    }, {
                        $set: {
                            paymentId: payment.id
                        }
                    }).then((response) => {
                        const approvalLink = payment.links.filter(link => link.rel === 'approval_url');
                        resolve(approvalLink[0].href);
                    }).catch((error) => {
                        reject({ error, errMessage: 'Unable to make payment. Please Try again.' });
                    });
                }
            });
        });
    },
    getVerifiedPaypalOrder: (paymentId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).findOne({ paymentId }).then((order) => {
                resolve(order);
            }).catch((error) => {
                reject(error);
            });
        });
    },
    confirmOrder: (orderId, user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: ObjectID(orderId)
            }, {
                $set: {
                    status: 'booked'
                }
            }).then(async (response) => {
                const order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectID(orderId) });
                order.orderDate = `${order.orderDate.getFullYear()}-${order.orderDate.getMonth() + 1}-${order.orderDate.getDate()}`;
                db.get().collection(collection.SCREEN_COLLECTION).updateOne({
                    _id: ObjectID(order.screenId),
                    'shows._id': ObjectID(order.showDetails._id)
                }, {
                    $push: {
                        'shows.$.reservedSeats': { $each: order.seats }
                    }
                }).then((response) => {
                    if (user.email) {
                        mailer.sendMail({
                            from: process.env.USER,
                            to: user.email,
                            subject: 'Ticket Booked Successfully',
                            template: 'templates/ticket',
                            context: { order }
                        }).then((response) => {
                            console.log(response);
                            resolve(response);
                        }).catch((error) => {
                            console.log(error);
                            reject(error);
                        });
                    } else {
                        resolve(response);
                    }
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    },
    getAllOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            const orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: ObjectID(userId) }).sort({ orderDate: -1 }).toArray();
            resolve(orders);
        });
    },
    updateProfilePicture: (userId, url) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $set: {
                    profilePic: url
                }
            }).then(async (response) => {
                resolve({ alertMessage: 'Successfully updated.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Faild to update profile picture.' });
            });
        });
    },
    updateProfileInfo: (userData, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: ObjectID(userId)
            }, {
                $set: userData
            }).then((response) => {
                resolve({ status: true, response, alertMessage: 'Successfully updated.' });
            }).catch((error) => {
                reject({ status: false, errMessage: 'Failed to update user info' });
            });
        });
    },
    updateMobile: ({ contryCode, mobile }, userId) => {
        return new Promise((resolve, reject) => {
            const mobileNumber = mobile.substr(0, 3) === '+91' ? mobile : `${contryCode}${mobile}`;

            sendVerificationToken(mobileNumber).then((verification) => {
                resolve(mobileNumber);
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to send verification code.' });
            });
        });
    },
    verifyMobile: ({ mobile, OTP }, userId) => {
        return new Promise((resolve, reject) => {
            checkVerificationToken({ mobile, OTP }).then((verification_check) => {
                if (verification_check.status === 'approved') {
                    db.get().collection(collection.USER_COLLECTION).updateOne({
                        _id: ObjectID(userId)
                    }, {
                        $set: {
                            mobileNumber: mobile
                        }
                    }).then((response) => {
                        resolve({ status: true, response, alertMessage: 'Successfully updated.' });
                    }).catch((error) => {
                        reject({ status: false, error, mobileNumber: mobile, errMessage: 'Failed to update.' });
                    });
                } else if (verification_check.status === 'pending') {
                    reject({ status: false, mobileNumber: mobile, errMessage: 'Invalid verification code.' });
                }
            }).catch((error) => {
                reject({ status: false, error, mobileNumber: mobile, errMessage: 'Failed to check verification code.' });
            });
        });
    }
}