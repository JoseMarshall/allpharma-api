const { db } = require('../credentials/admin')

const moment = require('moment')


/***
 * @param Id {String} the string that represents the id to this new pharma
 * @param newPharma {Object} an object whith this signature:
 * 
 *  {
        "ContaUsuariosId": "",
        "Nome": "",
        "Proprietario": {
                            "PrimeiroNome": "",
                            "Apelido": "",
                            "NomeCompleto": "",
                            "DataNascimneto": ""
                        },
        "Descricao": "",
        "Email": "",
        "WebSite": "",
        "NIF": "",
        "NumAlvara": "",
        "NumINAPEM": "",
        "CapitalSocial": 150000,
        "DataInicioOperacao": "",
        "CreatedAt": "",
        "UpdatedAt": ""
    }
 */

exports.create = (newPharma, Id) => {
    
    return db
        .collection('RedeFarmacias')
        .doc(Id)
        .set({
            contaUsuariosId: Id,
            createdAt: moment().toJSON(),
            updatedAt: null,
            ...newPharma
        })
        .then(function() {
            console.log('Rede de Farmacias cadastrada com sucesso');
        })
        .catch(function(error) {
            console.error("Falha ao criar a Rede de Farmacia: ", error);
        });

}

exports.getOne = (req, res, next) => {
    const docRef = db.collection('RedeFarmacias').doc(req.params.id)
    docRef.get()    
        .then((doc) => {
            if (doc.exists) {
                const redeFarmacia=doc.data()
                docRef.listCollections()
                    .then(async(subCollections)=>{
                        for (const iterator of subCollections) {
                            await iterator.get()
                                .then((snap)=>{
                                    const idx = iterator.id[0].toLowerCase()+iterator.id.slice(1)
                                    redeFarmacia[idx] = []                             
                                    snap.docs.map((d)=>{
                                        redeFarmacia[idx].push({
                                            id:d.id,
                                            ...d.data(),
                                            link:`${process.env.URL_ROOT}/${idx}/${d.id}`
                                        })                                    
                                    })
                                     
                                })        
                        }
                                                
                        return res.status(200).json(redeFarmacia)
                    })
                    .catch(next)
                
            } else {
                return res.status(404).json({ msg: 'Esta Rede não foi encontrada' })
            }
            
        })
        .catch(next) 
   
}
 
exports.getAll = (req, res, next) => {

    let redeFarmacias = []
    db
        .collection('RedeFarmacias')
        .get()
        .then((snap) => {
            snap.docs.map(doc => {
                redeFarmacias.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/redeFarmacias/' + doc.id })
                console.log({ id: doc.id, data: doc.data() });
            })
            return res.status(200).json(redeFarmacias)
            
        })
        .catch(next)
}


exports.update = (req, res, next) => {
    db
        .collection('RedeFarmacias')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                req.body.redeFarmacia.updatedAt = moment().toJSON()
                doc.ref
                    .update(req.body.redeFarmacia)
                    .then((result) => {
                        res.status(201).send({
                            msg: 'Updated Successfuly',
                            result,
                            id: doc.id,
                            link: process.env.URL_ROOT + '/redeFarmacias/' + doc.id
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
        .collection('RedeFarmacias')
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