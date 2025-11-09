/**
 * Firebase Admin SDK Configuration
 * Initializes Firestore connection
 */

import admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

let db: admin.firestore.Firestore;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = (): admin.firestore.Firestore => {
    if (db) {
        return db;
    }

    try {
    // Option 1: Using service account key file (recommended for production)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        // Option 2: Using environment variables (for development/testing)
        else if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }
        // Option 3: Default credentials (for local emulator or cloud environment)
        else {
            console.warn('⚠️  No Firebase credentials found. Using application default credentials.');
            admin.initializeApp();
        }

        db = admin.firestore();

        // Configure Firestore settings
        db.settings({
            ignoreUndefinedProperties: true,
        });

        console.log('✅ Firebase initialized successfully');
        return db;
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        throw new Error('Firebase initialization failed');
    }
};

/**
 * Get Firestore instance
 */
export const getFirestore = (): admin.firestore.Firestore => {
    if (!db) {
        return initializeFirebase();
    }
    return db;
};

/**
 * Collection names constants
 */
export const COLLECTIONS = {
    RESTAURANTS: 'restaurants',
    USER_SWIPES: 'userSwipes',
    USERS: 'users',
} as const;
