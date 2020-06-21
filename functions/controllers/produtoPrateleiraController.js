require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');


//  "ProdutosPrateleira": [{
//         "Nome": "",
//         "CodigoBarra": "",
//         "CodigoQR": "",
//         "Peso": "",
//         "Dosagem": "",
//         "Quantidade": 1,
//         "PrecoUnitarioVenda": 100,
//         "Encomendavel": true,
//         "Visivel": true,
//         "Imagens": [{
//             "Perfil": "",
//             "Uploads": [{
//                 "Caminho": "",
//                 "CreatedAt": ""
//             }]
//         }],
//         "CreatedAt": "",
//         "UpdatedAt": ""
//     }]


exports.create = async(req, res, next) => {

    if (!contains(req.body.produtoPrateleira.codigoBarra, req.body)) {
        req.body.produtoPrateleira.updatedAt = null
        req.body.produtoPrateleira.createdAt = moment().toJSON()
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.body.farmacia.farmaciaId)
            .collection('ProdutosPrateleira')
            .add(req.body.produtoPrateleira)
            .then(function(result) {

                console.log(`Stock ${result.id} criado com sucesso `);

                return res.status(201).json({
                    msg: `Stock ${result.id} criado com sucesso `
                })

            })
            .catch(function(error) {
                console.error(`Falha ao colocar o produto na prateleira`, error.message);
                return res.status(500).json({ msg: error.message })
            });
    } else {
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.body.farmacia.farmaciaId)
            .collection('ProdutosPrateleira')
            .doc(req.body.produtoPrateleira.id)
            .then(function(doc) {
                doc.ref.update({
                    quantidade: req.body.produtoPrateleira.quantidade,
                    updatedAt: moment().toJSON()
                })
                console.log(`Produto ${req.body.produtoPrateleira.codigoBarra} colocado com sucesso.`);

                return res.status(201).json({
                    msg: `Produto ${req.body.produtoPrateleira.codigoBarra} colocado com sucesso.`
                })

            })
            .catch(function(error) {
                console.error(`Falha: `, error.message);
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
        .collection('ProdutosPrateleira')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este regiso não foi encontrado' })
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
        .collection('ProdutosPrateleira')
        .get()
        .then(async(snap) => {
            await snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/produtosPrateleira/' + doc.id })
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
        .collection('ProdutosPrateleira')
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
        .collection('ProdutosPrateleira')
        .where('codigoBarra', '==', barCode)
        .get()
        .then(function(result) {
            if (!result.empty) {
                result.forEach(r => {
                    body.produtoPrateleira.id += r.id
                    body.produtoPrateleira.quantidade += r.data().quantidade
                })
                return true
            }
            return false
        })
}