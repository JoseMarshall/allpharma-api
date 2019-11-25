const router = require('express').Router();
const auth = require('../midlewares/auth')

router.post('/', auth.checkAuth)


module.exports = router