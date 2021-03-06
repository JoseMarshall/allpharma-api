require('dotenv').config()
const { db } = require('../credentials/admin')
const CheckerController = require('../midlewares/checker')
const moment = require('moment');
const emailSender = require("../email/emailSender");
const bcrypt = require('bcrypt')
// "Funcionarios": [{
//         "NumIdentificacao": "",
//         "Nome": {
//             "Primeiro": "",
//             "Apelido": "",
//             "Alias": "",
//             "Completo": ""
//         },
//         "Email": "",
//         "NIF": "",
//         "NumeroCxSocial": "",
//         "DataNascimento": "",
//         "Genero": "",
//         "Perfil": "",
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
//         "Telefones": []
//     }]

// "FuncionariosFarmacia": [{
//     "ContaUsuariosId": "",
//     "NumIdentificacao": "",
//     "Nome": {
//         "Primeiro": "",
//         "Apelido": "",
//         "Alias": "",
//         "Completo": ""
//     },
//     "Email": "",
//     "NIF": "",
//     "NumeroCxSocial": "",
//     "DataNascimento": "",
//     "Genero": "",
//     "Perfil": "",
//     "Menus": [{
//         "Nome": "",
//         "URL": ""
//     }],
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
//     "Telefones": [],
//     "Farmacia": {
//         "Nome": "",
//         "FarmaciaId": ""
//     }

// }]
exports.create = async (req, res, next) => {
    req.body.contaUsuarios = {}
    await CheckerController.generateNewCredentials(req.body).then(async (x) => {
        req.body.contaUsuarios.userName = x.userName
        req.body.contaUsuarios.password = x.password
    })

    let passwordHash;
    let codeVerification = Math.floor((Math.random() * 999999) + 100000) //O codigo que ser?? enviado por email para o usuario, para que ele possa verificar o seu email

    //Encripta a password 
    bcrypt.hash(req.body.contaUsuarios.password, 10)
        .then((hash) => {
            passwordHash = hash

            // Add a new document with a generated id.

            let newAccount = {
                username: req.body.contaUsuarios.userName,
                passwordHash: passwordHash,
                email: req.body.funcionario.email,
                codigoVerificacao: codeVerification,
                acessosFalhados: 0,
                advertencias: 0,
                ultimoAcesso: null,
                collectionName: req.body.connection.collectionName,
                contaUsuariosOrganizacaoPai: req.body.connection.contaUsuariosId,
                farmaciaId: req.body.funcionario.farmacia.farmaciaId,
                createdAt: moment().toJSON(),
                updatedAt: null,
                enabled: true
            }



            //Cria a conta de utilizador
            db.collection('ContaUsuarios')
                .doc(req.body.contaUsuarios.userName)
                .set(newAccount)
                .then(() => {

                    //Grava os dados do funcionario na cole????o funcionariosFarmacia
                    req.body.funcionario.updatedAt = null
                    req.body.funcionario.createdAt = moment().toJSON()
                    db
                        .collection(req.body.connection.collectionName)
                        .doc(req.body.connection.contaUsuariosId)
                        .collection('Funcionarios')
                        .doc(req.body.contaUsuarios.userName)
                        .set({ contaUsuariosId: req.body.contaUsuarios.userName, ...req.body.funcionario })
                        .then(function () {

                            emailSender.sendEmailSignUp(req.body.contaUsuarios.userName,
                                req.body.contaUsuarios.password,
                                req.body.funcionario.email)

                            db
                                .collection(req.body.connection.collectionName)
                                .doc(req.body.connection.contaUsuariosId)
                                .collection('Farmacias')
                                .doc(req.body.funcionario.farmacia.farmaciaId)
                                .collection('Funcionarios')
                                .doc(req.body.contaUsuarios.userName)
                                .set(req.body.funcionario)
                                .then(() => {
                                    return res.status(201).json({
                                        msg: `Funcionario ${req.body.funcionario.nome.completo} criado com sucesso `
                                    })
                                })

                        })
                        .catch(function (error) {
                            console.error(`Falha ao cadastrar Funcionario ${req.body.funcionario.nome} ?? Rede de Farmacia`, error.message);
                            return res.status(500).json({ msg: error.message })
                        });


                })
                .catch((err) => {
                    return res.status(500).json({ msg: err.message, code: err.code })
                });

        }).catch((err) => {
            return res.status(500).json({ msg: 'Alguma coisa correu mal', erro: err.message })
        })



}

exports.getOne = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Funcionarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            return (doc.exists) ?
                res.status(200).json(doc.data()) :
                res.status(404).json({ msg: 'Este Funcionario n??o foi encontrado' })

        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Funcionarios')
        .get()
        .then((snap) => {
            snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/funcionarios/' + doc.id })
            })
            return res.status(200).json(array)

        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Funcionarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.delete()
                    .then((result) => {
                        db.collection('ContaUsuarios')
                            .doc(req.params.id)
                            .delete()
                            .then(() => res.status(200).json({ msg: 'Deleted Successfully', result }))
                            .catch(next)

                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'N??o foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}

exports.update = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Funcionarios')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {

                const { farmaciaId } = doc.data().farmacia
                db
                    .collection(req.body.connection.collectionName)
                    .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
                    .collection('Farmacias')
                    .doc(farmaciaId)
                    .collection('Funcionarios')
                    .doc(req.params.id)
                    .get()
                    .then(d => {
                        if (d.exists) {
                            req.body.funcionario.updatedAt = moment().toJSON()
                            d.ref.update(req.body.funcionario) //Atualiza na cole????o dos funcionarios que se encntra dentro da cole????o das farmacias
                                .then(() => {

                                    doc.ref.update(req.body.funcionario) //Atualiza na cole????o dos funcionariosFarmacias que se encntra dentro da cole????o das redeFarmacias
                                        .then((result) => {
                                            return res.status(201).send({
                                                msg: 'Updated Successfuly',
                                                result,
                                                id: doc.id,
                                                link: process.env.URL_ROOT + '/funcionarios/' + doc.id
                                            })
                                        })
                                        .catch(next)

                                })
                        }
                    })

            } else {
                return res.status(204).send({ msg: 'N??o foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}