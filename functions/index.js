require('dotenv').config()
const functions = require('firebase-functions')

const express = require('express')
const bodyParser = require('body-parser')
const redeFarmaciaRouter = require('../api/routes/redeFarmacia');
const perfilRouter = require('../api/routes/perfil');
const authentication_Router = require('../api/routes/auth');
const signUp = require('../api/midlewares/signup');

const app = express()
const port = (parseInt(process.env.PORT) || 3000)
app.listen(port, () => {
    console.log("Now listening on port " + port);
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.status(201).json(new Date().toJSON())
})

app.use('/redeFarmacia', redeFarmaciaRouter)
app.use('/perfil', perfilRouter)
app.post('/signup', signUp.createAccount)
app.use('/auth', authentication_Router)



app.use((req, res, next, err) => {

    return res.status(404).json({
        msg: 'Something went bad',
        erro: err.message
    })

});



exports.api = functions.https.onRequest(app)