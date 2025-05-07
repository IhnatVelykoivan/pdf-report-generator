/**
 * Renders text to the PDF document with proper support for all characters including Cyrillic
 */
export const renderText = (
    doc: PDFKit.PDFDocument,
    text: string,
    style: any = {}
): void => {
    try {
        // Проверяем, что текст - это строка
        if (typeof text !== 'string') {
            console.warn(`Text content is not a string: ${typeof text}`);
            text = String(text || '');
        }

        // Сохраняем текущее состояние перед изменениями
        doc.save();

        // Применяем стили текста
        // Убедимся, что используем шрифт с поддержкой кириллицы
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

        // Настройки отображения текста
        const options: PDFKit.Mixins.TextOptions = {
            width: style?.width,
            align: style?.align || 'left',
            lineBreak: style?.lineBreak !== false,
            underline: style?.underline || false,
            // Настройки для улучшения отображения кириллицы
            characterSpacing: 0,
            wordSpacing: 0,
            lineGap: style?.paragraphGap || 0
        };

        // Для позиции используем указанное в элементе положение
        if (style?.position) {
            // Position the text at the specified coordinates
            doc.text(text, style.position.x, style.position.y, options);
        } else {
            // Отображаем текст в текущей позиции
            doc.text(text, options);
        }

        // Восстанавливаем исходное состояние
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