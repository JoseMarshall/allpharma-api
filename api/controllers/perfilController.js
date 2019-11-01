require('dotenv').config()
const { db } = require('../../functions/credentials/admin')
    // {
    //     "connection": {
    //         "contaUsuariosId": "",
    //         "collectionName": ""
    //     },
    //     "perfil": {
    //         "nome": "",
    //         "menus": [
    //             {
    //                 "nome": "",
    //                 "url": ""
    //             }
    //         ]
    //     }
    // }
exports.create = async(req, res, next) => {


    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Perfis')
        .doc(req.body.perfil.nome)
        .set({ Nome: req.body.perfil.nome, Menus: req.body.perfil.menus })
        .then(function() {
            console.log(`Perfil ${req.body.perfil.nome} criado com sucesso `);
            return res.status(201).json({ msg: `Perfil ${req.body.perfil.nome} criado com sucesso ` })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar perfil ${req.body.perfil.nome} a Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Perfis')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Este perfil não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let perfis = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Perfis')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    perfis.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/perfil/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(perfis)
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
        .collection('Perfis')
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