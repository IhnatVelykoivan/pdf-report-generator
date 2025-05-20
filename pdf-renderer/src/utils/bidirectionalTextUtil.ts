/**
 * Utility functions for handling bidirectional text (RTL and LTR) in PDF rendering
 */

/**
 * Determines if the text contains RTL characters (e.g., Arabic)
 */
export const containsRTL = (text: string): boolean => {
    if (!text) return false;

    // Unicode ranges for Arabic script and other RTL scripts
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF\u07C0-\u07FF\u200F]/;
    return rtlRegex.test(text);
};

/**
 * Checks if the text is Arabic only
 */
export const isArabicOnly = (text: string): boolean => {
    if (!text) return false;

    // Check if the text contains only Arabic characters, spaces and common punctuation marks
    const arabicOnlyRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\d.,!?:;'"()-]+$/;
    return arabicOnlyRegex.test(text);
};

/**
 * Prepares text for RTL rendering
 * For PDF it's important to apply special Unicode markers that preserve the correct display order
 */
export const prepareText = (text: string, isRTL: boolean = false): string => {
    if (!text) return '';

    // For RTL text we apply special Unicode markers
    if (isRTL) {
        // Use RIGHT-TO-LEFT EMBEDDING (U+202B) and POP DIRECTIONAL FORMATTING (U+202C)
        return '\u202B' + text + '\u202C';
    }

    return text;
};

/**
 * Creates text options with RTL support
 */
export const createTextOptions = (
    options: any = {},
    isRTL: boolean = false
): Record<string, any> => {
    const textOptions = { ...options };

    // Set alignment for RTL text
    if (isRTL && !textOptions.align) {
        textOptions.align = 'right';
    }

    return textOptions;
};

/**
 * Adjusts position for RTL text
 */
export const adjustPositionForRTL = (
    position: { x: number; y: number },
    textWidth: number,
    pageWidth: number,
    isRTL: boolean = false
): { x: number; y: number } => {
    if (!isRTL) return position;

    // For RTL text, adjust the position for right alignment
    if (position && pageWidth) {
        return {
            x: pageWidth - position.x - textWidth,
            y: position.y
        };
    }

    return position;
};