import ttsService from '../services/ttsService.js';
import fs from 'fs';
import path from 'path';

class TtsController {
  /**
   * Handle Text-to-Speech synthesis and return audio directly
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async synthesizeText(req, res) {
    try {
      const { text, languageCode, voiceName, audioEncoding, speakingRate, pitch, volumeGainDb } = req.body;

      // Validate input
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Text is required',
          message: 'Please provide text to convert to speech'
        });
      }

      if (text.length > 5000) {
        return res.status(400).json({
          success: false,
          error: 'Text too long',
          message: 'Text must be less than 5000 characters'
        });
      }

      console.log('Converting text to speech:', text.substring(0, 100) + '...');

      // Prepare options
      const options = {
        languageCode: languageCode || 'en-US',
        voiceName: voiceName || 'en-US-Journey-D',
        audioEncoding: audioEncoding || 'MP3',
        speakingRate: speakingRate || 1.0,
        pitch: pitch || 0.0,
        volumeGainDb: volumeGainDb || 0.0
      };

      // Perform text-to-speech synthesis
      const result = await ttsService.synthesizeSpeech(text, options);

      // Set appropriate headers and return audio directly
      res.set({
        'Content-Type': result.contentType,
        'Content-Length': result.size,
        'Cache-Control': 'public, max-age=3600'
      });

      // Send the audio data directly
      res.send(result.audioData);

    } catch (error) {
      console.error('Error in synthesizeText controller:', error);
      res.status(500).json({
        success: false,
        error: 'Text-to-speech synthesis failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle SSML Text-to-Speech synthesis
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async synthesizeSSML(req, res) {
    try {
      const { ssml, options = {} } = req.body;

      // Validate input
      if (!ssml || ssml.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'SSML is required',
          message: 'Please provide SSML to convert to speech'
        });
      }

      console.log('Converting SSML to speech');

      // Perform SSML text-to-speech synthesis
      const result = await ttsService.synthesizeSSML(ssml, options);

      res.status(200).json({
        success: true,
        fileName: result.fileName,
        fileSize: result.size,
        contentType: result.contentType,
        downloadUrl: `/api/tts/download/${result.fileName}`,
        ssmlLength: ssml.length,
        options: options,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in synthesizeSSML controller:', error);
      res.status(500).json({
        success: false,
        error: 'SSML text-to-speech synthesis failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Download generated audio file
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async downloadAudio(req, res) {
    try {
      const { fileName } = req.params;
      const filePath = path.join(process.cwd(), 'outputs', fileName);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found',
          message: 'The requested audio file does not exist or has been deleted'
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Set appropriate headers
      const fileExtension = path.extname(fileName).toLowerCase();
      const contentType = fileExtension === '.wav' ? 'audio/wav' : 'audio/mpeg';
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      });

      // Stream the file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);

      readStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'File streaming failed',
            message: error.message
          });
        }
      });

    } catch (error) {
      console.error('Error in downloadAudio controller:', error);
      res.status(500).json({
        success: false,
        error: 'File download failed',
        message: error.message
      });
    }
  }

  /**
   * Stream audio file directly to response
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async streamAudio(req, res) {
    try {
      const { fileName } = req.params;
      const filePath = path.join(process.cwd(), 'outputs', fileName);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found',
          message: 'The requested audio file does not exist'
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Set appropriate headers for streaming
      const fileExtension = path.extname(fileName).toLowerCase();
      const contentType = fileExtension === '.wav' ? 'audio/wav' : 'audio/mpeg';
      
      res.set({
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      });

      // Stream the file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);

    } catch (error) {
      console.error('Error in streamAudio controller:', error);
      res.status(500).json({
        success: false,
        error: 'Audio streaming failed',
        message: error.message
      });
    }
  }

  /**
   * Get available voices for TTS
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getAvailableVoices(req, res) {
    try {
      const { languageCode = 'en-US' } = req.query;
      const voices = await ttsService.getAvailableVoices(languageCode);

      res.status(200).json({
        success: true,
        languageCode: languageCode,
        voices: voices,
        totalVoices: voices.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in getAvailableVoices controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get available voices',
        message: error.message
      });
    }
  }

  /**
   * Get TTS configuration information
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getTTSInfo(req, res) {
    try {
      const supportedLanguages = [
        'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
        'es-ES', 'es-US', 'es-MX', 'fr-FR', 'fr-CA',
        'de-DE', 'it-IT', 'pt-BR', 'pt-PT', 'ja-JP',
        'ko-KR', 'zh-CN', 'zh-TW', 'hi-IN', 'ar-XA',
        'ru-RU', 'tr-TR', 'sv-SE', 'nl-NL', 'da-DK'
      ];

      const audioFormats = [
        { format: 'MP3', encoding: 'MP3', description: 'MPEG Audio Layer III (default)' },
        { format: 'WAV', encoding: 'LINEAR16', description: 'Linear PCM' },
        { format: 'OGG', encoding: 'OGG_OPUS', description: 'Ogg Vorbis' }
      ];

      const voiceTypes = [
        'MALE', 'FEMALE', 'NEUTRAL'
      ];

      const sampleRates = [
        8000, 16000, 22050, 24000, 44100, 48000
      ];

      res.status(200).json({
        success: true,
        supportedLanguages: supportedLanguages,
        audioFormats: audioFormats,
        voiceTypes: voiceTypes,
        sampleRates: sampleRates,
        maxTextLength: 5000,
        defaultVoice: 'en-US-Journey-D',
        defaultAudioFormat: 'MP3',
        defaultSampleRate: 24000,
        ssmlSupported: true,
        features: {
          speakingRateControl: { min: 0.25, max: 4.0, default: 1.0 },
          pitchControl: { min: -20.0, max: 20.0, default: 0.0 },
          volumeGainControl: { min: -96.0, max: 16.0, default: 0.0 }
        }
      });

    } catch (error) {
      console.error('Error in getTTSInfo controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get TTS information',
        message: error.message
      });
    }
  }

  /**
   * Clean up old audio files
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async cleanupFiles(req, res) {
    try {
      const { maxAgeHours = 24 } = req.body;
      await ttsService.cleanupOldFiles(maxAgeHours);

      res.status(200).json({
        success: true,
        message: `Cleaned up audio files older than ${maxAgeHours} hours`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in cleanupFiles controller:', error);
      res.status(500).json({
        success: false,
        error: 'File cleanup failed',
        message: error.message
      });
    }
  }
}

export default new TtsController();