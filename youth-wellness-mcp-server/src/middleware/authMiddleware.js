import jwt from 'jsonwebtoken';

/**
 * JWT Authentication Middleware
 * Validates JWT tokens in the Authorization header
 */
const authMiddleware = (req, res, next) => {
  // TEMPORARY: Skip authentication for testing purposes
  if (process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') {
    console.log('⚠️  Skipping authentication for testing');
    req.user = { id: 'test-user', email: 'test@example.com' };
    return next();
  }

  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'No valid token provided. Please include "Authorization: Bearer <token>" header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Token is missing'
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request object
    req.user = decoded;
    
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'The provided token has expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Similar to authMiddleware but allows requests without tokens
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();

  } catch (error) {
    console.error('Optional auth middleware error:', error);
    
    // For optional auth, we don't reject invalid tokens, just set user to null
    req.user = null;
    next();
  }
};

export { optionalAuthMiddleware };
export default authMiddleware;
