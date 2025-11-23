// Test Firestore Connection
// Run this in browser console to diagnose Firestore issues

import { db, auth } from './src/services/auth/firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';

console.log('=== Firestore Connection Test ===');
console.log('Auth current user:', auth.currentUser);
console.log('Firestore instance:', db);

if (!auth.currentUser) {
    console.warn('⚠️ No user authenticated. Please login first.');
} else {
    console.log('✅ User authenticated:', auth.currentUser.uid);

    // Try to read a document
    const testRef = doc(db, 'users', auth.currentUser.uid, 'data', 'profile');

    getDoc(testRef)
        .then((snap) => {
            if (snap.exists()) {
                console.log('✅ Successfully read from Firestore:', snap.data());
            } else {
                console.log('ℹ️ Document does not exist yet (this is normal for new users)');
            }
        })
        .catch((error) => {
            console.error('❌ Firestore Error:', {
                code: error.code,
                message: error.message,
                details: error
            });

            if (error.code === 'permission-denied') {
                console.error('🔒 PERMISSION DENIED - Check Firestore Security Rules!');
                console.log('Current rules should allow authenticated users to read/write their own data.');
                console.log('Suggested rules:');
                console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
                `);
            }
        });
}
