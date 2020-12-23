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
    },
    addScreens: (screenDetails, theatreId) => {
        screenDetails.theatre = ObjectID(theatreId);

        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).insertOne(screenDetails).then((response) => {
                resolve({ data: response.ops[0], alertMessage: 'Added Successfully.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to add screen.' });
            });
        });
    },
    getAllScreens: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const screens = await db.get().collection(collection.SCREEN_COLLECTION).find({ theatre: ObjectID(theatreId) }).toArray();
            resolve(screens);
        });
    },
    getScreen: (screenId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).findOne({ _id: ObjectID(screenId) }).then((screen) => {
                resolve(screen);
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to find screen.' })
            });
        });
    },
    editScreen: (screenDetails) => {
        const screenId = screenDetails.screenId;
        delete screenDetails.screenId;
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).updateOne({
                _id: ObjectID(screenId)
            }, {
                $set: screenDetails
            }).then((response) => {
                resolve({ response, alertMessage: 'Successfully updated screen details.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to update screen details.' });
            })
        });
    },
    deleteScreen: (screenId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).removeOne({ _id: ObjectID(screenId) }).then((response) => {
                resolve({ status: true, alertMessage: 'Deleted Successfully.' });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to delete owner.' });
            })
        });
    },
    addMovies: (movieDetails, theatreId) => {
        movieDetails.theatre = ObjectID(theatreId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MOVIE_COLLECTION).insertOne(movieDetails).then((response) => {
                resolve({ data: response.ops[0], alertMessage: 'Movie added successfully.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to add movie.' });
            });
        });
    },
    getAllMovies: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const movies = await db.get().collection(collection.MOVIE_COLLECTION).find({ theatre: ObjectID(theatreId) }).toArray();
            resolve(movies);
        });
    },
    getMovie: (movieId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MOVIE_COLLECTION).findOne({ _id: ObjectID(movieId) }).then((movie) => {
                resolve(movie);
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to find movie.' });
            });
        });
    },
    editMovie: (movieDetails) => {
        const movieId = movieDetails.movieId;
        delete movieDetails.movieId;
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MOVIE_COLLECTION).updateOne({
                _id: ObjectID(movieId)
            }, {
                $set: movieDetails
            }).then((response) => {
                resolve({ response, movieId, alertMessage: 'Successfully updated movie details.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to update movie details.' });
            })
        });
    },
    deleteMovie: (movieId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MOVIE_COLLECTION).removeOne({ _id: ObjectID(movieId) }).then((response) => {
                resolve({ status: true, alertMessage: 'Deleted Successfully.' });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to delete movie.' });
            })
        });
    },
    addUpcomingMovies: (movieDetails, theatreId) => {
        movieDetails.theatre = ObjectID(theatreId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).insertOne(movieDetails).then((response) => {
                resolve({ data: response.ops[0], alertMessage: 'Movie added successfully.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to add movie.' });
            });
        });
    },
    getAllUpcomingMovies: (theatreId) => {
        return new Promise(async (resolve, reject) => {
            const movies = await db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).find({ theatre: ObjectID(theatreId) }).toArray();
            resolve(movies);
        });
    },
    getUpcomingMovie: (movieId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).findOne({ _id: ObjectID(movieId) }).then((movie) => {
                resolve(movie);
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to find movie.' });
            });
        });
    },
    editUpcomingMovie: (movieDetails) => {
        const movieId = movieDetails.movieId;
        delete movieDetails.movieId;
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).updateOne({
                _id: ObjectID(movieId)
            }, {
                $set: movieDetails
            }).then((response) => {
                resolve({ response, movieId, alertMessage: 'Successfully updated movie details.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failed to update movie details.' });
            })
        });
    },
    deleteUpcomingMovie: (movieId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.UPCOMINGMOVIE_COLLECTION).removeOne({ _id: ObjectID(movieId) }).then((response) => {
                resolve({ status: true, alertMessage: 'Deleted Successfully.' });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to delete movie.' });
            })
        });
    },
    addShows: (showDetails) => {
        const screenId = showDetails.screenId;
        delete showDetails.screenId;
        showDetails.movie = ObjectID(showDetails.movie);
        showDetails._id = new ObjectID();
        return new Promise(async (resolve, reject) => {
            const shows = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectID(screenId)
                    }
                }, {
                    $unwind: '$shows'
                }, {
                    $project: {
                        _id: '$shows._id',
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
                        from: collection.MOVIE_COLLECTION,
                        localField: 'movie',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                }
            ]).toArray();

            const scheduledTime = shows.filter((show) => {
                if (show.date == showDetails.date && parseInt(show.showTime) > (parseInt(showDetails.showTime) - 3)) {
                    return show;
                }
            });

            if (scheduledTime[0]) {
                reject({ screenId, errMessage: `This time slot is already taken please choose a time slot after ${parseInt(scheduledTime[0].showTime) + 3}:00` });
            } else {
                db.get().collection(collection.SCREEN_COLLECTION).updateOne({
                    _id: ObjectID(screenId)
                }, {
                    $push: {
                        shows: showDetails
                    }
                }).then((response) => {
                    resolve({ response, screenId, alertMessage: 'Show added successfully.' });
                }).catch((error) => {
                    reject({ error, screenId, errMessage: 'Failed to add show.' });
                });
            }
        });
    },
    getAllShows: (screenId) => {
        return new Promise(async (resolve, reject) => {
            const shows = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectID(screenId)
                    }
                }, {
                    $unwind: '$shows'
                }, {
                    $project: {
                        _id: '$shows._id',
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
                        from: collection.MOVIE_COLLECTION,
                        localField: 'movie',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                }
            ]).toArray();
            resolve(shows);
        });
    },
    getShow: ({ screenId, showId }) => {
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
                        _id: '$shows._id',
                        screen: '$_id',
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
    editShow: async (showDetails) => {
        return new Promise(async (resolve, reject) => {
            const shows = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectID(showDetails.screenId)
                    }
                }, {
                    $unwind: '$shows'
                }, {
                    $project: {
                        _id: '$shows._id',
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
                        from: collection.MOVIE_COLLECTION,
                        localField: 'movie',
                        foreignField: '_id',
                        as: 'movieDetails'
                    }
                }
            ]).toArray();

            const scheduledTime = shows.filter((show) => {
                if (show.date == showDetails.date && parseInt(show.showTime) > (parseInt(showDetails.showTime) - 3)) {
                    return show;
                }
            });

            if (scheduledTime[0]) {
                reject({ errMessage: `This time slot is already taken please choose a time slot after ${parseInt(scheduledTime[0].showTime) + 3}:00` });
            } else {
                db.get().collection(collection.SCREEN_COLLECTION).updateOne({
                    _id: ObjectID(showDetails.screenId),
                    'shows._id': ObjectID(showDetails.showId)
                }, {
                    $set: {
                        'shows.$.movie': ObjectID(showDetails.movie),
                        'shows.$.date': showDetails.date,
                        'shows.$.showTime': showDetails.showTime,
                        'shows.$.vip': showDetails.vip,
                        'shows.$.premium': showDetails.premium,
                        'shows.$.executive': showDetails.executive,
                        'shows.$.normal': showDetails.normal,
                        'shows.$.reservedSeats': []
                    }
                }).then((response) => {
                    resolve({ response, alertMessage: 'Successfully updated show details.' });
                }).catch((error) => {
                    reject({ error, errMessage: 'Failed to update show details.' });
                });
            }
        });
    },
    deleteShow: ({ screenId, showId }) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SCREEN_COLLECTION).updateOne({
                _id: ObjectID(screenId)
            }, {
                $pull: {
                    shows: { _id: ObjectID(showId) }
                }
            }).then((response) => {
                resolve({ status: true, alertMessage: 'Deleted Successfully.' });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to delete show.' });
            })
        });
    }
}