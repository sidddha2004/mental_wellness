import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  });
}

/**
 * Firebase Auth Middleware
 * Validates Firebase ID tokens in the Authorization header
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'No valid token provided. Please include "Authorization: Bearer <idToken>" header'
      });
    }

    const idToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Access denied',
        message: 'Token is missing'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'The provided Firebase ID token is invalid'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Similar to authMiddleware but allows requests without tokens
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const idToken = authHeader.substring(7);
    
    if (!idToken) {
      req.user = null;
      return next();
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
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
