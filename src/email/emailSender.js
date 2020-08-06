require('dotenv').config()
const nodemailer = require('nodemailer')
const handleBars = require('handlebars')
const fs = require('fs')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const clientId = '1010002138431-tn5ag045ijnsau0pbpc9g5uh83krsmi7.apps.googleusercontent.com'
const clientSecret = '_8vXs2cGX8CWUZ06zsA6yHgQ'
const refreshToken = '1//040EPxtx8hRXQCgYIARAAGAQSNwF-L9IrvEkhdmz1DqEuUeY_V-GLnvlHAFu-Kh_tKdAljTcPsP8ojoFTGyFboQR6JRwDtYjxpKw'

const myOAuth2Client = new OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
)

myOAuth2Client.setCredentials({
    refresh_token: refreshToken
});
const accessToken = myOAuth2Client.getAccessToken()

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, //The OlYn's email service
    auth: {
        user: process.env.EMAIL_ADDRESS, //The OlYn's email
        type: 'OAuth2',
        accessToken,
        clientId,
        clientSecret,
        refreshToken

    }
})

let mailOptions = {
    from: process.env.EMAIL_ADDRESS, //The OlYn's email
    to: '',
    subject: 'Credenciais de Acesso à Plataforma da OlYn',
    html: ''
}

/***
 * @param context {Object} - An object that contains the keys to be embeded into email template 
 * Render the email's template with the data comming from the context
 * @returns {result} An HTML
 * 
 */
const loadTemplate = (name, context) => {
    let source = fs.readFileSync(__dirname + '/' + name, { encoding: 'utf-8' })
    let template = handleBars.compile(source)
    let result = template(context)
    return result;
}

/***
 * @param destiny {String} - the destinatary of email 
 * @param hypertext {String} - the HTML to be sent in the email's body
 *  
 * Send an email to {destiny} containing the {hypertext}
 */
const send = (destiny, hypertext) => {
    mailOptions.to = destiny
    mailOptions.html = hypertext

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions)
            .then(resolve)
            .catch(reject)
    })

};

exports.sendEmaiValidationCode = (user, validationCode, link, emailDest) => {
    //O contexto a ser enviado para o email do usuario
    const context = {
        userName: user,
        validatitionCode: validationCode,
        link
    };
    const HTML = loadTemplate('accountReativation.hbs', context); //O html que irá no corpo do e-amil
    send(emailDest, HTML)
        .then(console.log)
        .catch(console.error);
}

exports.sendEmailSignUp = (user, pass, emailDest) => {
    //O contexto a ser enviado para o email do usuario
    const context = {
        userName: user,
        password: pass,
        link: `${process.env.FRONT_END}/auth?username=${user}&password=${pass}`
    };
    const HTML = loadTemplate('credentials.hbs', context); //O html que irá no corpo do e-amil
    return send(emailDest, HTML)
        .then(console.log)
        .catch(console.error);
}