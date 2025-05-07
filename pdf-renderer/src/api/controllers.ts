import { Request, Response } from 'express';
import { validateDSL } from '../validation/dslValidator';
import { renderDSLToPDF } from '../engine/renderer';
import { convertPDFToImages } from '../engine/images/imageConverter';
import { getAvailableTemplates } from '../engine/templates/templateRenderer';

/*** Health check endpoint*/
export const healthCheck = (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        service: 'pdf-renderer',
        timestamp: new Date().toISOString()
    });
};

/*** Controller for getting available templates*/
export const getTemplates = (_req: Request, res: Response) => {
    const templates = getAvailableTemplates();
    res.status(200).json({
        templates
    });
};

/*** Controller for rendering DSL to PDF*/
export const renderPDF = async (req: Request, res: Response) => {
    try {
        const { dsl } = req.body;

        // Validate DSL
        const validationResult = validateDSL(dsl);
        if (!validationResult.valid) {
            return res.status(400).json({
                error: true,
                message: 'Invalid DSL',
                details: validationResult.errors
            });
        }

        // Render DSL to PDF
        const pdfBuffer = await renderDSLToPDF(dsl);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=rendered-document.pdf');

        // Send PDF buffer
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error rendering PDF:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to render PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/*** Controller for rendering DSL to images*/
export const renderPDFToImages = async (req: Request, res: Response) => {
    try {
        const { dsl, dpi = 300 } = req.body;

        // Validate DSL
        const validationResult = validateDSL(dsl);
        if (!validationResult.valid) {
            return res.status(400).json({
                error: true,
                message: 'Invalid DSL',
                details: validationResult.errors
            });
        }

        // Render DSL to PDF
        const pdfBuffer = await renderDSLToPDF(dsl);

        // Convert PDF to images
        const images = await convertPDFToImages(pdfBuffer, dpi);

        // Send images
        res.json({
            success: true,
            message: 'PDF rendered to images successfully',
            images: images
        });
    } catch (error) {
        console.error('Error rendering PDF to images:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to render PDF to images',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};