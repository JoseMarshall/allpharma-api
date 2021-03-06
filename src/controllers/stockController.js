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



exports.create = async (req, res, next) => {

    const { found, stock } = await contains(req.body.stock.id, req)
    if (!found) {
        req.body.stock.updatedAt = null
        req.body.stock.createdAt = moment().toJSON()
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.params.farmaciaId)
            .collection('Stocks')
            .add(req.body.stock)
            .then(function (result) {
                return res.status(201).json({
                    msg: `Stock ${result.id} criado com sucesso `
                })
            })
            .catch(function (error) {
                return res.status(500).json({ msg: error.message })
            });
    } else {
        req.body.stock.quantidadeInicial += stock.quantidadeInicial
        req.body.stock.quantidadeDisponivel += stock.quantidadeDisponivel
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.params.farmaciaId)
            .collection('Stocks')
            .doc(stock.id)
            .get()
            .then(function (doc) {
                doc.ref.update({
                    quantidadeInicial: req.body.stock.quantidadeInicial,
                    quantidadeDisponivel: req.body.stock.quantidadeDisponivel,
                    updatedAt: moment().toJSON()
                })

                return res.status(201).json({
                    msg: `Stock ${doc.id} actualizado com sucesso `
                })

            })
            .catch(function (error) {
                return res.status(500).json({ msg: error.message })
            });
    }
}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.params.farmaciaId)
        .collection('Stocks')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este Stock n??o foi encontrado' })
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
        .doc(req.params.farmaciaId)
        .collection('Stocks')
        .get()
        .then((snap) => {
            snap.docs.forEach(doc => {
                array.push({ id: doc.id, ...doc.data(), farmaciaId: req.params.farmaciaId, link: '/stocks/' + doc.id })
            })

            return res.status(200).json(array)

        })
        .catch(next)

}


exports.update = (req, res, next) => {

    function errorHandling(error) {
        if (!res.headersSent) {
            res.status(500).send({
                msg: 'Error while updating',
                error
            })
        }
    }

    const stockCollection = db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.params.farmaciaId)
        .collection('Stocks')

    req.body.newStock.forEach((product) => {
        const { id } = product
        delete product.id
        stockCollection.where('id', '==', id)
            .get()
            .then((stock) => {
                if (!stock.empty) {
                    stock.docs[0].ref
                        .update(product)
                        .then((result) => {
                            if (!res.headersSent) {
                                res.status(201).send({
                                    msg: 'Updated Successfuly',
                                    result
                                })
                            }
                        })
                        .catch(errorHandling)
                }
                else {
                    errorHandling('Produto nao encontrado')
                }
            })
            .catch(errorHandling)
    })

}

exports.delete = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.params.farmaciaId)
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
                return res.status(204).send({ msg: 'N??o foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}


async function contains(id, { body, params }) {
    let obj
    await db
        .collection('RedeFarmacias')
        .doc(body.connection.contaUsuariosOrganizacaoPai || body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(params.farmaciaId)
        .collection('Stocks')
        .where('id', '==', id)
        .get()
        .then(function (result) {
            return obj = (!result.empty) ? { found: true, stock: { id: result.docs[0].id, ...result.docs[0].data() } } : { found: false }
        })
    return obj
}