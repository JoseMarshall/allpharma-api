require('dotenv').config()
const { db } = require('../credentials/admin')
const registoTrocoController = require('./registoTrocoController');
const guid = require('guid');
const moment = require('moment');

//     "Vendas": [{
//         "Descricao": "",
//         "NomeFuncionario": "",
//         "NumIdentificacaoFuncionario": "",
//         "valorPago":100,
//         "troco":0,
//         "registaTroco": false,
//         "ProdutosVendidos": [{
//             "Nome": "",
//             "CodigoBarra": "",
//             "CodigoQR": "",
//             "Peso": "",
//             "Dosagem": "",
//             "Quantidade": 1,
//             "PrecoUnitarioVenda": 100,
//             "SubTotal": 100
//         }],
//         "NomeCliente": "",
//         "MovimentosVenda": {
//             "Referencia": "",
//             "Debito": 0,
//             "Credito": 0,
//             "PlanoContas": {
//                 "NumeroConta": "",
//                 "DescricaoConta": ""
//             }

//         },
//         "CreatedAt": "",
//         "UpdatedAt": ""
//     }]


// "RegistoTroco": [{
//     "Referencia": "",
//     "ValorTroco": 100,
//     "Vendas": {
//         "Descricao": "",
//         "NomeFuncionario": "",
//         "NumIdentificacaoFuncionario": ""
//     },
//     "PlanoContas": {
//         "NumeroConta": "",
//         "DescricaoConta": ""
//     },
//     "CreatedAt": "",
//     "UpdatedAt": ""
// }]

exports.create = async (req, res, next) => {

    let movimentos = []

    await req.body.vendas.produtosVendidos.map((p) => {
        /**
         * Decrease the availability of the product
         */
        db
            .collection('RedeFarmacias')
            .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
            .collection('Farmacias')
            .doc(req.body.farmacia.farmaciaId)
            .collection('Stocks')
            .where('id', '==', p.id)
            .get()
            .then((snap) => {
                snap.forEach(doc => {
                    const { quantidadeDisponivel } = doc.data()
                    doc.ref.update({
                        quantidadeDisponivel: quantidadeDisponivel - p.quantity,
                        updatedAt: moment().toJSON(),

                    })
                })
            })

        const myObj1 = {
            referencia: guid.create().value,
            debito: p.precoUnitarioVenda * p.quantity,
            credito: 0,
            planoContas: {
                numeroConta: "45",
                descricaoConta: "Caixa"
            },
            createdAt: moment().toJSON(),
            updatedAt: null
        }

        const myObj2 = {
            referencia: guid.create().value,
            debito: 0,
            credito: p.precoUnitarioVenda * p.quantity,
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

    // if (req.body.vendas.registaTroco) {
    //     const myObj = {
    //         referencia: guid.create().value,
    //         debito: req.body.vendas.troco,
    //         credito: 0,
    //         planoContas: {
    //             numeroConta: "37",
    //             descricaoConta: "Outros Valores a Receber e a Pagar"
    //         },
    //         createdAt: moment().toJSON(),
    //         updatedAt: null
    //     }
    //     registoTrocoController(req)
    //     movimentos.push(myObj)
    // }

    req.body.vendas.movimentosVenda = movimentos
    req.body.vendas.updatedAt = null
    req.body.vendas.createdAt = moment().toJSON()

    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Vendas')
        .add(req.body.vendas)
        .then(function (result) {
            return res.status(201).json({ msg: `Vendas ${req.body.vendas.descricao} criada com sucesso `, id: result.id })

        })
        .catch(function (error) {
            console.error(`Falha ao cadastrar Vendas ${req.body.vendas.descricao} a Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Vendas')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este regiso n??o foi encontrado' })
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
        .collection('Vendas')
        .get()
        .then((snap) => {
            snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/vendas/' + doc.id })
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
        .collection('Vendas')
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