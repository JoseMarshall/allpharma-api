const router = require('express').Router();
const auth = require('../midlewares/auth')

router.post('/', auth.checkAuth)
router.post('/setNewPassword', auth.setNewPassword)
router.post('/requestPassword', auth.requestPassword)
router.get('/reactivateAccount', auth.reactivateAccount)


module.exports = router