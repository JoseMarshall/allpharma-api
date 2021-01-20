require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');
// "Fornecedores": [{
//     "Nome": "",
//     "Email": "",
//     "Descricao": "",
//     "NIF": "",
//     "Enderecos": [{
//         "Provincia": "",
//         "Municipio": "",
//         "Bairro": "",
//         "Rua": "",
//         "Andar": "",
//         "NumPorta": "",
//         "Latitude": "",
//         "Longitude": ""
//     }],
//     "PlanoContas": {
//         "NumeroConta": "",
//         "DescricaoConta": ""
//     },
//     "CreatedAt": "",
//     "UpdatedAt": ""

// }]

exports.create = async (req, res, next) => {

    req.body.fornecedor.updatedAt = null
    req.body.fornecedor.createdAt = moment().toJSON()

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .add(req.body.fornecedor)
        .then(function () {
            console.log(`Fornecedor ${req.body.fornecedor.nome} criado com sucesso `);
            return res.status(201).json({ msg: `Fornecedor ${req.body.fornecedor.nome} criado com sucesso ` })

        })
        .catch(function (error) {
            console.error(`Falha ao cadastrar fornecedor ${req.body.fornecedor.nome} à Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });
}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este fornecedor não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let fornecedores = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .get()
        .then(async (snap) => {

            await snap.docs.map(doc => {
                fornecedores.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/fornecedores/' + doc.id })
            })
            return res.status(200).json(fornecedores)

        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
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

exports.update = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.update(req.body.fornecedor)
                    .then((result) => {
                        res.status(201).send({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/fornecedor/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}