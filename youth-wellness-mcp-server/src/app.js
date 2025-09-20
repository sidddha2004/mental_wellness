import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';

import chatRoutes from "./routes/chatRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import sttRoutes from "./routes/sttRoutes.js";
import ttsRoutes from "./routes/ttsRoutes.js";
import diaryRoutes from "./routes/diaryRoutes.js";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'development'
  ? "*"  // allow all in development
  : (process.env.ALLOWED_ORIGINS?.split(',') || ["https://exchange-two-blond.vercel.app"]);

const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins === "*") return callback(null, true); // dev: allow all
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
};
//app.use(cors(corsOptions));
app.use(cors({
  origin: '*'
}));
app.set('trust proxy', 1);
//app.set('trust proxy', true);
// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const diaryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    error: 'Too many diary operations',
    message: 'Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(process.cwd()));
app.use('/outputs', express.static('outputs'));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/diary', diaryLimiter, diaryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Youth Wellness MCP Server',
    version: '1.0.0',
    features: {
      chat: 'active',
      resources: 'active',
      stt: 'active',
      tts: 'active',
      diary: 'active'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Sahara API is running',
    endpoints: {
      chat: '/api/chat',
      resources: '/api/resources',
      stt: '/api/stt',
      tts: '/api/tts',
      diary: '/api/diary'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large',
      message: 'File size exceeds the 10MB limit'
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }

  if (err.code && err.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication Error',
      message: 'Invalid or expired authentication token'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/api/chat',
      '/api/resources',
      '/api/stt',
      '/api/tts',
      '/api/diary',
      '/health',
      '/api/status'
    ]
  });
});

export default app;
