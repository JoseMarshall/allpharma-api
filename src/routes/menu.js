const router = require('express').Router()
const controller = require('../controllers/menuController')


router.get('/:id', controller.getOne)

router.get('/', controller.getAll)

module.exports = router