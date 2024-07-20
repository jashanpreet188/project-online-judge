// middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if no auth header
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Check if auth header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Invalid token format' });
    }

    // Extract the token
    const token = authHeader.slice(7); // Remove "Bearer " from the start

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};