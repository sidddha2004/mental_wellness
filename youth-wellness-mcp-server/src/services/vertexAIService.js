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
    const prompt = `You must respond ONLY with valid JSON. Do not include any explanatory text, markdown formatting, or additional commentary.

Analyze the emotional tone and urgency level of this message from a young person and respond with this exact JSON structure:

Message: "${message}"

Required JSON response format:
{
  "sentiment": "positive",
  "urgency": "low",
  "emotions": ["emotion1", "emotion2"],
  "needsSupport": false
}

Rules:
- sentiment must be: "positive", "neutral", or "negative"
- urgency must be: "low", "medium", or "high"
- emotions must be an array of strings
- needsSupport must be true or false
- Respond with ONLY the JSON object, no other text`;
    
    const result = await this.model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.1, // Lower temperature for more consistent formatting
        topP: 0.8,
        topK: 40
      }
    });

    const response = result.response.candidates[0].content.parts[0].text;
    console.log('Raw AI response:', response); // Debug log
    
    // Clean the response to extract JSON
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object in the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    // Parse the JSON
    const parsed = JSON.parse(cleanedResponse);
    
    // Validate the structure
    const validSentiments = ['positive', 'neutral', 'negative'];
    const validUrgency = ['low', 'medium', 'high'];
    
    if (!validSentiments.includes(parsed.sentiment)) {
      parsed.sentiment = 'neutral';
    }
    if (!validUrgency.includes(parsed.urgency)) {
      parsed.urgency = 'low';
    }
    if (!Array.isArray(parsed.emotions)) {
      parsed.emotions = ['unknown'];
    }
    if (typeof parsed.needsSupport !== 'boolean') {
      parsed.needsSupport = false;
    }
    
    return parsed;
    
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    console.error('Failed response parsing, using fallback');
    
    // Return default analysis if AI fails
    return {
      sentiment: 'neutral',
      urgency: 'low',
      emotions: ['unknown'],
      needsSupport: false
    };
  }
}
  //THIS PART IF FOR DIARY NOW FROM HERE
  async analyzeDiaryEntry(content) {
    try {
      const prompt = `
      Analyze this diary entry and provide insights in JSON format. Focus on mental wellness aspects relevant to Indian youth facing academic and social pressures.

      Diary Entry: "${content}"

      Please provide analysis in this exact JSON structure:
      {
        "themes": ["theme1", "theme2", "theme3"],
        "triggers": ["trigger1", "trigger2"],
        "copingStrategies": ["strategy1", "strategy2"],
        "emotionalState": "primary_emotion",
        "stressLevel": "low/medium/high",
        "supportNeeded": "type_of_support",
        "positiveAspects": ["positive1", "positive2"],
        "concernAreas": ["concern1", "concern2"],
        "culturalContext": "relevant_cultural_aspects"
      }

      Guidelines:
      - Identify themes like academic pressure, family expectations, peer relationships, career anxiety, self-doubt, etc.
      - Look for triggers like exams, social situations, family interactions, comparison with others
      - Identify any coping strategies mentioned (healthy or unhealthy)
      - Consider the Indian cultural context and family dynamics
      - Be sensitive to mental health stigma issues
      - Focus on constructive, supportive insights
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
      }

      // Fallback response if JSON parsing fails
      return {
        themes: ["personal_reflection"],
        triggers: [],
        copingStrategies: [],
        emotionalState: "mixed",
        stressLevel: "medium",
        supportNeeded: "general",
        positiveAspects: ["self_awareness"],
        concernAreas: [],
        culturalContext: "general"
      };

    } catch (error) {
      console.error('Diary analysis error:', error);
      throw new Error(`Failed to analyze diary entry: ${error.message}`);
    }
  }

  // Generate personalized writing prompts based on user's history
  async generateWritingPrompts(userInsights, count = 3) {
    try {
      // Extract recent themes and emotions from insights
      const recentThemes = userInsights
        .flatMap(insight => insight.themes || [])
        .slice(0, 10);
      
      const recentEmotions = userInsights
        .flatMap(insight => insight.emotions || [])
        .map(emotion => emotion.name)
        .slice(0, 10);

      const prompt = `
      Based on a user's recent diary themes and emotions, generate ${count} personalized, culturally sensitive writing prompts for an Indian youth mental wellness app called "Sahara".

      Recent themes: ${recentThemes.join(', ') || 'general life experiences'}
      Recent emotions: ${recentEmotions.join(', ') || 'mixed emotions'}

      Guidelines:
      - Create prompts that are gentle, non-judgmental, and supportive
      - Consider Indian cultural context (family, academics, societal expectations)
      - Encourage self-reflection and emotional processing
      - Avoid triggering or overwhelming questions
      - Focus on growth, resilience, and self-compassion
      - Make them specific enough to inspire writing but open enough for personal interpretation

      Return as JSON array:
      {
        "prompts": [
          {
            "title": "Short prompt title",
            "prompt": "The actual writing prompt question/statement",
            "category": "emotional/academic/social/family/self_care",
            "intention": "Brief description of what this prompt aims to achieve"
          }
        ]
      }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed.prompts || [];
        }
      } catch (parseError) {
        console.error('Failed to parse prompts JSON:', parseError);
      }

      // Fallback prompts
      return [
        {
          title: "Daily Gratitude",
          prompt: "What are three small things that brought you joy or comfort today?",
          category: "self_care",
          intention: "Cultivate gratitude and positive awareness"
        },
        {
          title: "Strength Recognition",
          prompt: "Describe a recent challenge you faced. What strengths did you discover or use?",
          category: "emotional",
          intention: "Build self-awareness of personal resilience"
        },
        {
          title: "Future Self",
          prompt: "What would you want to tell your future self about where you are right now?",
          category: "emotional",
          intention: "Encourage self-compassion and perspective"
        }
      ];

    } catch (error) {
      console.error('Prompt generation error:', error);
      throw new Error(`Failed to generate writing prompts: ${error.message}`);
    }
  }

  // Generate insights summary for a time period
  async generateInsightsSummary(insights, timeframe = "month") {
    try {
      const themes = insights.flatMap(i => i.themes || []);
      const emotions = insights.flatMap(i => i.emotions || []);
      const triggers = insights.flatMap(i => i.triggers || []);
      const copingStrategies = insights.flatMap(i => i.copingStrategies || []);

      const prompt = `
      Create a compassionate, encouraging summary of a user's emotional journey over the past ${timeframe} based on their diary insights.

      Themes mentioned: ${themes.join(', ')}
      Emotions experienced: ${emotions.map(e => e.name || e).join(', ')}
      Identified triggers: ${triggers.join(', ')}
      Coping strategies used: ${copingStrategies.join(', ')}

      Create a supportive summary in JSON format:
      {
        "overallTrend": "positive/stable/needs_attention",
        "keyInsights": ["insight1", "insight2", "insight3"],
        "growthAreas": ["area1", "area2"],
        "strengths": ["strength1", "strength2"],
        "recommendations": ["recommendation1", "recommendation2"],
        "encouragement": "A warm, supportive message"
      }

      Guidelines:
      - Use encouraging, non-clinical language
      - Focus on growth and resilience
      - Acknowledge challenges while highlighting progress
      - Provide actionable, culturally sensitive recommendations
      - Consider the Indian context of family, academics, and social pressures
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse summary JSON:', parseError);
      }

      // Fallback summary
      return {
        overallTrend: "stable",
        keyInsights: ["You're showing great self-awareness through regular reflection"],
        growthAreas: ["Continue developing emotional vocabulary"],
        strengths: ["Consistent self-reflection", "Willingness to explore emotions"],
        recommendations: ["Keep up the regular journaling practice"],
        encouragement: "Your journey of self-discovery is valuable and you're making progress."
      };

    } catch (error) {
      console.error('Summary generation error:', error);
      throw new Error(`Failed to generate insights summary: ${error.message}`);
    }
  }

  // Generate coping strategy recommendations
  async generateCopingStrategies(currentEmotionalState, triggers, culturalContext = "indian_youth") {
    try {
      const prompt = `
      Suggest culturally appropriate coping strategies for an Indian youth experiencing specific emotional challenges.

      Current emotional state: ${currentEmotionalState}
      Identified triggers: ${triggers.join(', ')}
      Cultural context: ${culturalContext}

      Provide strategies in JSON format:
      {
        "immediateStrategies": [
          {
            "name": "strategy_name",
            "description": "How to implement it",
            "timeNeeded": "5-15 minutes",
            "accessibility": "easy/moderate"
          }
        ],
        "dailyPractices": [
          {
            "name": "practice_name",
            "description": "Daily implementation guide",
            "benefits": "Expected benefits"
          }
        ],
        "culturallyRelevant": [
          {
            "name": "culturally_specific_approach",
            "description": "How it fits Indian context",
            "familyConsideration": "How to involve or navigate family"
          }
        ]
      }

      Guidelines:
      - Consider Indian family dynamics and social expectations
      - Include both traditional and modern approaches
      - Ensure strategies are practical for students/young adults
      - Be sensitive to potential stigma around mental health
      - Focus on accessible, low-cost solutions
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse coping strategies JSON:', parseError);
      }

      // Fallback strategies
      return {
        immediateStrategies: [
          {
            name: "Deep Breathing",
            description: "Take 5 slow, deep breaths focusing on the exhale",
            timeNeeded: "2-3 minutes",
            accessibility: "easy"
          }
        ],
        dailyPractices: [
          {
            name: "Gratitude Practice",
            description: "Write down 3 things you're grateful for each evening",
            benefits: "Improved mood and perspective"
          }
        ],
        culturallyRelevant: [
          {
            name: "Family Communication",
            description: "Find trusted family member or friend to share feelings with",
            familyConsideration: "Choose someone understanding and supportive"
          }
        ]
      };

    } catch (error) {
      console.error('Coping strategies generation error:', error);
      throw new Error(`Failed to generate coping strategies: ${error.message}`);
    }
  }
}


const vertexaiservice = new VertexAIService()
export default vertexaiservice