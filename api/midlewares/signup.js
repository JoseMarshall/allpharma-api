const { db } = require('../../functions/credentials/admin')

const bcrypt = require('bcrypt')
const emailSender = require("../email/emailSender");
const CheckerController = require('./checker')
const moment = require('moment')
const redeFarmaciaController = require('../controllers/redeFarmaciaController');



exports.createAccount = async(req, res, next) => {
    await CheckerController.generateNewCredentials(req.body).then(async(x) => {
        req.body.contaUsuarios.userName = x.userName
        req.body.contaUsuarios.password = x.password
        console.log(req.body.contaUsuarios);
    })

    let passwordHash;
    let codeVerification = await Math.floor((Math.random() * 999999) + 100000) //O codigo que será enviado por email para o usuario, para que ele possa verificar o seu email

    //Encripta a password 
    bcrypt.hash(req.body.contaUsuarios.password, 10)
        .then((hash) => {
            passwordHash = hash

            // Add a new document with a generated id.

            let newAccount = {
                Username: req.body.contaUsuarios.userName,
                PasswordHash: passwordHash,
                Email: req.body.contaUsuarios.email,
                CodigoVerificacao: codeVerification,
                AcessosFalhados: 0,
                Advertencias: 0,
                UltimoAcesso: null,
                CollectionName: req.body.contaUsuarios.collectionName,
                CreatedAt: moment().toJSON(),
                UpdatedAt: null,
                Enabled: true
            }

            db.collection('ContaUsuarios')
                .doc(req.body.contaUsuarios.userName)
                .set(newAccount)
                .then(ref => {
                    console.log('Added document with ID: ', ref.id);

                    switch (req.body.contaUsuarios.collectionName) {
                        case 'RedeFarmacias':
                            redeFarmaciaController.create(req.body.novaFarmacia, req.body.contaUsuarios.userName)
                            break;

                        default:
                            break;
                    }

                    emailSender.sendEmailSignUp(req.body.contaUsuarios.userName,
                        req.body.contaUsuarios.password,
                        req.body.contaUsuarios.email)

                    return res.status(201).json({
                        msg: 'Conta criada com sucesso, por favor verifique a caixa de entrada do seu e-mail se recebeu as credenciais de acesso, pode demorar até 1 hora',
                        password: req.body.contaUsuarios.password, //ELIMINAR ESTA KEY
                        userName: req.body.contaUsuarios.userName //ELIMINAR ESTA KEY
                    })

                })
                .catch((err) => {
                    console.error('Algo correu mal :(', err)
                    return res.status(500).json({ msg: err.message, code: err.code })
                });

        }).catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: 'Alguma coisa correu mal', erro: err.message })
        })



}