require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');
//     "Produtos": [{
//         "Categoria":""
//         "Nome": "",
//         "CodigoBarra": "",
//         "CodigoQR": "",
//         "Peso": "",
//         "Dosagem": "",
//         "Encomendavel": true,
//         "Imagens": [{
//             "Perfil": "",
//             "Uploads": [{
//                 "Caminho": "",
//                 "CreatedAt": ""
//             }],
//             "CreatedAt": "",
//             "UpdatedAt": ""
//         }]
//     }]


exports.create = async (req, res, next) => {

    req.body.produto.updatedAt = null
    req.body.produto.createdAt = moment().toJSON()

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Produtos')
        .add(req.body.produto)
        .then((doc) => {
            return res.status(201).json({ msg: `Produto ${req.body.produto.nome}  ${doc.id} criado com sucesso ` })

        })
        .catch((error) => {
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Produtos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(200).json({ id: doc.id, ...doc.data() })
            } else {
                return res.status(404).json({ msg: 'Este produto não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let produtos = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Produtos')
        .get()
        .then((snap) => {
            snap.forEach(produto => {
                produtos.push({ id: produto.id, ...produto.data(), link: `/produtos/${produto.id}` })
            })

            return res.status(200).json(produtos)
        })
        .catch(next)


}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Produtos')
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
        .collection('Produtos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.update(req.body.produto)
                    .then((result) => {
                        res.status(201).send({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: '/produto/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}