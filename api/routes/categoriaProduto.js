const router = require('express').Router()
const controller = require('../controllers/categoriaProdutoController')

router.post('/', controller.create)

router.get('/:id', controller.getOne)

router.get('/', controller.getAll)

router.delete('/:id', controller.delete)

router.put('/:id', controller.update)


module.exports = router