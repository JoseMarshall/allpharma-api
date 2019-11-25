require('dotenv').config()
const functions = require('firebase-functions')

const express = require('express')
const bodyParser = require('body-parser')
const signUp = require('../api/midlewares/signup');
const redefinePassword = require('../api/midlewares/auth');
const { checkToken, checkMenuAccess } = require('../api/midlewares/checkToken');
const emailSender = require('../api/email/emailSender');

const redeFarmaciaRouter = require('../api/routes/redeFarmacia');
const perfilRouter = require('../api/routes/perfil');
const authRouter = require('../api/routes/auth');
const farmaciaRouter = require('../api/routes/farmacia');

const ajudaPrestadaRouter = require('../api/routes/ajudaPrestada');
const categoriaProdutoRouter = require('../api/routes/categoriaProduto');
const clientePacienteRouter = require('../api/routes/clientePaciente');
const comentarioRouter = require('../api/routes/comentario');
const comprasProdutoRouter = require('../api/routes/comprasProduto');
const encomendaRouter = require('../api/routes/encomenda');
const enfermeiroRouter = require('../api/routes/enfermeiro');
const farmaceuticoRouter = require('../api/routes/farmaceutico');
const fornecedorRouter = require('../api/routes/fornecedor');
const funcionarioRouter = require('../api/routes/funcionario');
const generoRouter = require('../api/routes/genero');
const mensagemRouter = require('../api/routes/mensagem');
const menuRouter = require('../api/routes/menu');
const ordemEmfermeiroRouter = require('../api/routes/ordemEnfermeiro');
const ordemFarmaceuticoRouter = require('../api/routes/ordemFarmaceutico');
const pedidoAjudaRouter = require('../api/routes/pedidoAjuda');
const pedidoAjudaByClienteRouter = require('../api/routes/pedidoAjudaByCliente');
const produtoRouter = require('../api/routes/produto');
const produtoPrateleiraRouter = require('../api/routes/produtoPrateleira');
const registoTrocoRouter = require('../api/routes/registoTroco');
const respostaRouter = require('../api/routes/resposta');
const stockRouter = require('../api/routes/stock');
const vendasRouter = require('../api/routes/vendas');

const app = express()
const port = (parseInt(process.env.PORT) || 3000)
app.listen(port, () => {
    console.log("Now listening on port " + port);
})

//Função que a cada hora checa a lista dos emails falhados e tenta o reenvio 
setInterval(() => {
    emailSender.resendAllFailedEmail()
}, 3600000)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/', (req, res) => {
    res.status(200).json({
        msg: 'Welcome to AllPharma, created by JoseM@rshall in Nov/2019',
        datetime: new Date().toJSON()
    })
})

app.use('/auth', authRouter) //All good
app.post('/signup', signUp.createAccount) //All good 

app.post('/redefinePassword', redefinePassword.setNewPassword) //All good
app.post('/requestPassword', redefinePassword.requestPassword) //All good
app.get('/reactivateAccount', redefinePassword.reactivateAccount) //All good

app.use('/redeFarmacia', redeFarmaciaRouter) //All good
app.use('/perfil', checkToken, perfilRouter) //All good
app.use('/farmacia', checkToken, farmaciaRouter) //Falta testar

app.use('/ajudaPrestada', checkToken, ajudaPrestadaRouter) //Falta testar
app.use('/categoriasProduto', checkToken, categoriaProdutoRouter) //Falta testar
app.use('/clientePaciente', checkToken, clientePacienteRouter) //Falta testar
app.use('/comentario', checkToken, comentarioRouter) //Falta testar
app.use('/comprasProduto', checkToken, comprasProdutoRouter) //Falta testar
app.use('/encomenda', checkToken, encomendaRouter) //Falta testar
app.use('/enfermeiro', checkToken, enfermeiroRouter) //Falta testar
app.use('/farmaceutico', checkToken, farmaceuticoRouter) //Falta testar
app.use('/fornecedor', checkToken, fornecedorRouter) //Falta testar
app.use('/funcionario', checkToken, funcionarioRouter) //Falta testar
app.use('/genero', generoRouter) //Falta testar
app.use('/mensagem', checkToken, mensagemRouter) //Falta testar
app.use('/menu', menuRouter) //Falta testar
app.use('/ordemEnfermeiros', ordemEmfermeiroRouter) //Falta testar
app.use('/ordemFarmaceuticos', ordemFarmaceuticoRouter) //Falta testar
app.use('/pedidosAjuda', checkToken, pedidoAjudaRouter) //Falta testar
app.use('/pedidosAjudaByCliente', checkToken, pedidoAjudaByClienteRouter) //Falta testar
app.use('/produto', checkToken, produtoRouter) //Falta testar
app.use('/produtoPrateleira', checkToken, produtoPrateleiraRouter) //Falta testar
app.use('/registoTroco', checkToken, registoTrocoRouter) //Falta testar
app.use('/resposta', checkToken, respostaRouter) //Falta testar
app.use('/stock', checkToken, stockRouter) //Falta testar
app.use('/vendas', checkToken, vendasRouter) //Falta testar


//Midleware padrão dos erros
app.use((err, req, res, next) => {

    return res.status(404).json({
        msg: 'Something went bad',
        erro: err.message
    })

});



exports.api = functions.https.onRequest(app)