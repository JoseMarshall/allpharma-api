const express = require('express');
const router = express.Router();
const auth = require('../midlewares/auth')

router.post('/', auth.checkAuth)


module.exports = router