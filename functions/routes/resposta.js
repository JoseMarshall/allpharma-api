const router = require('express').Router()
const controller = require('../controllers/respostaController')


router.post('/', controller.create)

router.get('/', controller.getAll)

router.put('/:id', controller.update)

router.delete('/:id', controller.delete)


module.exports = router