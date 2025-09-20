import admin from 'firebase-admin';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Firebase Admin for diary database
let dbDiary;

try {
  // Use service account key file
  const serviceAccountPath = path.join(__dirname, '../../config/serviceAccountKey.json');
  
  console.log('Initializing Firebase Diary App...');
  console.log('Service Account Path:', serviceAccountPath);
  
  // Try to get existing app or create new one
  const diaryApp = admin.apps.find(app => app.name === 'diaryApp') || 
                   admin.initializeApp({
                     credential: admin.credential.cert(serviceAccountPath),
                     projectId: "leafy-grammar-469906-p6"
                   }, 'diaryApp');
  
  console.log('Diary app initialized successfully');
  
  // Get Firestore instance for specific database
  dbDiary = diaryApp.firestore();
  dbDiary.settings({ 
    databaseId: 'diaryentry',
    ignoreUndefinedProperties: true
  });
  
  console.log('Diary database configured with ID: diaryentry');
  
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  console.error('Make sure serviceAccountKey.json exists in config directory');
}

console.log('dbDiary initialized:', !!dbDiary);

export { dbDiary };
export default dbDiary;