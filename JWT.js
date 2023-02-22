const { sign, verify } = require("jsonwebtoken");

const createTokens = (user => {
    payload = { username: user.username, id: user.id, email: user.email }
    const accessToken = sign(payload, "jwtsasdfghjkl");
    return accessToken;
});

const validateToken = (req, res, next) => {
    const accessToken = req.cookies["access-token"]
    if (!accessToken) return res.redirect('/login');
    try {
        const validateToken = verify(accessToken, "jwtsasdfghjkl");
        if (validateToken) {
            req.authenitcated = true;
            req.user = validateToken
            return next()
        }
    } catch (err) {
        return res.status(400).json({ error: err })
    }
}

function isLogin(req) {
    const accessToken = req.cookies["access-token"]
    if (!accessToken) {
        return false
    }
    const validateToken = verify(accessToken, "jwtsasdfghjkl");
    if (validateToken) {
        return true
    }
}

module.exports = { createTokens, validateToken, isLogin }