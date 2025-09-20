# Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enter your project name (e.g., "zenith")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click "Enable" and save
   - **Google**: Click "Enable", add your authorized domain, and save

## Step 3: Get Firebase Configuration

1. Click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "zenith-web")
6. Copy the Firebase configuration object

## Step 4: Set Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Under "Authorized domains", add:
   - `localhost` (for development)
   - Your production domain (when deployed)

## Step 6: Test Authentication

1. Run your development server: `npm run dev`
2. Navigate to `/auth`
3. Try creating an account and signing in
4. Check Firebase Console > Authentication > Users to see created accounts

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console

2. **"Firebase: Error (auth/invalid-api-key)"**
   - Check your environment variables are correctly set
   - Ensure `.env.local` is in your project root

3. **"Firebase: Error (auth/operation-not-allowed)"**
   - Enable the authentication method in Firebase Console

### Development with Emulators:

If you want to use Firebase emulators for development:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init emulators`
4. Start emulators: `firebase emulators:start`

The app is already configured to connect to emulators in development mode.

## Security Rules

For production, consider setting up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

After setting up authentication, you can:
1. Add user profile management
2. Implement role-based access control
3. Add social login providers (Facebook, Twitter, etc.)
4. Set up password reset functionality
5. Add email verification
