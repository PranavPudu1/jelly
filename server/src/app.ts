/**
 * Express App Configuration
 * Sets up middleware, routes, and error handling
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/env.config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.use(
        cors({
            origin: config.CORS_ORIGIN,
            credentials: true,
        })
    );

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    app.use(compression());

    // Request logging in development
    if (config.NODE_ENV === 'development') {
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
    }

    // API routes
    app.use('/api', routes);

    // Root endpoint
    app.get('/', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome to Jelly API',
            version: '1.0.0',
            documentation: '/api/health',
        });
    });

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    return app;
};
