const { db } = require('../credentials/admin')

// "Generos": [{
//     "Nome": ""
// }]

exports.getAll = (req, res, next) => {

    let array = []
    db
        .collection('Generos')
        .get()
        .then(async(snap) => {
            if (!snap.empty) {
                await snap.docs.map(doc => {
                    array.push({ id: doc.id, data: doc.data()})
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum genero' })
            }
        })
        .catch(next)
}