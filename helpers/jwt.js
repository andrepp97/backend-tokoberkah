const jwt = require('jsonwebtoken');

module.exports = {
    createJWTToken: (payload) => {
        return jwt.sign(payload, 'bambang', { expiresIn: '1h' })
    }
}