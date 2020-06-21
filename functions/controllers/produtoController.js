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


exports.create = async(req, res, next) => {

    req.body.produto.updatedAt = null
    req.body.produto.createdAt = moment().toJSON()

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.body.produto.categoria)
        .collection('Produtos')
        .add(req.body.produto)
        .then(function() {
            console.log(`Produto ${req.body.produto.nome} criado com sucesso `);
            return res.status(201).json({ msg: `Produto ${req.body.produto.nome} criado com sucesso ` })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar produto ${req.body.produto.nome} à Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.body.categoria)
        .collection('Produtos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Este produto não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let produtos = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .get()
        .then(snap => {            
            snap.docs.map(doc => {
                doc.ref.collection('Produtos')
                    .get()
                    .then(async(p) => {
                        
                            await p.forEach(produto => {
                                produtos.push({ id: produto.id, data: produto.data(), link: process.env.URL_ROOT + '/produto/' + doc.id })
                                console.log({ id: produto.id, data: produto.data() });
                            })
                        
                            return res.status(200).json(produtos)
                    })
            })
            
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.body.categoria)
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
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.body.categoria)
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
                            link: process.env.URL_ROOT + '/produto/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}