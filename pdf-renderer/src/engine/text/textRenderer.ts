/**
 * Renders text to PDF document with BULLETPROOF support for Arabic and other RTL scripts
 */
import PDFDocument from 'pdfkit';
import { prepareText, containsRTL, isArabicOnly } from '../../utils/bidirectionalTextUtil';

interface TextRenderPosition {
    x: number;
    y: number;
}

/**
 * УЛУЧШЕННАЯ функция определения правильного шрифта (основана на рабочем тесте)
 */
const getCorrectFont = (text: string, styleFont?: string): string => {
    // Проверяем наличие арабских символов
    const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

    // Если есть арабские символы, используем приоритетную цепочку шрифтов
    if (hasArabic) {
        console.log(`🔤 Обнаружен арабский текст: "${text.substring(0, 30)}..."`);

        // Приоритет шрифтов для арабского текста (по результатам рабочего теста)
        const arabicFontPriority = [
            styleFont,           // Если указан в стиле
            'DejaVuSans',       // Основной шрифт (работает в тесте)
            'DejaVuSans-Bold',  // Жирный вариант
            'NotoSansArabic',   // Специализированный арабский шрифт
            'Helvetica'         // Fallback
        ].filter((font): font is string => Boolean(font)); // Исправлено: фильтруем и типизируем

        console.log(`🔤 Приоритет шрифтов для арабского текста: ${arabicFontPriority.join(' -> ')}`);
        return arabicFontPriority[0] || 'DejaVuSans'; // Исправлено: добавлен fallback
    }

    // Если указан шрифт в стиле, проверяем его валидность
    if (styleFont) {
        // Список поддерживаемых шрифтов
        const supportedFonts = ['DejaVuSans', 'DejaVuSans-Bold', 'NotoSansArabic', 'Helvetica', 'Courier', 'Times-Roman'];

        if (supportedFonts.includes(styleFont)) {
            return styleFont;
        } else {
            console.warn(`⚠️ Неподдерживаемый шрифт ${styleFont}, используем DejaVuSans`);
        }
    }

    // По умолчанию используем DejaVuSans (поддерживает кириллицу и частично арабский)
    return 'DejaVuSans';
};

/**
 * УСИЛЕННАЯ функция применения шрифта с fallback цепочкой
 */
const applyFontWithFallback = (doc: PDFKit.PDFDocument, text: string, styleFont?: string): void => {
    const desiredFont = getCorrectFont(text, styleFont);

    // Приоритетная цепочка шрифтов (основана на рабочем тесте)
    const fontFallbackChain = [
        desiredFont,
        'DejaVuSans',      // Основной fallback (работает в тесте)
        'DejaVuSans-Bold', // Жирный вариант DejaVu
        'NotoSansArabic',  // Специализированный арабский
        'Helvetica',       // Встроенный PDFKit
        'Courier',         // Встроенный PDFKit
        'Times-Roman'      // Встроенный PDFKit
    ];

    let fontApplied = false;

    for (const fontName of fontFallbackChain) {
        if (fontApplied) break;

        try {
            doc.font(fontName);
            console.log(`✅ Применён шрифт: ${fontName} для текста: "${text.substring(0, 30)}..."`);
            fontApplied = true;
        } catch (fontError) {
            console.warn(`⚠️ Не удалось применить шрифт ${fontName}, пробуем следующий...`);
        }
    }

    if (!fontApplied) {
        console.error(`❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось применить ни один шрифт для текста: "${text.substring(0, 30)}..."`);
        throw new Error('Не удалось применить шрифт');
    }
};

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

/**
 * ГЛАВНАЯ функция рендеринга текста с усиленной поддержкой RTL
 */
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

        if (!text.trim()) {
            console.warn('Пустой текст, пропускаем рендеринг');
            return;
        }

        console.log(`🎨 Рендерим текст: "${text.substring(0, 50)}..." со стилем:`, JSON.stringify(style, null, 2));

        // Save the current document state
        doc.save();

        // КРИТИЧЕСКИ ВАЖНО: Определяем направление текста с дополнительными проверками
        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
        const isRTL = style?.direction === 'rtl' ||
            (!style?.direction && (hasArabic || containsRTL(text)));
        const isFullyArabic = isArabicOnly(text);

        console.log(`📝 Анализ текста: hasArabic=${hasArabic}, isRTL=${isRTL}, isFullyArabic=${isFullyArabic}, direction=${style?.direction}`);

        // УСИЛЕННОЕ применение шрифта
        applyFontWithFallback(doc, text, style?.font);

        // Apply other text styles
        if (style?.fontSize) {
            doc.fontSize(style.fontSize);
        }

        // Применяем цвет с правильной конвертацией
        if (style?.color) {
            const convertedColor = convertColor(style.color);
            doc.fillColor(convertedColor);
            console.log(`🎨 Применён цвет: ${style.color} -> ${convertedColor}`);
        }

        // УЛУЧШЕННЫЕ опции для текста (основано на рабочем тесте)
        const baseAlign = isRTL ? 'right' : 'left';
        const finalAlign = style?.align || baseAlign;

        // Для арабского текста, если align не задан явно, принудительно ставим right (как в рабочем тесте)
        const correctedAlign = hasArabic && !style?.align ? 'right' : finalAlign;

        const textOptions: PDFKit.Mixins.TextOptions = {
            width: style?.width,
            align: correctedAlign,
            continued: style?.continued || false,
            indent: style?.indent || 0,
            paragraphGap: style?.paragraphGap || 0,
            lineBreak: style?.lineBreak !== false,
            underline: style?.underline || false,
        };

        console.log(`📐 Параметры текста: align=${correctedAlign}, width=${style?.width}, lineBreak=${textOptions.lineBreak}`);

        // Determine the final position of the text
        const finalPosition: TextRenderPosition = style?.position
            ? { ...style.position }
            : { x: doc.x, y: doc.y };

        // УСИЛЕННАЯ подготовка текста для отображения
        const preparedText = prepareText(text, isRTL);

        console.log(`🔄 Подготовленный текст: "${preparedText.substring(0, 50)}..."`);

        // Render text with direction consideration
        doc.text(preparedText, finalPosition.x, finalPosition.y, textOptions);

        console.log(`✅ Текст успешно отрендерен в позиции (${finalPosition.x}, ${finalPosition.y})`);

        // Restore original state
        doc.restore();
    } catch (error) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА рендеринга текста:', error);

        try {
            // FALLBACK рендеринг с минимальными настройками
            doc.font('Helvetica')
                .fontSize(12)
                .fillColor('#FF0000')
                .text(`[ОШИБКА РЕНДЕРИНГА]: ${text.substring(0, 100)}`,
                    style?.position?.x || 50,
                    style?.position?.y || 50,
                    { width: 400 });

            console.log('🚨 Отображена fallback ошибка рендеринга');
        } catch (fallbackError) {
            console.error('💀 КРИТИЧЕСКАЯ ОШИБКА: Не удалось отобразить даже fallback сообщение:', fallbackError);
        }
    }
};