var express = require('express');
var router = express.Router();
const fs = require('fs');
const theatreHelpers = require('../helpers/theatreHelpers');

const verifyLogin = (req, res, next) => {
  if (req.session.theatreLoggedIn) {
    next();
  } else {
    res.redirect('/theatre/login');
  }
}

router.get('/login', (req, res) => {
  if (req.session.theatreLoggedIn) {
    res.redirect('/theatre');
  } else {
    res.render('theatre/login', { title: 'Theatre | Login', loginErr: req.session.theatreLoginErr, adminStyle: true });
    req.session.theatreLoginErr = false;
  }
});

router.post('/login', (req, res) => {
  theatreHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.theatreLoggedIn = true;
      req.session.theatre = response.theatre;
      res.redirect('/theatre');
    }
  }).catch((error) => {
    if (!error.status) {
      req.session.theatreLoginErr = error.errMessage;
      res.redirect('/theatre/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.theatre = null;
  req.session.theatreLoggedIn = false;
  res.json({ status: true });
});

router.get('/', verifyLogin, function (req, res, next) {
  res.render('theatre/dashboard', { title: 'Theatre | Dashboard', theatre: req.session.theatre, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/update-owner-picture/:id', verifyLogin, (req, res) => {
  if (req.files.ownerPicture) {
    theatreHelpers.updateOwnerPicture(req.params.id, true).then((response) => {

      let image = req.files.ownerPicture;

      image.mv(`./public/images/theatre/${response.theatre._id}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
      req.session.theatre = response.theatre;
      req.session.alertMessage = response.alertMessage;
      res.redirect('/theatre');
    }).catch((error) => {
      req.session.errMessage = error.errMessage;
      res.redirect('/theatre');
    });
  }
});

router.get('/remove-owner-picture/:id', verifyLogin, (req, res) => {
  theatreHelpers.updateOwnerPicture(req.params.id, false).then((response) => {
    req.session.theatre = response.theatre;
    req.session.alertMessage = response.alertMessage;
    fs.unlinkSync(`./public/images/theatre/${response.theatre._id}.jpg`);
    res.redirect('/theatre');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre');
  });;
});

router.post('/update-theatre-details', verifyLogin, (req, res) => {
  console.log(req.body);
  theatreHelpers.updateTheatreDetails(req.body, req.session.theatre._id).then((response) => {
    req.session.theatre = response.theatre;
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre');
  });
});

router.post('/change-password', verifyLogin, (req, res) => {
  theatreHelpers.changePassword(req.body, req.session.theatre._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre');
  });
});

module.exports = router;
