var express = require('express');
var router = express.Router();
const fs = require('fs');
const theatreHelpers = require('../helpers/theatreHelpers');
const passport = require('passport');
const isTheatre = require('../middleware/auth').isTheatre;

router.get('/login', (req, res) => {
  if (req.isAuthenticated() && req.user.theatre) {
    res.redirect('/theatre');
  } else {
    res.render('theatre/login', { title: 'Theatre | Login' });
  }
});

router.post('/login', passport.authenticate('theatre-login', { successRedirect: '/theatre', failureRedirect: '/theatre/login', failureFlash: true }));

router.get('/auth/google', passport.authenticate('theatre-google-auth', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('theatre-google-auth', { failureRedirect: '/theatre/login', failureFlash: true }), (req, res) => {
  res.redirect('/theatre/popup');
});

router.get('/popup', (req, res) => {
  res.render('auth-popup-callback');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ status: true });
});

router.get('/', isTheatre, function (req, res, next) {
  res.render('theatre/dashboard', { title: 'Theatre | Dashboard', theatre: req.user, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/update-owner-picture/:id', isTheatre, (req, res) => {
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
      req.session.alertMessage = response.alertMessage;
      res.redirect('/theatre');
    }).catch((error) => {
      req.session.errMessage = error.errMessage;
      res.redirect('/theatre');
    });
  }
});

router.get('/remove-owner-picture/:id', isTheatre, (req, res) => {
  theatreHelpers.updateOwnerPicture(req.params.id, false).then((response) => {
    req.session.alertMessage = response.alertMessage;
    fs.unlinkSync(`./public/images/theatre/${response.theatre._id}.jpg`);
    res.redirect('/theatre');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre');
  });;
});

router.post('/update-theatre-details', isTheatre, (req, res) => {
  console.log(req.body);
  theatreHelpers.updateTheatreDetails(req.body, req.user._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre');
  });
});

router.post('/change-password', isTheatre, (req, res) => {
  theatreHelpers.changePassword(req.body, req.user._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre');
  });
});

router.get('/screens', isTheatre, (req, res) => {
  theatreHelpers.getAllScreens(req.user._id).then((screens) => {
    res.render('theatre/screens', { title: 'Theatre | Screens', theatre: req.user, screens, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-screens', isTheatre, (req, res) => {
  res.render('theatre/add-screens', { title: 'Admin | Add Screens', theatre: req.user, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-screens', isTheatre, (req, res) => {
  theatreHelpers.addScreens(req.body, req.user._id).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/add-screens');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/add-screens');
  });
});

router.get('/edit-screen/:id', isTheatre, (req, res) => {
  theatreHelpers.getScreen(req.params.id).then((screen) => {
    res.render('theatre/edit-screen', { title: 'Admin | Edit Screen', theatre: req.user, screen, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/screens');
  });
});

router.post('/edit-screen', isTheatre, (req, res) => {
  theatreHelpers.editScreen(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/screens');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/screens');
  });
});

router.post('/delete-screen', isTheatre, (req, res) => {
  theatreHelpers.deleteScreen(req.body.id).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/movie-management', isTheatre, (req, res) => {
  theatreHelpers.getAllMovies(req.user._id).then((movies) => {
    res.render('theatre/movie-management', { title: 'Theatre | Movie Management', theatre: req.user, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-movies', isTheatre, (req, res) => {
  res.render('theatre/add-movies', { title: 'Theatre | Add Movies', theatre: req.user, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-movies', isTheatre, (req, res) => {
  theatreHelpers.addMovies(req.body, req.user._id).then((response) => {
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

router.get('/edit-movie/:id', isTheatre, (req, res) => {
  theatreHelpers.getMovie(req.params.id).then((movie) => {
    res.render('theatre/edit-movie', { title: 'Theatre | Edit Movie', theatre: req.user, movie });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/movie-management');
  });
});

router.post('/edit-movie', isTheatre, (req, res) => {
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

router.post('/delete-movie', isTheatre, (req, res) => {
  theatreHelpers.deleteMovie(req.body.id).then((response) => {
    fs.unlinkSync(`./public/images/movies/posters/${req.body.id}.jpg`);
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/upcoming-movies', isTheatre, (req, res) => {
  theatreHelpers.getAllUpcomingMovies(req.user._id).then((movies) => {
    res.render('theatre/upcoming-movies', { title: 'Theatre | Upcoming Movies', theatre: req.user, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.get('/add-upcoming-movies', isTheatre, (req, res) => {
  res.render('theatre/add-upcoming-movies', { title: 'Theatre | Add Movies', theatre: req.user, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
  req.session.errMessage = false;
  req.session.alertMessage = false;
});

router.post('/add-upcoming-movies', isTheatre, (req, res) => {
  theatreHelpers.addUpcomingMovies(req.body, req.user._id).then((response) => {
    let image = req.files.moviePoster;

    image.mv(`./public/images/movies/upcoming-movies/posters/${response.data._id}.jpg`, (err, done) => {
      if (err) {
        console.log(err);
      } else {
        console.log(done);
      }
    });

    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/add-upcoming-movies');
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/add-upcoming-movies');
  });
});

router.get('/edit-upcoming-movie/:id', isTheatre, (req, res) => {
  theatreHelpers.getUpcomingMovie(req.params.id).then((movie) => {
    res.render('theatre/edit-upcoming-movie', { title: 'Theatre | Edit Upcoming Movie', theatre: req.user, movie });
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/movie-management');
  });
});

router.post('/edit-upcoming-movie', isTheatre, (req, res) => {
  theatreHelpers.editUpcomingMovie(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect('/theatre/upcoming-movies');

    if (req.files.moviePoster) {
      let image = req.files.moviePoster;

      image.mv(`./public/images/movies/upcoming-movies/posters/${response.movieId}.jpg`, (err, done) => {
        if (err) {
          console.log(err);
        } else {
          console.log(done);
        }
      });
    }
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/upcoming-movies');
  });
});

router.post('/delete-upcoming-movie', isTheatre, (req, res) => {
  theatreHelpers.deleteUpcomingMovie(req.body.id).then((response) => {
    fs.unlinkSync(`./public/images/movies/upcoming-movies/posters/${req.body.id}.jpg`);
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/view-schedule/:id', isTheatre, (req, res) => {
  theatreHelpers.getScreen(req.params.id).then(async (screen) => {
    const shows = await theatreHelpers.getAllShows(req.params.id);
    res.render('theatre/view-schedule', { title: 'Theatre | View Schedule', theatre: req.user, screen, shows, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect('/theatre/screens');
  });
});

router.get('/add-shows/:id', isTheatre, (req, res) => {
  theatreHelpers.getAllMovies(req.user._id).then((movies) => {
    res.render('theatre/add-shows', { title: 'Theatre | Add Shows', theatre: req.user, screenId: req.params.id, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  });
});

router.post('/add-shows', isTheatre, (req, res) => {
  theatreHelpers.addShows(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect(`/theatre/add-shows/${response.screenId}`);
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/theatre/add-shows/${error.screenId}`);
  });
});

router.get('/edit-show', isTheatre, (req, res) => {
  theatreHelpers.getAllMovies(req.user._id).then(async (movies) => {
    const show = await theatreHelpers.getShow(req.query);
    res.render('theatre/edit-show', { title: 'Theatre | Edit Show', theatre: req.user, show, movies, errMessage: req.session.errMessage, alertMessage: req.session.alertMessage });
    req.session.errMessage = false;
    req.session.alertMessage = false;
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/theatre/view-schedule/${req.query.screenId}`);
  });
});

router.post('/edit-show', isTheatre, (req, res) => {
  theatreHelpers.editShow(req.body).then((response) => {
    req.session.alertMessage = response.alertMessage;
    res.redirect(`/theatre/view-schedule/${req.body.screenId}`)
  }).catch((error) => {
    req.session.errMessage = error.errMessage;
    res.redirect(`/theatre/view-schedule/${req.body.screenId}`)
  });
});

router.post('/delete-show', isTheatre, (req, res) => {
  theatreHelpers.deleteShow(req.body).then((response) => {
    res.json(response);
  }).catch((error) => {
    res.json(error);
  });
});

router.get('/users-activity', isTheatre, (req, res) => {
  res.render('theatre/users-activity', { title: 'Theatre | Users Activity', theatre: req.user });
});

module.exports = router;
