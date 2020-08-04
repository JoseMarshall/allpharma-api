const { db } = require('../credentials/admin')

const moment = require('moment')


/***
 * @param Id {String} the string that represents the id to this new pharma
 * @param newOrdem {Object} an object whith this signature:
 * 
 *"OrdemFarmaceuticos": [{
        "ContaUsuariosId": "",
        "Sigla": "",
        "Descricao": "",
        "Endereco": {
            "Provincia": "",
            "Municipio": "",
            "Bairro": "",
            "Rua": "",
            "Andar": "",
            "NumPorta": "",
            "Latitude": "",
            "Longitude": ""
        },
        "Telefones": [""],
        "CreatedAt": "",
        "UpdatedAt": ""
    }]
 */

exports.create = (newOrdem, Id) => {

    return db
        .collection('OrdemFarmaceuticos')
        .doc(Id)
        .set({
            contaUsuariosId: Id,
            createdAt: moment().toJSON(),
            updatedAt: null,
            ...newOrdem
        })
        .then(function() {
            console.log('Ordem dos farmacêuticos cadastrada com sucesso');
        })
        .catch(function(error) {
            console.error(`Falha ao criar a Ordem dos farmacêuticos: ${Id}`, error);
        });

}

exports.getOne = (req, res, next) => {
    let farmaceuticos = []
    db
        .collection('OrdemFarmaceuticos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                doc.ref
                    .collection('Farmaceuticos')
                    .get()
                    .then((snap) => {
                        if (!snap.empty) {
                            snap.docs.forEach((e) => {
                                farmaceuticos.push(
                                    e.id,
                                    ...e.data()
                                )
                            })
                        }
                    })
                    .then(() => {
                        return res.status(200).json({...doc.data(), farmaceuticos })
                    })

            } else {
                return res.status(404).json({ msg: 'A Ordem dos farmacêuticos não foi encontrada' })
            }
        })
        .catch(next)
}


exports.update = (req, res, next) => {
    db
        .collection('OrdemFarmaceuticos')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.ordem.updatedAt = moment().toJSON()
                doc.ref
                    .update(req.body.ordem)
                    .then((result) => {
                        res.status(201).send({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/ordemFarmaceuticos/' + doc.id
                        })
                    })
                    .catch(next)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum registos' })

            }
        })
        .catch(next)
}


exports.delete = (req, res, next) => {
    db
        .collection('OrdemFarmaceuticos')
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