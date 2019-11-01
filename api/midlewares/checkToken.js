require('dotenv').config()
const jwt = require('jsonwebtoken')
const { db } = require('../../functions/credentials/admin')



exports.check = (req, res, next) => {
    try {
        const incomingToken = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(incomingToken, process.env.JWT_KEY)
        db
            .collection('ContaUsuarios')
            .doc(decodedToken.ContaUsuariosId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const {
                        CollectionName,
                        ContaUsuariosOrganizacaoPai,
                        ContaUsuariosId
                    } = doc.data()
                    if (CollectionName == decodedToken.CollectionName) {
                        req.body.connection.CollectionName = CollectionName,
                            req.body.connection.ContaUsuariosOrganizacaoPai = ContaUsuariosOrganizacaoPai,
                            req.body.connection.ContaUsuariosId = ContaUsuariosId
                    }
                }

                //Continua a execução chamando o próximo middleware da pilha
                next()

            })
            .catch(err => { throw err })

    } catch (err) {
        return res.status(403)
            .send({
                msg: 'You\'re not authorized, please log again',
                url: process.env.URL_ROOT + '/auth/',
                error: err.message
            })
    }
}