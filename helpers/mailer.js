const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'andreputerap@gmail.com',
        pass: 'hftrxgcjclsiqbzs'
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = {
    transporter
}