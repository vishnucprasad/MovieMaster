const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./connection');
const collection = require('./collection');
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');

function initalize(passport) {
    passport.use('admin-login', new LocalStrategy(
        { usernameField: 'email' },
        function (email, password, done) {
            db.get().collection(collection.ADMIN_COLLECTION).findOne({ email }).then(async (user) => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (! await bcrypt.compare(password, user.password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            }).catch((err) => {
                return done(err);
            });
        }
    ));

    passport.use('theatre-login', new LocalStrategy(
        { usernameField: 'email' },
        function (email, password, done) {
            db.get().collection(collection.THEATRE_COLLECTION).findOne({ email }).then(async (user) => {
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (! await bcrypt.compare(password, user.password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            }).catch((err) => {
                return done(err);
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, { userId: user._id, admin: user.admin, theatre: user.theatre });
    });

    passport.deserializeUser(function ({ userId, admin, theatre }, done) {
        if (admin) {
            db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(userId) }).then((user) => {
                done(null, user)
            }).catch((err) => {
                done(err);
            });
        } else if (theatre) {
            db.get().collection(collection.THEATRE_COLLECTION).findOne({ _id: ObjectID(userId) }).then((user) => {
                done(null, user)
            }).catch((err) => {
                done(err);
            });
        }
    });
}

module.exports = initalize;