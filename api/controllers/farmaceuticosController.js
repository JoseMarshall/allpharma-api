require('dotenv').config()
const Storage = require('@google-cloud/storage').Bucket
const { db, admin, config } = require('../../functions/credentials/admin')
const credentials = require('../../functions/credentials/credentials.json')
const moment = require('moment');

const storage = Storage.name = credentials.storageBucket
    // "Farmaceuticos": [{
    //     "ContaUsuariosId": "",
    //     "Nome": {
    //         "Primeiro": "",
    //         "Apelido": "",
    //         "Completo": ""
    //     },
    //     "NumCarteira": "",
    //     "Genero": "",
    //     "Especialidades": [""],
    //     "CreatedAt": "",
    //     "UpdatedAt": ""
    // }]


exports.create = async(newFarmaceutico, Id) => {

    newFarmaceutico.updatedAt = null
    newFarmaceutico.createdAt = moment().toJSON()

    let img = "https://firebasestorage.googleapis.com/v0/b/allpharma-e8f00.appspot.com/o/blankProfile.png?alt=media"


    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Farmaceuticos')
        .doc(Id)
        .set(newFarmaceutico)
        .then(function(doc) {

            return db
                .collection('Farmaceuticos')
                .doc(Id)
                .set({
                    contaUsuariosId: Id,
                    imagemPerfil: img,
                    ...newFarmaceutico
                })
                .then(() => {
                    console.log(`Farmaceutico ${newFarmaceutico.nome.completo} criado com sucesso `);
                    return res.status(201).json({ msg: `Farmaceutico ${newFarmaceutico.nome.completo} criado com sucesso ` })
                })

        })
        .catch(function(error) {
            console.error(`Falha ao cadastrar Farmaceutico ${newFarmaceutico.nome.completo} à Ordem de Farmaceuticos`, error.message);
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection('Farmaceuticos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref
                    .collection('AjudasPrestadas')
                    .get()
                    .then(async(snapAjudas) => {
                        if (!snapAjudas.empty) {
                            let ajudas = []
                            await snapAjudas.docs.forEach((a) => {
                                ajudas.push({
                                    id: a.id,
                                    ...a.data()
                                })
                            })
                            console.log({
                                ...doc.data(),
                                ajudas
                            });

                            return res.status(200).json({
                                farmaceutico: {
                                    ...doc.data(),
                                    ajudas
                                },
                            })
                        } else {
                            return res.status(200).json({
                                ...doc.data()
                            })
                        }
                    })
                    .catch(next)

            } else {
                return res.status(204).json({ msg: 'Este farmaceutico não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('Farmaceuticos')
        .get()
        .then(async(snap) => {
            if (!snap.empty) {
                await snap.forEach((doc) => {
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/farmaceutico/' + doc.id })
                    console.log({ id: doc.id, data: doc.data() });
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum farmaceutico' })
            }
        })
        .catch(next)

}


exports.delete = (req, res, next) => {
    db
        .collection('Farmaceuticos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                return db
                    .collection(req.body.connection.collectionName)
                    .doc(req.body.connection.contaUsuariosId)
                    .collection('Farmaceuticos')
                    .doc(doc.id)
                    .delete()
                    .then(() => {
                        doc.ref.delete()
                            .then((result) => {
                                return res.status(200).json({ msg: 'Deleted Successfully', result })
                            })
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
        .collection('Farmaceuticos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.farmaceutico.updatedAt = moment().toJSON()
                doc.ref
                    .update(req.body.farmaceutico)
                    .then((result) => {
                        return db
                            .collection(req.body.connection.collectionName)
                            .doc(req.body.connection.contaUsuariosId)
                            .collection('Farmaceuticos')
                            .doc(doc.id)
                            .update(req.body.farmaceutico)
                            .then(() => {
                                return res.status(201).json({
                                    msg: 'Updated Successfuly',
                                    result,
                                    id: doc.id,
                                    link: process.env.URL_ROOT + '/farmaceutico/' + doc.id
                                })
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

        storage.upload(imageToBeUploaded.filePath, { name: imageFileName })

        // admin
        //     .storage()
        //     .bucket('allpharma-e8f00.appspot.com')
        //     .upload(imageToBeUploaded.filePath, {
        //         resumable: false,
        //         metadata: {
        //             metadata: {
        //                 contentType: imageToBeUploaded.mimetype
        //             }
        //         }
        //     })
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