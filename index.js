const bodyParser = require('body-parser')
const express = require('express')

const app = express()
const cors = require('cors')
const {uploader} = require('./helpers/uploader')
const fs = require("fs")
const nodemailer = require("nodemailer")
const crypto = require("crypto")
const { createJWTToken } = require('./helpers/jwt')
const { auth } = require('./helpers/auth')
const bearerToken = require('express-bearer-token')
const port = process.env.PORT || 1997

app.use(bodyParser.json())
app.use(cors())
app.use(bearerToken())
app.use('/files', express.static('public'))

const { userRouter, kotaRouter, tokoRouter } = require('./routers')

app.use('/user', userRouter)
app.use('/kota', kotaRouter)
app.use('/toko', tokoRouter)

app.listen(port, () => console.log('API aktif di port ' + port))