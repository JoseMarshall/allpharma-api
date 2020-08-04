require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');



// "Respostas": [{
//                 "From": "",
//                 "Text": "",
//                 "CreatedAt": "",
//                 "UpdatedAt": ""
//             }]



exports.create = async(req, res, next) => {

    req.body.resposta.updatedAt = null
    req.body.resposta.createdAt = moment().toJSON()

    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosId || req.body.connection.contaUsuariosOrganizacaoPai || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.params.id)
        .collection('Respostas')
        .add(req.body.resposta)
        .then(function(result) {

            console.log(`Resposta ${result.id} criada com sucesso `);

            return res.status(201).json({
                msg: `Resposta ${result.id} criada com sucesso `
            })

        })
        .catch(function(error) {
            console.error(`Falha ao responder ao comentário`, error.message);
            return res.status(500).json({ msg: error.message })
        });

}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId || req.body.farmacia.redeFarmaciaId )
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.params.id)
        .collection('Respostas')
        .get()
        .then(async(snap) => {
            
            await snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data() })
                console.log({ id: doc.id, data: doc.data() });
            })

            return res.status(200).json(array)
            
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc( req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.body.comentario.comentarioId)
        .collection('Respostas')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                if (doc.data().from == req.body.connection.contaUsuariosId) {
                    doc.ref.delete()
                        .then((result) => {
                            return res.status(200).json({ msg: 'Deleted Successfully', result })
                        })
                        .catch(next)
                } else {
                    return res.status(404).json({ msg: 'Unable to delete' })

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
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Comentarios')
        .doc(req.body.comentario.comentarioId)
        .collection('Respostas')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.resposta.updatedAt = moment().toJSON()
                if (doc.data().from == req.body.connection.contaUsuariosId) {
                    doc.ref.update(req.body.resposta)
                        .then((result) => {
                            res.status(201).send({
                                msg: 'Updated Successfuly',
                                result,
                                id: doc.id
                            })
                        })
                        .catch(next)
                }
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}