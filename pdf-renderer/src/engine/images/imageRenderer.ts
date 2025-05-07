import PDFDocument from 'pdfkit';
import { fetchImage } from '../../utils/imageUtils';

/**
 * Renders an image to the PDF document
 */
export const renderImage = async (
    doc: PDFKit.PDFDocument,
    imageData: string | Buffer,
    position: { x: number, y: number },
    style: any = {}
): Promise<void> => {
    try {
        // Process image data (could be URL, base64, or buffer)
        const imageBuffer = await fetchImage(imageData);

        // Calculate image dimensions
        const width = style?.width || undefined;
        const height = style?.height || undefined;

        // Render image
        doc.image(imageBuffer, position.x, position.y, {
            width,
            height,
            fit: [width || 300, height || 200],
            align: style?.align || 'center',
            valign: style?.valign || 'center'
        });
    } catch (error) {
        console.error('Error rendering image:', error);
        // Render placeholder for failed image
        doc.rect(position.x, position.y, 100, 100)
            .stroke()
            .fontSize(12)
            .text('Image Error', position.x + 20, position.y + 40);
    }
};