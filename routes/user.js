var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const passport = require('passport');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  const upcomingMovies = await userHelpers.getUpcomingMovies();
  const movies = await userHelpers.getMovies();
  res.render('user/homepage', { title: 'MovieMaster | HOME', user: req.user, movies, upcomingMovies });
});

router.get('/now-showing-movies', async (req, res) => {
  const nowShowingMovies = await userHelpers.getallMovies();
  res.render('user/now-showing-movies', { title: 'MovieMaster | Now Showing Movies', nowShowingMovies });
});

router.get('/upcoming-movies', async (req, res) => {
  const upcomingMovies = await userHelpers.getallUpcomingMovies();
  res.render('user/upcoming-movies', { title: 'MovieMaster | Upcoming Movies', upcomingMovies });
});

router.get('/view-movie', async (req, res) => {
  const date = new Date();
  const todayShows = await userHelpers.getMovieShows(req.query.movieId, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
  const tomorrowShows = await userHelpers.getMovieShows(req.query.movieId, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`);
  const dayAfterTomorrowShows = await userHelpers.getMovieShows(req.query.movieId, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 2}`);
  const latestMovies = await userHelpers.getMovies();
  userHelpers.getMovie(req.query.movieId).then((movie) => {
    res.render('user/view-movie', { title: 'MovieMaster | View Movie', movie, todayShows, tomorrowShows, dayAfterTomorrowShows, latestMovies });
  }).catch((error) => {
    res.redirect('/');
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

module.exports = router;
