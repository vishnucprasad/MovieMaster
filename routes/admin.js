var express = require('express');
var router = express.Router();
const fs = require('fs');
const adminHelpers = require('../helpers/adminHelpers');

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin');
  } else {
    res.render('admin/login', { title: 'Admin | Login', loginErr: req.session.adminLoginErr });
    req.session.adminLoginErr = false;
  }
});

router.post('/login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect('/admin');
    }
  }).catch((error) => {
    if (!error.status) {
      req.session.adminLoginErr = error.errMessage;
      res.redirect('/admin/login');
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.json({ status: true });
});

router.get('/', verifyLogin, function (req, res, next) {
  res.render('admin/dashboard', { title: 'Admin | Dashboard', admin: req.session.admin, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/update-profile-picture/:id', verifyLogin, (req, res) => {
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
      req.session.admin = response.admin;
      req.session.alertMessage = response.alertMessage;
      res.redirect('/admin');
    }).catch((error) => {
      req.session.errMessage = error.errMessage;
      res.redirect('/admin');
    });
  }
});

router.get('/remove-profile-picture/:id', verifyLogin, (req, res) => {
  adminHelpers.updateProfilePicture(req.params.id, false).then((response) => {
    req.session.admin = response.admin;
    req.session.alertMessage = response.alertMessage;
    fs.unlinkSync(`./public/images/admin/${response.admin._id}.jpg`);
    res.redirect('/admin');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin');
  });;
});

router.post('/update-admin-details', verifyLogin, (req, res) => {
  console.log(req.body);
  adminHelpers.updateAdminDetails(req.body, req.session.admin._id).then((response) => {
    req.session.admin = response.admin;
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin');
  });
});

router.post('/change-password', (req, res) => {
  adminHelpers.changePassword(req.body, req.session.admin._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin');
  });
});

router.get('/theater-management', verifyLogin, (req, res) => {
  adminHelpers.getOwners().then((owners) => {
    res.render('admin/theater-management', { title: 'Admin | Theater Management', admin: req.session.admin, owners, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-owners', verifyLogin, (req, res) => {
  res.render('admin/add-owners', { title: 'Admin | Add Owners', admin: req.session.admin, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-owners', verifyLogin, (req, res) => {
  adminHelpers.addOwners(req.body, req.session.admin._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin/add-owners');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/add-owners');
  });
});

router.get('/owner-details/:id', verifyLogin, (req, res) => {
  adminHelpers.getOwner(req.params.id).then((owner) => {
    res.render('admin/owner-details', { title: 'Admin | Theater Details', admin: req.session.admin, owner });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/theater-management');
  });
});

router.get('/edit-owner/:id', verifyLogin, (req, res) => {
  adminHelpers.getOwner(req.params.id).then((owner) => {
    res.render('admin/edit-owner', { title: 'Admin | Edit Theater Owner Details', admin: req.session.admin, owner, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/admin/theater-management');
  });
});

router.post('/edit-owner', verifyLogin, (req, res) => {
  adminHelpers.editOwner(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/admin/theater-management');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/admin/edit-owner/${req.body.ownerId}`)
  });
});

router.post('/delete-owner', verifyLogin, (req, res) => {
  adminHelpers.deleteOwner(req.body.id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/users-management', verifyLogin, (req, res) => {
  res.render('admin/users-management', { title: 'Admin | Users Management', admin: req.session.admin });
});

router.get('/users-activity', verifyLogin, (req, res) => {
  res.render('admin/users-activity', { title: 'Admin | Users Activity Track', admin: req.session.admin });
});

module.exports = router;
