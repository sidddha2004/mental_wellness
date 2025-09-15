import express from 'express';
import diaryController from '../controllers/diaryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all diary routes
router.use(authMiddleware);

// Diary entry CRUD operations
router.post('/entries', diaryController.createEntry);
router.get('/entries', diaryController.getEntries);
router.get('/entries/:id', diaryController.getEntry);
router.put('/entries/:id', diaryController.updateEntry);
router.delete('/entries/:id', diaryController.deleteEntry);

// Analytics and insights
router.get('/analytics', diaryController.getAnalytics);
router.get('/insights/:id', diaryController.getEntryInsights);
router.get('/emotional-insights', diaryController.getEmotionalInsights);

// Writing assistance
router.get('/prompts', diaryController.getWritingPrompts);
router.get('/stats', diaryController.getWritingStats);

// Search functionality
router.get('/search', diaryController.searchEntries);

// Admin/system endpoints
router.post('/process-pending', diaryController.processPendingAnalysis);

export default  router;