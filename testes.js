const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const testeHelp = require('./testeHelp');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', testeHelp.checkMenuAccess, (req, res) => res.status(200).json({ msg: 'Entrou em ' + req.url, saudacao: 'Hello World!!' }))

app.get('/api/teste', testeHelp.checkMenuAccess, (req, res) => {
    res.status(200).json({ msg: 'Entrou em ' + req.url })
})
app.get('/api/:id', testeHelp.checkMenuAccess, (req, res) => {
    res.status(200).json({ msg: 'Entrou em ' + req.url })
})

app.post('/api', testeHelp.checkMenuAccess, (req, res) => {
    res.status(200).json(req.body)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))