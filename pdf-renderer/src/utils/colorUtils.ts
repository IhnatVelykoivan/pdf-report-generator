/**
 * Utilities for working with colors in PDF renderer
 */

/**
 * Named colors dictionary
 */
const NAMED_COLORS: Record<string, string> = {
    // Basic colors
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',

    // Gray shades
    'gray': '#808080',
    'grey': '#808080',
    'darkgray': '#404040',
    'darkgrey': '#404040',
    'lightgray': '#C0C0C0',
    'lightgrey': '#C0C0C0',
    'silver': '#C0C0C0',
    'dimgray': '#696969',
    'dimgrey': '#696969',
    'gainsboro': '#DCDCDC',
    'whitesmoke': '#F5F5F5',

    // Additional colors
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'navy': '#000080',
    'teal': '#008080',
    'olive': '#808000',
    'lime': '#00FF00',
    'aqua': '#00FFFF',
    'fuchsia': '#FF00FF',
    'maroon': '#800000',
    'gold': '#FFD700',
    'indigo': '#4B0082',
    'violet': '#EE82EE',
    'turquoise': '#40E0D0',
    'salmon': '#FA8072',
    'khaki': '#F0E68C',
    'tan': '#D2B48C',
    'coral': '#FF7F50',
    'crimson': '#DC143C',
    'forestgreen': '#228B22',
    'limegreen': '#32CD32',
    'orangered': '#FF4500',
    'royalblue': '#4169E1',
    'skyblue': '#87CEEB',
    'steelblue': '#4682B4',
    'tomato': '#FF6347'
};

/**
 * Converts color to hex format compatible with PDFKit
 * @param color - color in any format (hex, rgb, rgba, named)
 * @param defaultColor - default color if conversion fails
 * @returns hex color in #RRGGBB format
 */
export const convertColorToHex = (color: string, defaultColor: string = '#000000'): string => {
    if (!color || typeof color !== 'string') {
        console.warn(`Invalid color input: ${color}, using default: ${defaultColor}`);
        return defaultColor;
    }

    const trimmedColor = color.trim();

    // If color is already in hex format
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmedColor)) {
        return trimmedColor.toUpperCase();
    }

    // If short hex format (#RGB -> #RRGGBB)
    if (/^#[0-9A-Fa-f]{3}$/.test(trimmedColor)) {
        const shortHex = trimmedColor.slice(1);
        return `#${shortHex[0]}${shortHex[0]}${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}`.toUpperCase();
    }

    // If color is in rgb(r, g, b) format
    const rgbMatch = trimmedColor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (rgbMatch) {
        const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1])));
        const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2])));
        const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3])));
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // If color is in rgba(r, g, b, a) format - ignore alpha
    const rgbaMatch = trimmedColor.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/i);
    if (rgbaMatch) {
        const r = Math.min(255, Math.max(0, parseInt(rgbaMatch[1])));
        const g = Math.min(255, Math.max(0, parseInt(rgbaMatch[2])));
        const b = Math.min(255, Math.max(0, parseInt(rgbaMatch[3])));
        console.log(`Converting rgba to rgb, alpha channel ignored: ${trimmedColor} -> #${toHex(r)}${toHex(g)}${toHex(b)}`);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // If named color
    const namedColor = NAMED_COLORS[trimmedColor.toLowerCase()];
    if (namedColor) {
        console.log(`Converting named color: ${trimmedColor} -> ${namedColor}`);
        return namedColor;
    }

    // If unrecognized format
    console.warn(`Unknown color format: "${color}", using default: ${defaultColor}`);
    return defaultColor;
};

/**
 * Converts number to two-digit hex representation
 */
const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
};

/**
 * Extracts alpha channel from rgba color
 * @param color - rgba color
 * @returns alpha value between 0 and 1, or 1 if alpha not found
 */
export const extractAlpha = (color: string): number => {
    if (!color || typeof color !== 'string') {
        return 1;
    }

    const rgbaMatch = color.match(/^rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/i);
    if (rgbaMatch) {
        const alpha = parseFloat(rgbaMatch[1]);
        return Math.min(1, Math.max(0, alpha));
    }

    return 1; // Full opacity by default
};

/**
 * Checks if color is valid
 * @param color - color to validate
 * @returns true if color is valid
 */
export const isValidColor = (color: string): boolean => {
    if (!color || typeof color !== 'string') {
        return false;
    }

    const trimmedColor = color.trim();

    // Check hex format
    if (/^#[0-9A-Fa-f]{3}$/.test(trimmedColor) || /^#[0-9A-Fa-f]{6}$/.test(trimmedColor)) {
        return true;
    }

    // Check rgb format
    if (/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(trimmedColor)) {
        return true;
    }

    // Check rgba format
    if (/^rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(trimmedColor)) {
        return true;
    }

    // Check named color
    if (NAMED_COLORS[trimmedColor.toLowerCase()]) {
        return true;
    }

    return false;
};

/**
 * Creates darker version of color (for hover effects, active states)
 * @param color - original color
 * @param factor - darkening factor (0-1)
 * @returns darkened color
 */
export const darkenColor = (color: string, factor: number = 0.2): string => {
    const hexColor = convertColorToHex(color);

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

/**
 * Creates lighter version of color
 * @param color - original color
 * @param factor - lightening factor (0-1)
 * @returns lightened color
 */
export const lightenColor = (color: string, factor: number = 0.2): string => {
    const hexColor = convertColorToHex(color);

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

/**
 * Returns contrast color (black or white) for given color
 * @param color - original color
 * @returns '#000000' or '#FFFFFF'
 */
export const getContrastColor = (color: string): string => {
    const hexColor = convertColorToHex(color);

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate brightness using YIQ formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness >= 128 ? '#000000' : '#FFFFFF';
};