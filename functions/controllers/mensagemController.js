const { db } = require('../credentials/admin')

const moment = require('moment')

// "Mensagens": [{
//     "From": "",
//     "To": "",
//     "Subject": "",
//     "Text": "",
//     "CreatedAt": "",
//     "UpdatedAt": ""
// }]

exports.create = (req, res, next) => {

    req.body.mensagem.updatedAt = null
    req.body.mensagem.createdAt = moment().toJSON()

    return db
        .collection('Mensagens')
        .add(req.body.mensagem)
        .then(function() {
            console.log('Mensagem envida com sucesso');
            return res.status(201).json({ msg: 'Mensagem envida com sucesso' })
        })
        .catch(next);

}

exports.getOne = (req, res, next) => {

    db
        .collection('Mensagens')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Esta mensagem não foi encontrada' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('Mensagens')
        .where('to', '==', req.body.connection.contaUsuariosId)
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/mensagens/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhuma mensagem' })
            }
        })
        .catch(next)
}

exports.delete = (req, res, next) => {
    db
        .collection('Mensagens')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.delete()
                    .then((result) => {
                        return res.status(200).json({ msg: 'Deleted Successfully', result })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}