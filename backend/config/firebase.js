const admin = require('firebase-admin');

let firebaseInitialized = false;

const initFirebase = () => {
  if (firebaseInitialized) return;

  try {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_CLIENT_EMAIL !== 'your-firebase-client-email' &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PRIVATE_KEY !== 'your-firebase-private-key' &&
      process.env.FIREBASE_PROJECT_ID !== 'your-firebase-project-id'
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️  Firebase credentials not set — auth will use dev mode');
    }
  } catch (err) {
    console.error('Firebase init error:', err.message);
  }
};

initFirebase();

module.exports = admin;
