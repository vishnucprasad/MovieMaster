var express = require('express');
var router = express.Router();
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers');
const passport = require('passport');
const isAdmin = require('../middleware/auth').isAdmin;

router.get('/login', (req, res) => {
  if (req.isAuthenticated() && req.user.admin) {
    res.redirect('/admin');
  } else {
    if (req.session.messages) {
      res.render('admin/login', { title: 'Admin | Login', messages: req.session.messages, adminStyle: true });
      req.session.messages = false;
    } else {
      res.render('admin/login', { title: 'Admin | Login', adminStyle: true });
    }
  }
});

router.post('/login', passport.authenticate('admin-login', { successRedirect: '/admin', failureRedirect: '/admin/login', failureFlash: true }));

router.get('/auth/google', passport.authenticate('admin-google-auth', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('admin-google-auth', { failureRedirect: '/admin/popup', failureFlash: true }), (req, res) => {
  res.redirect('/admin/popup');
});

router.get('/popup', (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.messages = { error: 'Invalid Account' };
  }
  res.render('auth-popup-callback');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ status: true });
});

router.get('/', isAdmin, async function (req, res, next) {
  const totalUsers = await adminHelpers.getNumberOfUsers();
  const totalTheaters = await adminHelpers.getNumberOfTheaters();
  const totalActiveTheaters = await adminHelpers.getNumberOfActiveTheaters();
  const totalTheatersOnHold = await adminHelpers.getNumberOfTheatersOnHold();
  res.render('admin/dashboard', { title: 'Admin | Dashboard', admin: req.user, totalUsers, totalTheaters, totalActiveTheaters, totalTheatersOnHold, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/update-profile-picture/:id', isAdmin, (req, res) => {
  if (req.files.profilePicture) {
    adminHelpers.updateProfilePicture(req.params.id, true).then((response) => {

      let image = req.files.profilePicture;

      image.mv(`./public/images/admin/${response.admin._id}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
      req.session.alertMessage = response.alertMessage;
      res.redirect('/admin');
    }).catch((error) => {
      req.session.errMessage = error.errMessage;
      res.redirect('/admin');
    });
  }
});

router.get('/remove-profile-picture/:id', isAdmin, (req, res) => {
  adminHelpers.updateProfilePicture(req.params.id, false).then((response) => {
    req.session.alertMessage = response.alertMessage;
    fs.unlinkSync(`./public/images/admin/${response.admin._id}.jpg`);
    res.redirect('/admin');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin');
  });;
});

router.post('/update-admin-details', isAdmin, (req, res) => {
  adminHelpers.updateAdminDetails(req.body, req.user._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin');
  });
});

router.post('/change-password', (req, res) => {
  adminHelpers.changePassword(req.body, req.user._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin');
  });
});

router.get('/theater-management', isAdmin, (req, res) => {
  adminHelpers.getOwners().then((owners) => {
    res.render('admin/theater-management', { title: 'Admin | Theater Management', admin: req.user, owners, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-owners', isAdmin, (req, res) => {
  res.render('admin/add-owners', { title: 'Admin | Add Owners', admin: req.user, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-owners', isAdmin, (req, res) => {
  adminHelpers.addOwners(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin/add-owners');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/add-owners');
  });
});

router.get('/owner-details/:id', isAdmin, (req, res) => {
  adminHelpers.getOwner(req.params.id).then((owner) => {
    res.render('admin/owner-details', { title: 'Admin | Theater Details', admin: req.user, owner });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/theater-management');
  });
});

router.get('/edit-owner/:id', isAdmin, (req, res) => {
  adminHelpers.getOwner(req.params.id).then((owner) => {
    res.render('admin/edit-owner', { title: 'Admin | Edit Theater Owner Details', admin: req.user, owner, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/theater-management');
  });
});

router.post('/edit-owner', isAdmin, (req, res) => {
  adminHelpers.editOwner(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin/theater-management');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/admin/edit-owner/${req.body.ownerId}`)
  });
});

router.post('/delete-owner', isAdmin, (req, res) => {
  adminHelpers.deleteOwner(req.body.id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/users-management', isAdmin, (req, res) => {
  res.render('admin/users-management', { title: 'Admin | Users Management', admin: req.user });
});

router.get('/users-activity', isAdmin, (req, res) => {
  res.render('admin/users-activity', { title: 'Admin | Users Activity Track', admin: req.user });
});

module.exports = router;
