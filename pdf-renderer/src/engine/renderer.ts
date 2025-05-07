import PDFDocument from 'pdfkit';
import { renderTemplate, applyTemplateToPage } from './templates/templateRenderer';
import { renderText } from './text/textRenderer';
import { renderImage } from './images/imageRenderer';
import { renderChart } from './charts/chartRenderer';
import path from 'path';
import fs from 'fs';

// Настройка пути к шрифтам
const fontPath = path.resolve(__dirname, '../../assets/fonts');

/*** Applies page style to the PDF document*/

const applyPageStyle = (doc: PDFKit.PDFDocument, style: any = {}): void => {
    try {
        // Set page size if specified
        if (style.size) {
            // Convert common sizes to dimensions
            const sizes: Record<string, [number, number]> = {
                'a4': [595.28, 841.89],
                'letter': [612, 792],
                'legal': [612, 1008]
            };

            if (typeof style.size === 'string' && style.size.toLowerCase() in sizes) {
                const [width, height] = sizes[style.size.toLowerCase()];
                doc.page.width = width;
                doc.page.height = height;
            } else if (Array.isArray(style.size) && style.size.length === 2) {
                doc.page.width = style.size[0];
                doc.page.height = style.size[1];
            }
        }

        // Set page margins
        if (style.margin) {
            if (typeof style.margin === 'number') {
                doc.page.margins = {
                    top: style.margin,
                    bottom: style.margin,
                    left: style.margin,
                    right: style.margin
                };
            } else if (typeof style.margin === 'object') {
                doc.page.margins = {
                    top: style.margin.top || doc.page.margins.top,
                    bottom: style.margin.bottom || doc.page.margins.bottom,
                    left: style.margin.left || doc.page.margins.left,
                    right: style.margin.right || doc.page.margins.right
                };
            }
        }

        // Set page background color
        if (style.backgroundColor) {
            doc.rect(0, 0, doc.page.width, doc.page.height)
                .fill(style.backgroundColor);
        }
    } catch (error) {
        console.error('Error applying page style:', error);
    }
};

/**
 * Загружает и регистрирует шрифты
 */
const registerFonts = (doc: PDFKit.PDFDocument): void => {
    try {
        // Проверяем наличие директории шрифтов
        if (fs.existsSync(fontPath)) {
            // Регистрируем стандартный шрифт для кириллицы, если файл существует
            const opensansPath = path.join(fontPath, 'OpenSans-Regular.ttf');
            if (fs.existsSync(opensansPath)) {
                // Важно: зарегистрировать шрифт с встраиванием
                doc.registerFont('OpenSans', opensansPath);
                console.log('OpenSans font registered successfully');

                // Сразу устанавливаем стандартный шрифт
                doc.font('OpenSans');
            } else {
                console.warn(`Font file not found: ${opensansPath}`);
            }
        } else {
            console.warn(`Font directory not found: ${fontPath}`);
        }
    } catch (error) {
        console.error('Error registering fonts:', error);
    }
};

/**
 * Renders DSL to PDF buffer
 */
export const renderDSLToPDF = async (dsl: any): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            // Create a PDF document with built-in font embedding
            const doc = new PDFDocument({
                autoFirstPage: false, // Важно: не создавать первую страницу автоматически
                bufferPages: true,
                compress: true, // Включаем сжатие для меньшего размера файла
                info: {
                    Title: 'Generated Document',
                    Creator: 'PDF Renderer Service',
                    Producer: 'PDFKit',
                    // Убедимся, что метаданные корректно обрабатывают юникод
                    CreationDate: new Date()
                },
                font: 'Helvetica', // Начальный стандартный шрифт
                pdfVersion: '1.7', // Используем новую версию PDF для лучшей поддержки юникода
            });

            // Регистрируем шрифты с поддержкой кириллицы
            registerFonts(doc);

            // Buffer to store PDF data
            const buffers: Buffer[] = [];

            // Add listeners for data and end events
            doc.on('data', (chunk) => {
                if (chunk) {
                    buffers.push(chunk);
                }
            });

            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Add error handler
            doc.on('error', (err) => {
                console.error('PDFKit error:', err);
                reject(err);
            });

            // Store template name for later use
            const templateName = dsl.template || 'default';

            // Render template (just store info, don't apply yet)
            renderTemplate(doc, templateName);

            // Рассчитываем общее количество страниц для замены в шаблоне
            const totalPages = dsl.pages?.length || 1;

            // Add pages and render content
            if (!dsl.pages || !Array.isArray(dsl.pages) || dsl.pages.length === 0) {
                // If no pages, add an empty page
                doc.addPage();
                applyTemplateToPage(doc, templateName, 1, 1);
                doc.text('Empty document', 50, 50);
            } else {
                // Process all pages
                dsl.pages.forEach((page: any, pageIndex: number) => {
                    // Add a new page
                    doc.addPage();

                    // Apply template to this page
                    applyTemplateToPage(doc, templateName, pageIndex + 1, totalPages);

                    // Apply page style if provided
                    if (page.style) {
                        applyPageStyle(doc, page.style);
                    }

                    // Process each element on the page
                    if (page.elements && Array.isArray(page.elements)) {
                        page.elements.forEach((element: any) => {
                            if (!element || !element.type || !element.position) {
                                console.warn('Invalid element:', element);
                                return;
                            }

                            const { type, content, position, style } = element;

                            try {
                                // Render element based on type
                                switch (type) {
                                    case 'text':
                                        if (typeof content === 'string') {
                                            // Важно: всегда используем шрифт с поддержкой кириллицы
                                            doc.font('OpenSans');
                                            renderText(doc, content, {
                                                ...style,
                                                position,
                                                font: 'OpenSans'
                                            });
                                        } else {
                                            // Попытаемся преобразовать контент в строку
                                            try {
                                                const stringContent = String(content || '');
                                                console.warn(`Text content is not a string, converting: ${typeof content} -> string`);
                                                doc.font('OpenSans');
                                                renderText(doc, stringContent, {
                                                    ...style,
                                                    position,
                                                    font: 'OpenSans'
                                                });
                                            } catch (textError) {
                                                console.error('Failed to convert text content to string:', textError);
                                                doc.text(`Error: Invalid text content format (${typeof content})`, position.x, position.y);
                                            }
                                        }
                                        break;
                                    case 'image':
                                        renderImage(doc, content, position, style)
                                            .catch((err: Error) => console.error('Error rendering image:', err));
                                        break;
                                    case 'chart':
                                        renderChart(doc, content, position, style)
                                            .catch((err: Error) => console.error('Error rendering chart:', err));
                                        break;
                                    default:
                                        console.warn(`Unknown element type: ${type}`);
                                }
                            } catch (elementError) {
                                console.error(`Error rendering element of type ${type}:`, elementError);
                                doc.text(`Error rendering ${type} element`, position.x, position.y);
                            }
                        });
                    }
                });
            }

            // Finalize the document
            doc.end();
        } catch (initialError) {
            console.error('Error initializing PDF generation:', initialError);
            reject(initialError);
        }
    });
};