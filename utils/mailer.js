require('dotenv/config');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

module.exports.sendMail = function (mailDetails) {
    return new Promise(async (resolve, reject) => {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken
            }
        });

        const mailOptions = {
            from: process.env.USER,
            to: mailDetails.to,
            subject: mailDetails.subject,
            html: mailDetails.html
        }

        transport.sendMail(mailOptions).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    });
}