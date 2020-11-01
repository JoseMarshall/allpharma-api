const router = require('express').Router()
const controller = require('../controllers/stockController')


router.post('/', controller.create)

router.get('/farmacias/:farmaciaId', controller.getAll)

router.get('/:id', controller.getOne)

router.delete('/:id', controller.delete)


module.exports = router