import PDFDocument from 'pdfkit';
import { fetchImage } from '../../utils/imageUtils';
import { convertColorToHex } from '../../utils/colorUtils';

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
        const placeholderWidth = style?.width || 100;
        const placeholderHeight = style?.height || 100;

        // Define placeholder colors
        const borderColor = convertColorToHex('#CCCCCC');
        const backgroundColor = convertColorToHex('#F5F5F5');
        const textColor = convertColorToHex('#FF0000');

        doc.save()
            // Draw placeholder background
            .fillColor(backgroundColor)
            .rect(position.x, position.y, placeholderWidth, placeholderHeight)
            .fill()
            // Draw border
            .strokeColor(borderColor)
            .lineWidth(1)
            .rect(position.x, position.y, placeholderWidth, placeholderHeight)
            .stroke()
            // Add error text
            .fontSize(12)
            .fillColor(textColor)
            .text('Image Error',
                position.x + placeholderWidth / 2 - 30,
                position.y + placeholderHeight / 2 - 6,
                {
                    width: placeholderWidth - 10,
                    align: 'center'
                })
            .restore();
    }
};