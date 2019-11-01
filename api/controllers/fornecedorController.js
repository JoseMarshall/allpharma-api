require('dotenv').config()
const { db } = require('../../functions/credentials/admin')

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

exports.create = async(req, res, next) => {

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .add(req.body.fornecedor)
        .then(function() {
            console.log(`Fornecedor ${req.body.fornecedor.nome} criado com sucesso `);
            return res.status(201).json({ msg: `Fornecedor ${req.body.fornecedor.nome} criado com sucesso ` })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar fornecedor ${req.body.fornecedor.nome} à Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });
}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Este fornecedor não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let fornecedores = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Fornecedores')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    fornecedores.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/fornecedor/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(fornecedores)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum fornecedor' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
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
                next()
            }
        })
        .catch(next)

}

exports.update = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
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
                next()
            }
        })
        .catch(next)

}