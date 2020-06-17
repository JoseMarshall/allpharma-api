require('dotenv').config()
const { db, admin, config } = require('../credentials/admin')
const moment = require('moment');

// "Farmacias": [{
// "RedeFarmaciaId":"",
//     "Nome": "",
//     "Email": "",
//     "CaixaInicial": 1000000,
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
//     "Telefones": [""],
//     "CreatedAt": "",
//     "UpdatedAt": ""
// }]


exports.create = async(req, res, next) => {

    req.body.farmacia.updatedAt = null
    req.body.farmacia.createdAt = moment().toJSON()

    let img = {
        perfil: "https://firebasestorage.googleapis.com/v0/b/allpharma-e8f00.appspot.com/o/blankProfile.png?alt=media",
        uploads: []
    }


    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .add(req.body.farmacia)
        .then(function(doc) {
            //Adiciona a imagem de perfil padrão  à farmácia
            db
                .collection(req.body.connection.collectionName)
                .doc(req.body.connection.contaUsuariosId)
                .collection('Farmacias')
                .doc(doc.id)
                .collection('Imagens')
                .add(img)

            console.log(`Farmácia ${req.body.farmacia.nome} criado com sucesso `);
            return res.status(201).json({ msg: `Farmácia ${req.body.farmacia.nome} criado com sucesso ` })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar farmácia ${req.body.farmacia.nome} à Rede de Farmácia`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

// "Comentarios": [{
//     "Classificacao": 5,
//     "Message": {
//         "From": "",
//         "Subject": "",
//         "Text": "",
//         "CreatedAt": "",
//         "UpdatedAt": ""
//     },
//     "Respostas": [{
//         "From": "",
//         "Text": "",
//         "CreatedAt": "",
//         "UpdatedAt": ""
//     }]
// }]

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                let imagemProfile;
                doc.ref
                    .collection('Imagens')
                    .get()
                    .then((snap) => {
                        if (!snap.empty) {
                            const { perfil, uploads } = snap.docs[0].data()
                            return doc.ref
                                .collection('Comentarios')
                                .get()
                                .then((snapComent) => {
                                    if (!snapComent.empty) {
                                        let comentarios = []
                                        snapComent.docs.forEach((c) => {
                                            let obj = {
                                                id: c.id,
                                                ...c.data()
                                            }
                                            c.ref
                                                .collection('Respostas')
                                                .get()
                                                .then(async(snapRespostas) => {
                                                    if (!snapRespostas.empty) {
                                                        let respostas = []
                                                        await snapRespostas.docs.forEach((r) => {
                                                            respostas.push({
                                                                id: r.id,
                                                                ...r.data()
                                                            })
                                                        })
                                                        obj.respostas = respostas
                                                    }
                                                })
                                            comentarios.push(obj)
                                        })
                                        console.log(doc.data());
                                        return res.status(200).json({
                                            farmacia: {
                                                ...doc.data(),
                                                imagens: { perfil, uploads },
                                                comentarios: comentarios
                                            },
                                        })
                                    }
                                })

                        } else {
                            return res.status(500).json({ msg: 'Ocorreu um erro a localizar a imagem de perfil da farmacia' })
                        }

                    })
                    .catch(next)
            } else {
                return res.status(204).json({ msg: 'Esta Farmácia não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.farmacia.redeFarmaciaId || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .get()
        .then(async(snap) => {
            if (!snap.empty) {
                await snap.forEach((doc) => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/farmacia/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhuma farmácia' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Farmacias')
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

exports.update = (req, res, next) => {
    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.farmacia.updatedAt = moment().toJSON()
                doc.ref.update(req.body.farmacia)
                    .then((result) => {
                        res.status(201).json({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/farmacia/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)

}




exports.getOneEncomenda = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
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

exports.getAllEncomenda = (req, res, next) => {
    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Encomendas')
        .get()
        .then(snap => {
            if (!snap.empty) {
                snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/farmacia/encomenda/' + doc.id })
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


exports.deleteEncomenda = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Encomendas')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref.delete()
                    .then((result) => {
                        //"Apaga" da base de dados do cliente (na verdade set a encomenda como cancelada)
                        return db
                            .collection('ClientesPacientes')
                            .doc(req.body.cliente.clientePacienteId)
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
                next()
            }
        })
        .catch(next)

}


exports.updateEncomenda = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai)
        .collection('Farmacias')
        .doc(req.body.farmacia.farmaciaId)
        .collection('Encomendas')
        .doc(req.params.id)
        .update({
            ...req.body.encomenda,
            updatedAt: moment().toJSON()
        })
        .then(() => {
            db
                .collection('ClientesPacientes')
                .doc(req.body.cliente.clientePacienteId)
                .collection('Encomendas')
                .doc(req.params.id)
                .update({
                    ...req.body.encomenda,
                    updatedAt: moment().toJSON()
                })
            return res.status(200).json({ msg: 'Deleted Successfully', result })
        })
        .catch(next)

}

exports.setImageProfile = (req, res, next) => {

    const BusBoy = require('busboy');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const guid = require('guid');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};
    let myGuid = guid.create().value

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(204).json({ msg: 'Formato do ficheiro inválido, só são permitidos ficheiros do tipo .jpg ou .png ou jpeg' })
        }
        let myArray = filename.split('.')
        const imageExtension = myArray[myArray.length - 1]
        imageFileName = `${myGuid}.${imageExtension}`
        const filePath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = { filePath, mimetype }
        file.pipe(fs.createWriteStream(filePath))
    });

    busboy.on('finish', () => {


        admin
            .storage()
            .bucket('allpharma-e8f00.appspot.com')
            .upload(imageToBeUploaded.filePath, {})
            .then(() => {
                admin
                    .storage()
                    .bucket('allpharma-e8f00.appspot.com')
                    .file(imageFileName)


                const imageURL = `https//firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${myGuid}`
                return db
                    .collection('RedeFarmacias')
                    .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
                    .collection('Farmacias')
                    .doc(req.params.id)
                    .collection('Imagens')
                    .get()
                    .then((snap) => {
                        if (!snap.empty) {
                            snap.docs[0].ref
                                .update({
                                    perfil: imageURL
                                })
                        }
                    })
                    .catch(next)


            })
            .then(() => {
                return res.status(201).json({ msg: 'Updated Successfully' })
            })
            .catch(next)
    })

    busboy.end(req.rawBody)

}



exports.uploadImage = (req, res, next) => {

    const BusBoy = require('busboy');
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const guid = require('guid');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};


    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(204).json({ msg: 'Formato do ficheiro inválido, só são permitidos ficheiros do tipo .jpg ou .png ou jpeg' })
        }
        let myArray = filename.split('.')
        const imageExtension = myArray[myArray.length - 1]
        imageFileName = `${guid.create().value}.${imageExtension}`
        const filePath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = { filePath, mimetype }
        file.pipe(fs.createWriteStream(filePath))
    });

    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filePath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageURL = `https//firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
                return db
                    .collection('RedeFarmacias')
                    .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
                    .collection('Farmacias')
                    .doc(req.params.id)
                    .collection('Imagens')
                    .get()
                    .then((snap) => {
                        if (!snap.empty) {
                            snap.docs[0].ref
                                .collection('Uploads')
                                .add({
                                    caminho: imageURL,
                                    createdAt: moment().toJSON()
                                })
                        }
                    })

            })
            .then(() => {
                return res.status(201).json({ msg: 'Upload Successfully' })
            })
            .catch(next)
    })

    busboy.end(req.rawBody)

}