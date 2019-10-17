const { uploader } = require('../helpers/uploader')
const { sqlDB } = require('../database')
const fs = require('fs')

module.exports = {
    getToko: (req, res) => {
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

        let query = sqlDB.query(sql, (err, results) => {
            if (err) throw err
            res.send(results)
        })
    },

    getTokoById: (req, res) => {
        let sql = "SELECT * FROM toko WHERE id=" + sqlDB.escape(req.params.tokoId);
        let query = sqlDB.query(sql, (err, results) => {
            if (err) throw err
            res.send(results)
        })
    },

    addToko: (req, res) => {
        var newToko = req.body
        console.log(newToko)
        if (newToko) {
            var sql = 'INSERT into toko SET ?'

            sqlDB.query(sql, newToko, (err, results) => {
                if (err) {
                    return status(500).send('Error Bro')
                }
                res.status(200).send(results)
            })
        } else {
            res.status(500).send('Kasih body la cuk')
        }
    },

    editToko: (req, res) => {
        if (req.body) {
            var sql = `UPDATE toko
                    SET ?
                    WHERE id = ${req.params.id}`

            sqlDB.query(sql, req.body, (err, results) => {
                if (err) {
                    return status(500).send(err)
                }
                res.status(200).send(results)
                console.log('SUCCESS')
            })
        } else {
            res.status(500).send('Kasih body la cuk')
        }
    },

    deleteToko: (req, res) => {
        var sql = `DELETE from toko WHERE id = ${sqlDB.escape(req.params.id)}`

        sqlDB.query(sql, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        })
    },

    addImageToko: (req, res) => {
        const path = '/img/toko'
        const upload = uploader(path, 'TOK').fields([{
            name: 'image'
        }])

        upload(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    message: 'Upload file failed !',
                    error: err.message
                });
            }

            const {
                image
            } = req.files;
            console.log(image)

            const data = JSON.parse(req.body.data)
            console.log(data)

            var insertData = []
            for (let i = 0; i < image.length; i++) {
                insertData.push([`${path}/${image[i].filename}`, data.tokoId])
            }

            var sql = `INSERT INTO toko_img (pathname, tokoId) VALUES ?`
            sqlDB.query(sql, [insertData], (err, results) => {
                if (err) {
                    for (let i = 0; i < image.length; i++) {
                        fs.unlinkSync(`./public${path}/${image[i].filename}`)
                    }
                    return res.status(500).send(err)
                }

                res.status(200).send(results)
            })
        })
    },

    getImageTokoByTokoId: (req, res) => {
        var sql = `SELECT ti.*, t.nama as namaToko FROM toko_img ti
                JOIN toko t ON t.id = ti.tokoId
                WHERE tokoId = ${sqlDB.escape(req.params.id)}`
        console.log(sql)
        sqlDB.query(sql, (err, results) => {
            if (err) res.status(500).send(err)

            res.status(200).send(results)
        })
    },

    editImageTokoById: (req, res) => {
        const path = '/img/toko'
        const upload = uploader(path, 'TOK').fields([{
            name: 'image'
        }])

        upload(req, res, (err) => {
            if (err) {
                return res.status(500).json({
                    message: 'Upload file failed !',
                    error: err.message
                });
            }

            const {
                image
            } = req.files;
            console.log(image)

            var imgPath = path + '/' + image[0].filename
            console.log(imgPath)

            var sql2 = `SELECT pathname FROM toko_img WHERE id = ${sqlDB.escape(req.params.id)}`
            sqlDB.query(sql2, (err, results) => {
                if (err) {
                    return res.status(500).send(err)
                }

                var oldPath = results[0].pathname
                console.log('path lawas = ' + oldPath)

                var sql = `UPDATE toko_img SET pathname = '${imgPath}' WHERE id = ${sqlDB.escape(req.params.id)}`
                sqlDB.query(sql, (err, results) => {
                    if (err) {
                        fs.unlinkSync(`./public${imgPath}`)
                        return res.status(500).send(err)
                    }
                    fs.unlinkSync(`./public${oldPath}`)
                    res.status(200).send('Mantap Jiwa')
                })

            })

        })
    },

    deleteImageToko: (req, res) => {
        if (req.body) {
            var sql = `DELETE from toko_img WHERE id = ${sqlDB.escape(req.body.id)}`

            sqlDB.query(sql, (err, results) => {
                if (err) {
                    return res.status(500).send(err)
                }

                fs.unlinkSync(`./public${req.body.path}`)
                res.status(200).send(results)
            })
        }
    }
}