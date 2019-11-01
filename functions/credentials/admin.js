const admin = require('firebase-admin')
admin.initializeApp({
    credential: admin.credential.cert(require('./credentials.json'))
});

const db = admin.firestore()

module.exports = { admin, db }