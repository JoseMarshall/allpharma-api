require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');
// {
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

    req.body.perfil.updatedAt = null
    req.body.perfil.createdAt = moment().toJSON()

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Perfis')
        .doc(req.body.perfil.nome)
        .set({ nome: req.body.perfil.nome, menus: req.body.perfil.menus })
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
                return res.status(404).json({ msg: 'Este perfil não foi encontrado' })
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
        .then(async(snap) => {
            await snap.docs.map(doc => {
                perfis.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/perfil/' + doc.id })
                console.log({ id: doc.id, data: doc.data() });
            })
            return res.status(200).json(perfis)
            
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
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}