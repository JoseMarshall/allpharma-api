require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');


//     "Comentarios": [{
//         "Classificacao": 5,
//         "Message": {
//             "From": "",
//             "Subject": "",
//             "Text": "",
//             "CreatedAt": "",
//             "UpdatedAt": ""
//         }
//     }],


exports.create = async (req, res, next) => {

    req.body.comentario.mensagem.updatedAt = null
    req.body.comentario.mensagem.createdAt = moment().toJSON()

    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .add(req.body.comentario)
        .then(function (result) {

            return res.status(201).json({
                msg: `Comentário ${result.id} criado com sucesso `
            })

        })
        .catch(function (error) {
            return res.status(500).json({ msg: error.message })
        });

}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.query.farmacia)
        .collection('Comentarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este comentário não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.query.farmacia)
        .collection('Comentarios')
        .get()
        .then(async (snap) => {
            for (const doc of snap.docs) {
                array.push({ id: doc.id, ...doc.data(), link: '/comentarios/' + doc.id })
            }

            return res.status(200).json(array)

        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.query.farmacia)
        .collection('Comentarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().message.from == req.body.connection.contaUsuariosId) {
                    doc.ref.delete()
                        .then((result) => {
                            return res.status(200).json({ msg: 'Deleted Successfully', result })
                        })
                        .catch(next)
                }
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}

exports.update = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.query.farmacia)
        .collection('Comentarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().message.from == req.body.connection.contaUsuariosId) {

                    req.body.comentario.updatedAt = moment().toJSON()
                    doc.ref.update(req.body.comentario)
                        .then((result) => {
                            res.status(201).send({
                                msg: 'Updated Successfuly',
                                result,
                                id: doc.id,
                                link: process.env.URL_ROOT + '/comentario/' + doc.id
                            })
                        })
                        .catch(next)
                }
            } else {
                next()
            }
        })
        .catch(next)

}