const router = require('express').Router()
const farmaciaController = require('../controllers/farmaciaController')

router.post('/', farmaciaController.create)

router.get('/:id', farmaciaController.getOne)

router.get('/', farmaciaController.getAll)

router.put('/:id', farmaciaController.update)

router.delete('/:id', farmaciaController.delete)

router.get('/encomenda/:id', farmaciaController.getOneEncomenda)

router.get('/encomenda', farmaciaController.getAllEncomenda)

router.delete('/encomenda/:id', farmaciaController.deleteEncomenda)

router.put('/encomenda/:id', farmaciaController.updateEncomenda)

router.put('/imageProfile/:id', farmaciaController.setImageProfile)

router.post('/imageProfile/upload/:id', farmaciaController.uploadImage)


module.exports = router