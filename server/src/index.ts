import { createApp } from './app';
import { config, validateEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
    try {
        // Validate environment variables
        validateEnv();

        // Connect to database
        await connectDatabase();

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
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await disconnectDatabase();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await disconnectDatabase();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await disconnectDatabase();
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await disconnectDatabase();
    process.exit(1);
});

// Start the server
startServer();
