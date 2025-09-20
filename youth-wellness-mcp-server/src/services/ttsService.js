import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import util from 'util';

class TtsService {
  constructor() {
    this.client = new TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    this.outputDir = path.join(process.cwd(), 'outputs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async synthesizeSpeech(text, options = {}) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const request = {
      input: { text },
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

    const [response] = await this.client.synthesizeSpeech(request);
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS service');
    }

    const timestamp = Date.now();
    const ext = options.audioEncoding === 'WAV' ? 'wav' : 'mp3';
    const filename = `tts_${timestamp}.${ext}`;
    const filepath = path.join(this.outputDir, filename);
    await util.promisify(fs.writeFile)(filepath, response.audioContent, 'binary');

    return {
      success: true,
      fileName: filename,
      filePath: filepath,
      audioData: response.audioContent,
      contentType: options.audioEncoding === 'WAV' ? 'audio/wav' : 'audio/mpeg',
      size: response.audioContent.length,
    };
  }

  async synthesizeSSML(ssml, options = {}) {
    if (!ssml || ssml.trim().length === 0) throw new Error('SSML cannot be empty');

    const request = {
      input: { ssml },
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

    const [response] = await this.client.synthesizeSpeech(request);
    if (!response.audioContent) {
      throw new Error('No audio content received from TTS service');
    }

    const timestamp = Date.now();
    const ext = options.audioEncoding === 'WAV' ? 'wav' : 'mp3';
    const filename = `tts_ssml_${timestamp}.${ext}`;
    const filepath = path.join(this.outputDir, filename);
    await util.promisify(fs.writeFile)(filepath, response.audioContent, 'binary');

    return {
      success: true,
      fileName: filename,
      filePath: filepath,
      audioData: response.audioContent,
      contentType: options.audioEncoding === 'WAV' ? 'audio/wav' : 'audio/mpeg',
      size: response.audioContent.length,
    };
  }

  async getAvailableVoices(languageCode) {
    const [response] = await this.client.listVoices({ languageCode });
    return response.voices.map(voice => ({
      name: voice.name,
      ssmlGender: voice.ssmlGender,
      naturalSampleRateHertz: voice.naturalSampleRateHertz,
      languageCodes: voice.languageCodes,
    }));
  }

  async cleanupOldFiles(maxAgeHours = 24) {
    const files = await util.promisify(fs.readdir)(this.outputDir);
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(this.outputDir, file);
      const stats = await util.promisify(fs.stat)(filePath);
      if (now - stats.mtime.getTime() > maxAgeMs) {
        await util.promisify(fs.unlink)(filePath);
        console.log(`Deleted old file: ${file}`);
      }
    }
  }
}

export default new TtsService();
