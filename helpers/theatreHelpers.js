const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = {
    doLogin: ({ email, password }) => {
        return new Promise(async (resolve, reject) => {
            const theatre = await db.get().collection(collection.THEATRE_COLLECTION).findOne({ email });
            if (theatre) {
                bcrypt.compare(password, theatre.password).then((status) => {
                    if (status) {
                        delete theatre.password
                        resolve({ status: true, theatre });
                    } else {
                        reject({ status: false, errMessage: 'Incorrect password.' });
                    }
                });
            } else {
                reject({ status: false, errMessage: 'Cannot find theatre.' });
            }
        });
    },
    updateOwnerPicture: (theatreId, ownerPicStatus) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.THEATRE_COLLECTION).updateOne({
                _id: ObjectID(theatreId)
            }, {
                $set: {
                    ownerPic: ownerPicStatus
                }
            }).then(async (response) => {
                const theatre = await db.get().collection(collection.THEATRE_COLLECTION).findOne({ _id: ObjectID(theatreId) });
                delete theatre.password;
                resolve({ theatre, alertMessage: 'Success.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Faild to update profile picture.' });
            });
        });
    },
    updateTheatreDetails: ({ ownerName, theatreName, email, phoneNumber }, theatreId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.THEATRE_COLLECTION).updateOne({
                _id: ObjectID(theatreId)
            }, {
                $set: {
                    ownerName,
                    theatreName,
                    email,
                    phoneNumber
                }
            }).then(async (response) => {
                const theatre = await db.get().collection(collection.THEATRE_COLLECTION).findOne({ _id: ObjectID(theatreId) });
                delete theatre.password;
                resolve({ theatre, alertMessage: 'Updated successfully.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to update theatre details.' });
            });
        });
    },
    changePassword: ({ password, newPassword, confirmPassword }, theatreId) => {
        return new Promise(async (resolve, reject) => {
            const theatre = await db.get().collection(collection.THEATRE_COLLECTION).findOne({ _id: ObjectID(theatreId) });
            bcrypt.compare(password, theatre.password).then(async (status) => {
                if (status) {
                    if (newPassword === confirmPassword) {
                        newPassword = await bcrypt.hash(newPassword, 10);
                        db.get().collection(collection.THEATRE_COLLECTION).updateOne({
                            _id: ObjectID(theatreId)
                        }, {
                            $set: {
                                password: newPassword
                            }
                        }).then((response) => {
                            resolve({ alertMessage: 'Password changed successfully' });
                        })
                    } else {
                        reject({ errMessage: "Entered passwords dosen't match" });
                    }
                } else {
                    reject({ errMessage: 'Incorrect password.' });
                }
            });
        });
    }
}