#!/usr/bin/env node

/**
 * Test script for STT and TTS functionality
 * Run with: node test-stt-tts.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_JWT = 'your-test-jwt-token-here'; // Replace with actual JWT token

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default(url, {
      headers: {
        'Authorization': `Bearer ${TEST_JWT}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.message || error.error}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
}

// Test TTS functionality
async function testTTS() {
  console.log('\\n🗣️  Testing Text-to-Speech...');
  
  try {
    // Test basic TTS
    const ttsResponse = await makeRequest(`${BASE_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of the text-to-speech functionality. How are you feeling today?',
        options: {
          languageCode: 'en-US',
          voiceName: 'en-US-Journey-D',
          audioEncoding: 'MP3',
          speakingRate: 1.0
        }
      })
    });

    console.log('✅ TTS Success:', {
      fileName: ttsResponse.fileName,
      fileSize: ttsResponse.fileSize,
      downloadUrl: ttsResponse.downloadUrl
    });

    // Test getting available voices
    const voicesResponse = await makeRequest(`${BASE_URL}/api/tts/voices?languageCode=en-US`);
    console.log(`✅ Found ${voicesResponse.voices.length} available voices for en-US`);

    // Test TTS info endpoint
    const infoResponse = await makeRequest(`${BASE_URL}/api/tts/info`);
    console.log(`✅ TTS Info: ${infoResponse.supportedLanguages.length} languages supported`);

  } catch (error) {
    console.error('❌ TTS Test Failed:', error.message);
  }
}

// Test STT functionality
async function testSTT() {
  console.log('\\n🎙️  Testing Speech-to-Text...');
  
  try {
    // Test STT info endpoint first
    const infoResponse = await makeRequest(`${BASE_URL}/api/stt/info`);
    console.log(`✅ STT Info: ${infoResponse.supportedLanguages.length} languages supported`);
    console.log(`   Supported formats: ${infoResponse.supportedFormats.map(f => f.format).join(', ')}`);

    console.log('\\n⚠️  Note: To fully test STT, you need to upload an audio file.');
    console.log('   You can test STT using curl or a client application:');
    console.log(`   curl -X POST -H "Authorization: Bearer ${TEST_JWT}" \\`);
    console.log(`        -F "audio=@your-audio-file.wav" \\`);
    console.log(`        -F "languageCode=en-US" \\`);
    console.log(`        ${BASE_URL}/api/stt`);

  } catch (error) {
    console.error('❌ STT Test Failed:', error.message);
  }
}

// Test health endpoints
async function testHealth() {
  console.log('\\n🏥 Testing Health Endpoints...');
  
  try {
    const mainHealth = await makeRequest(`${BASE_URL}/health`);
    console.log('✅ Main Health:', mainHealth.status);

    const sttHealth = await makeRequest(`${BASE_URL}/api/stt/health`);
    console.log('✅ STT Health:', sttHealth.status);

    const ttsHealth = await makeRequest(`${BASE_URL}/api/tts/health`);
    console.log('✅ TTS Health:', ttsHealth.status);

  } catch (error) {
    console.error('❌ Health Test Failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting STT/TTS API Tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  if (TEST_JWT === 'your-test-jwt-token-here') {
    console.log('⚠️  Warning: Using placeholder JWT token. Replace with actual token for authenticated endpoints.');
  }

  try {
    await testHealth();
    await testTTS();
    await testSTT();
    
    console.log('\\n✨ All tests completed!');
    console.log('\\n📝 Next steps:');
    console.log('1. Set up proper JWT authentication');
    console.log('2. Test with actual audio files for STT');
    console.log('3. Verify Google Cloud credentials are working');
    console.log('4. Check the /outputs directory for generated TTS files');
    
  } catch (error) {
    console.error('\\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testTTS, testSTT, testHealth, runTests };