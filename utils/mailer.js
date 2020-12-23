const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const handleBars = require('nodemailer-express-handlebars');

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

module.exports.sendMail = function (mailOptions) {
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

        transport.use('compile', handleBars({          
                viewEngine: {  
                extname: '.hbs',
                layoutsDir: 'views/templates/',
                defaultLayout : 'main'           
                },
                viewPath: './views',                   
                extName: '.hbs'
        }));

        transport.sendMail(mailOptions).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    });
}