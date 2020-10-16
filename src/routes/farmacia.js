const router = require('express').Router()
const farmaciaController = require('../controllers/farmaciaController')

router.get('/encomenda/:id', farmaciaController.getOneEncomenda)

router.get('/encomenda', farmaciaController.getAllEncomenda)

router.delete('/encomenda/:id', farmaciaController.deleteEncomenda)

router.put('/encomenda/:id', farmaciaController.updateEncomenda)

router.get('/:id/images', farmaciaController.getAllImages)

router.post('/:id/images', farmaciaController.uploadImage)

router.delete('/images/:id', farmaciaController.deleteImages)

router.post('/', farmaciaController.create)

router.get('/:id', farmaciaController.getOne)

router.get('/', farmaciaController.getAll)

router.put('/:id', farmaciaController.update)

router.delete('/:id', farmaciaController.delete)

module.exports = router