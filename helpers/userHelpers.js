const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');
const axios = require('axios');
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
    doSignup: ({ name, email, contryCode, mobile }) => {
        return new Promise(async (resolve, reject) => {
            const mobileNumber = `${contryCode}${mobile}`
            const existingUser = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber });
            if (!existingUser) {
                sendVerificationToken(mobileNumber).then((verification) => {
                    db.get().collection(collection.USER_COLLECTION).insertOne({ name, email, mobileNumber }).then((response) => {
                        resolve({ status: true, user: response.ops[0] });
                    }).catch((error) => {
                        reject({ status: false, error, errMessage: 'Signup Failed.' });
                    });
                }).catch((error) => {
                    reject({ status: false, error, errMessage: 'Failed to send verification code.' });
                });
            } else {
                reject({ status: false, errMessage: 'This number is already registered.' });
            }
        });
    },
    doLogin: ({ contryCode, mobile }) => {
        return new Promise(async (resolve, reject) => {
            const mobileNumber = `${contryCode}${mobile}`;
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber });

            if (user) {
                sendVerificationToken(mobileNumber).then((verification) => {
                    resolve({ status: true, user });
                }).catch((error) => {
                    reject({ status: false, error, errMessage: 'Failed to send verification code.' });
                })
            } else {
                reject({ status: false, errMessage: 'Cannot find user.' });
            }
        });
    },
    verifyAccount: ({ mobile, OTP }) => {
        return new Promise((resolve, reject) => {
            checkVerificationToken({ mobile, OTP }).then((verification_check) => {
                if (verification_check.status === 'approved') {
                    db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber: mobile }).then((user) => {
                        resolve({ status: true, user });
                    }).catch((error) => {
                        reject({ status: false, error, mobile, errMessage: 'Failed to get userDetails.' });
                    });
                } else if (verification_check.status === 'pending') {
                    reject({ status: false, error, mobile, errMessage: 'Invalid verification code.' });
                }
            }).catch((error) => {
                console.log(error);
                reject({ status: false, error, mobile, errMessage: 'Failed to check verification code.' });
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
    getTheatersByDistance: (movieId, year, month, day, coordinates) => {
        return new Promise(async (resolve, reject) => {
            month = month < 10 ? `0${month}` : month;
            day = day < 10 ? `0${day}` : day;

            const date = `${year}-${month}-${day}`;

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
                    }
                }, {
                    $lookup: {
                        from: collection.THEATRE_COLLECTION,
                        localField: 'theatre',
                        foreignField: '_id',
                        as: 'theatreDetails'
                    }
                }
            ]).sort({ showTime: 1 }).toArray();

            if (shows[0]) {
                let showsWithDistance = [];
                shows.forEach(show => {
                    const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + coordinates[0] + ',' + coordinates[1] + ';' + show.theatreDetails[0].location.longitude + ',' + show.theatreDetails[0].location.latitude + '?steps=true&geometries=geojson&access_token=' + process.env.MAPBOX_GL_ACCESS_TOKEN;

                    axios.get(url).then((response) => {
                        const data = response.data.routes[0];
                        const route = data.geometry.coordinates;
                        const geojson = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: route
                            }
                        };
                        data.distance = parseInt(data.distance / 1000);
                        show.geolocationData = data;
                        show.geojson = geojson;
                        showsWithDistance.push(show);
                    });
                });

                const refreshInterval = setInterval(() => {
                    if (showsWithDistance.length === shows.length) {
                        showsWithDistance.sort((a, b) => {
                            return a.geolocationData.distance - b.geolocationData.distance;
                        });

                        let theaters = [];
                        let uniqueObject = {};

                        for (let i in showsWithDistance) {
                            objTheatre = showsWithDistance[i]['theatre'];
                            uniqueObject[objTheatre] = showsWithDistance[i];
                        }

                        for (i in uniqueObject) {
                            theaters.push(uniqueObject[i]);
                        }

                        resolve(theaters);
                        stopRefresh();
                    }
                }, 100);

                const stopRefresh = () => clearInterval(refreshInterval);
            } else {
                resolve(shows);
            }
        });
    },
    getMovieShows: (movieId, theatreId, year, month, day) => {
        return new Promise(async (resolve, reject) => {
            month = month < 10 ? `0${month}` : month;
            day = day < 10 ? `0${day}` : day;

            const date = `${year}-${month}-${day}`;

            const shows = await db.get().collection(collection.SCREEN_COLLECTION).aggregate([
                {
                    $match: {
                        theatre: ObjectID(theatreId),
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
                        totalSeats: '$seats',
                        reservedSeats: '$shows.reservedSeats',
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
            shows.forEach(show => {
                show.reservedSeats = show.reservedSeats ? show.reservedSeats.length : 0;
            });
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
                status: 'Payment Failed'
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
                            from: process.env.USER_EMAIL,
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
            orders.forEach(order => {
                const year = order.orderDate.getFullYear();
                const month = order.orderDate.getMonth() + 1 < 10 ? `0${order.orderDate.getMonth() + 1}` : order.orderDate.getMonth() + 1;
                const day = order.orderDate.getDate() < 10 ? `0${order.orderDate.getDate()}` : order.orderDate.getDate();

                const hour = order.orderDate.getHours() < 10 ? `0${order.orderDate.getHours()}` : order.orderDate.getHours();
                const minute = order.orderDate.getMinutes() < 10 ? `0${order.orderDate.getMinutes()}` : order.orderDate.getMinutes();

                order.orderDate = `${year}-${month}-${day} - ${hour} : ${minute}`;
            });
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
                resolve({ status: true, mobileNumber });
            }).catch((error) => {
                reject({ status: false, error, errMessage: 'Failed to send verification code.' });
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
    },
    sendTicket: (order, email) => {
        return new Promise((resolve, reject) => {
            mailer.sendMail({
                from: process.env.USER_EMAIL,
                to: email,
                subject: 'Ticket Booked Successfully',
                template: 'templates/ticket',
                context: { order }
            }).then((response) => {
                console.log(response);
                resolve({ status: true, response, alertMessage: `Successfully sent ticket to ${email}.` });
            }).catch((error) => {
                console.log(error);
                reject({ status: false, error, errMessage: 'Failed to send ticket.' });
            });
        });
    },
    getTheatreLocations: () => {
        return new Promise(async (resolve, reject) => {
            const features = await db.get().collection(collection.THEATRE_COLLECTION).aggregate([
                {
                    $project: {
                        _id: 0,
                        location: 1,
                        theatreName: 1,
                        status: 1
                    }
                }
            ]).toArray();
            resolve(features);
        });
    },
    getRoutes: (coordinates, features) => {
        return new Promise((resolve, reject) => {
            let routes = [];

            features.forEach(feature => {
                const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + coordinates[0] + ',' + coordinates[1] + ';' + feature.location.longitude + ',' + feature.location.latitude + '?steps=true&geometries=geojson&access_token=' + process.env.MAPBOX_GL_ACCESS_TOKEN;

                axios.get(url).then((response) => {
                    const data = response.data.routes[0];
                    const route = data.geometry.coordinates;
                    const geojson = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: route
                        }
                    };
                    feature.geolocationData = data;
                    feature.geojson = geojson;
                    routes.push(feature);
                });
            });

            const refreshInterval = setInterval(() => {
                if (routes.length === features.length) {
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${process.env.MAPBOX_GL_ACCESS_TOKEN}`

                    axios.get(url).then((response) => {
                        const place_name = response.data.features[1].place_name;
                        const userLocation = { coordinates, place_name };
                        resolve({ routes, userLocation });
                    });

                    stopRefresh();
                }
            }, 100);

            const stopRefresh = () => clearInterval(refreshInterval);
        });
    }
}