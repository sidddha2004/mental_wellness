# Speech-to-Text and Text-to-Speech API Documentation

## Overview

The Youth Wellness MCP Server now supports Speech-to-Text (STT) and Text-to-Speech (TTS) functionality using Google Cloud Speech and Text-to-Speech APIs.

## Features

### Speech-to-Text (STT)
- Convert audio files to text
- Support for multiple audio formats: WAV, FLAC, MP3, WebM, OGG
- Multiple language support
- Streaming transcription for longer audio files
- Configurable recognition models and parameters

### Text-to-Speech (TTS)
- Convert text to natural-sounding speech
- Multiple voice options and languages
- SSML (Speech Synthesis Markup Language) support
- Multiple audio output formats: MP3, WAV, OGG
- Adjustable speech parameters (rate, pitch, volume)

## Prerequisites

1. **Google Cloud Project** with Speech-to-Text and Text-to-Speech APIs enabled
2. **Service Account Key** or Application Default Credentials configured
3. **Environment Variables** set up in `.env` file:
   ```env
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   # Note: JWT_SECRET removed - now using Firebase Auth
   ```

## API Endpoints

### Speech-to-Text Endpoints

#### `POST /api/stt`
Convert uploaded audio file to text.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Headers: `Authorization: Bearer <jwt-token>`
- Form Data:
  - `audio`: Audio file (required) - Max 25MB
  - `languageCode`: Language code (optional) - Default: 'en-US'
  - `enableWordTimeOffsets`: Boolean (optional) - Default: false
  - `sampleRateHertz`: Integer (optional)
  - `model`: Recognition model (optional) - Default: 'latest_long'

**Response:**
```json
{
  "success": true,
  "transcription": "Hello, this is the transcribed text from your audio file.",
  "fileName": "original-filename.wav",
  "fileSize": 1024000,
  "options": {
    "languageCode": "en-US",
    "enableWordTimeOffsets": false,
    "model": "latest_long"
  },
  "timestamp": "2025-09-13T10:30:00.000Z"
}
```

#### `POST /api/stt/stream`
Convert uploaded audio file to text using streaming (for longer files).

**Request:** Same as `/api/stt` but optimized for longer audio files.

#### `GET /api/stt/info`
Get STT capabilities and supported options.

**Response:**
```json
{
  "success": true,
  "supportedLanguages": ["en-US", "en-GB", "es-ES", ...],
  "supportedFormats": [
    {
      "format": "WAV",
      "encoding": "LINEAR16",
      "description": "Uncompressed PCM audio"
    }
  ],
  "availableModels": [...],
  "maxFileSizeMB": 25
}
```

#### `GET /api/stt/health`
Health check for STT service.

### Text-to-Speech Endpoints

#### `POST /api/tts`
Convert text to speech.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Headers: `Authorization: Bearer <jwt-token>`
- Body:
```json
{
  "text": "Hello, this text will be converted to speech.",
  "options": {
    "languageCode": "en-US",
    "voiceName": "en-US-Journey-D",
    "audioEncoding": "MP3",
    "speakingRate": 1.0,
    "pitch": 0.0,
    "volumeGainDb": 0.0
  }
}
```

**Response:**
```json
{
  "success": true,
  "fileName": "tts_1694608200000.mp3",
  "fileSize": 51200,
  "contentType": "audio/mpeg",
  "downloadUrl": "/api/tts/download/tts_1694608200000.mp3",
  "textLength": 45,
  "timestamp": "2025-09-13T10:30:00.000Z"
}
```

#### `POST /api/tts/ssml`
Convert SSML to speech.

**Request:**
```json
{
  "ssml": "<speak>Hello <break time='1s'/> this is <emphasis level='strong'>SSML</emphasis> text.</speak>",
  "options": { ... }
}
```

#### `GET /api/tts/download/:fileName`
Download generated audio file.

#### `GET /api/tts/stream/:fileName`
Stream generated audio file (for direct playback).

#### `GET /api/tts/voices?languageCode=en-US`
Get available voices for a language.

#### `GET /api/tts/info`
Get TTS capabilities and supported options.

#### `POST /api/tts/cleanup`
Clean up old audio files (admin endpoint).

**Request:**
```json
{
  "maxAgeHours": 24
}
```

## Usage Examples

### cURL Examples

#### STT Example:
```bash
curl -X POST \\
  -H "Authorization: Bearer your-jwt-token" \\
  -F "audio=@sample-audio.wav" \\
  -F "languageCode=en-US" \\
  http://localhost:8080/api/stt
```

#### TTS Example:
```bash
curl -X POST \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello, how are you feeling today?", "options": {"voiceName": "en-US-Journey-D"}}' \\
  http://localhost:8080/api/tts
```

### JavaScript Client Example:

```javascript
// STT Example
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('languageCode', 'en-US');

const sttResponse = await fetch('/api/stt', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const sttResult = await sttResponse.json();
console.log('Transcription:', sttResult.transcription);

// TTS Example
const ttsResponse = await fetch('/api/tts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hello, this is a test message.',
    options: {
      languageCode: 'en-US',
      voiceName: 'en-US-Journey-D'
    }
  })
});

const ttsResult = await ttsResponse.json();
// Play or download the audio file
const audioUrl = ttsResult.downloadUrl;
```

## Configuration

### Supported Audio Formats

#### STT Input Formats:
- WAV (LINEAR16, 16kHz recommended)
- FLAC (16kHz recommended)
- MP3 (16kHz recommended)
- WebM with Opus codec (48kHz)
- OGG Vorbis

#### TTS Output Formats:
- MP3 (default, 24kHz)
- WAV (LINEAR16)
- OGG Opus

### Supported Languages (partial list):
- English: en-US, en-GB, en-AU, en-CA, en-IN
- Spanish: es-ES, es-US, es-MX
- French: fr-FR, fr-CA
- German: de-DE
- Italian: it-IT
- Portuguese: pt-BR, pt-PT
- Japanese: ja-JP
- Korean: ko-KR
- Chinese: zh-CN, zh-TW
- Hindi: hi-IN
- Arabic: ar-XA
- Russian: ru-RU
- Turkish: tr-TR

## File Management

- **Upload Directory**: `/uploads` (temporary files, auto-cleaned)
- **Output Directory**: `/outputs` (generated TTS files)
- **File Cleanup**: Old TTS files are automatically cleaned up (configurable)
- **File Size Limits**: 
  - STT: 25MB max
  - TTS: 5000 characters max

## Authentication

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header, except:
- `/api/tts/download/:fileName` (direct file access)
- `/api/tts/stream/:fileName` (direct streaming)
- Health check endpoints

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2025-09-13T10:30:00.000Z"
}
```

Common HTTP status codes:
- `400`: Bad Request (invalid input, file too large, etc.)
- `401`: Unauthorized (missing or invalid JWT)
- `404`: Not Found (file not found)
- `500`: Internal Server Error (service errors)

## Testing

Run the included test script to verify functionality:

```bash
node test-stt-tts.js
```

Make sure to:
1. Start the server: `npm start`
2. Set up proper JWT token in the test script
3. Ensure Google Cloud credentials are configured
4. Test with actual audio files for STT

## Monitoring and Logs

The service logs important events:
- File uploads and processing
- Transcription and synthesis operations
- Error conditions
- File cleanup operations

Monitor the console output and implement proper logging as needed for production use.

## Security Considerations

1. **File Upload Security**: Only audio files are accepted, with size limits
2. **JWT Authentication**: All sensitive endpoints are protected
3. **Temporary File Cleanup**: Uploaded files are automatically deleted after processing
4. **CORS Configuration**: Properly configured for your frontend domains
5. **Rate Limiting**: Consider implementing rate limiting for production use

## Production Recommendations

1. **Load Balancing**: Use load balancer for multiple instances
2. **File Storage**: Consider using cloud storage for audio files
3. **Caching**: Implement caching for frequently requested voice lists
4. **Monitoring**: Set up proper monitoring and alerting
5. **Backup**: Regular backup of configuration and important data
6. **SSL/TLS**: Use HTTPS in production
7. **Rate Limiting**: Implement API rate limiting
8. **Resource Limits**: Monitor CPU, memory, and storage usage