require('dotenv').config()
const nodemailer = require('nodemailer')
const handleBars = require('handlebars')
const fs = require('fs')
const path = require('path')

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, //The OlYn's email service
    auth: {
        user: process.env.EMAIL_ADDRESS, //The OlYn's email
        pass: process.env.EMAIL_PASSWORD // The OlYn email's password
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
    console.log('Trying to send email to: ' + emailDest);
    send(emailDest, HTML)
        .then(data => {
            console.log(data);
            fs.appendFileSync(path.join(__dirname, 'sendingSuccessful.txt'),
                '=========================================================================' +
                JSON.stringify(data) +
                '\n=========================================================================\n', { encoding: 'utf8' })

        })
        .catch(err => {
            console.log(err);
            fs.appendFileSync(path.join(__dirname, 'sendingFailed.txt'), `${context.userName};${context.password};${emailDest}$`, { encoding: 'utf8' })
        });
}

exports.sendEmailSignUp = (user, pass, emailDest) => {
    //O contexto a ser enviado para o email do usuario
    const context = {
        userName: user,
        password: pass,
        link: `${process.env.URL_ROOT}/auth?username=${user}&password=${pass}`
    };
    const HTML = loadTemplate('credentials.hbs', context); //O html que irá no corpo do e-amil
    console.log('Trying to send email to: ' + emailDest);
    return send(emailDest, HTML)
        .then(data => {
            console.log(data);
            fs.appendFileSync(path.join(__dirname, 'sendingSuccessful.txt'),
                '=========================================================================\n' +
                JSON.stringify(data) +
                '=========================================================================\n', { encoding: 'utf8' })

        })
        .catch(err => {
            console.log(err);
            fs.appendFileSync(path.join(__dirname, 'sendingFailed.txt'), `${context.userName};${context.password};${emailDest}$`, { encoding: 'utf8' })
        });
}

exports.resendAllFailedEmail = () => {

    fs.readFile(path.join(__dirname, 'sendingFailed.txt'), { encoding: 'utf8' }, async(err, data) => {
        let stringContent
        let myArray
        myArray = [...data.split('$')]

        /**
         * Apagar o conteudo do ficheiro
         */
        await fs.writeFileSync(path.join(__dirname, 'sendingFailed.txt'), '', { encoding: 'utf8' })

        myArray.map((l) => {
            if (l !== '') {
                stringContent = l.split(';')
                    //invocar função que envia  email
                sendEmailSignUp(stringContent[0], stringContent[1], stringContent[2])
            }
        })

    })

}