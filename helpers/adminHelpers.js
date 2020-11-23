const db = require('../config/connection');
const collection = require('../config/collection');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = {
    doLogin: ({ email, password }) => {
        return new Promise(async (resolve, reject) => {
            const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email });
            if (admin) {
                bcrypt.compare(password, admin.password).then((status) => {
                    if (status) {
                        delete admin.password
                        resolve({ status: true, admin });
                    } else {
                        reject({ status: false, errMessage: 'Incorrect password.' });
                    }
                });
            } else {
                reject({ status: false, errMessage: 'Cannot find admin.' });
            }
        });
    },
    updateProfilePicture: (adminId, profilePicStatus) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({
                _id: ObjectID(adminId)
            }, {
                $set: {
                    profilePic: profilePicStatus
                }
            }).then(async (response) => {
                const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(adminId) });
                delete admin.password;
                resolve({admin, alertMessage: 'Success.'});
            }).catch((error) => {
                reject({ error, errMessage: 'Faild to update profile picture.' });
            });
        });
    },
    updateAdminDetails: ({ name, email }, adminId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADMIN_COLLECTION).updateOne({
                _id: ObjectID(adminId)
            }, {
                $set: {
                    name,
                    email
                }
            }).then(async (response) => {
                const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(adminId) });
                delete admin.password;
                resolve({ admin, alertMessage: 'Updated successfully.' });
            }).catch((error) => {
                reject({ error, errMessage: 'Failde to update admin details.' });
            });
        });
    },
    changePassword: ({ password, newPassword, confirmPassword }, adminId) => {
        return new Promise(async (resolve, reject) => {
            const admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ _id: ObjectID(adminId) });
            bcrypt.compare(password, admin.password).then(async (status) => {
                if (status) {
                    if (newPassword === confirmPassword) {
                        newPassword = await bcrypt.hash(newPassword, 10);
                        db.get().collection(collection.ADMIN_COLLECTION).updateOne({
                            _id: ObjectID(adminId)
                        }, {
                            $set: {
                                password: newPassword
                            }
                        }).then((response) => {
                            resolve({ alertMessage: 'Password changed successfully' });
                        })
                    } else {
                        reject({ errMessage: "Entered passwords dosen't match" });
                    }
                } else {
                    reject({ errMessage: 'Incorrect password.' });
                }
            });
        });
    }
}