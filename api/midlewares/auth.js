require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment');
const { db } = require('../../functions/credentials/admin')
const emailSender = require('../email/emailSender');

function generateToken(user, res) {
    jwt.sign({
            ContaUsuariosId: user.ContaUsuariosId,
            CollectionName: user.CollectionName
        },
        process.env.JWT_KEY, { expiresIn: '8h' },

        (err, token) => {
            if (err) {
                return res.status(500).send({ error: err.message })
            }

            db
                .collection('ContaUsuarios')
                .doc(user.ContaUsuariosId)
                .get()
                .then((doc) => {

                    doc.ref.update({
                        AcessosFalhados: 0,
                        UltimoAcesso: moment().toJSON(),
                        UpdatedAt: moment().toJSON(),
                    })


                    return res.status(200).send({
                        token: 'Bearer ' + token,
                        msg: 'login successfull, verifique o token enviado'
                    })
                })
                .catch((err) => {
                    return res.status(500).send({
                        codigoErro: err.code,
                        erro: err.message,
                        msg: ':( Ocorreu um erro ao tentar gerar o token de acesso. Por favor tente mais tarde'
                    })
                })


        }

    )

}

exports.checkAuth = (req, res, next) => {

    db
        .collection('ContaUsuarios')
        .doc(req.body.username)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const {
                    Enabled,
                    PasswordHash,
                    UltimoAcesso,
                    CollectionName,
                    AcessosFalhados
                } = doc.data()

                if (Enabled) {
                    bcrypt.compare(req.body.password, PasswordHash).then(result => {
                        if (result) {
                            if (UltimoAcesso === null) {
                                return res.status(307).send({
                                        msg: 'Por favor redefina a sua palavra-passe',
                                        userName: req.body.username,
                                        link: process.env.LINK_RECUPERACAO_SENHA
                                    }) //O link para a redefinição de senha

                            } else {
                                let user = {
                                    ContaUsuariosId: doc.id,
                                    CollectionName
                                }
                                return generateToken(user, res)
                            }
                        } else {

                            doc.ref
                                .update({
                                    AcessosFalhados: (AcessosFalhados + 1),
                                    UpdatedAt: moment().toJSON(),
                                })

                            if (AcessosFalhados == 4) {
                                const validationCode = Math.floor((Math.random() * 99999) + 10000)
                                doc.ref
                                    .update({
                                        Enabled: false,
                                        CodigoVerificacao: validationCode,
                                        UpdatedAt: moment().toJSON(),
                                    })

                                return res.status(403).send({ msg: 'Conta bloqueada, terá que solicitar a reactivação da conta para voltar a ter acesso à plataforma, clicando em \"recuperar senha\" na página inicial' })

                            } else {
                                return res.status(401).send({ msg: 'Authentication Failed' })
                            }
                        }
                    })
                } else {
                    return res.status(401).send({ msg: 'Authentication Failed' })
                }
            } else {
                return res.status(401).send({ msg: 'Authentication Failed' })
            }


        })
        .catch((err) => {
            return res.status(500).send({
                codigoErro: err.code,
                erro: err.message,
                msg: ':(Ocorreu um erro no processo de autenticação. Por favor tente mais tarde'
            })
        })

}

/**
 * Serviço que o cliente solicita quando deseja fazer alteração da senha
 */
exports.setNewPassword = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
        .then(hash => {

            db
                .collection('ContaUsuarios')
                .doc(req.body.username)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        doc.ref.update({
                            PasswordHash: hash,
                            CodigoVerificacao: null,
                            Enabled: true
                        })

                        let user = {
                            ContaUsuariosId: doc.data().ContaUsuariosId,
                            CollectionName: doc.data().CollectionName
                        }

                        return generateToken(user, res)
                    } else {
                        return res.status(401).send({
                            msg: 'Algo correu mal. Por favor tente mais tarde'
                        })
                    }

                })
                .catch((err) => {
                    return res.status(500).send({
                        codigoErro: err.code,
                        erro: err.message,
                        msg: ':(Ocorreu um erro ao redefenir a senha. Por favor tente mais tarde'
                    })
                })

        })
        .catch(next)

}

/**
 * A função que o cliente chama quando pretende reactivar a sua conta
 */
exports.requestPassword = (req, res, next) => {

    db
        .collection('ContaUsuarios')
        .doc(req.body.username)
        .get()
        .then((doc) => {

            if (doc.exists) {
                const CodigoVerificacao = Math.floor((Math.random() * 999999) + 100000)
                doc.ref.update({
                        CodigoVerificacao: CodigoVerificacao,
                        UpdatedAt: moment().toJSON()
                    })
                    .then(() => {

                        //send a link containing the validationCode and the username byEmail for redefinition of password 
                        //Ex: http://www.allpharmar.co.ao/verify/ContaUsuarios?username=Josemar354&code=123456             
                        let link = process.env.URL_ROOT + '/verify/ContaUsuarios?username=' + req.body.username + '&validationCode=' + CodigoVerificacao;

                        emailSender.sendEmaiValidationCode(req.query.username,
                            newPassword,
                            link,
                            doc.data().Email)

                        return res.status(200).send({
                            msg: 'Abre o email e checa se recebeu  codigo de verificação, pode demorar até 1 hora',
                            validationCode: validationCode, //ELIMINAR ESTA KEY
                            Id: user.dataValues.Id, //ELIMINAR ESTA KEY

                        })
                    })
                    .catch((err) => {
                        console.error(err);
                        return res.status(500).send({
                            codigoErro: err.code,
                            erro: err.message,
                            msg: ':(Ocorreu um erro ao requisitar a senha. Por favor tente mais tarde'
                        })
                    })
            } else {
                return res.status(403).send({
                    msg: 'Acesse a página inicial',
                    link: process.env.URL_ROOT
                })
            }


        })
        .catch((err) => {
            console.error(err);
            return res.status(403).send({
                msg: 'Authentication Failed',
                erro: err.message
            })

        })


}

/**
 * Funcção auxiliar no processo de activação da conta, verifica se o codigo de validação da conta é valido, se sim reactiva a conta e envia por email a nova password do cliente para que este possa fazer login
 * É chamada através do link que foi previamente enviado para  cliente a partir da funcção requestPassword
 */
exports.reactivateAccount = (req, res, next) => {

    db
        .collection('ContaUsuarios')
        .doc(req.query.username)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const {
                    CodigoVerificacao,
                    Enabled,
                    Email,
                    UpdatedAt
                } = doc.data()

                if (!Enabled && CodigoVerificacao == req.query.validationCode) {

                    if (moment().diff(UpdatedAt) > 1) {

                        return res.status(401).send({
                            msg: 'O seu codivo de validação expirou, por favor solicite um novo codigo para a recuperação da sua senha',
                            link: process.env.LINK_RECUPERACAO_SENHA
                        })
                    } else {
                        const newPassword = (parseInt(req.query.validationCode) + 413915).toString()
                        bcrypt.hash(newPassword, 10).then(hash => {
                            doc.ref.update({
                                CodigoVerificacao: null,
                                PasswordHash: hash,
                                Enabled: true,
                                UpdatedAt: moment().toJSON()
                            })

                            //send a link containing the newPasword to user byEmail e o link da homepage da allpharma
                            emailSender.sendEmailSignUp(req.query.username,
                                newPassword,
                                Email)

                            return res.status(201).send({
                                msg: 'Abre o email e checa se recebeu a sua nova Palavra-Passe',
                                password: newPassword, // ELIMINAR ESTA KEY
                                userName: req.query.username // ELIMINAR ESTA KEY
                            })

                        }).catch(next)

                    }
                } else {
                    return res.status(401).send({
                        msg: 'Código de validação incorrecto',
                    })
                }
            } else {
                return res.status(401).send({
                    msg: 'Username ou password incorrectos',
                })
            }
        })
        .catch(next)

}