import firestoreService from "./firestoreService.js";
import vertexAIService from "./vertexAIService.js";
import { v4 as uuidv4 } from "uuid"

class MCPService {
  async processChatMessage(userId, message, sessionId = null) {
    try {
      // Generate session ID if not provided
      const chatId = sessionId || uuidv4();
      
      // Get user context
      const userContext = await this.getUserContext(userId);
      
      // Get recent chat history
      const chatHistory = await firestoreService.getChatHistory(chatId, 10);
      
      // Analyze user sentiment for risk assessment
      const sentimentAnalysis = await vertexAIService.analyzeUserSentiment(message);
      
      // Save user message
      await firestoreService.saveChatMessage(chatId, {
        role: 'user',
        content: message,
        userId: userId,
        sentiment: sentimentAnalysis
      });

      // Generate AI response
      const aiResponse = await vertexAIService.generateWellnessResponse(
        message,
        chatHistory,
        userContext
      );

      // Enhance response with resources if needed
      const enhancedResponse = await this.enhanceWithResources(
        aiResponse.response,
        sentimentAnalysis
      );

      // Save AI response
      await firestoreService.saveChatMessage(chatId, {
        role: 'assistant',
        content: enhancedResponse,
        userId: userId,
        aiMetadata: aiResponse.metadata
      });

      return {
        success: true,
        response: enhancedResponse,
        sessionId: chatId,
        sentiment: sentimentAnalysis,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error processing chat message:', error);
      throw error;
    }
  }

  async getUserContext(userId) {
    try {
      const user = await firestoreService.getUser(userId);
      return user ? {
        ageRange: user.ageRange,
        interests: user.interests,
        concerns: user.concerns
      } : {};
    } catch (error) {
      console.error('Error getting user context:', error);
      return {};
    }
  }

  async enhanceWithResources(response, sentimentAnalysis) {
    try {
      // If user needs support, add relevant resources
      if (sentimentAnalysis.needsSupport || sentimentAnalysis.urgency === 'high') {
        const resources = await firestoreService.getWellnessResources('coping-strategies', 2);
        
        if (resources.length > 0) {
          const resourceText = resources
            .map(r => `• ${r.title}: ${r.description}`)
            .join('\n');
          
          return `${response}\n\n📚 Here are some additional resources that might help:\n${resourceText}`;
        }
      }

      return response;
    } catch (error) {
      console.error('Error enhancing with resources:', error);
      return response; // Return original response if enhancement fails
    }
  }

  async getChatSessions(userId) {
    try {
      const chatsRef = firestoreService.db.collection('chats');
      const query = chatsRef.where('userId', '==', userId).orderBy('lastMessageAt', 'desc');
      
      const snapshot = await query.get();
      const sessions = [];
      
      snapshot.forEach(doc => {
        sessions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return sessions;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }
}
const mcpservice = new MCPService()
export default mcpservice