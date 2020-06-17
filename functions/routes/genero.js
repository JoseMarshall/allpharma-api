const router = require('express').Router()
const controller = require('../controllers/generoController')


router.get('/', controller.getAll)




module.exports = router