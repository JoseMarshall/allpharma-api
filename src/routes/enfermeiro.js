const router = require('express').Router()
const controller = require('../controllers/enfermeirosController')


router.get('/:id', controller.getOne)

router.get('/', controller.getAll)

router.put('/:id', controller.update)

router.delete('/:id', controller.delete)

router.put('/imageProfile', controller.setImageProfile)



module.exports = router