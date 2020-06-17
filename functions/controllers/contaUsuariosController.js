const { db } = require('../credentials/admin')


exports.getOne = (id) => {

    return db
        .collection('ContaUsuarios')
        .doc(id)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return doc.data()
            } else {
                return {}
            }
        })
        .catch((err) => {
            console.log(err.message);
            return { erro: err.message }
        })
}