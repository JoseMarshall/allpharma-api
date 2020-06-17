require('dotenv').config()
const { db, admin, config } = require('../credentials/admin')
const moment = require('moment');

//TODO
// "ClientesPacientes": [{
//     "ContaUsuariosId": "",
//     "ImagemPerfil": "",
//     "Nome": {
//         "Primeiro": "",
//         "Apelido": "",
//         "Completo": ""
//     },
//     "NumIdentificacao": "",
//     "Genero": "",
//     "DataNascimento": "",
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
//     "CreatedAt": "",
//     "UpdatedAt": ""
// }]


exports.create = async(newCliente, Id) => {

    newCliente.updatedAt = null
    newCliente.createdAt = moment().toJSON()

    let img = "https://firebasestorage.googleapis.com/v0/b/allpharma-e8f00.appspot.com/o/blankProfile.png?alt=media"


    return db
        .collection('ClientesPacientes')
        .doc(Id)
        .set({
            contaUsuariosId: Id,
            imagemPerfil: img,
            ...newCliente,
            createdAt: moment().toJSON(),
            updatedAt: null
        })
        .then(() => {
            console.log(`Usuário ${newCliente.nome.completo} criado com sucesso `);
            return res.status(201).json({ msg: `Usuário ${newCliente.nome.completo} criado com sucesso ` })
        })

}

exports.getOne = (req, res, next) => {
    db
        .collection('ClientesPacientes')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                let ajudas = []
                let encomendas = []
                doc.ref
                    .collection('PedidosAjuda')
                    .get()
                    .then(async(snapAjudas) => {
                        if (!snapAjudas.empty) {
                            await snapAjudas.docs.forEach((a) => {
                                ajudas.push({
                                    id: a.id,
                                    ...a.data()
                                })
                            })

                        }
                    })
                    .then(() => {
                        return doc.ref
                            .collection('Encomendas')
                            .get()
                            .then(async(snapEncomendas) => {
                                if (!snapEncomendas.empty) {
                                    await snapEncomendas.docs.forEach((e) => {
                                        encomendas.push({
                                            id: e.id,
                                            ...e.data()
                                        })
                                    })

                                }
                            })

                    })
                    .then(() => {

                        return res.status(200).json({
                            clientePaciente: {
                                ...doc.data(),
                                ajudas,
                                encomendas
                            },
                        })
                    })
                    .catch(next)

            } else {
                return res.status(204).json({ msg: 'Este clientePaciente não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('ClientesPacientes')
        .get()
        .then(async(snap) => {
            if (!snap.empty) {
                await snap.forEach((doc) => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/clientePaciente/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum clientePaciente' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection('ClientesPacientes')
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
        .collection('ClientesPacientes')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.clientePaciente.updatedAt = moment().toJSON()
                doc.ref
                    .update(req.body.clientePaciente)
                    .then((result) => {
                        return res.status(201).json({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/clientePaciente/' + doc.id
                        })

                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
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
            .bucket('allpharma-e8f00.appspot.com')
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
                    .collection(req.body.connection.collectionName)
                    .doc(req.body.connection.contaUsuariosId)
                    .update({
                        imagemPerfil: imageURL
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