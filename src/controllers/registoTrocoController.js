require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');
const guid = require('guid');
//     "RegistoTroco": [{
//         "Referencia": "",
//         "ValorTroco": 100,
//         "Venda": {
//             "Descricao": "",
//             "NomeFuncionario": "",
//             "NumIdentificacaoFuncionario": ""
//         }
//     }],

exports.create = async(req) => {

    req.body.registoTroco.updatedAt = null
    req.body.registoTroco.createdAt = moment().toJSON()
    const myGuid = guid.create().value
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('RegistoTroco')
        .doc(myGuid)
        .set({
            referencia: myGuid,
            ...req.body.registoTroco
        })
        .then(function(result) {
            console.log(`Troco ${result.id} registado com sucesso `);
        })
        .catch(function(error) {
            console.error(`Falha ao registar o troco `, error.message);
        });

}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('RegistoTroco')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este registo não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('RegistoTroco')
        .get()
        .then(async(snap) => {
            
            await snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/registoTroco/' + doc.id })
                console.log({ id: doc.id, data: doc.data() });
            })
            return res.status(200).json(array)
           
        })
        .catch(next)

}

exports.delete = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('RegistoTroco')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.delete()
                    .then((result) => {
                        return res.status(201).json({ msg: 'Deleted Successfully', result })
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
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('RegistoTroco')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.update(req.body.registoTroco)
                    .then(() => {
                        return res.status(201).json({ msg: 'Updated Successfully' })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}