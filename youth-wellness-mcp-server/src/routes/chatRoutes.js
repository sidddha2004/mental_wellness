import express from 'express';
import chatController from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Send a chat message
router.post('/message', chatController.sendMessage);

// Get chat history for a session
router.get('/history/:sessionId', chatController.getChatHistory);

// Get all chat sessions for a user
router.get('/sessions', chatController.getUserSessions);

export default router;