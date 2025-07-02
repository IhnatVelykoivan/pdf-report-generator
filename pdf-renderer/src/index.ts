import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { apiRouter } from './api/routes';
import claudeRouter from './routes/claude';


const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', apiRouter);
app.use('/api/claude', claudeRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: true,
        message: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`PDF Renderer Service running on port ${PORT}`);
});
// Расширенная настройка CORS
const corsOptions = {
    origin: [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:5174',  // Альтернативный порт Vite
        'http://localhost:3000',  // Возможный другой порт
        'http://127.0.0.1:5173',  // IP адрес
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Content-Disposition']
};

app.use(cors(corsOptions));

// Добавьте middleware для логирования всех запросов
app.use((req, res, next) => {
    console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST') {
        console.log('📦 Body:', JSON.stringify(req.body, null, 2).substring(0, 200));
    }
    next();
});

export default app;