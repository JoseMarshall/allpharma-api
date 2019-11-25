const router = require('express').Router()
const controller = require('../controllers/ordemEnfermeirosController')


router.get('/:id', controller.getOne)

router.put('/:id', controller.update)

router.delete('/:id', controller.delete)


module.exports = router