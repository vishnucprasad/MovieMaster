var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const passport = require('passport');
const isUser = require('../middleware/auth').isUser;

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const upcomingMovies = await userHelpers.getUpcomingMovies();
  const movies = await userHelpers.getMovies();
  res.render('user/homepage', { title: 'MovieMaster | HOME', user: req.user, movies, upcomingMovies });
});

router.get('/now-showing-movies', async (req, res) => {
  const nowShowingMovies = await userHelpers.getallMovies();
  res.render('user/now-showing-movies', { title: 'MovieMaster | Now Showing Movies', user: req.user, nowShowingMovies });
});

router.get('/upcoming-movies', async (req, res) => {
  const upcomingMovies = await userHelpers.getallUpcomingMovies();
  res.render('user/upcoming-movies', { title: 'MovieMaster | Upcoming Movies', user: req.user, upcomingMovies });
});

router.get('/view-movie', async (req, res) => {
  const date = new Date();
  const todayShows = await userHelpers.getMovieShows(req.query.movieId, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
  const tomorrowShows = await userHelpers.getMovieShows(req.query.movieId, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`);
  const dayAfterTomorrowShows = await userHelpers.getMovieShows(req.query.movieId, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 2}`);
  const latestMovies = await userHelpers.getMovies();
  userHelpers.getMovie(req.query.movieId).then((movie) => {
    res.render('user/view-movie', { title: 'MovieMaster | View Movie', user: req.user, movie, todayShows, tomorrowShows, dayAfterTomorrowShows, latestMovies });
  }).catch((error) => {
    res.redirect('/');
  });
});

router.get('/view-upcoming-movie', async (req, res) => {
  const upcomingMovies = await userHelpers.getUpcomingMovies();
  userHelpers.getUpcomingMovie(req.query.movieId).then((movie) => {
    res.render('user/view-upcoming-movie', { title: 'MovieMaster | View Upcoming Movie', user: req.user, movie, upcomingMovies });
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

    res.render('user/search-result', { title: `MovieMaster | Search?q=${req.query.searchQuery}`, user: req.user, searchedMovies, resultCount, searchQuery: req.query.searchQuery, searchNotFound });
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
  res.render('user/seat-selection', { title: 'MovieMaster | Select Seat', user: req.user, show });
});

router.get('/checkout', isUser, async (req, res) => {
  const show = await userHelpers.getShow(req.query);
  res.render('user/checkout', { title: 'MovieMaster | checkout', user: req.user, show, checkoutDetails: req.query });
});

router.post('/checkoutRazorpay', isUser, (req, res) => {
  userHelpers.placeOrder(req.body, req.user._id, { paymentMethod: 'Razorpay' }).then((order) => {
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
    userHelpers.confirmOrder(req.body['order[receipt]']).then((response) => {
      res.json(status);
    });
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/checkoutPaypal', (req, res) => {
  userHelpers.placeOrder(req.body, req.user._id, { paymentMethod: 'PayPal' }).then(async (order) => {
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
    userHelpers.confirmOrder(order._id).then((response) => {
      res.redirect(`/view-order?orderId=${order._id}`);
    });
  });
});

router.get('/cancel-paypal', (req, res) => {
  res.redirect('/');
});

router.get('/view-order', isUser, (req, res) => {
  userHelpers.getOrder(req.query.orderId, req.user._id).then((order) => {
    userHelpers.getShow({ showId: order.showId, screenId: order.screenId }).then((show) => {
      order.orderDate = `${order.orderDate.getFullYear()}-${order.orderDate.getMonth() + 1}-${order.orderDate.getDate()}`
      res.render('user/view-order', { title: 'MovieMaster | View Order', user: req.user, order, show });
    });
  }).catch((error) => {
    req.flash('error', error.errMessage);
    req.redirect('/');
  });
});

module.exports = router;
