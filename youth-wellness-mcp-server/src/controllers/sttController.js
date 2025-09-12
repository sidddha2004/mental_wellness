import sttService from '../services/sttService.js';
import fs from 'fs';
import util from 'util';

class SttController {
  /**
   * Handle Speech-to-Text transcription
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async transcribeAudio(req, res) {
    let tempFilePath = null;

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded',
          message: 'Please upload a valid audio file (.wav, .flac, .mp3, .webm)'
        });
      }

      tempFilePath = req.file.path;
      console.log('Processing audio file:', req.file.originalname);

      // Extract options from request body
      const options = {
        languageCode: req.body.languageCode || 'en-US',
        enableWordTimeOffsets: req.body.enableWordTimeOffsets === 'true',
        sampleRateHertz: req.body.sampleRateHertz ? parseInt(req.body.sampleRateHertz) : undefined,
        model: req.body.model || 'latest_long'
      };

      // Perform transcription
      const transcription = await sttService.transcribeAudio(tempFilePath, options);

      // Clean up the temporary file
      if (fs.existsSync(tempFilePath)) {
        await util.promisify(fs.unlink)(tempFilePath);
      }

      res.status(200).json({
        success: true,
        transcription: transcription,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        options: options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in transcribeAudio controller:', error);

      // Clean up the temporary file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          await util.promisify(fs.unlink)(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Transcription failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle Speech-to-Text streaming transcription for longer audio files
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async transcribeAudioStream(req, res) {
    let tempFilePath = null;

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded',
          message: 'Please upload a valid audio file'
        });
      }

      tempFilePath = req.file.path;
      console.log('Processing audio file with streaming:', req.file.originalname);

      // Extract options from request body
      const options = {
        languageCode: req.body.languageCode || 'en-US',
        sampleRateHertz: req.body.sampleRateHertz ? parseInt(req.body.sampleRateHertz) : 16000,
        encoding: req.body.encoding || 'LINEAR16'
      };

      // Perform streaming transcription
      const transcription = await sttService.transcribeAudioStream(tempFilePath, options);

      // Clean up the temporary file
      if (fs.existsSync(tempFilePath)) {
        await util.promisify(fs.unlink)(tempFilePath);
      }

      res.status(200).json({
        success: true,
        transcription: transcription,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        method: 'streaming',
        options: options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in transcribeAudioStream controller:', error);

      // Clean up the temporary file if it exists
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          await util.promisify(fs.unlink)(tempFilePath);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Streaming transcription failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get supported languages and models for STT
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getSTTInfo(req, res) {
    try {
      const supportedLanguages = [
        'en-US', 'en-GB', 'es-ES', 'es-US', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR',
        'ja-JP', 'ko-KR', 'zh-CN', 'hi-IN', 'ar-XA', 'ru-RU', 'tr-TR'
      ];

      const supportedFormats = [
        { format: 'WAV', encoding: 'LINEAR16', description: 'Uncompressed PCM audio' },
        { format: 'FLAC', encoding: 'FLAC', description: 'Free Lossless Audio Codec' },
        { format: 'MP3', encoding: 'MP3', description: 'MPEG Audio Layer III' },
        { format: 'WebM', encoding: 'WEBM_OPUS', description: 'WebM with Opus codec' }
      ];

      const availableModels = [
        { name: 'latest_long', description: 'Latest model optimized for longer audio' },
        { name: 'latest_short', description: 'Latest model optimized for shorter audio' },
        { name: 'command_and_search', description: 'Optimized for voice commands and search queries' },
        { name: 'phone_call', description: 'Optimized for phone call audio' },
        { name: 'video', description: 'Optimized for video audio' },
        { name: 'default', description: 'Default model' }
      ];

      res.status(200).json({
        success: true,
        supportedLanguages: supportedLanguages,
        supportedFormats: supportedFormats,
        availableModels: availableModels,
        maxFileSizeMB: 10,
        recommendations: {
          sampleRateHertz: {
            'LINEAR16': 16000,
            'FLAC': 16000,
            'MP3': 16000,
            'WEBM_OPUS': 48000
          }
        }
      });

    } catch (error) {
      console.error('Error in getSTTInfo controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get STT information',
        message: error.message
      });
    }
  }
}

export default new SttController();