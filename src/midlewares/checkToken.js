require('dotenv').config()
const jwt = require('jsonwebtoken')
const { db } = require('../credentials/admin')

exports.checkToken = (req, res, next) => {
    if (req.headers.authorization === 'allpharma-client-mobile-app') {
        req.body.connection = {
            contaUsuariosOrganizacaoPai: req.query.contaUsuariosOrganizacaoPai,
            contaUsuariosId: req.query.contaUsuariosOrganizacaoPai,
        }
        //Continua a execução chamando o próximo middleware da pilha
        next()
        return;
    }
    try {
        const decodedToken = jwt.verify(req.headers.authorization, process.env.JWT_KEY)
        db
            .collection('ContaUsuarios')
            .doc(decodedToken.contaUsuariosId)
            .get()
            .then(doc => {
                if (doc.exists) {
                    const {
                        collectionName,
                        contaUsuariosOrganizacaoPai
                    } = doc.data()
                    if (collectionName == decodedToken.collectionName) {
                        req.body.connection = {
                            collectionName,
                            contaUsuariosOrganizacaoPai,
                            contaUsuariosId: doc.id
                        }
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

exports.checkMenuAccess = (req, res, next) => {

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                let { menus } = doc.data()
                return menus.includes(req.url.replace(req.params.id, '')) ?
                    next() :
                    res.status(403).json({
                        msg: 'You\'re not authorized'
                    })

            } else {
                return res.status(403).json({
                    msg: 'You\'re not authorized'
                })
            }
        })

}