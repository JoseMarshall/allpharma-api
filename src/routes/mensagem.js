const router = require('express').Router()
const controller = require('../controllers/mensagemController')


router.post('/', controller.create)

router.get('/:id', controller.getOne)

router.get('/', controller.getAll)

router.delete('/:id', controller.delete)


module.exports = router