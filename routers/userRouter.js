const express = require('express')
const {auth} = require('../helpers/auth')
const {userController} = require('../controllers')

const router = express.Router()

router.post('/register', userController.register)
router.post('/resendEmailConfirm', userController.resendEmailConfirm)
router.post('/emailConfirmed', userController.emailConfirmed)
router.post('/login', userController.login)
router.post('/keepLogin', auth, userController.keepLogin)

module.exports = router