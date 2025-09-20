import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';

class SttService {
  constructor() {
    this.speechClient = new SpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  /**
   * Convert a full audio file to text (batch recognition)
   */
  async transcribeAudio(audioFilePath, options = {}) {
    try {
      const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

      const request = {
        audio: { content: audioBytes },
        config: {
          encoding: options.encoding || 'WEBM_OPUS',
          sampleRateHertz: options.sampleRateHertz || 48000,
          languageCode: options.languageCode || 'en-US',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: options.enableWordTimeOffsets || false,
          model: options.model || 'latest_long',
          useEnhanced: true,
        },
      };

      // auto-detect format from extension
      const ext = audioFilePath.split('.').pop().toLowerCase();
      if (ext === 'wav') {
        request.config.encoding = 'LINEAR16';
        request.config.sampleRateHertz = options.sampleRateHertz || 16000;
      } else if (ext === 'flac') {
        request.config.encoding = 'FLAC';
      } else if (ext === 'mp3') {
        request.config.encoding = 'MP3';
      } else if (ext === 'webm') {
        request.config.encoding = 'WEBM_OPUS';
      }

      console.log('📝 Transcribing audio with config:', {
        encoding: request.config.encoding,
        sampleRateHertz: request.config.sampleRateHertz,
        languageCode: request.config.languageCode
      });

      const [response] = await this.speechClient.recognize(request);

      if (!response.results || response.results.length === 0) {
        throw new Error('No transcription results found');
      }

      return response.results.map(r => r.alternatives[0].transcript).join(' ');

    } catch (error) {
      console.error('❌ Error in speech-to-text transcription:', error);
      throw new Error(`Speech-to-text transcription failed: ${error.message}`);
    }
  }

  /**
   * File-based streaming transcription (not real-time mic, just large files)
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

      const recognizeStream = this.speechClient.streamingRecognize(request);

      let transcription = '';

      return new Promise((resolve, reject) => {
        recognizeStream.on('data', (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            transcription += data.results[0].alternatives[0].transcript;
          }
        });

        recognizeStream.on('end', () => resolve(transcription));
        recognizeStream.on('error', reject);

        fs.createReadStream(audioFilePath).pipe(recognizeStream);
      });

    } catch (error) {
      console.error('❌ Error in streaming speech-to-text transcription:', error);
      throw new Error(`Streaming speech-to-text transcription failed: ${error.message}`);
    }
  }

  /**
   * 🔴 Live streaming recognition for WebSockets
   * Creates a bidirectional stream you can feed mic chunks into.
   */
  createStreamingRecognize(options = {}) {
    const request = {
      config: {
        encoding: options.encoding || 'WEBM_OPUS',   // matches MediaRecorder
        sampleRateHertz: options.sampleRateHertz || 48000,
        languageCode: options.languageCode || 'en-US',
        enableAutomaticPunctuation: true,
        model: options.model || 'latest_long',
      },
      interimResults: true
    };

    console.log("🎤 Starting live streaming recognition with config:", request.config);

    return this.speechClient.streamingRecognize(request);
  }
}

export default new SttService();
