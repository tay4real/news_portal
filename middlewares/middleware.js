const jwt = require('jsonwebtoken');

class middleware {}

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Access token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const userInfo = jwt.verify(token, process.env.secret);
    req.userInfo = userInfo;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const role = async (req, res, next) => {
  const { userInfo } = req;
  if (userInfo.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Access is denied' });
  }
  next();
};
module.exports = { auth, role };
