require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');

// "Stock": [{
//         "Nome": "",
//         "CodigoBarra": "",
//         "CodigoQR": "",
//         "Peso": "",
//         "Dosagem": "",
//         "QuantidadeInicial": 1,
//         "QuantidadeDisponivel": 1,
//         "PrecoUnitarioVenda": 100,
//         "Encomendavel": true,
//         "CreatedAt": "",
//         "UpdatedAt": ""
//     }]



exports.create = async(req, res, next) => {

    if (!contains(req.body.stock.codigoBarra, req.body)) {
        req.body.stock.updatedAt = null
        req.body.stock.createdAt = moment().toJSON()
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.body.farmacia.farmaciaId)
            .collection('Stocks')
            .add(req.body.stock)
            .then(function(result) {

                console.log(`Stock ${result.id} criado com sucesso `);

                return res.status(201).json({
                    msg: `Stock ${result.id} criado com sucesso `
                })

            })
            .catch(function(error) {
                console.error(`Falha ao cadastrar Stock`, error.message);
                return res.status(500).json({ msg: error.message })
            });
    } else {
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.body.farmacia.farmaciaId)
            .collection('Stocks')
            .doc(req.body.stock.id)
            .then(function(doc) {
                doc.ref.update({
                    quantidadeInicial: req.body.stock.quantidadeInicial,
                    quantidadeDisponivel: req.body.stock.quantidadeDisponivel,
                    updatedAt: moment().toJSON()
                })
                console.log(`Stock ${result.id} criado com sucesso `);

                return res.status(201).json({
                    msg: `Stock ${result.id} criado com sucesso `
                })

            })
            .catch(function(error) {
                console.error(`Falha ao cadastrar Stock`, error.message);
                return res.status(500).json({ msg: error.message })
            });
    }
}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Stocks')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este Stock não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Stocks')
        .get()
        .then(async(snap) => {
            
                await snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/stocks/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })

                return res.status(200).json(array)
           
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Stocks')
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


function contains(barCode, body) {
    db
        .collection('RedeFarmacias')
        .doc(body.connection.contaUsuariosOrganizacaoPai || body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(body.farmacia.farmaciaId)
        .collection('Stocks')
        .where('CodigoBarra', '==', barCode)
        .get()
        .then(function(result) {
            if (!result.empty) {
                result.forEach(r => {
                    body.stock.id += r.id
                    body.stock.quantidadeInicial += r.data().quantidadeInicial
                    body.stock.quantidadeDisponivel += r.data().quantidadeDisponivel
                })
                return true
            }
            return false
        })
}