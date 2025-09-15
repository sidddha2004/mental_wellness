import diaryService from '../services/diaryService.js';

class DiaryController {
  
  // POST /api/diary/entries - Create new diary entry
  async createEntry(req, res) {
    try {
      const userId = req.user.uid; // From auth middleware
      const { content, mood, tags } = req.body;

      // Validate input
      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }

      const entryData = { content, mood, tags };
      const entry = await diaryService.createEntry(userId, entryData);

      res.status(201).json({
        success: true,
        message: 'Diary entry created successfully',
        data: entry
      });

    } catch (error) {
      console.error('Create entry error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/entries - Get user's diary entries
  async getEntries(req, res) {
    try {
      const userId = req.user.uid;
      const {
        startDate,
        endDate,
        limit,
        includeInsights
      } = req.query;

      const filters = {
        startDate,
        endDate,
        limit,
        includeInsights: includeInsights === 'true'
      };

      const entries = await diaryService.getUserEntries(userId, filters);

      res.json({
        success: true,
        data: entries,
        count: entries.length
      });

    } catch (error) {
      console.error('Get entries error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/entries/:id - Get single diary entry
  async getEntry(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const includeInsights = req.query.includeInsights !== 'false';

      const entry = await diaryService.getEntry(id, userId, includeInsights);

      res.json({
        success: true,
        data: entry
      });

    } catch (error) {
      console.error('Get entry error:', error);
      const status = error.message.includes('not found') ? 404 : 
                    error.message.includes('Unauthorized') ? 403 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/diary/entries/:id - Update diary entry
  async updateEntry(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.processed;

      const updatedEntry = await diaryService.updateEntry(id, userId, updateData);

      res.json({
        success: true,
        message: 'Diary entry updated successfully',
        data: updatedEntry
      });

    } catch (error) {
      console.error('Update entry error:', error);
      const status = error.message.includes('not found') ? 404 : 
                    error.message.includes('Unauthorized') ? 403 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/diary/entries/:id - Delete diary entry
  async deleteEntry(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;

      const result = await diaryService.deleteEntry(id, userId);

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Delete entry error:', error);
      const status = error.message.includes('not found') ? 404 : 
                    error.message.includes('Unauthorized') ? 403 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/analytics - Get user analytics
  async getAnalytics(req, res) {
    try {
      const userId = req.user.uid;
      const days = parseInt(req.query.days) || 30;

      const analytics = await diaryService.getUserAnalytics(userId, days);

      res.json({
        success: true,
        data: analytics,
        period: `${days} days`
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/insights/:id - Get insights for specific entry
  async getEntryInsights(req, res) {
    try {
      const userId = req.user.uid;
      const { id } = req.params;

      // First verify user owns this entry
      await diaryService.getEntry(id, userId, false);
      
      const insights = await diaryService.getEntryInsights(id);

      res.json({
        success: true,
        data: insights
      });

    } catch (error) {
      console.error('Get insights error:', error);
      const status = error.message.includes('not found') ? 404 : 
                    error.message.includes('Unauthorized') ? 403 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/emotional-insights - Get emotional insights
  async getEmotionalInsights(req, res) {
    try {
      const userId = req.user.uid;
      const days = parseInt(req.query.days) || 30;

      const insights = await diaryService.getEmotionalInsights(userId, days);

      res.json({
        success: true,
        data: insights,
        period: `${days} days`
      });

    } catch (error) {
      console.error('Get emotional insights error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/prompts - Get personalized writing prompts
  async getWritingPrompts(req, res) {
    try {
      const userId = req.user.uid;
      const count = parseInt(req.query.count) || 3;

      const prompts = await diaryService.generatePersonalizedPrompts(userId, count);

      res.json({
        success: true,
        data: prompts
      });

    } catch (error) {
      console.error('Get prompts error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/diary/process-pending - Process pending analysis (admin endpoint)
  async processPendingAnalysis(req, res) {
    try {
      // This could be restricted to admin users
      const limit = parseInt(req.body.limit) || 5;
      
      const result = await diaryService.processPendingAnalysis(limit);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Process pending analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/stats - Get user writing statistics
  async getWritingStats(req, res) {
    try {
      const userId = req.user.uid;
      const days = parseInt(req.query.days) || 30;

      const stats = await diaryService.getUserAnalytics(userId, days);

      // Return only the basic stats, not emotional insights
      const { averageSentiment, sentimentTrend, topEmotions, ...basicStats } = stats;

      res.json({
        success: true,
        data: basicStats,
        period: `${days} days`
      });

    } catch (error) {
      console.error('Get writing stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/diary/search - Search diary entries
  async searchEntries(req, res) {
    try {
      const userId = req.user.uid;
      const { query, startDate, endDate, limit } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      // Get entries and filter by content
      const filters = { startDate, endDate, limit: limit || 50 };
      const entries = await diaryService.getUserEntries(userId, filters);

      // Simple text search (can be enhanced with more sophisticated search later)
      const searchResults = entries.filter(entry => 
        entry.content.toLowerCase().includes(query.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        ))
      );

      res.json({
        success: true,
        data: searchResults,
        count: searchResults.length,
        query: query
      });

    } catch (error) {
      console.error('Search entries error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
export default new DiaryController();