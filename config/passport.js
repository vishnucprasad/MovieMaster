const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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
                    return done(null, false, { message: 'Incorrect Email.' });
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

    passport.use('admin-google-auth', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_ADMIN_CALLBACK_URL
    }, function (accessToken, refreshToken, profile, done) {
        db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: profile._json.email }).then(async (user) => {
            if (!user) {
                return done(null, false, { message: 'Incorrect Email.' });
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
                    return done(null, false, { message: 'Incorrect Email.' });
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

    passport.use('theatre-google-auth', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_THEATRE_CALLBACK_URL
    }, function (accessToken, refreshToken, profile, done) {
        db.get().collection(collection.THEATRE_COLLECTION).findOne({ email: profile._json.email }).then(async (user) => {
            if (!user) {
                return done(null, false, { message: 'Incorrect Email.' });
            }
            return done(null, user);
        }).catch((err) => {
            return done(err);
        });
    }
    ));

    passport.use('facebook-auth', new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'name', 'email', 'picture.type(large)']
    }, async function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        const existingUser = await db.get().collection(collection.USER_COLLECTION).findOne({ facebookId: profile.id });
        if (!existingUser) {
            if (profile.emails[0]) {
                email = profile.emails[0].value;
            }

            if (profile.photos[0]) {
                profilePic = profile.photos[0].value
            }

            db.get().collection(collection.USER_COLLECTION).insertOne({ facebookId: profile.id, name: profile.displayName, email, profilePic }).then((response) => {
                const user = response.ops[0];
                done(null, user);
            }).catch((err) => {
                return done(err);
            });
        } else {
            db.get().collection(collection.USER_COLLECTION).findOne({ facebookId: profile.id }).then((user) => {
                return done(null, user);
            }).catch((err) => {
                return done(err);
            });
        }
    }
    ));

    passport.use('google-auth', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_USER_CALLBACK_URL
    }, async function (accessToken, refreshToken, profile, done) {
        const existingUser = await db.get().collection(collection.USER_COLLECTION).findOne({ googleId: profile.id });
        if (!existingUser) {
            if (profile.emails[0]) {
                email = profile.emails[0].value;
            }

            if (profile.photos[0]) {
                profilePic = profile.photos[0].value
            }

            db.get().collection(collection.USER_COLLECTION).insertOne({ googleId: profile.id, name: profile.displayName, email, profilePic }).then((response) => {
                const user = response.ops[0];
                done(null, user);
            }).catch((err) => {
                return done(err);
            });
        } else {
            db.get().collection(collection.USER_COLLECTION).findOne({ googleId: profile.id }).then((user) => {
                return done(null, user);
            }).catch((err) => {
                return done(err);
            });
        }
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
        } else {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectID(userId) }).then((user) => {
                done(null, user)
            }).catch((err) => {
                done(err);
            });
        }
    });
}

module.exports = initalize;