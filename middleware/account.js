module.exports.isBlocked = (req, res, next) => {
    if (req.isAuthenticated() && req.user.blocked) {
        res.redirect('/account-blocked');
    } else {
        next();
    }
}