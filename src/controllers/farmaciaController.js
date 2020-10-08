const { db } = require('../credentials/admin')
const moment = require('moment');
const { cloudinary } = require('../cloudinary')
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

exports.create = (req, res, next) => {

    req.body.farmacia.updatedAt = null
    req.body.farmacia.createdAt = moment().toJSON()
    req.body.farmacia.redeFarmaciaId = req.body.connection.contaUsuariosId

    db
        .collection(req.body.connection.collectionName)
        .doc(req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .add(req.body.farmacia)
        .then((doc) => {

            return res.status(201).json({ msg: `Farmácia ${req.body.farmacia.nome} criado com sucesso ` })

        })
        .catch(function (error) {
            return res.status(500).json({ msg: error.message })
        });


}

exports.getOne = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosId || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .doc(req.params.id)
        .get()
        .then(async (doc) => {

            if (doc.exists) {
                let imagesUploaded = [];
                await doc.ref
                    .collection('Imagens')
                    .get()
                    .then((snap) => {
                        for (const image of snap.docs) {
                            imagesUploaded.push(image.data())
                        }
                        return res.status(200).json({
                            ...doc.data(),
                            imagesUploaded,
                        })

                    })
                    .catch(next)

            } else {
                return res.status(404).json({ msg: 'Esta Farmácia não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosId || req.body.farmacia.redeFarmaciaId)
        .collection('Farmacias')
        .orderBy('createdAt')
        .limit(20)
        .startAfter(req.body.last || '')
        .get()
        .then((snap) => {
            snap.forEach((doc) => {
                array.push({ id: doc.id, ...doc.data(), link: '/farmacias/' + doc.id })
                console.log({ id: doc.id, ...doc.data() });
            })
            return res.status(200).json(array)

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
                return res.status(404).send({ msg: 'Não foi encontrado nenhum registos' })

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
                            link: '/farmacia/' + doc.id
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
                return res.status(200).json({ msg: 'Esta encomenda não foi encontrada' })
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

            snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data(), link: '/farmacia/encomenda/' + doc.id })
                console.log({
                    id: doc.id,
                    data: doc.data()
                });

            })
            return res.status(200).json(array)

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
            return res.status(200).json({ msg: 'Updated Successfully', result })
        })
        .catch(next)

}

exports.setImageProfile = (req, res, next) => {
    const path = Object.values(Object.values(req.files)[0])[0].path
    cloudinary.uploader.upload(path)
        .then(image => {
            db
                .collection('RedeFarmacias')
                .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
                .collection('Farmacias')
                .doc(req.params.id)
                .update({
                    imageProfile: image.url
                })
                .then(() => res.status(201).json({ msg: 'Image profile updated successfully', filePath: image.url }))
                .catch(next)
        })
        .catch(next)
}

exports.removeImageProfile = (req, res, next) => {

    const imageProfile = cloudinary.image('blankProfile_k982nd.png')
    db
        .collection('RedeFarmacias')
        .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
        .collection('Farmacias')
        .doc(req.params.id)
        .update({
            imageProfile
        })
        .then(() => res.status(201).json({ msg: 'Image profile updated successfully', filePath: image.url }))
        .catch(next)

}

exports.uploadImage = (req, res, next) => {
    const success = []
    const errors = []
    const types = ['image/png', 'image/jpeg', 'image/jpg']
    const { files } = req

    /**
     * Catching files with wrong format
     */
    for (const file of files) {
        if (!types.includes(file, type)) {
            errors.push(`'${file.type}' of file '${file.path}' is not a supported format`)
        }
        else {
            cloudinary.uploader.upload(file.path).then((uploadeImage) => {
                db
                    .collection('RedeFarmacias')
                    .doc(req.body.connection.contaUsuariosOrganizacaoPai || req.body.connection.contaUsuariosId)
                    .collection('Farmacias')
                    .doc(req.params.id)
                    .collection('Imagens')
                    .add({
                        imageURL: uploadeImage.url,
                        createdAt: moment().toJSON()
                    })
                    .then(() => success.push(uploadeImage.url))
                    .catch(next)
            })
        }
    }

    if (errors.length) {
        return res.status(406).json({ msg: 'Formato do ficheiro inválido, só são permitidos ficheiros do tipo .jpg ou .png ou jpeg', errors })
    }
    else {
        return res.status(201).json({ msg: 'Imagens carregadas som sucesso', success })

    }
}

exports.deleteImages = (req, res, next) => {
    cloudinary.api.delete_resources(req.body.fileNames).then((result) => {
        return res.status(200).json({ msg: 'Imagens apagadas som sucesso', result })
    })
        .catch(next)
}