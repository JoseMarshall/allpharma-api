const { db } = require('../credentials/admin')


exports.getOne = (id) => {

    return db
        .collection('ContaUsuarios')
        .doc(id)
        .get()
        .then((doc) => {
            return (doc.exists) ? doc.data() : {}
        })
        .catch((err) => {
            return { erro: err.message }
        })
}