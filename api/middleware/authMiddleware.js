const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('Auth Failure: No token provided');
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Auth Failure: Token verification failed', err.message);
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log('Auth Success: Token verified for user:', decoded.username, 'Role:', decoded.role);
        req.user = decoded;
        next();
    });
};

exports.authorize = (roles) => {
    return (req, res, next) => {
        console.log('Authorizing access. Required Roles:', roles, 'Actual Role:', req.user.role);
        if (!roles.includes(req.user.role)) {
            console.log('Auth Failure: Role mismatch');
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
