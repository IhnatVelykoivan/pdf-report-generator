/*** Renders text to the PDF document with proper support for all characters including Cyrillic*/

export const renderText = (
    doc: PDFKit.PDFDocument,
    text: string,
    style: any = {}
): void => {
    try {
        // Checking that the text is a string
        if (typeof text !== 'string') {
            console.warn(`Text content is not a string: ${typeof text}`);
            text = String(text || '');
        }

        // Saving the current state before changes
        doc.save();

        // Applying text styles
        // Making sure to use a font that supports Cyrillic characters

        if (style?.font) {
            try {
                doc.font(style.font);
            } catch (fontError) {
                console.warn(`Font not found: ${style.font}, using current font instead`);
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
            // Settings for better Cyrillic text rendering
            characterSpacing: 0,
            wordSpacing: 0,
            lineGap: style?.paragraphGap || 0
        };

        // Using the position specified in the element for the placement
        if (style?.position) {
            // Position the text at the specified coordinates
            doc.text(text, style.position.x, style.position.y, options);
        } else {
            // Displaying the text at the current position
            doc.text(text, options);
        }

        // Restoring the original state
        doc.restore();
    } catch (error) {
        console.error('Error rendering text:', error);
        try {
            doc.font('Helvetica')
                .fontSize(12)
                .fillColor('#FF0000')
                .text(`Error rendering text: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } catch (fallbackError) {
            console.error('Failed to render error message:', fallbackError);
        }
    }
};