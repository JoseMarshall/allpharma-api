require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');
// "CategoriasProduto": [{
//     "Nome": ""
// }]

exports.create = async(req, res, next) => {

    req.body.categoriaProduto.updatedAt = null
    req.body.categoriaProduto.createdAt = moment().toJSON()

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .add({ nome: req.body.categoriaProduto.nome })
        .then(function() {
            console.log(`Categoria ${req.body.categoriaProduto.nome} criada com sucesso `);
            return res.status(201).json({ msg: `Categoria ${req.body.categoriaProduto.nome} criada com sucesso ` })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar categoria ${req.body.categoriaProduto.nome} à Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    const docRef = db
                    .collection(req.body.connection.collectionName)
                    .doc(req.body.connection.contaUsuariosId)
                    .collection('CategoriasProduto')
                    .doc(req.params.id)
        docRef.get()
        .then(doc => {
            if (doc.exists) {
                const category = doc.data()
                category.produtos=[] 
                docRef.collection('Produtos')
                .get()
                .then(async(products)=>{
                    for (const product of products.docs) {
                        await category.produtos.push({
                            id:product.id,
                            ...product.data() 
                        }) 
                    }

                    return res.status(200).json(category)
                })
                .catch(next)

            } else {
                return res.status(404).json({ msg: 'Esta categoria não foi encontrada' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let categorias = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .get()
        .then(snap => {
            snap.docs.map(doc => {
                categorias.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/categoriasProduto/' + doc.id })
            })
            return res.status(200).json(categorias)            
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
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
                return res.status(404).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}

exports.update = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.update(req.body.categoria)
                    .then((result) => {
                        doc.ref.id = req.body.categoria.nome
                        res.status(201).send({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/categoriasProduto/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}