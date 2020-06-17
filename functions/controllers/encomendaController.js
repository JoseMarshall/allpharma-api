require('dotenv').config()
const { db } = require('../credentials/admin')
const moment = require('moment');

//REgisto na coleção Farmacia
//     "Encomendas": [{
//         "ClientePacienteId":"",
//         "Descricao": "",
//         "DataDesejadaEntrega": "",
//         "TotalReceber": 10000,
//         "Endereco": {
//             "Provincia": "",
//             "Municipio": "",
//             "Bairro": "",
//             "Rua": "",
//             "Andar": "",
//             "NumPorta": "",
//             "Latitude": "",
//             "Longitude": ""
//         },
//         "ProdutosEncomendados": [{
//             "Categoria": "",
//             "Nome": "",
//             "CodigoBarra": "",
//             "CodigoQR": "",
//             "Peso": "",
//             "Dosagem": "",
//             "Quntidade": 1,
//             "PrecoUnitarioVenda": 1000,
//             "SubTotal": 1000
//         }],
//         "Status": 0,
//         "CreatedAt": "",
//         "UpdatedAt": ""
//     }]

//Registo na coleção Cliente
// "Encomendas": [{
//     "Descricao": "",
//     "DataDesejadaEntrega": "",
//     "Endereco": {
//         "Provincia": "",
//         "Municipio": "",
//         "Bairro": "",
//         "Rua": "",
//         "Andar": "",
//         "NumPorta": "",
//         "Latitude": "",
//         "Longitude": ""
//     },
//     "ProdutosEncomendados": [{
//         "Categoria": "",
//         "Nome": "",
//         "CodigoBarra": "",
//         "CodigoQR": "",
//         "Peso": "",
//         "Dosagem": "",
//         "Quntidade": 1,
//         "PrecoUnitarioVenda": 1000,
//         "SubTotal": 1000
//     }],
//     "Status": 0,
//     "CreatedAt": "",
//     "UpdatedAt": ""
// } 


exports.create = async(req, res, next) => {

    req.body.encomenda.updatedAt = null
    req.body.encomenda.createdAt = moment().toJSON()
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Encomendas')
        .add(req.body.encomenda)
        .then(async function(encomendaRef) {
            let TotalReceber = 0
            await req.body.encomenda.produtosEncomendados.map((p) => {
                TotalReceber += p.SubTotal
            })
            req.body.encomenda.TotalReceber = TotalReceber

            db
                .collection('RedeFarmacias')
                .doc(req.body.farmacia.redeFarmaciaId)
                .collection('Farmacias')
                .doc(req.body.farmacia.farmaciaId)
                .collection('Encomendas')
                .doc(encomendaRef.id)
                .set(req.body.encomenda)
                .then(() => {
                    console.log(`Encomenda feita com sucesso.`);
                    return res.status(201).json({ msg: `Encomenda feita com sucesso.` })
                })

        })
        .catch(function(error) {
            console.error(`Falha ao encomendar produtos à Rede de Farmacia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Encomendas')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(204).json({ msg: 'Esta encomenda não foi encontrada' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {
    let array = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Encomendas')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/encomenda/' + doc.id })
                    console.log({
                        id: doc.id,
                        data: doc.data()
                    });

                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhuma encomenda' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Encomendas')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.delete()
                    .then((result) => {
                        //"Apaga" da base de dados da farmacia (na verdade set a encomenda como cancelada)
                        return db
                            .collection('RedeFarmacias')
                            .doc(req.body.farmacia.redeFarmaciaId)
                            .collection('Farmacias')
                            .doc(req.body.farmacia.farmaciaId)
                            .collection('Encomendas')
                            .doc(req.params.id)
                            .update({
                                status: -1,
                                updatedAt: moment().toJSON()
                            })
                            .then(() => {
                                return res.status(200).json({ msg: 'Deleted Successfully', result })
                            })
                            .catch(next)
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}

//Set uma encomenda como recebida
exports.update = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Encomendas')
        .doc(req.params.id)
        .update({
            status: 2,
            updatedAt: moment().toJSON()
        })
        .then(() => {
            return db
                .collection('RedeFarmacias')
                .doc(req.body.farmacia.redeFarmaciaId)
                .collection('Farmacias')
                .doc(req.body.farmacia.farmaciaId)
                .collection('Encomendas')
                .doc(req.params.id)
                .update({
                    status: 2,
                    updatedAt: moment().toJSON()
                })
                .then((result) => {
                    return res.status(201).send({
                        msg: 'Updated Successfuly',
                        result,
                        id: req.params.id,
                        link: process.env.URL_ROOT + '/encomenda/' + req.params.id
                    })
                })
        })
        .catch(next)

}