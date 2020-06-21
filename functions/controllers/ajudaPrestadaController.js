require('dotenv').config()
const { db } = require('../credentials/admin')
const contaUsuariosController = require('./contaUsuariosController')
const moment = require('moment');


// "AjudasPrestadas": [{
//     "DescricaoPedido": "",
//     "NomePaciente": "",
//     "NumIdentificacaoPaciente": "",
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
//     "CreatedAt": ""
// }]

exports.create = async(req, res, next) => {

    req.body.ajudaPrestada.createdAt = moment().toJSON()

    const { collectionName } = contaUsuariosController.getOne(req.body.ajudaPrestada.atendidoPor)

    db
        .collection(collectionName)
        .doc(req.body.ajudaPrestada.atendidoPor)
        .collection('AjudasPrestadas')
        .add(req.body.ajudaPrestada)
        .then(function(result) {

            console.log(`Ajuda Prestada ${result.id} criado com sucesso `);

            return res.status(201).json({
                msg: `Ajuda Prestada  ${result.id} criado com sucesso `
            })

        })
        .catch(function(error) {
            console.error(`Falha ao registar a Ajuda Prestada `, error.message);
            return res.status(500).json({ msg: `Falha ao registar a Ajuda Prestada ${error.message }` })
        });

}

exports.getOne = (req, res, next) => {

    let refColection =
        req.body.connection.collectionName === 'OrdemEnfermeiros' ?
        req.body.enfermeiro.enfermeiroId :
        req.body.connection.collectionName === 'OrdemFarmaceuticos' ?
        req.body.farmaceutico.farmaceuticoId :
        req.body.connection.contaUsuariosId

    const { collectionName } = contaUsuariosController.getOne(req.body.ajudaPrestada.atendidoPor)

    db
        .collection(collectionName)
        .doc(refColection)
        .collection('AjudasPrestadas')
        .doc(req.params.id)
        .get()
        .then((doc) => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este comentário não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []

    let refColection =
        req.body.connection.collectionName === 'OrdemEnfermeiros' ?
        req.body.enfermeiro.enfermeiroId :
        req.body.connection.collectionName === 'OrdemFarmaceuticos' ?
        req.body.farmaceutico.farmaceuticoId :
        req.body.connection.contaUsuariosId

    const { collectionName } = contaUsuariosController.getOne(req.body.ajudaPrestada.atendidoPor)


    db
        .collection(collectionName)
        .doc(refColection)
        .collection('AjudasPrestadas')
        .get()
        .then(snap => {
            
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/' + collectionName.toLowerCase() + '/ajudaPrestada/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })

                return res.status(200).json(array)
           
        })
        .catch(next)

}