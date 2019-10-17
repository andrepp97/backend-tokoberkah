const mysql = require('mysql')

const conn = mysql.createConnection({
    host: 'db4free.net',
    user: 'andre97',
    password: 'kureha21',
    database: 'tokoberkahgue',
    timezone: 'UTC'
})

module.exports = {
    sqlDB: conn
}