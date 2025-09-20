import mcpService  from '../services/mcpService.js'

class ChatController {
  async sendMessage(req, res) {
    try {
      const { message, sessionId } = req.body;
      const userId = req.user.uid; // Get from authenticated user

      if (!message) {
        return res.status(400).json({
          error: 'Message is required'
        });
      }

      const result = await mcpService.processChatMessage(userId, message, sessionId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        error: 'Failed to process chat message',
        details: error.message
      });
    }
  }

  async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;

      const history = await firestoreService.getChatHistory(sessionId, parseInt(limit));
      
      res.status(200).json({
        success: true,
        history,
        sessionId
      });
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({
        error: 'Failed to get chat history',
        details: error.message
      });
    }
  }

  async getUserSessions(req, res) {
    try {
      const userId = req.user.uid; // Get from authenticated user
      
      const sessions = await mcpService.getChatSessions(userId);
      
      res.status(200).json({
        success: true,
        sessions
      });
    } catch (error) {
      console.error('Error getting user sessions:', error);
      res.status(500).json({
        error: 'Failed to get user sessions',
        details: error.message
      });
    }
  }
}

export default new ChatController()