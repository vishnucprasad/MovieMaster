var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const passport = require('passport');
const isUser = require('../middleware/auth').isUser;
const fs = require('fs');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const upcomingMovies = await userHelpers.getUpcomingMovies();
  const movies = await userHelpers.getMovies();
  res.render('user/homepage', { title: 'MovieMaster | HOME', user: req.user, userLocation: req.session.userLocation, movies, upcomingMovies });
});

router.get('/now-showing-movies', async (req, res) => {
  const nowShowingMovies = await userHelpers.getallMovies();
  res.render('user/now-showing-movies', { title: 'MovieMaster | Now Showing Movies', user: req.user, userLocation: req.session.userLocation, nowShowingMovies });
});

router.get('/upcoming-movies', async (req, res) => {
  const upcomingMovies = await userHelpers.getallUpcomingMovies();
  res.render('user/upcoming-movies', { title: 'MovieMaster | Upcoming Movies', user: req.user, userLocation: req.session.userLocation, upcomingMovies });
});

router.get('/view-movie', async (req, res) => {
  const date = new Date();
  const todayShows = await userHelpers.getTheatersByDistance(req.query.movieId, date.getFullYear(), date.getMonth() + 1, date.getDate(), req.session.userLocation.coordinates);
  const tomorrowShows = await userHelpers.getTheatersByDistance(req.query.movieId, date.getFullYear(), date.getMonth() + 1, date.getDate() + 1, req.session.userLocation.coordinates);
  const dayAfterTomorrowShows = await userHelpers.getTheatersByDistance(req.query.movieId, date.getFullYear(), date.getMonth() + 1, date.getDate() + 2, req.session.userLocation.coordinates);
  const latestMovies = await userHelpers.getMovies();
  userHelpers.getMovie(req.query.movieId).then((movie) => {
    res.render('user/view-movie', { title: 'MovieMaster | View Movie', user: req.user, userLocation: req.session.userLocation, movie, todayShows, tomorrowShows, dayAfterTomorrowShows, latestMovies });
  }).catch((error) => {
    res.redirect('/');
  });
});

router.get('/view-shows', async (req, res) => {
  const date = new Date();
  const todayShows = await userHelpers.getMovieShows(req.query.movieId, req.query.theatreId, date.getFullYear(), date.getMonth() + 1, date.getDate());
  const tomorrowShows = await userHelpers.getMovieShows(req.query.movieId, req.query.theatreId, date.getFullYear(), date.getMonth() + 1, date.getDate() + 1);
  const dayAfterTomorrowShows = await userHelpers.getMovieShows(req.query.movieId, req.query.theatreId, date.getFullYear(), date.getMonth() + 1, date.getDate() + 2);
  const latestMovies = await userHelpers.getMovies();
  console.log(todayShows);
  userHelpers.getMovie(req.query.movieId).then((movie) => {
    res.render('user/view-shows', { title: 'MovieMaster | View Shows', user: req.user, userLocation: req.session.userLocation, movie, todayShows, tomorrowShows, dayAfterTomorrowShows, latestMovies, theatreName: req.query.theatreName });
  }).catch((error) => {
    res.redirect('/');
  });
});

router.get('/view-upcoming-movie', async (req, res) => {
  const upcomingMovies = await userHelpers.getUpcomingMovies();
  userHelpers.getUpcomingMovie(req.query.movieId).then((movie) => {
    res.render('user/view-upcoming-movie', { title: 'MovieMaster | View Upcoming Movie', user: req.user, userLocation: req.session.userLocation, movie, upcomingMovies });
  }).catch((error) => {
    res.redirect('/');
  });
});

router.post('/search', (req, res) => {
  userHelpers.searchMovie(req.body).then(async (products) => {
    res.json(products);
  });
});

router.get('/search-movie', (req, res) => {
  userHelpers.searchMovie(req.query).then((movies) => {
    let searchNotFound = false;

    if (movies[0]) {
      searchedMovies = movies;
      resultCount = movies.length;
    } else {
      searchNotFound = true;
    }

    res.render('user/search-result', { title: `MovieMaster | Search?q=${req.query.searchQuery}`, user: req.user, userLocation: req.session.userLocation, searchedMovies, resultCount, searchQuery: req.query.searchQuery, searchNotFound });
  });
});

router.get('/popup', (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.messages = { error: 'Authentication failed.' };
  }
  res.render('auth-popup-callback');
});

router.get('/auth/facebook', passport.authenticate('facebook-auth', { scope: ['public_profile', 'email'] }));

router.get('/auth/facebook/callback', passport.authenticate('facebook-auth', { successRedirect: '/popup', failureRedirect: '/popup', failureFlash: true }));

router.get('/auth/google', passport.authenticate('google-auth', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google-auth', { failureRedirect: '/popup' }), (req, res) => {
  res.redirect('/popup');
});

router.get('/signup', (req, res) => {
  if (req.isAuthenticated() && !req.user.theatre && !req.user.admin) {
    res.redirect('/');
  } else {
    if (req.session.messages) {
      res.render('user/signup', { title: 'Account | Signup', messages: req.session.messages });
      req.session.messages = false;
    } else {
      res.render('user/signup', { title: 'Account | Signup' });
    }
  }
});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((user) => {
    res.render('user/verify-account', { title: 'Account | Verify Account', mobileNumber: user.mobileNumber });
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.redirect('/signup');
  });
});

router.get('/login', (req, res) => {
  if (req.isAuthenticated() && !req.user.theatre && !req.user.admin) {
    res.redirect('/');
  } else {
    if (req.session.messages) {
      res.render('user/login', { title: 'Account | Login', messages: req.session.messages });
      req.session.messages = false;
    } else {
      res.render('user/login', { title: 'Account | Login' });
    }
  }
});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((user) => {
    res.render('user/verify-account', { title: 'Account | Verify Account', mobileNumber: user.mobileNumber });
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.redirect('/login');
  })
});

router.post('/verify-account', (req, res) => {
  userHelpers.verifyAccount(req.body).then((user) => {
    req.session.passport = { user: { userId: user._id } };
    res.redirect('/');
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.render('user/verify-account', { title: 'Account | Verify Account', mobileNumber: error.mobile });
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ status: true });
});

router.get('/book-seat', isUser, async (req, res) => {
  const show = await userHelpers.getShow(req.query);
  res.render('user/seat-selection', { title: 'MovieMaster | Select Seat', user: req.user, userLocation: req.session.userLocation, show });
});

router.get('/checkout', isUser, async (req, res) => {
  const show = await userHelpers.getShow(req.query);
  res.render('user/checkout', { title: 'MovieMaster | checkout', user: req.user, userLocation: req.session.userLocation, show, checkoutDetails: req.query });
});

router.post('/checkoutRazorpay', isUser, async (req, res) => {
  const show = await userHelpers.getShow({ showId: req.body.showId, screenId: req.body.screenId });
  userHelpers.placeOrder(req.body, show, req.user._id, { paymentMethod: 'Razorpay' }).then((order) => {
    userHelpers.generateRazorpay(order._id, order.totalAmount).then((response) => {
      res.json(response);
    }).catch((error) => {
      res.json(error);
    });
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/verify-razorpay-payment', (req, res) => {
  userHelpers.verifyRazorpayPayment(req.body).then((status) => {
    userHelpers.confirmOrder(req.body['order[receipt]'], req.user).then((response) => {
      res.json(status);
    });
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/checkoutPaypal', async (req, res) => {
  const show = await userHelpers.getShow({ showId: req.body.showId, screenId: req.body.screenId });
  userHelpers.placeOrder(req.body, show, req.user._id, { paymentMethod: 'PayPal' }).then(async (order) => {
    const show = await userHelpers.getShow({ showId: order.showId, screenId: order.screenId });
    userHelpers.createPaypal(show, order).then((approvalLink) => {
      res.json({ approvalLink });
    });
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/success-paypal', (req, res) => {
  userHelpers.getVerifiedPaypalOrder(req.query.paymentId).then((order) => {
    userHelpers.confirmOrder(order._id, req.user).then((response) => {
      res.redirect(`/view-order?orderId=${order._id}`);
    });
  });
});

router.get('/cancel-paypal', (req, res) => {
  res.redirect('/');
});

router.get('/view-order', isUser, (req, res) => {
  userHelpers.getOrder(req.query.orderId, req.user._id).then((order) => {
    order.orderDate = `${order.orderDate.getFullYear()}-${order.orderDate.getMonth() + 1}-${order.orderDate.getDate()}`;
    res.render('user/view-order', { title: 'MovieMaster | View Order', user: req.user, userLocation: req.session.userLocation, order });
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.redirect('/');
  });
});

router.get('/my-orders', isUser, async (req, res) => {
  const orders = await userHelpers.getAllOrders(req.user._id);
  res.render('user/my-orders', { title: 'MovieMaster | My Orders', user: req.user, userLocation: req.session.userLocation, orders })
});

router.get('/my-profile', isUser, (req, res) => {
  res.render('user/my-profile', { title: 'MovieMaster | My Profile', user: req.user, userLocation: req.session.userLocation, });
});

router.post('/update-profile-picture', isUser, (req, res) => {
  if (req.files.profilePicture) {
    userHelpers.updateProfilePicture(req.user._id, `/images/user/profile/${req.user._id}.jpg`).then((response) => {

      let image = req.files.profilePicture;

      image.mv(`./public/images/user/profile/${req.user._id}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
      req.flash('info', response.alertMessage);
      res.redirect('/my-profile');
    }).catch((error) => {
      req.flash('error', error.errMessage);
      res.redirect('/my-profile');
    });
  }
});

router.get('/remove-profile-picture', isUser, (req, res) => {
  userHelpers.updateProfilePicture(req.user._id, null).then((response) => {
    fs.unlinkSync(`./public/images/user/profile/${req.user._id}.jpg`);
    req.flash('info', response.alertMessage);
    res.redirect('/my-profile');
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.redirect('/my-profile');
  });;
});

router.post('/edit-personal-info', isUser, (req, res) => {
  userHelpers.updateProfileInfo(req.body, req.user._id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/update-mobile', isUser, (req, res) => {
  userHelpers.updateMobile(req.body, req.user._id).then((mobileNumber) => {
    res.json({ mobileNumber });
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/verify-mobile', isUser, (req, res) => {
  console.log(req.body);
  userHelpers.verifyMobile(req.body, req.user._id).then((response) => {
    res.json(response);
  }).catch((error) => {
    console.log(error);
    res.json(error);
  });
});

router.post('/sendTicket', isUser, (req, res) => {
  userHelpers.getOrder(req.body.orderId, req.user._id).then((order) => {
    order.orderDate = `${order.orderDate.getFullYear()}-${order.orderDate.getMonth() + 1}-${order.orderDate.getDate()}`;
    userHelpers.sendTicket(order, req.body.email).then((response) => {
      res.json(response);
    }).catch((error) => {
      res.json(error);
    });
  }).catch((error) => {
    error.status = false;
    res.json(error);
  });
});

router.get('/theatre-locations', (req, res) => {
  userHelpers.getTheatreLocations().then((features) => {
    res.json(features);
  });
});

router.post('/get-routes', async (req, res) => {
  const features = await userHelpers.getTheatreLocations();
  userHelpers.getRoutes(req.body['start[]'], features).then((response) => {
    req.session.userLocation = response.userLocation;
    res.json(response.routes);
  });
});

module.exports = router;
