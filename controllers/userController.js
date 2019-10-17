const crypto = require('crypto')
const { sqlDB } = require('../database')
const { createJWTToken } = require('../helpers/jwt')
const { transporter } = require('../helpers/mailer')

const secret = 'bambang'


module.exports = {
    keepLogin: (req, res) => {
        console.log(req.user)
        res.status(200).send({
            ...req.user
        })
    },

    login: (req,res) => {
        var { email, password } = req.body;
        password = crypto.createHmac('sha256', secret)
                        .update(password)
                        .digest('hex');

        var sql = `SELECT id,username,email,status
                    FROM users 
                    WHERE email = ${sqlDB.escape(email)}
                    AND password = ${sqlDB.escape(password)};`
        
        sqlDB.query(sql, (err, results) => {
            if(err) return res.status(500).send({ err, message: 'Database Error' })

            if(results.length === 0) {
                return res.status(500).send({ message: 'Email or Password Incorrect' })
            }

            var token = createJWTToken({ ...results[0] }, { expiresIn: '1h' })

            res.status(200).send({ ...results[0], token })
        })
    },

    register: (req,res) => {
        req.body.status = 'Unverified'
        req.body.created_date = new Date()

        // Encrypt
        req.body.password = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex')

        var sql = `SELECT * FROM users
                        WHERE email = '${req.body.email}'`
        sqlDB.query(sql, (err, results) => {
            if (err) return res.status(500).send({ message:'DB Error gan!', err, error: true })

            if (results.length > 0) {
                return res.status(500).send('Email already used for another account!')
            }

            var sql = `INSERT INTO users SET ?`
            sqlDB.query(sql, req.body, (err, results) => {
                if (err) return res.status(500).send({
                    message: 'DB Error gan!',
                    err,
                    error: true
                })

                // Email Verification
                var mailOptions = {
                    from: "Son Of A Gun <andreputerap@gmail.com>",
                    to: req.body.email,
                    subject: "Email Confirmation",
                    html: `<h1>Bergabunglah Dengan Kami</h1>
                        <h4>Silahkan klik <a href='http://localhost:3000/emailverified?email=${req.body.email}' target='_blank'>disini</a></h4>`
                }

                transporter.sendMail(mailOptions, (err, results) => {
                    if (err) {
                        return res.status(500).send({
                            message: 'Kirim Email Confirmation Gagal!',
                            err,
                            error: false
                        })
                    }

                    res.status(200).send(results)
                })
            })
        })
    },

    resendEmailConfirm: (req, res) => {
        var mailOptions = {
            from: "Son Of A Gun <andreputerap@gmail.com>",
            to: req.body.email,
            subject: "Email Confirmation",
            html: `<h1>Bergabunglah Dengan Kami</h1>
                <h4>Silahkan klik <a href='http://localhost:3000/emailverified?email=${req.body.email}' target='_blank'>disini</a></h4>`
        }

        transporter.sendMail(mailOptions, (err, results) => {
            if (err) {
                return res.status(500).send({
                    message: 'Kirim Email Confirmation Gagal!',
                    err,
                    error: false
                })
            }

            res.status(200).send({
                message: 'MANTAP',
                results
            })
        })
    },

    emailConfirmed: (req,res) => {
    var sql = `UPDATE users SET status='Verified' WHERE email = '${req.body.email}'`
    sqlDB.query(sql, (err,results) => {
        if (err) return res.status(500).send({
            status: 'error',
            err
        })

        sql = `SELECT id,username,email,status FROM users WHERE email = '${req.body.email}'`
        sqlDB.query(sql, (err,results) => {
            if (err) return res.status(500).send(err)

            var token = createJWTToken({ ...results[0] }, { expiresIn: '1h' })

            res.status(200).send({ ...results[0], token })
        })
    })
}
}