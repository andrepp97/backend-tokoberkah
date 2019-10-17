const express = require('express')
const { auth } = require('../helpers/auth')
const { kotaController } = require('../controllers')

const router = express.Router()

router.get('/getkota', kotaController.getKota)
router.get('/getkota/:id', kotaController.getKotaById)

module.exports = router