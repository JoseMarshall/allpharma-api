const stringHelper = require('../helpers/stringHelper')
const { db } = require('../credentials/admin')

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

        const milliSeconds = new Date().getMilliseconds().toString() + '00'
        const day = new Date().getDate().toString()
        let credentialGenerated = '' //Username temporario
        let keepOn = true
        let nameTrimed
            //testa cada possivel username dentro do array, e atribuir o primeiro válido ao credentialGenerated
        for (let iterator of[
                form.objecto.primeiroNome,
                form.objecto.apelido,
                form.objecto.primeiroNome + day,
                form.objecto.apelido + day,
                form.objecto.primeiroNome + milliSeconds,
                form.objecto.apelido + milliSeconds,
                form.objecto.primeiroNome[0] + form.objecto.apelido,
                form.objecto.primeiroNome[0] + form.objecto.apelido + milliSeconds[0],
                form.objecto.primeiroNome[0] + form.objecto.apelido + milliSeconds[1],
                form.objecto.primeiroNome[0] + form.objecto.apelido + milliSeconds[2],
                form.objecto.primeiroNome[0] + form.objecto.apelido + day,
                form.objecto.primeiroNome + form.objecto.dataNascimento.slice(8),
                form.objecto.primeiroNome + form.objecto.dataNascimento.slice(8) + milliSeconds
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
            nameTrimed = stringHelper.removeEspecialChars(form.objecto.primeiroNome)
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
            .where('username', '==', userName)
            .where('codigoVerificacao', '==', code)
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