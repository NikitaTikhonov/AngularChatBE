const jwt = require('jsonwebtoken');
const httpStatus = require('http-status-codes');

const secret = require('../config/secret').secret;

module.exports = {
  verifyToken: async (req, res, next) => {
    const token =
      req.cookies.auth ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: 'No token provided' });
    }

    try {
      const decoded = await jwt.verify(token, secret);
      req.user = decoded.data.user;
      next();
    } catch (err) {
      if (err.expiredAt < new Date()) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: 'Token has expired. Please login again',
          token: null
        });
      }
    }
  }
};
