const bodyParser = require('body-parser')
const express = require('express')
const mysql = require('mysql')
const app = express()
const cors = require('cors')
const {uploader} = require('./uploader')
const fs = require("fs")
const port = process.env.PORT || 1997

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tokoberkah',
    timezone: 'UTC'
})

conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});

app.get('/kota', (req, res) => {
    let sql = "SELECT * FROM kota order by nama"
    let query = conn.query(sql, (err, results) => {
        if (err) throw err
        res.send(results)
    })
})

app.get('/kota/:kotaId', (req, res) => {
    let sql = `SELECT * FROM kota WHERE id=${conn.escape(req.params.kotaId)}`
    console.log(sql)
    let query = conn.query(sql, (err, results) => {
        if (err) throw err
        res.send(results)
    })
})

app.get('/toko/:tokoId', (req, res) => {
    let sql = "SELECT * FROM toko WHERE id=" + conn.escape(req.params.tokoId);
    let query = conn.query(sql, (err, results) => {
        if (err) throw err
        res.send(results)
    })
})

app.get('/toko', (req, res) => {
    const nama = req.query.nama || ''
    const alamat = req.query.alamat ? ` AND alamat like '%${req.query.alamat}%'` : ''
    const minIncome = req.query.minIncome ? ` AND totalIncome >= ${req.query.minIncome}` : ''
    const maxIncome = req.query.maxIncome ? ` AND totalIncome <= ${req.query.maxIncome}` : ''
    const dateFrom = req.query.dateFrom ? ` AND tanggalBerdiri >= '${req.query.dateFrom}'` : ''
    const dateTo = req.query.dateTo ? ` AND tanggalBerdiri <= '${req.query.dateTo}'` : ''

    let sql = `SELECT t.id as idToko, t.nama as namaToko, alamat, totalIncome, tanggalBerdiri, k.nama as Kota, k.id as idKota
                FROM toko t
                JOIN kota k on k.id = t.kotaId
                WHERE t.nama like '%${nama}%'` + alamat + minIncome + maxIncome + dateFrom + dateTo

    let query = conn.query(sql, (err, results) => {
        if (err) throw err
        res.send(results)
    })
})


// POST
app.post('/addtoko', (req, res) => {
    var newToko = req.body
    console.log(newToko)
    if (newToko) {
        var sql = 'INSERT into toko SET ?'

        conn.query(sql, newToko, (err, results) => {
            if (err) {
                return status(500).send('Error Bro')
            }
            res.status(200).send(results)
        })
    }else{
        res.status(500).send('Kasih body la cuk')
    }
})

app.put('/edittoko/:id', (req, res) => {
    if (req.body) {
        var sql = `UPDATE toko
                    SET ?
                    WHERE id = ${req.params.id}`

        conn.query(sql, req.body, (err, results) => {
            if (err) {
                return status(500).send(err)
            }
            res.status(200).send(results)
            console.log('SUCCESS')
        })
    } else {
        res.status(500).send('Kasih body la cuk')
    }
})

app.delete('/deletetoko/:id', (req,res) => {
    var sql = `DELETE from toko WHERE id = ${conn.escape(req.params.id)}`

    conn.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err)
        }

        res.status(200).send(results)
    })
})


// IMAGES
app.get('/tokoimg/:id', (req,res) => {
    var sql = `SELECT ti.*, t.nama as namaToko FROM toko_img ti
                JOIN toko t ON t.id = ti.tokoId
                WHERE tokoId = ${conn.escape(req.params.id)}`
    console.log(sql)
    conn.query(sql, (err, results) => {
        if (err) res.status(500).send(err)

        res.status(200).send(results)
    })
})

app.post('/addtokoimg', (req,res) => {
    const path = '/img/toko'
    const upload = uploader(path, 'TOK').fields([{ name: 'image' }])

    upload(req, res, (err) => {
        if(err){
            return res.status(500).json({ message: 'Upload file failed !', error: err.message });
        }

        const { image } = req.files;
        console.log(image)

        const data = JSON.parse(req.body.data)
        console.log(data)

        var insertData = []
        for (let i = 0; i < image.length; i++) {
            insertData.push([`${path}/${image[i].filename}`, data.tokoId])
        }

        var sql = `INSERT INTO toko_img (pathname, tokoId) VALUES ?`
        conn.query(sql, [insertData], (err,results) => {
            if (err) {
                for (let i = 0; i < image.length; i++) {
                    fs.unlinkSync(`./public${path}/${image[i].filename}`)
                }
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        })
    })
})

app.put('/editimg/:id', (req,res) => {
    const path = '/img/toko'
    const upload = uploader(path, 'TOK').fields([{ name: 'image' }])

    upload(req, res, (err) => {
        if(err){
            return res.status(500).json({ message: 'Upload file failed !', error: err.message });
        }

        const { image } = req.files;
        console.log(image)

        var imgPath = path + '/' + image[0].filename
        console.log(imgPath)

        var sql2 = `SELECT pathname FROM toko_img WHERE id = ${conn.escape(req.params.id)}`
        conn.query(sql2, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }

            var oldPath = results[0].pathname
            console.log('path lawas = ' + oldPath)

            var sql = `UPDATE toko_img SET pathname = '${imgPath}' WHERE id = ${conn.escape(req.params.id)}`
            conn.query(sql, (err, results) => {
                if (err) {
                    fs.unlinkSync(`./public${imgPath}`)
                    return res.status(500).send(err)
                }
                fs.unlinkSync(`./public${oldPath}`)
                res.status(200).send('Mantap Jiwa')
            })

        })

    })
})

app.post('/deleteimg', (req, res) => {
    if (req.body) {
        var sql = `DELETE from toko_img WHERE id = ${conn.escape(req.body.id)}`

        conn.query(sql, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }

            fs.unlinkSync(`./public${req.body.path}`)
            res.status(200).send(results)
        })
    }
})
// IMAGES


app.listen(port, () => console.log('API aktif di port ' + port))