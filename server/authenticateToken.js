import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret', (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Add the user payload to the request
        next();
    });
};

export default authenticateToken;
