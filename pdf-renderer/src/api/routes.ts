import express from 'express';
import { renderPDF, renderPDFToImages, healthCheck, getTemplates } from './controllers';
import { dslAutoFixerMiddleware } from '../middleware/dslAutoFixer';

const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', healthCheck);

// Get available templates
apiRouter.get('/templates', getTemplates);

// Route to render DSL to PDF - С АВТОМАТИЧЕСКИМ ИСПРАВЛЕНИЕМ DSL
apiRouter.post('/render',
    dslAutoFixerMiddleware,  // 🔧 КРИТИЧЕСКИ ВАЖНО: Автоматически исправляет DSL перед обработкой
    renderPDF
);

// Route to render DSL to images - С АВТОМАТИЧЕСКИМ ИСПРАВЛЕНИЕМ DSL
apiRouter.post('/render-images',
    dslAutoFixerMiddleware,  // 🔧 КРИТИЧЕСКИ ВАЖНО: Автоматически исправляет DSL перед обработкой
    renderPDFToImages
);

export { apiRouter };