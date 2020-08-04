const admin = require('firebase-admin')
const config = require('./credentials.json')
admin.initializeApp({
    credential: admin.credential.cert(require('./credentials.json'))
});

const db = admin.firestore()

module.exports = { admin, db, config }