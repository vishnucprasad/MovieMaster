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

router.get('/screens', verifyLogin, (req, res) => {
  theatreHelpers.getAllScreens(req.session.theatre._id).then((screens) => {
    res.render('theatre/screens', { title: 'Theatre | Screens', theatre: req.session.theatre, screens, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-screens', verifyLogin, (req, res) => {
  res.render('theatre/add-screens', { title: 'Admin | Add Screens', theatre: req.session.theatre, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-screens', verifyLogin, (req, res) => {
  theatreHelpers.addScreens(req.body, req.session.theatre._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/add-screens');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/add-screens');
  });
});

router.get('/edit-screen/:id', verifyLogin, (req, res) => {
  theatreHelpers.getScreen(req.params.id).then((screen) => {
    res.render('theatre/edit-screen', { title: 'Admin | Edit Screen', theatre: req.session.theatre, screen, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/screens');
  });
});

router.post('/edit-screen', verifyLogin, (req, res) => {
  theatreHelpers.editScreen(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/screens');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/screens');
  });
});

router.post('/delete-screen', verifyLogin, (req, res) => {
  console.log(req.body);
  theatreHelpers.deleteScreen(req.body.id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/movie-management', verifyLogin, (req, res) => {
  theatreHelpers.getAllMovies(req.session.theatre._id).then((movies) => {
    res.render('theatre/movie-management', { title: 'Theatre | Movie Management', theatre: req.session.theatre, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-movies', verifyLogin, (req, res) => {
  res.render('theatre/add-movies', { title: 'Theatre | Add Movies', theatre: req.session.theatre, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-movies', verifyLogin, (req, res) => {
  theatreHelpers.addMovies(req.body, req.session.theatre._id).then((response) => {
    let image = req.files.moviePoster;

    image.mv(`./public/images/movies/posters/${response.data._id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);
      }
    });

    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/add-movies');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/add-movies');
  });
});

router.get('/edit-movie/:id', verifyLogin, (req, res) => {
  theatreHelpers.getMovie(req.params.id).then((movie) => {
    res.render('theatre/edit-movie', { title: 'Theatre | Edit Movie', theatre: req.session.theatre, movie });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/movie-management');
  });
});

router.post('/edit-movie', verifyLogin, (req, res) => {
  theatreHelpers.editMovie(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/movie-management');

    if (req.files.moviePoster) {
      let image = req.files.moviePoster;

      image.mv(`./public/images/movies/posters/${response.movieId}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
    }
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/movie-management');
  });
});

router.post('/delete-movie', verifyLogin, (req, res) => {
  console.log(req.body);
  theatreHelpers.deleteMovie(req.body.id).then((response) => {
    fs.unlinkSync(`./public/images/movies/posters/${req.body.id}.jpg`);
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/view-schedule/:id', verifyLogin, (req, res) => {
  theatreHelpers.getScreen(req.params.id).then(async (screen) => {
    const shows = await theatreHelpers.getAllShows(req.params.id);
    res.render('theatre/view-schedule', { title: 'Theatre | View Schedule', theatre: req.session.theatre, screen, shows, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/screens');
  });
});

router.get('/add-shows/:id', verifyLogin, (req, res) => {
  theatreHelpers.getAllMovies(req.session.theatre._id).then((movies) => {
    res.render('theatre/add-shows', { title: 'Theatre | Add Shows', theatre: req.session.theatre, screenId: req.params.id, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.post('/add-shows', verifyLogin, (req, res) => {
  theatreHelpers.addShows(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect(`/theatre/add-shows/${response.screenId}`);
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/theatre/add-shows/${error.screenId}`);
  });
});

router.get('/edit-show', verifyLogin, (req, res) => {
  theatreHelpers.getAllMovies(req.session.theatre._id).then(async (movies) => {
    const show = await theatreHelpers.getShow(req.query);
    res.render('theatre/edit-show', { title: 'Theatre | Edit Show', theatre: req.session.theatre, show, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/theatre/view-schedule/${req.query.screenId}`);
  });
});

router.post('/edit-show', verifyLogin, (req, res) => {
  theatreHelpers.editShow(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect(`/theatre/view-schedule/${req.body.screenId}`)
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/theatre/view-schedule/${req.body.screenId}`)
  });
});

router.post('/delete-show', verifyLogin, (req, res) => {
  theatreHelpers.deleteShow(req.body).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/users-activity', verifyLogin, (req, res) => {
  res.render('theatre/users-activity', { title: 'Theatre | Users Activity', theatre: req.session.theatre });
});

module.exports = router;
