import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import util from 'util';

class TtsService {
  constructor() {
    this.ttsClient = new TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    // Ensure outputs directory exists
    this.outputDir = path.join(process.cwd(), 'outputs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Convert text to speech using Google Cloud Text-to-Speech
   * @param {string} text - Text to convert to speech
   * @param {object} options - Configuration options for text-to-speech
   * @returns {Promise<object>} - Object containing file path and audio data
   */
  async synthesizeSpeech(text, options = {}) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      // Configure the text-to-speech request
      const request = {
        input: { text: text },
        voice: {
          languageCode: options.languageCode || 'en-US',
          name: options.voiceName || 'en-US-Journey-D', // High-quality voice
          ssmlGender: options.ssmlGender || 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: options.audioEncoding || 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volumeGainDb || 0.0,
          sampleRateHertz: options.sampleRateHertz || 24000,
        },
      };

      console.log('Synthesizing speech with config:', {
        languageCode: request.voice.languageCode,
        voiceName: request.voice.name,
        audioEncoding: request.audioConfig.audioEncoding,
        speakingRate: request.audioConfig.speakingRate
      });

      // Perform the text-to-speech request
      const [response] = await this.ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = options.audioEncoding === 'WAV' ? 'wav' : 'mp3';
      const fileName = `tts_${timestamp}.${fileExtension}`;
      const filePath = path.join(this.outputDir, fileName);

      // Save the audio content to a file
      await util.promisify(fs.writeFile)(filePath, response.audioContent, 'binary');

      console.log('TTS audio file saved successfully:', fileName);

      return {
        success: true,
        fileName: fileName,
        filePath: filePath,
        audioData: response.audioContent,
        contentType: options.audioEncoding === 'WAV' ? 'audio/wav' : 'audio/mpeg',
        size: response.audioContent.length
      };

    } catch (error) {
      console.error('Error in text-to-speech synthesis:', error);
      throw new Error(`Text-to-speech synthesis failed: ${error.message}`);
    }
  }

  /**
   * Convert SSML text to speech using Google Cloud Text-to-Speech
   * @param {string} ssml - SSML text to convert to speech
   * @param {object} options - Configuration options for text-to-speech
   * @returns {Promise<object>} - Object containing file path and audio data
   */
  async synthesizeSSML(ssml, options = {}) {
    try {
      if (!ssml || ssml.trim().length === 0) {
        throw new Error('SSML cannot be empty');
      }

      // Configure the text-to-speech request with SSML
      const request = {
        input: { ssml: ssml },
        voice: {
          languageCode: options.languageCode || 'en-US',
          name: options.voiceName || 'en-US-Journey-D',
          ssmlGender: options.ssmlGender || 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: options.audioEncoding || 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volumeGainDb || 0.0,
          sampleRateHertz: options.sampleRateHertz || 24000,
        },
      };

      console.log('Synthesizing SSML speech');

      // Perform the text-to-speech request
      const [response] = await this.ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExtension = options.audioEncoding === 'WAV' ? 'wav' : 'mp3';
      const fileName = `tts_ssml_${timestamp}.${fileExtension}`;
      const filePath = path.join(this.outputDir, fileName);

      // Save the audio content to a file
      await util.promisify(fs.writeFile)(filePath, response.audioContent, 'binary');

      console.log('TTS SSML audio file saved successfully:', fileName);

      return {
        success: true,
        fileName: fileName,
        filePath: filePath,
        audioData: response.audioContent,
        contentType: options.audioEncoding === 'WAV' ? 'audio/wav' : 'audio/mpeg',
        size: response.audioContent.length
      };

    } catch (error) {
      console.error('Error in SSML text-to-speech synthesis:', error);
      throw new Error(`SSML text-to-speech synthesis failed: ${error.message}`);
    }
  }

  /**
   * Get list of available voices for a specific language
   * @param {string} languageCode - Language code (e.g., 'en-US', 'es-ES')
   * @returns {Promise<Array>} - Array of available voices
   */
  async getAvailableVoices(languageCode = 'en-US') {
    try {
      const [response] = await this.ttsClient.listVoices({ languageCode });
      return response.voices.map(voice => ({
        name: voice.name,
        ssmlGender: voice.ssmlGender,
        naturalSampleRateHertz: voice.naturalSampleRateHertz,
        languageCodes: voice.languageCodes
      }));
    } catch (error) {
      console.error('Error getting available voices:', error);
      throw new Error(`Failed to get available voices: ${error.message}`);
    }
  }

  /**
   * Clean up old audio files from the outputs directory
   * @param {number} maxAgeHours - Maximum age of files in hours (default: 24)
   */
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = await util.promisify(fs.readdir)(this.outputDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds

      for (const file of files) {
        const filePath = path.join(this.outputDir, file);
        const stats = await util.promisify(fs.stat)(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await util.promisify(fs.unlink)(filePath);
          console.log(`Cleaned up old TTS file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
}

export default new TtsService();