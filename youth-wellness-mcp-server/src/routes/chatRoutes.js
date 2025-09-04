import express from 'express';
import chatController from '../controllers/chatController.js'

const router = express.Router();

// Send a chat message
router.post('/message', chatController.sendMessage);

// Get chat history for a session
router.get('/history/:sessionId', chatController.getChatHistory);

// Get all chat sessions for a user
router.get('/sessions/:userId', chatController.getUserSessions);

export default router