const router = require('express').Router()
const controller = require('../controllers/stockController')


router.post('/farmacias/:farmaciaId', controller.create)

router.get('/farmacias/:farmaciaId/:id', controller.getOne)

router.get('/farmacias/:farmaciaId', controller.getAll)

router.put('/farmacias/:farmaciaId/:id', controller.update)

router.delete('/:id', controller.delete)


module.exports = router