const { db } = require('../credentials/admin')

const moment = require('moment')


// "PedidosAjuda": [{
//     "DescricaoPedido": "",
//     "NomePaciente": "",
//     "NumIdentificacaoPaciente": "",
//     "Endereco": {
//         "Provincia": "",
//         "Municipio": "",
//         "Bairro": "",
//         "Rua": "",
//         "Andar": "",
//         "NumPorta": "",
//         "Latitude": "",
//         "Longitude": ""
//     },
//     "NivelUrgencia":"Normal"
//     "Status": 0,
//     "CreatedAt": "",
//     "UpdatedAt": ""
// }]

exports.create = (req, res, next) => {

    req.body.pedidoAjuda.clientePacienteId = req.body.connection.contaUsuariosId
    req.body.pedidoAjuda.atendidoPor = null
    req.body.pedidoAjuda.updatedAt = null
    req.body.pedidoAjuda.createdAt = moment().toJSON()

    return db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('PedidosAjuda')
        .add(req.body.pedidoAjuda)
        .then((docRef) => {
            return db
                .collection('PedidosAjuda')
                .doc(docRef.id)
                .set(req.body.pedidoAjuda)
                .then(() => {
                    console.log('Pedido de Ajuda cadastrado com sucesso');
                    return res.status(201).json({ msg: 'Pedido de Ajuda cadastrado com sucesso' })
                })
                .catch(next)

        })
        .catch(next)


}

exports.getOne = (req, res, next) => {

    db
        .collection('PedidosAjuda')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Esta pedido não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('PedidosAjuda')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/pedidosAjuda/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum pedido de ajuda' })
            }
        })
        .catch(next)
}

exports.getAllByCliente = (req, res, next) => {

    let array = []
    db
        .collection('PedidosAjuda')
        .where('clientePacienteId', '==', req.connection.contaUsuariosId)
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/pedidosAjuda/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum pedido de ajuda' })
            }
        })
        .catch(next)
}


exports.update = (req, res, next) => {
    db
        .collection('PedidosAjuda')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.pedidoAjuda.updatedAt = moment().toJSON()
                doc.ref
                    .update(req.body.pedidoAjuda)
                    .then((result) => {
                        return db
                            .collection('ClientesPacientes')
                            .doc(doc.data().clientePacienteId)
                            .collection('PedidosAjuda')
                            .doc(req.params.id)
                            .update(req.body.pedidoAjuda)
                            .then(() => {

                                return res.status(201).send({
                                    msg: 'Updated Successfuly',
                                    result,
                                    id: doc.id,
                                    link: process.env.URL_ROOT + '/pedidosAjuda/' + doc.id
                                })
                            })
                            .catch(next)
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)
}


exports.delete = (req, res, next) => {

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('PedidosAjuda')
        .doc(req.params.id)
        .delete()
        .then(() => {

            return db
                .collection('PedidosAjuda')
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
        })
        .catch(next)

}