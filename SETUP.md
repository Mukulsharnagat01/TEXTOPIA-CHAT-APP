# TEXTOPIA Chat App Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with your Firebase credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OneSignal Configuration (Optional for development)
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
VITE_ONESIGNAL_SAFARI_WEB_ID=your_onesignal_safari_web_id
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Go to Project Settings > General > Your apps
6. Copy the configuration values to your `.env` file

### 4. Firestore Rules

Deploy the `firestore.rules` file to your Firebase project:

```bash
firebase deploy --only firestore:rules
```

Or manually set the rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. OneSignal Setup (Optional)

1. Go to [OneSignal Dashboard](https://app.onesignal.com/)
2. Create a new app
3. Get your App ID and Safari Web ID
4. Add them to your `.env` file

### 6. Run the App

```bash
# Development
npm run dev

# Production build
npm run build
```

## 🔧 Development Notes

- OneSignal is disabled in development mode to avoid tracking prevention issues
- Firebase will work with proper credentials or show helpful error messages
- The app includes mock Firebase objects for development without credentials

## 🚀 Production Deployment

When deploying to production:

1. Set up your Firebase project with proper rules
2. Configure OneSignal for your domain
3. Deploy your app
4. OneSignal will automatically work in production

## 📱 Features

- Real-time chat messaging
- User authentication
- Push notifications (production only)
- Emoji support
- Responsive design
- Offline support

## 🐛 Troubleshooting

### Common Issues:

1. **Firebase permissions error**: Make sure your Firestore rules allow authenticated users
2. **OneSignal tracking prevention**: This is normal in development, will work in production
3. **Authentication issues**: Check your Firebase Auth configuration

### Getting Help:

- Check the browser console for detailed error messages
- Ensure all environment variables are set correctly
- Verify Firebase project configuration
