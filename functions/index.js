require('dotenv').config()
const functions = require('firebase-functions')
const express = require('express')
const bodyParser = require('body-parser')
const signUp = require('./midlewares/signup');
const redefinePassword = require('./midlewares/auth');
const { checkToken, checkMenuAccess } = require('./midlewares/checkToken');

const redeFarmaciaRouter = require('./routes/redeFarmacia');
const perfilRouter = require('./routes/perfil');
const authRouter = require('./routes/auth');
const farmaciaRouter = require('./routes/farmacia');
const ajudaPrestadaRouter = require('./routes/ajudaPrestada');
const categoriaProdutoRouter = require('./routes/categoriaProduto');
const clientePacienteRouter = require('./routes/clientePaciente');
const comentarioRouter = require('./routes/comentario');
const comprasProdutoRouter = require('./routes/comprasProduto');
const encomendaRouter = require('./routes/encomenda');
const enfermeiroRouter = require('./routes/enfermeiro');
const farmaceuticoRouter = require('./routes/farmaceutico');
const fornecedorRouter = require('./routes/fornecedor');
const funcionarioRouter = require('./routes/funcionario');
const generoRouter = require('./routes/genero');
const mensagemRouter = require('./routes/mensagem');
const menuRouter = require('./routes/menu');
const ordemEmfermeiroRouter = require('./routes/ordemEnfermeiro');
const ordemFarmaceuticoRouter = require('./routes/ordemFarmaceutico');
const pedidoAjudaRouter = require('./routes/pedidoAjuda');
const pedidoAjudaByClienteRouter = require('./routes/pedidoAjudaByCliente');
const produtoRouter = require('./routes/produto');
const produtoPrateleiraRouter = require('./routes/produtoPrateleira');
const registoTrocoRouter = require('./routes/registoTroco');
const respostaRouter = require('./routes/resposta');
const stockRouter = require('./routes/stock');
const vendasRouter = require('./routes/vendas');

const app = express()
const port = (parseInt(process.env.PORT) || 4000)
app.listen(port, () => {
    console.log("Now listening on port " + port);
    console.log("URL:" + process.env.URL_ROOT);
})


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        '*'
    )
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, GET, POST , PATCH , DELETE')
        return res.status(200).json({})
    }
    next()
})

app.get('/', (req, res) => {
    res.status(200).json({
        msg: 'Welcome to AllPharma, created by JoseM@rshall in Dec/2019',
        datetime: new Date().toJSON()
    })
})

app.use('/auth', authRouter) 
app.post('/signup', signUp.createAccount)  

app.post('/redefinePassword', redefinePassword.setNewPassword) 
app.post('/requestPassword', redefinePassword.requestPassword) 
app.get('/reactivateAccount', redefinePassword.reactivateAccount) 

app.use('/redeFarmacia', redeFarmaciaRouter) 
app.use('/genero', generoRouter) 
app.use('/menu', menuRouter)
app.use(checkToken)
app.use('/perfil', perfilRouter) 
app.use('/farmacia', farmaciaRouter) 
app.use('/ajudaPrestada', ajudaPrestadaRouter) //Dont remember what is it for
app.use('/categoriasProduto', categoriaProdutoRouter) 
app.use('/clientePaciente', clientePacienteRouter) 
app.use('/comentario', comentarioRouter) //Falta testar
app.use('/comprasProduto', comprasProdutoRouter) //Falta testar
app.use('/encomenda', encomendaRouter) //Falta testar
app.use('/enfermeiro', enfermeiroRouter) //Falta testar
app.use('/farmaceutico', farmaceuticoRouter) //Falta testar
app.use('/fornecedor', fornecedorRouter) //Falta testar
app.use('/funcionario', funcionarioRouter) //Falta testar
app.use('/mensagem', mensagemRouter) //Falta testar
app.use('/ordemEnfermeiros', ordemEmfermeiroRouter) //Falta testar
app.use('/ordemFarmaceuticos', ordemFarmaceuticoRouter) //Falta testar
app.use('/pedidosAjuda', pedidoAjudaRouter) //Falta testar
app.use('/pedidosAjudaByCliente', pedidoAjudaByClienteRouter) //Falta testar
app.use('/produto', produtoRouter) //Falta testar
app.use('/produtoPrateleira', produtoPrateleiraRouter) //Falta testar
app.use('/registoTroco', registoTrocoRouter) //Falta testar
app.use('/resposta', respostaRouter) //Falta testar
app.use('/stock', stockRouter) //Falta testar
app.use('/vendas', vendasRouter) //Falta testar


//Midleware padrão dos erros
app.use((err, req, res, next) => {

    return res.status(500).json({
        msg: 'Something went bad',
        erro: err.message
    })

});

exports.api = functions.https.onRequest(app)