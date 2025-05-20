import PDFDocument from 'pdfkit';
import { fetchImage } from '../../utils/imageUtils';

/*** Renders an image to the PDF document*/

export const renderImage = async (
    doc: PDFKit.PDFDocument,
    imageData: string | Buffer,
    position: { x: number, y: number },
    style: any = {}
): Promise<void> => {
    try {
        // Save state before rendering image
        doc.save();

        // Process image data (could be URL, base64, or buffer)
        const imageBuffer = await fetchImage(imageData);

        // Calculate image dimensions
        const width = style?.width || undefined;
        const height = style?.height || undefined;

        // Set up fit options based on specified dimensions
        let fit: [number, number] | undefined;
        if (width || height) {
            fit = [width || 300, height || 200];
        }

        // Render image with improved options
        doc.image(imageBuffer, position.x, position.y, {
            width,
            height,
            fit,
            align: style?.align || 'center',
            valign: style?.valign || 'center'
        });

        // Restore state after rendering
        doc.restore();
    } catch (error) {
        console.error('Error rendering image:', error);
        // Render placeholder for failed image with clear formatting
        doc.save()
            .rect(position.x, position.y, 100, 100)
            .lineWidth(1)
            .stroke()
            .fontSize(12)
            .fillColor('#FF0000')
            .text('Image Error', position.x + 20, position.y + 40)
            .restore();
    }
};