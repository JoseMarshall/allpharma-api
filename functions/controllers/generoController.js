const { db } = require('../credentials/admin')

// "Generos": [{
//     "Nome": ""
// }]

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('Generos')
        .get()
        .then((snap) => {            
            snap.docs.map(doc => {
                array.push({ id: doc.id, data: doc.data()})
            })
            return res.status(200).json(array)            
        })
        .catch(next)
}