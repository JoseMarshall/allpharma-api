const router = require('express').Router()
const perfilController = require('../controllers/perfilController')

router.post('/', perfilController.create)

router.get('/:id', perfilController.getOne)

router.get('/', perfilController.getAll)

router.delete('/:id', perfilController.delete)

module.exports = router