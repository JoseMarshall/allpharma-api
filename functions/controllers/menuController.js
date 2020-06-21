const { db } = require('../credentials/admin')

const moment = require('moment')

// "Menus": [{
//     "Nome": "",
//     "URL": ""
// }]

exports.getOne = (req, res, next) => {

    db
        .collection('Menus')
        .doc(req.params.id)
        .get()
        .then(doc => {
            if (doc.exists) {
                console.log(doc.data());
                return res.status(200).json(doc.data())

            } else {
                return res.status(404).json({ msg: 'Este menu não foi encontrado' })
            }
        })
        .catch(next)
}

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('Menus')
        .get()
        .then(async(snap) => {
            
            await snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/menus/' + doc.id })
                console.log({ id: doc.id, data: doc.data() });
            })
            return res.status(200).json(array)
           
        })
        .catch(next)
}