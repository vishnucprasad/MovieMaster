const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID

const client = require('twilio')(accountSid, authToken);

function sendVerificationToken(mobile) {
    return new Promise((resolve, reject) => {
        client.verify.services(serviceSid)
            .verifications
            .create({ to: mobile, channel: 'sms' })
            .then((verification) => {
                resolve(verification);
            });
    });
}

function checkVerificationToken({ mobile, OTP }) {
    return new Promise((resolve, reject) => {
        client.verify.services(serviceSid)
            .verificationChecks
            .create({ to: mobile, code: OTP })
            .then((verification_check) => {
                console.log(verification_check)
                resolve(verification_check);
            }).catch((error) => {
                reject(error);
            });
    });
}

module.exports = { sendVerificationToken, checkVerificationToken }