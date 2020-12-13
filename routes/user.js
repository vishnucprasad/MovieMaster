var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/userHelpers');
const passport = require('passport');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('user/homepage', { title: 'MovieMaster | HOME', user: req.user });
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
