const jwt = require('jsonwebtoken');

module.exports = {
    auth: (req, res, next) => {
        if (req.method !== "OPTIONS") {
            jwt.verify(req.token, "bambang", (error, decoded) => {
                if (error) {
                    // success = false;
                    return res.status(401).json({
                        message: "User not authorized.",
                        error: "User not authorized."
                    });
                }
                console.log(decoded)
                req.user = decoded
                next()
            })
        } else {
            next()
        }
    }
}