const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id and role
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

module.exports = { verifyToken, isAdmin };
