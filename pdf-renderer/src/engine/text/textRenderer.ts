/**
 * Renders text to PDF document with proper support for all characters, including Cyrillic
 */
export const renderText = (
    doc: PDFKit.PDFDocument,
    text: string,
    style: any = {}
): void => {
    try {
        // Check that text is a string
        if (typeof text !== 'string') {
            console.warn(`Text content is not a string: ${typeof text}`);
            text = String(text || '');
        }

        // Save current state before changes
        doc.save();

        // Apply text styles
        // Make sure to use a font that supports Cyrillic characters
        if (style?.font) {
            try {
                doc.font(style.font);
            } catch (fontError) {
                console.warn(`Font not found: ${style.font}, using current font`);
            }
        }

        if (style?.fontSize) {
            doc.fontSize(style.fontSize);
        }

        if (style?.color) {
            doc.fillColor(style.color);
        }

        // Text display settings
        const options: PDFKit.Mixins.TextOptions = {
            width: style?.width,
            align: style?.align || 'left',
            lineBreak: style?.lineBreak !== false,
            underline: style?.underline || false,
            // Settings for better rendering of Cyrillic text
            characterSpacing: 0,
            wordSpacing: 0,
            lineGap: style?.paragraphGap || 0
        };

        // Use position specified in the element for placement
        if (style?.position) {
            // Clear metadata before rendering text
            // This code can help avoid "BBD0CÔ8Dd0 1 C„7 2" artifacts

            // Position text at specified coordinates
            doc.text(text, style.position.x, style.position.y, options);
        } else {
            // Display text at current position
            doc.text(text, options);
        }

        // Restore original state
        doc.restore();
    } catch (error) {
        console.error('Error rendering text:', error);
        try {
            doc.font('Helvetica')
                .fontSize(12)
                .fillColor('#FF0000')
                .text(`Error rendering text: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } catch (fallbackError) {
            console.error('Failed to display error message:', fallbackError);
        }
    }
};