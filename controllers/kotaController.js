const { uploader } = require('../helpers/uploader')
const { sqlDB } = require('../database')
const fs = require('fs')

module.exports = {
    getKotaById: (req, res) => {
        let sql = `SELECT * FROM kota WHERE id=${sqlDB.escape(req.params.kotaId)}`
        console.log(sql)
        let query = sqlDB.query(sql, (err, results) => {
            if (err) throw err
            res.send(results)
        })
    },

    getKota: (req, res) => {
        let sql = "SELECT * FROM kota order by nama"
        let query = sqlDB.query(sql, (err, results) => {
            if (err) throw err
            res.send(results)
        })
    }
}