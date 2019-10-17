const express = require('express')
const { auth } = require('../helpers/auth')
const { tokoController } = require('../controllers')

const router = express.Router()

router.get('/toko', tokoController.getToko)
router.get('/toko/:tokoId', tokoController.getTokoById)
router.post('/addtoko', tokoController.addToko)
router.put('/edittoko/:id', tokoController.editToko)
router.delete('/deletetoko/:id', tokoController.deleteToko)

router.post('/addtokoimg', tokoController.addImageToko)
router.get('/tokoimg/:id', tokoController.getImageTokoByTokoId)
router.put('/editimg/:id', tokoController.editImageTokoById)
router.post('/deleteimg', tokoController.deleteImageToko)

module.exports = router