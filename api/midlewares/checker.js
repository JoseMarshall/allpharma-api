const stringHelper = require('../helpers/stringHelper')
const { db } = require('../../functions/credentials/admin')

/**
 * 
 * @param {Object} form - an object whith these signature
 * {
 * Objecto:{
 * primeiroNome,
 * apelido,
 * dataNascimento
 * }
 * }
 */
const generateNewCredentials = (form) => {

    return new Promise(async(resolve, reject) => {

        const milliSeconds = new Date().getMilliseconds().toString()
        const day = new Date().getDate().toString()
        let credentialGenerated = '' //Username temporario
        let keepOn = true
        let nameTrimed
            //testa cada possivel username dentro do array, e atribuir o primeiro válido ao credentialGenerated
        for (let iterator of[
                form.Objecto.primeiroNome,
                form.Objecto.apelido,
                form.Objecto.primeiroNome + day,
                form.Objecto.apelido + day,
                form.Objecto.primeiroNome + milliSeconds,
                form.Objecto.apelido + milliSeconds,
                form.Objecto.primeiroNome[0] + form.Objecto.apelido,
                form.Objecto.primeiroNome[0] + form.Objecto.apelido + milliSeconds[0],
                form.Objecto.primeiroNome[0] + form.Objecto.apelido + milliSeconds[1],
                form.Objecto.primeiroNome[0] + form.Objecto.apelido + milliSeconds[2],
                form.Objecto.primeiroNome[0] + form.Objecto.apelido + day,
                form.Objecto.primeiroNome + form.Objecto.dataNascimento.slice(8),
                form.Objecto.primeiroNome + form.Objecto.dataNascimento.slice(8) + milliSeconds
            ]) {
            iterator = stringHelper.removeEspecialChars(iterator)

            await existsUserName(iterator).then(x => {
                if (!x) {
                    credentialGenerated = iterator
                    keepOn = false
                }

            })

            if (!keepOn) break

        }



        if (credentialGenerated === '') {
            nameTrimed = stringHelper.removeEspecialChars(form.redeFarmacias.proprietario.primeiroNome)
            let count = 0
            await
            db
                .collection('ContaUsuarios')
                .get()
                .then((snapshot) => {
                    snapshot.forEach((doc) => {
                        if (doc.id.startsWith(nameTrimed)) {
                            count++
                        }
                    })
                })


            //A partir do numero de ocorrencias, gera um novo userName composto por: PrimeiroNome+(Numero de ocorrencias+1)            
            credentialGenerated = nameTrimed + (++count)

        }
        resolve({
            userName: credentialGenerated,
            password: Math.floor((Math.random() * 999999) + 100000).toString()
        })

    })
}


/*Check if this userName already exixts, if true return an alternative userName*/
const existsUserName = (userName) => {
    return new Promise((resolve, reject) => {
        db
            .collection('ContaUsuarios')
            .doc(userName)
            .get()
            .then(doc => {
                resolve(doc.exists)
            })
            .catch(err => {
                console.error('Error getting documents', err);
                reject(err)
            })

    })

};


/*Check if this email already exixts*/
const existsEmail = (email) => {
    return new Promise((resolve, reject) => {

        db
            .collection('ContaUsuarios')
            .doc(email)
            .get()
            .then(doc => {
                resolve(doc.exists)
            })
            .catch(err => {
                console.error('Error getting documents', err);
                reject(err)
            })


    })
};

/*Check if this codeVerification is Valide*/
const existsCodeVerification = (userName, code) => {
    return new Promise((resolve, reject) => {

        db
            .collection('ContaUsuarios')
            .where('Username', '==', userName)
            .where('CodigoVerificacao', '==', code)
            .get()
            .then(snapshot => {
                resolve(!snapshot.empty)
            })
            .catch(err => {
                console.error('Error getting documents', err);
                reject(err)
            })



    })
};

exports.existsCodeVerification = existsCodeVerification
exports.existsEmail = existsEmail
exports.existsUserName = existsUserName
exports.generateNewCredentials = generateNewCredentials