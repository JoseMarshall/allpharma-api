require('dotenv').config()
const { db } = require('../../functions/credentials/admin')
const guid = require('guid');
const moment = require('moment');
// "ComprasProduto": [{
//     "Descricao": "",
//     "TotalPago": 100000,
//     "Fornecedor": {
//         "Nome": "",
//         "NIF": ""
//     },
//     "ProdutosComprados": [{
//         "Nome": "",
//         "CodigoBarra": "",
//         "CodigoQR": "",
//         "Peso": "",
//         "Dosagem": "",
//         "Encomendavel": true,
//         "Quantidade": 1,
//         "Distribuido": 0,
//         "PrecoUnitarioCompra": 100,
//         "DataValidade": ""
//     }],   
//     "CreatedAt": "",
//     "UpdatedAt": ""
// }]

exports.create = async(req, res, next) => {

    let movimentos = []

    await req.body.comprasProduto.produtosComprados.map((p) => {
        let myObj1 = {
            referencia: guid.create().value,
            debito: 0,
            credito: p.precoUnitarioCompra * p.quantidade,
            planoContas: {
                numeroConta: "45",
                descricaoConta: "Caixa"
            },
            createdAt: moment().toJSON(),
            updatedAt: null
        }

        let myObj2 = {
            referencia: guid.create().value,
            debito: p.precoUnitarioCompra * p.quantidade,
            credito: 0,
            planoContas: {
                numeroConta: "26",
                descricaoConta: "Mercadorias"
            },
            createdAt: moment().toJSON(),
            updatedAt: null
        }
        movimentos.push(myObj1)
        movimentos.push(myObj2)
    })

    req.body.comprasProduto.movimentosCompra = movimentos
    req.body.comprasProduto.updatedAt = null
    req.body.comprasProduto.createdAt = moment().toJSON()

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('ComprasProduto')
        .add(req.body.comprasProduto)
        .then(function() {
            console.log(`Compras ${req.body.comprasProduto.descricao} criada com sucesso `);
            return res.status(201).json({ msg: `Compras ${req.body.comprasProduto.descricao} criada com sucesso ` })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar Compras ${req.body.comprasProduto.descricao} a Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('ComprasProduto')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Este registo decompras não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let perfis = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('ComprasProduto')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    perfis.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/comprasProduto/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(perfis)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registo' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('ComprasProduto')
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