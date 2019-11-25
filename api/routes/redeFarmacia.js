const router = require('express').Router()
const redeFarmaciaController = require('../controllers/redeFarmaciaController')

router.get('/:id', redeFarmaciaController.getOne)

router.get('/', redeFarmaciaController.getAll)

router.put('/:id', redeFarmaciaController.update)

router.delete('/:id', redeFarmaciaController.delete)

module.exports = router