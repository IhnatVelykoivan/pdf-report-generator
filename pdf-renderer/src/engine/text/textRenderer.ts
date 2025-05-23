/**
 * Renders text to PDF document with proper support for all characters, including Arabic and Cyrillic
 */
import PDFDocument from 'pdfkit';
import { prepareText, containsRTL, isArabicOnly } from '../../utils/bidirectionalTextUtil';

interface TextRenderPosition {
    x: number;
    y: number;
}

/**
 * Преобразует цвет в формат, понятный PDFKit
 */
const convertColor = (color: string): string => {
    if (!color) return '#000000';

    // Если цвет уже в hex формате
    if (color.startsWith('#')) {
        return color;
    }

    // Если цвет в формате rgba или rgb
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
            const r = parseInt(matches[0]);
            const g = parseInt(matches[1]);
            const b = parseInt(matches[2]);

            // Конвертируем в hex
            const toHex = (n: number) => {
                const hex = n.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };

            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    }

    // Проверяем на именованные цвета и конвертируем их
    const namedColors: Record<string, string> = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#FF0000',
        'green': '#008000',
        'blue': '#0000FF',
        'yellow': '#FFFF00',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF',
        'gray': '#808080',
        'grey': '#808080',
        'darkgray': '#404040',
        'darkgrey': '#404040',
        'lightgray': '#C0C0C0',
        'lightgrey': '#C0C0C0'
    };

    const lowerColor = color.toLowerCase();
    if (namedColors[lowerColor]) {
        return namedColors[lowerColor];
    }

    // Если не можем распознать, возвращаем черный
    console.warn(`Unknown color format: ${color}, using black`);
    return '#000000';
};

export const renderText = (
    doc: PDFKit.PDFDocument,
    text: string,
    style: any = {}
): void => {
    try {
        // Check if the text is a string
        if (typeof text !== 'string') {
            console.warn(`Text content is not a string: ${typeof text}`);
            text = String(text || '');
        }

        // Save the current document state
        doc.save();

        // Determine text direction - first check style, then analyze content
        const isRTL = style?.direction === 'rtl' || (!style?.direction && containsRTL(text));
        const isFullyArabic = isArabicOnly(text);

        // Choose the appropriate font depending on content
        let fontToUse;

        if (isRTL) {
            // Priority of fonts for Arabic text
            fontToUse = style?.font || (isFullyArabic ? 'NotoSansArabic' : 'DejaVuSans');
        } else {
            // For regular text use standard font
            fontToUse = style?.font || 'DejaVuSans';
        }

        // Apply the font
        try {
            doc.font(fontToUse);
        } catch (fontError) {
            console.warn(`Font not found: ${fontToUse}, trying fallback fonts`);

            // Try to use fonts in priority order
            const fallbackFonts = [
                'DejaVuSans',
                'Helvetica', // built-in PDFKit
                'Courier',   // built-in PDFKit
                'Times-Roman' // built-in PDFKit
            ];

            let fontApplied = false;
            for (const fallbackFont of fallbackFonts) {
                if (fontApplied) break;
                try {
                    doc.font(fallbackFont);
                    console.log(`Applied fallback font: ${fallbackFont}`);
                    fontApplied = true;
                } catch (e) {
                    console.warn(`Could not apply fallback font: ${fallbackFont}`);
                }
            }
        }

        // Apply other text styles
        if (style?.fontSize) {
            doc.fontSize(style.fontSize);
        }

        // Применяем цвет с правильной конвертацией
        if (style?.color) {
            const convertedColor = convertColor(style.color);
            doc.fillColor(convertedColor);
            console.log(`Applied text color: ${style.color} -> ${convertedColor}`);
        }

        // Set options for text
        const textOptions: PDFKit.Mixins.TextOptions = {
            width: style?.width,
            align: style?.align || (isRTL ? 'right' : 'left'),
            continued: style?.continued || false,
            indent: style?.indent || 0,
            paragraphGap: style?.paragraphGap || 0,
            lineBreak: style?.lineBreak !== false,
            underline: style?.underline || false,
        };

        // Determine the final position of the text
        const finalPosition: TextRenderPosition = style?.position
            ? { ...style.position }
            : { x: doc.x, y: doc.y };

        // Prepare text for display considering direction
        const preparedText = prepareText(text, isRTL);

        // Render text with direction consideration
        doc.text(preparedText, finalPosition.x, finalPosition.y, textOptions);

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