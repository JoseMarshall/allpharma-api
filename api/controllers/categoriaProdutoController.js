require('dotenv').config()
const { db } = require('../../functions/credentials/admin')
    // "CategoriasProduto": [{
    //     "Nome": ""
    // }]

exports.create = async(req, res, next) => {


    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.body.categoriaProduto.nome)
        .set({ Nome: req.body.categoriaProduto.nome })
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
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('CategoriasProduto')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Esta categoria não foi encontrada' })
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
            if (!snap.empty) {
                snap.docs.map(doc => {
                    categorias.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/categoriasProduto/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(categorias)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum perfil' })
            }
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
                next()
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
                        res.status(201).send({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/categoriasProduto/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                next()
            }
        })
        .catch(next)

}