const express = require('express');
const router = express.Router();
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers');
const passport = require('passport');
const isAdmin = require('../middleware/auth').isAdmin;
const date = require('date-and-time');

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
  const totalOrders = await adminHelpers.getNumberOfOrders();
  const totalPaidOrders = await adminHelpers.getNumberOfPaidOrders();
  const currentMonthBookings = await adminHelpers.getBookings(date.format(new Date(), 'YYYY'), date.format(new Date(), 'MM'), date.format(new Date(), 'DD'));
  const pastMonthBookings = await adminHelpers.getBookings(date.format(new Date(), 'YYYY'), date.format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'MM'), date.format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'DD'));
  res.render('admin/dashboard', { title: 'Admin | Dashboard', admin: req.user, totalUsers, totalTheaters, totalActiveTheaters, totalTheatersOnHold, totalOrders, totalPaidOrders, currentMonthBookings, pastMonthBookings });
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
      req.flash('info', response.alertMessage);
      res.redirect('/admin/profile');
    }).catch((error) => {
      req.flash('error', error.errMessage);
      res.redirect('/admin/profile');
    });
  }
});

router.get('/remove-profile-picture/:id', isAdmin, (req, res) => {
  adminHelpers.updateProfilePicture(req.params.id, false).then((response) => {
    req.flash('info', response.alertMessage);
    fs.unlinkSync(`./public/images/admin/${response.admin._id}.jpg`);
    res.redirect('/admin/profile');
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.redirect('/admin/profile');
  });;
});

router.post('/update-admin-details', isAdmin, (req, res) => {
  adminHelpers.updateAdminDetails(req.body, req.user._id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/change-password', (req, res) => {
  adminHelpers.changePassword(req.body, req.user._id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
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
  res.render('admin/add-owners', { title: 'Admin | Add Owners', admin: req.user });
});

router.post('/add-owners', isAdmin, (req, res) => {
  adminHelpers.addOwners(req.body).then((response) => {
    req.flash('info', response.alertMessage);
    res.redirect('/admin/theater-management');
  }).catch((error) => {
    req.flash('error', error.errMessage);
    res.redirect('/admin/theater-management');
  });
});

router.get('/theatre-overview/:id', isAdmin, async (req, res) => {
  const totalShows = await adminHelpers.getNumberOfShows(req.params.id);
  const totalScreens = await adminHelpers.getNumberOfScreens(req.params.id);
  const totalBookings = await adminHelpers.getNumberOfBookings(req.params.id);
  const paidBookings = await adminHelpers.getNumberOfPayedBookings(req.params.id);
  const unpaidBookings = await adminHelpers.getNumberOfUnpayedBookings(req.params.id);
  const currentMonthBookings = await adminHelpers.getTheatreBookings(req.params.id, date.format(new Date(), 'YYYY'), date.format(new Date(), 'MM'), date.format(new Date(), 'DD'));
  const pastMonthBookings = await adminHelpers.getTheatreBookings(req.params.id, date.format(new Date(), 'YYYY'), date.format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'MM'), date.format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'DD'));
  adminHelpers.getOwner(req.params.id).then((owner) => {
    res.render('admin/theatre-overview', { title: 'Admin | Theater Details', admin: req.user, owner, totalShows, totalScreens, totalBookings, paidBookings, unpaidBookings, currentMonthBookings, pastMonthBookings });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/theater-management');
  });
});

router.get('/edit-owner/:id', isAdmin, (req, res) => {
  adminHelpers.getOwner(req.params.id).then((owner) => {
    res.render('admin/edit-owner', { title: 'Admin | Edit Theater Owner Details', admin: req.user, owner });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/theater-management');
  });
});

router.post('/edit-owner', isAdmin, (req, res) => {
  adminHelpers.editOwner(req.body).then((response) => {
    req.flash('info', response.alertMessage);
    res.redirect('/admin/theater-management');
  }).catch((error) => {
    req.flash('error', error.errMessage);
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
  adminHelpers.getUserData().then((userData) => {
    res.render('admin/users-management', { title: 'Admin | Users Management', admin: req.user, userData });
  });
});

router.post('/delete-user', (req, res) => {
  adminHelpers.deleteUser(req.body).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/block-user', (req, res) => {
  adminHelpers.blockUser(req.body).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.post('/unblock-user', (req, res) => {
  adminHelpers.unblockUser(req.body).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/users-activity', isAdmin, (req, res) => {
  adminHelpers.getUsers().then((users) => {
    res.render('admin/users-activity', { title: 'Admin | Users Activity Track', admin: req.user, users });
  });
});

router.get('/profile', isAdmin, (req, res) => {
  res.render('admin/profile', { title: 'Admin | Profile', admin: req.user });
});

module.exports = router;
