const router = require('express').Router()
const controller = require('../controllers/fornecedorController')


router.get('/:id', controller.getOne)

router.get('/', controller.getAll)

router.put('/:id', controller.update)

router.delete('/:id', controller.delete)




module.exports = router