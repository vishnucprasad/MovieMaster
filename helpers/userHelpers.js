const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');
const { sendVerificationToken, checkVerificationToken } = require('../utils/verify');

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
    }
}