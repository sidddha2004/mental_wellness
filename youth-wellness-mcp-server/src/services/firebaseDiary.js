import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from "dotenv";

dotenv.config();

// Firebase configuration for the diary database
// Replace these values with your actual diary database config from Firebase console
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-diary-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase app for diary database with a specific name
const diaryApp = initializeApp(firebaseConfig, 'diaryApp');

// Initialize Firestore for diary database
const dbDiary = getFirestore(diaryApp);

export { dbDiary };
export default dbDiary;