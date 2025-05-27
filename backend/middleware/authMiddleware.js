const jwt = require('jsonwebtoken');


const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or invalid', isSuccess: false });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions', isSuccess: false });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token verification failed', isSuccess: false });
    }
  };
};

module.exports = authMiddleware;
