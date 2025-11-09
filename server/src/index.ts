/**
 * Server Entry Point
 * Initializes Firebase and starts Express server
 */

import { createApp } from './app';
import { initializeFirebase } from './config/firebase.config';
import { config, validateEnv } from './config/env.config';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
    try {
    // Validate environment variables
        validateEnv();

        // Initialize Firebase
        initializeFirebase();

        // Create Express app
        const app = createApp();

        // Start listening
        const PORT = config.PORT;
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Jelly API Server`);
            console.log(`📍 Environment: ${config.NODE_ENV}`);
            console.log(`🌐 Server running on: http://localhost:${PORT}`);
            console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
            console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
            console.log('='.repeat(50));
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();
