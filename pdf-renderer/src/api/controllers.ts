import { Request, Response } from 'express';
import { validateDSL } from '../validation/dslValidator';
import { renderDSLToPDF } from '../engine/renderer';
import { convertPDFToImages } from '../engine/images/imageConverter';
import { getAvailableTemplates } from '../engine/templates/templateRenderer';

/*** Health check endpoint*/
export const healthCheck = (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        service: 'pdf-renderer',
        timestamp: new Date().toISOString()
    });
};

/*** Controller for getting available templates*/
export const getTemplates = (_req: Request, res: Response) => {
    const templates = getAvailableTemplates();
    res.status(200).json({
        templates
    });
};

/*** Controller for rendering DSL to PDF with enhanced logging*/
export const renderPDF = async (req: Request, res: Response) => {
    try {
        const { dsl } = req.body;

        console.log('📊 НАЧИНАЕМ ОБРАБОТКУ DSL для PDF рендеринга...');

        // Логируем информацию о DSL после автофикса
        if (dsl && dsl.pages) {
            console.log(`📄 DSL содержит ${dsl.pages.length} страниц`);
            console.log(`📄 DSL defaultDirection: ${dsl.defaultDirection || 'не задано'}`);
            console.log(`📄 DSL defaultFont: ${dsl.defaultFont || 'не задано'}`);

            let totalElements = 0;
            let arabicElements = 0;
            let fixedElements = 0;

            for (let i = 0; i < dsl.pages.length; i++) {
                const page = dsl.pages[i];
                if (page.elements) {
                    totalElements += page.elements.length;

                    for (const element of page.elements) {
                        if (element.type === 'text' && element.content) {
                            const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(element.content);
                            if (hasArabic) {
                                arabicElements++;

                                // Проверяем, применены ли исправления
                                if (element.style &&
                                    element.style.font &&
                                    ['DejaVuSans', 'DejaVuSans-Bold', 'NotoSansArabic'].includes(element.style.font) &&
                                    element.style.direction === 'rtl') {
                                    fixedElements++;
                                }

                                console.log(`🔍 Арабский элемент: "${element.content.substring(0, 30)}..." -> font=${element.style?.font}, direction=${element.style?.direction}, align=${element.style?.align}`);
                            }
                        }

                        if (element.type === 'chart' && element.content) {
                            const chart = element.content;
                            if (chart.title && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(chart.title)) {
                                console.log(`📊 Арабский график: "${chart.title}" -> rtl=${chart.options?.rtl}, font=${chart.options?.font?.family}, textDirection=${chart.textDirection}`);
                            }
                        }
                    }
                }
            }

            console.log(`📊 Статистика DSL:`);
            console.log(`   - Всего элементов: ${totalElements}`);
            console.log(`   - Арабские элементы: ${arabicElements}`);
            console.log(`   - Исправленные арабские элементы: ${fixedElements}`);

            if (arabicElements > 0 && fixedElements < arabicElements) {
                console.warn(`⚠️ ВНИМАНИЕ: ${arabicElements - fixedElements} арабских элементов могут быть не исправлены!`);
            } else if (arabicElements > 0) {
                console.log(`✅ Все ${arabicElements} арабских элементов правильно настроены`);
            }
        }

        // Validate DSL (с автоматическими исправлениями внутри)
        const validationResult = validateDSL(dsl);
        if (!validationResult.valid) {
            console.error('❌ DSL валидация не прошла:', validationResult.errors);
            return res.status(400).json({
                error: true,
                message: 'Invalid DSL',
                details: validationResult.errors
            });
        }

        console.log('✅ DSL валидация прошла успешно');

        // Render DSL to PDF
        console.log('🎨 Начинаем рендеринг PDF...');
        const pdfBuffer = await renderDSLToPDF(dsl);

        console.log(`✅ PDF успешно сгенерирован. Размер: ${pdfBuffer.length} байт`);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=rendered-document.pdf');

        // Send PDF buffer
        res.send(pdfBuffer);
    } catch (error) {
        console.error('❌ Критическая ошибка рендеринга PDF:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to render PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/*** Controller for rendering DSL to images with enhanced logging*/
export const renderPDFToImages = async (req: Request, res: Response) => {
    try {
        const { dsl, dpi = 300 } = req.body;

        console.log('🖼️ НАЧИНАЕМ ОБРАБОТКУ DSL для рендеринга в изображения...');

        // Validate DSL (с автоматическими исправлениями внутри)
        const validationResult = validateDSL(dsl);
        if (!validationResult.valid) {
            console.error('❌ DSL валидация для изображений не прошла:', validationResult.errors);
            return res.status(400).json({
                error: true,
                message: 'Invalid DSL',
                details: validationResult.errors
            });
        }

        console.log('✅ DSL валидация для изображений прошла успешно');

        // Render DSL to PDF
        console.log('🎨 Начинаем рендеринг PDF для конвертации в изображения...');
        const pdfBuffer = await renderDSLToPDF(dsl);

        // Convert PDF to images
        console.log(`🔄 Конвертируем PDF (${pdfBuffer.length} байт) в изображения с DPI=${dpi}...`);
        const images = await convertPDFToImages(pdfBuffer, dpi);

        console.log(`✅ Успешно создано ${images.length} изображений`);

        // Send images
        res.json({
            success: true,
            message: 'PDF rendered to images successfully',
            images: images
        });
    } catch (error) {
        console.error('❌ Критическая ошибка рендеринга PDF в изображения:', error);
        res.status(500).json({
            error: true,
            message: 'Failed to render PDF to images',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};