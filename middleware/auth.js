module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

module.exports.isTheatre = (req, res, next) => {
    if (req.isAuthenticated() && req.user.theatre) {
        next();
    } else {
        res.redirect('/theatre/login');
    }
}

module.exports.isUser = (req, res, next) => {
    if (req.isAuthenticated() && !req.user.theatre && !req.user.admin) {
        next();
    } else {
        res.redirect('/login');
    }
}