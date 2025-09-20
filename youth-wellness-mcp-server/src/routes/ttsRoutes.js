import express from 'express';
import ttsController from '../controllers/ttsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes except download/stream endpoints
router.use((req, res, next) => {
  // Skip auth for download and stream endpoints to allow direct audio access
  if (req.path.startsWith('/download/') || req.path.startsWith('/stream/')) {
    return next();
  }
  authMiddleware(req, res, next);
});

// TTS Routes

/**
 * POST /api/tts
 * Convert text to speech and return audio file information
 * Body: { text: "string", options?: { languageCode?, voiceName?, audioEncoding?, speakingRate?, pitch?, volumeGainDb? } }
 */
router.post('/', ttsController.synthesizeText);

/**
 * POST /api/tts/ssml
 * Convert SSML to speech and return audio file information
 * Body: { ssml: "string", options?: { languageCode?, voiceName?, audioEncoding?, speakingRate?, pitch?, volumeGainDb? } }
 */
router.post('/ssml', ttsController.synthesizeSSML);

/**
 * POST /api/tts/live
 * Convert text to speech on the spot using gTTS and stream audio response
 * Body: { text: "string" }
 */
router.post('/live', ttsController.liveGttsTts);

/**
 * GET /api/tts/download/:fileName
 * Download generated audio file
 */
router.get('/download/:fileName', ttsController.downloadAudio);

/**
 * GET /api/tts/stream/:fileName
 * Stream generated audio file
 */
router.get('/stream/:fileName', ttsController.streamAudio);

/**
 * GET /api/tts/voices
 * Get available voices for a specific language
 * Query params: languageCode (optional, defaults to 'en-US')
 */
router.get('/voices', authMiddleware, ttsController.getAvailableVoices);

/**
 * GET /api/tts/info
 * Get information about TTS capabilities, supported languages, voices, etc.
 */
router.get('/info', authMiddleware, ttsController.getTTSInfo);

/**
 * POST /api/tts/cleanup
 * Clean up old audio files (admin endpoint)
 * Body: { maxAgeHours?: number } (default: 24 hours)
 */
router.post('/cleanup', authMiddleware, ttsController.cleanupFiles);

// Health check endpoint for TTS service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Text-to-Speech',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supportedFormats: ['MP3', 'WAV', 'OGG'],
    maxTextLength: 5000
  });
});

// Validation middleware for text input
const validateTextInput = (req, res, next) => {
  const { text, ssml } = req.body;
  const content = text || ssml;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing content',
      message: 'Text or SSML content is required'
    });
  }

  if (content.length > 5000) {
    return res.status(400).json({
      success: false,
      error: 'Content too long',
      message: 'Text or SSML must be less than 5000 characters'
    });
  }

  next();
};

// Apply validation middleware to synthesis routes (including new /live route)
router.use('/', (req, res, next) => {
  if (req.method === 'POST' && (req.path === '/' || req.path === '/ssml' || req.path === '/live')) {
    return validateTextInput(req, res, next);
  }
  next();
});

export default router;
