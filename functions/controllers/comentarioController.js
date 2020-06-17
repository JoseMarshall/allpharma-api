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


exports.create = async(req, res, next) => {

    req.body.comentario.mensagem.updatedAt = null
    req.body.comentario.mensagem.createdAt = moment().toJSON()

    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .add(req.body.comentario)
        .then(function(result) {

            console.log(`Comentário ${result.id} criado com sucesso `);

            return res.status(201).json({
                msg: `Comentário ${result.id} criado com sucesso `
            })

        })
        .catch(function(error) {
            console.error(`Falha ao postar o comentário`, error.message);
            return res.status(500).json({ msg: error.message })
        });

}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Este comentário não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/comentario/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })

                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registo' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().Mensagem.From == req.body.connection.contaUsuariosId) {
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
        .doc(req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().mensagem.from == req.body.connection.contaUsuariosId) {

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