const router = require('express').Router()
const controller = require('../controllers/stockController')


router.post('/farmacias/:farmaciaId', controller.create)

router.get('/farmacias/:farmaciaId/:id', controller.getOne)

router.get('/farmacias/:farmaciaId', controller.getAll)

router.put('/farmacias/:farmaciaId', controller.update)

router.delete('/farmacias/:farmaciaId/:id', controller.delete)


module.exports = router