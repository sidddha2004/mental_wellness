import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import util from 'util';

class SttService {
  constructor() {
    this.speechClient = new SpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  /**
   * Convert audio file to text using Google Cloud Speech-to-Text
   * @param {string} audioFilePath - Path to the audio file
   * @param {object} options - Configuration options for speech recognition
   * @returns {Promise<string>} - The transcribed text
   */
  async transcribeAudio(audioFilePath, options = {}) {
    try {
      // Read the audio file
      const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

      // Configure the speech recognition request
      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: options.encoding || 'WEBM_OPUS', // Default to WEBM_OPUS, but can be overridden
          sampleRateHertz: options.sampleRateHertz || 48000,
          languageCode: options.languageCode || 'en-US',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: options.enableWordTimeOffsets || false,
          model: options.model || 'latest_long', // Use latest_long model for better accuracy
          useEnhanced: true,
        },
      };

      // Detect file format and adjust encoding accordingly
      const fileExtension = audioFilePath.split('.').pop().toLowerCase();
      switch (fileExtension) {
        case 'wav':
          request.config.encoding = 'LINEAR16';
          request.config.sampleRateHertz = options.sampleRateHertz || 16000;
          break;
        case 'flac':
          request.config.encoding = 'FLAC';
          break;
        case 'mp3':
          request.config.encoding = 'MP3';
          break;
        case 'webm':
          request.config.encoding = 'WEBM_OPUS';
          break;
        default:
          // Keep default settings
          break;
      }

      console.log('Transcribing audio with config:', {
        encoding: request.config.encoding,
        sampleRateHertz: request.config.sampleRateHertz,
        languageCode: request.config.languageCode
      });

      // Perform the speech recognition request
      const [response] = await this.speechClient.recognize(request);
      
      if (!response.results || response.results.length === 0) {
        throw new Error('No transcription results found');
      }

      // Extract the transcript from the response
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join(' ');

      console.log('Transcription completed successfully');
      return transcription;

    } catch (error) {
      console.error('Error in speech-to-text transcription:', error);
      throw new Error(`Speech-to-text transcription failed: ${error.message}`);
    }
  }

  /**
   * Convert audio file to text with streaming (for longer audio files)
   * @param {string} audioFilePath - Path to the audio file
   * @param {object} options - Configuration options
   * @returns {Promise<string>} - The transcribed text
   */
  async transcribeAudioStream(audioFilePath, options = {}) {
    try {
      const request = {
        config: {
          encoding: options.encoding || 'LINEAR16',
          sampleRateHertz: options.sampleRateHertz || 16000,
          languageCode: options.languageCode || 'en-US',
          enableAutomaticPunctuation: true,
        },
      };

      // Create a recognize stream
      const recognizeStream = this.speechClient
        .streamingRecognize(request)
        .on('error', (error) => {
          throw error;
        });

      let transcription = '';

      return new Promise((resolve, reject) => {
        recognizeStream.on('data', (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            transcription += data.results[0].alternatives[0].transcript;
          }
        });

        recognizeStream.on('end', () => {
          resolve(transcription);
        });

        recognizeStream.on('error', (error) => {
          reject(error);
        });

        // Stream the audio file
        fs.createReadStream(audioFilePath).pipe(recognizeStream);
      });

    } catch (error) {
      console.error('Error in streaming speech-to-text transcription:', error);
      throw new Error(`Streaming speech-to-text transcription failed: ${error.message}`);
    }
  }
}

export default new SttService();