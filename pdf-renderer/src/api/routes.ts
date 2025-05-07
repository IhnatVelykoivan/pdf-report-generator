import express from 'express';
import { renderPDF, renderPDFToImages, healthCheck, getTemplates } from './controllers';

const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', healthCheck);

// Get available templates
apiRouter.get('/templates', getTemplates);

// Route to render DSL to PDF
apiRouter.post('/render', renderPDF);

// Route to render DSL to images
apiRouter.post('/render-images', renderPDFToImages);

export { apiRouter };