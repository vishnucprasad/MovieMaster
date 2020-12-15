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
            ]).sort({showTime: 1}).toArray();
            resolve(shows);
        });
    }
}