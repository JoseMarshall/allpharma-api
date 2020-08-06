require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const signUp = require('./midlewares/signup');
const redefinePassword = require('./midlewares/auth');
const cors = require('cors')
const { checkToken } = require('./midlewares/checkToken');

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//============================      CORS       ===========================
const whitelist = [
    process.env.URL_ROOT,
    process.env.FRONT_END
]; //the array containing all url allowed by cors
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error(origin + " Not allowed by CORS"));
        }
    },
    methods: ["PUT", "GET", "POST", "HEAD", "DELETE"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "application/json",
    ]
};
app.use(cors(corsOptions));
//========================================================================

app.use((req, res, next) => {
    console.log(`Host: ${req.hostname || req.ip}
Method: ${req.method} ${req.url}`) //To log every request
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

app.use('/redeFarmacias', redeFarmaciaRouter)
app.use('/generos', generoRouter)
app.use('/menus', menuRouter)
app.use(checkToken)
app.use('/perfis', perfilRouter)
app.use('/farmacias', farmaciaRouter)
app.use('/ajudasPrestadas', ajudaPrestadaRouter) //Dont remember what is it for
app.use('/categoriasProduto', categoriaProdutoRouter)
app.use('/clientesPaciente', clientePacienteRouter)
app.use('/comentarios', comentarioRouter)
app.use('/comprasProduto', comprasProdutoRouter) //Falta testar
app.use('/encomendas', encomendaRouter) //Falta testar
app.use('/enfermeiros', enfermeiroRouter) //Falta testar
app.use('/farmaceuticos', farmaceuticoRouter) //Falta testar
app.use('/fornecedores', fornecedorRouter) //Falta testar
app.use('/funcionarios', funcionarioRouter) //Falta testar
app.use('/mensagens', mensagemRouter) //Falta testar
app.use('/ordemEnfermeiros', ordemEmfermeiroRouter) //Falta testar
app.use('/ordemFarmaceuticos', ordemFarmaceuticoRouter) //Falta testar
app.use('/pedidosAjuda', pedidoAjudaRouter) //Falta testar
app.use('/pedidosAjudaByCliente', pedidoAjudaByClienteRouter) //Falta testar
app.use('/produtos', produtoRouter)
app.use('/produtosPrateleira', produtoPrateleiraRouter) //Falta testar
app.use('/registoTroco', registoTrocoRouter) //Falta testar
app.use('/respostas', respostaRouter) //Falta testar
app.use('/stocks', stockRouter) //Falta testar
app.use('/vendas', vendasRouter) //Falta testar


//Midleware padrão dos erros
app.use((err, req, res, next) => {
    console.log(`Error message ${err.message}`)
    return res.status(500).json({
        msg: err.message,
        erro: err
    })

});

module.exports = app 