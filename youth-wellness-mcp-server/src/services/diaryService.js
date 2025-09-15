import diaryModel from '../models/diaryModel.js';
import vertexAIService from './vertexAIService.js';
import { LanguageServiceClient } from '@google-cloud/language';

class DiaryService {
  constructor() {
    this.languageClient = new LanguageServiceClient();
  }

  // Create new diary entry and trigger analysis
  async createEntry(userId, entryData) {
    try {
      // Validate entry data
      if (!entryData.content || entryData.content.trim().length === 0) {
        throw new Error('Entry content is required');
      }

      if (entryData.content.length > 10000) {
        throw new Error('Entry content is too long (max 10,000 characters)');
      }

      // Create the entry
      const entry = await diaryModel.createEntry(userId, entryData);

      // Trigger AI analysis asynchronously
      this.analyzeEntryAsync(entry.id, entryData.content);

      return entry;
    } catch (error) {
      throw new Error(`Failed to create diary entry: ${error.message}`);
    }
  }

  // Get user's diary entries with optional filtering
  async getUserEntries(userId, filters = {}) {
    try {
      const options = {};
      
      if (filters.startDate) {
        options.startDate = new Date(filters.startDate);
      }
      if (filters.endDate) {
        options.endDate = new Date(filters.endDate);
      }
      if (filters.limit) {
        options.limit = parseInt(filters.limit);
      }

      const entries = await diaryModel.getUserEntries(userId, options);
      
      // Optionally include insights for each entry
      if (filters.includeInsights) {
        for (let entry of entries) {
          entry.insights = await diaryModel.getEntryInsights(entry.id);
        }
      }

      return entries;
    } catch (error) {
      throw new Error(`Failed to get diary entries: ${error.message}`);
    }
  }

  // Get single entry with insights
  async getEntry(entryId, userId, includeInsights = true) {
    try {
      const entry = await diaryModel.getEntryById(entryId, userId);
      
      if (includeInsights) {
        entry.insights = await diaryModel.getEntryInsights(entryId);
      }

      return entry;
    } catch (error) {
      throw new Error(`Failed to get diary entry: ${error.message}`);
    }
  }

  // Update diary entry
  async updateEntry(entryId, userId, updateData) {
    try {
      const updatedEntry = await diaryModel.updateEntry(entryId, userId, updateData);
      
      // Re-analyze if content was updated
      if (updateData.content) {
        this.analyzeEntryAsync(entryId, updateData.content);
      }

      return updatedEntry;
    } catch (error) {
      throw new Error(`Failed to update diary entry: ${error.message}`);
    }
  }

  // Delete diary entry
  async deleteEntry(entryId, userId) {
    try {
      return await diaryModel.deleteEntry(entryId, userId);
    } catch (error) {
      throw new Error(`Failed to delete diary entry: ${error.message}`);
    }
  }

  // Get user statistics and analytics
  async getUserAnalytics(userId, days = 30) {
    try {
      const stats = await diaryModel.getUserStats(userId, days);
      const emotionalInsights = await this.getEmotionalInsights(userId, days);
      
      return {
        ...stats,
        ...emotionalInsights
      };
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error.message}`);
    }
  }

  // Get emotional insights for a user
  async getEmotionalInsights(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const entries = await diaryModel.getUserEntries(userId, {
        startDate: startDate,
        limit: 100
      });

      const insights = [];
      for (const entry of entries) {
        const entryInsights = await diaryModel.getEntryInsights(entry.id);
        insights.push(...entryInsights);
      }

      return this.processEmotionalInsights(insights);
    } catch (error) {
      throw new Error(`Failed to get emotional insights: ${error.message}`);
    }
  }

  // Process and aggregate emotional insights
  processEmotionalInsights(insights) {
    const emotionCounts = {};
    const sentimentScores = [];
    const commonThemes = {};
    const triggers = [];
    const copingStrategies = [];

    insights.forEach(insight => {
      // Count emotions
      if (insight.emotions) {
        insight.emotions.forEach(emotion => {
          emotionCounts[emotion.name] = (emotionCounts[emotion.name] || 0) + 1;
        });
      }

      // Collect sentiment scores
      if (insight.sentiment && insight.sentiment.score !== undefined) {
        sentimentScores.push(insight.sentiment.score);
      }

      // Count themes
      if (insight.themes) {
        insight.themes.forEach(theme => {
          commonThemes[theme] = (commonThemes[theme] || 0) + 1;
        });
      }

      // Collect triggers and coping strategies
      if (insight.triggers) {
        triggers.push(...insight.triggers);
      }
      if (insight.copingStrategies) {
        copingStrategies.push(...insight.copingStrategies);
      }
    });

    // Calculate averages and trends
    const avgSentiment = sentimentScores.length > 0 
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length 
      : 0;

    // Sort emotions by frequency
    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // Sort themes by frequency
    const topThemes = Object.entries(commonThemes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    return {
      averageSentiment: avgSentiment,
      sentimentTrend: this.calculateTrend(sentimentScores),
      topEmotions,
      topThemes,
      commonTriggers: [...new Set(triggers)].slice(0, 5),
      effectiveCopingStrategies: [...new Set(copingStrategies)].slice(0, 5)
    };
  }

  // Calculate trend direction
  calculateTrend(scores) {
    if (scores.length < 2) return 'neutral';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.1) return 'improving';
    if (difference < -0.1) return 'declining';
    return 'stable';
  }

  // Asynchronous entry analysis
  async analyzeEntryAsync(entryId, content) {
    try {
      // Perform Google Cloud Natural Language analysis
      const [nlpResult] = await this.languageClient.analyzeSentiment({
        document: {
          content: content,
          type: 'PLAIN_TEXT',
        },
      });

      // Extract entities
      const [entitiesResult] = await this.languageClient.analyzeEntities({
        document: {
          content: content,
          type: 'PLAIN_TEXT',
        },
      });

      // Use Vertex AI for advanced analysis
      const aiInsights = await vertexAIService.analyzeDiaryEntry(content);

      // Combine insights
      const insights = {
        sentiment: {
          score: nlpResult.documentSentiment.score,
          magnitude: nlpResult.documentSentiment.magnitude
        },
        emotions: this.extractEmotions(nlpResult),
        entities: entitiesResult.entities.map(entity => ({
          name: entity.name,
          type: entity.type,
          salience: entity.salience
        })),
        themes: aiInsights.themes || [],
        triggers: aiInsights.triggers || [],
        copingStrategies: aiInsights.copingStrategies || []
      };

      // Store insights
      await diaryModel.storeInsights(entryId, insights);
      
      console.log(`Successfully analyzed entry ${entryId}`);
    } catch (error) {
      console.error(`Failed to analyze entry ${entryId}:`, error);
    }
  }

  // Extract emotions from sentiment analysis
  extractEmotions(nlpResult) {
    const emotions = [];
    
    // Basic emotion extraction based on sentiment
    const score = nlpResult.documentSentiment.score;
    const magnitude = nlpResult.documentSentiment.magnitude;
    
    if (score > 0.25 && magnitude > 0.3) {
      emotions.push({ name: 'joy', confidence: score });
    } else if (score < -0.25 && magnitude > 0.3) {
      emotions.push({ name: 'sadness', confidence: Math.abs(score) });
    } else if (magnitude > 0.6) {
      emotions.push({ name: 'anxiety', confidence: magnitude });
    }
    
    // Add more sophisticated emotion detection based on sentence-level analysis
    if (nlpResult.sentences) {
      nlpResult.sentences.forEach(sentence => {
        const sentenceScore = sentence.sentiment.score;
        const sentenceMagnitude = sentence.sentiment.magnitude;
        
        if (sentenceMagnitude > 0.5) {
          if (sentenceScore > 0.3) {
            emotions.push({ name: 'excitement', confidence: sentenceScore });
          } else if (sentenceScore < -0.3) {
            emotions.push({ name: 'frustration', confidence: Math.abs(sentenceScore) });
          }
        }
      });
    }

    return emotions;
  }

  // Generate personalized prompts based on user's writing history
  async generatePersonalizedPrompts(userId, count = 3) {
    try {
      const recentEntries = await diaryModel.getUserEntries(userId, { limit: 10 });
      const insights = [];
      
      for (const entry of recentEntries) {
        const entryInsights = await diaryModel.getEntryInsights(entry.id);
        insights.push(...entryInsights);
      }

      // Use Vertex AI to generate contextual prompts
      const prompts = await vertexAIService.generateWritingPrompts(insights, count);
      
      return prompts;
    } catch (error) {
      throw new Error(`Failed to generate prompts: ${error.message}`);
    }
  }

  // Process batch of unprocessed entries
  async processPendingAnalysis(limit = 5) {
    try {
      const unprocessedEntries = await diaryModel.getUnprocessedEntries(limit);
      
      const processingPromises = unprocessedEntries.map(entry => 
        this.analyzeEntryAsync(entry.id, entry.content)
      );
      
      await Promise.all(processingPromises);
      
      return {
        processed: unprocessedEntries.length,
        message: `Successfully processed ${unprocessedEntries.length} entries`
      };
    } catch (error) {
      throw new Error(`Failed to process pending analysis: ${error.message}`);
    }
  }
}

export default new DiaryService();