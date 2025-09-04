import { VertexAI } from '@google-cloud/vertexai'
import dotenv from "dotenv";
dotenv.config();

class VertexAIService {
  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION
    });

    this.model = this.vertexAI.preview.getGenerativeModel({
      model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro'
    });
  }

  async generateWellnessResponse(userMessage, chatHistory = [], userContext = {}) {
    try {
      // Build context for the wellness chatbot
      const systemPrompt = this.buildSystemPrompt(userContext);
      const conversationHistory = this.buildConversationHistory(chatHistory);
      
      const prompt = `${systemPrompt}\n\n${conversationHistory}\n\nUser: ${userMessage}\n\nAssistant:`;

      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      });

      const response = result.response;
      const generatedText = response.candidates[0].content.parts[0].text;

      return {
        success: true,
        response: generatedText.trim(),
        metadata: {
          model: process.env.VERTEX_AI_MODEL,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  buildSystemPrompt(userContext = {}) {
    return `You are a supportive youth wellness chatbot designed to help teenagers and young adults with mental health, emotional wellness, and personal development.

Key Guidelines:
- Be empathetic, supportive, and non-judgmental
- Provide practical coping strategies and wellness tips
- Encourage professional help when needed
- Use age-appropriate language
- Focus on building resilience and positive mental health habits
- Never provide medical diagnoses or replace professional therapy

User Context:
- Age Range: ${userContext.ageRange || 'Teen/Young Adult'}
- Interests: ${userContext.interests || 'General wellness'}
- Previous concerns: ${userContext.concerns || 'None specified'}

Remember to:
1. Listen actively and validate emotions
2. Offer practical, actionable advice
3. Suggest healthy coping mechanisms
4. Encourage self-care practices
5. Know when to refer to professional help`;
  }

  buildConversationHistory(chatHistory) {
    if (!chatHistory || chatHistory.length === 0) {
      return "Conversation History: This is the start of the conversation.";
    }

    const history = chatHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    return `Conversation History:\n${history}`;
  }

  async analyzeUserSentiment(message) {
    try {
      const prompt = `Analyze the emotional tone and urgency level of this message from a young person:

"${message}"

Provide a JSON response with:
- sentiment: positive/neutral/negative
- urgency: low/medium/high
- emotions: array of detected emotions
- needsSupport: boolean`;

      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const response = result.response.candidates[0].content.parts[0].text;
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Return default analysis if AI fails
      return {
        sentiment: 'neutral',
        urgency: 'low',
        emotions: ['unknown'],
        needsSupport: false
      };
    }
  }
}

const vertexaiservice = new VertexAIService()
export default vertexaiservice