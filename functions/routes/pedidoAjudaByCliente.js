const router = require('express').Router()
const controller = require('../controllers/pedidoAjudaController')

router.get('/', controller.getAllByCliente)

module.exports = router