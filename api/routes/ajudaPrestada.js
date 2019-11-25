const router = require('express').Router()
const controller = require('../controllers/ajudaPrestadaController')

router.post('/', controller.create)

router.get('/:id', controller.getOne)

router.get('/', controller.getAll)

module.exports = router