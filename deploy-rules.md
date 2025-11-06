# How to Deploy Firestore Rules

## Option 1: Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project (should match `VITE_FIREBASE_PROJECT_ID`)

2. **Navigate to Firestore Rules**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Update the Rules**
   - Replace the existing rules with the content from `firestore.rules`
   - Click "Publish" button

4. **Verify Deployment**
   - You should see a success message
   - The rules should show as "Published"

## Option 2: Firebase CLI

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init firestore
   ```

4. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Troubleshooting

### If you get permission errors:

1. **Check your project ID**
   - Make sure `VITE_FIREBASE_PROJECT_ID` in your `.env` file matches the project in Firebase Console

2. **Check authentication**
   - Make sure you're signed in to the app
   - Check the debug panel in the top-right corner

3. **Try ultra-permissive rules temporarily**
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

4. **Check authorized domains**
   - Go to Firebase Console → Authentication → Settings
   - Make sure `localhost` is in the authorized domains list

### Common Issues:

- **Wrong project**: Make sure you're editing rules for the correct Firebase project
- **Not authenticated**: Make sure you're signed in to the app
- **Rules not published**: Make sure you clicked "Publish" after updating rules
- **Demo credentials**: Make sure you're using real Firebase credentials, not demo ones
