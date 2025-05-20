import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { apiRouter } from './api/routes';

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', apiRouter);

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

export default app;