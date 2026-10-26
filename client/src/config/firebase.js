/**
 * FutureSelector — Firebase Authentication Configuration
 * 
 * Google Firebase provides:
 * 1. 10,000 Free Phone OTP authentications every month (Zero SMS cost)
 * 2. 100% Free Google 1-Click Sign-In
 * 
 * To connect your production Firebase project:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (e.g. "FutureSelector")
 * 3. In "Build" -> "Authentication", enable:
 *    - Google Provider (Free)
 *    - Phone Provider (Free 10k/month quota)
 * 4. Paste your web config below in firebaseConfig
 */

export const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_FREE_FIREBASE_KEY_FUTURE_SELECTOR",
  authDomain: "future-selector.firebaseapp.com",
  projectId: "future-selector",
  storageBucket: "future-selector.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abcdef123456"
};

// Mode configuration
export const AUTH_MODE = {
  USE_FIREBASE_LIVE: false, // Set to true once Firebase SDK is initialized with live keys
  DEMO_OTP: "2026",         // Free instant verification code for testing & presentations
  MONTHLY_FREE_QUOTA: 10000
};
