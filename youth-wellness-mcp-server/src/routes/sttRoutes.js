import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sttController from '../controllers/sttController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `stt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/flac',
    'audio/x-flac',
    'audio/mp3',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
    'application/octet-stream' // Some browsers send this for audio files
  ];

  const allowedExtensions = ['.wav', '.flac', '.mp3', '.webm', '.ogg'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a valid audio file (.wav, .flac, .mp3, .webm, .ogg)'), false);
  }
};

// Configure multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
    files: 1 // Only allow one file at a time
  }
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size must be less than 25MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Only one file is allowed per request'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected file',
        message: 'Unexpected file field'
      });
    }
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: err.message
    });
  }

  next(err);
};

// Apply authentication middleware to all routes
router.use(authMiddleware);

// STT Routes

/**
 * POST /api/stt
 * Convert uploaded audio file to text
 * Requires: multipart/form-data with 'audio' file field
 * Optional body params: languageCode, enableWordTimeOffsets, sampleRateHertz, model
 */
router.post('/', upload.single('audio'), handleMulterError, sttController.transcribeAudio);

/**
 * POST /api/stt/stream
 * Convert uploaded audio file to text using streaming (for longer files)
 * Requires: multipart/form-data with 'audio' file field
 * Optional body params: languageCode, sampleRateHertz, encoding
 */
router.post('/stream', upload.single('audio'), handleMulterError, sttController.transcribeAudioStream);

/**
 * GET /api/stt/info
 * Get information about STT capabilities, supported languages, formats, etc.
 */
router.get('/info', sttController.getSTTInfo);

// Health check endpoint for STT service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Speech-to-Text',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supportedFormats: ['wav', 'flac', 'mp3', 'webm', 'ogg'],
    maxFileSize: '25MB'
  });
});

export default router;