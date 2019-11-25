const { db } = require('../../functions/credentials/admin')

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
                    array.push({ id: doc.id, data: doc.data(), link: process.env.URL_ROOT + '/generos/' + doc.id })
                })
                return res.status(200).json(array)
            } else {
                return res.status(204).send({ msg: 'Não foi encontrado nenhum genero' })
            }
        })
        .catch(next)
}