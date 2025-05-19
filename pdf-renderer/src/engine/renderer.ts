import PDFDocument from 'pdfkit';
import { renderTemplate, applyTemplateToPage } from './templates/templateRenderer';
import { renderText } from './text/textRenderer';
import { renderImage } from './images/imageRenderer';
import { renderChart } from './charts/chartRenderer';
import path from 'path';
import fs from 'fs';

// Setting the path to fonts
const fontPath = path.resolve(__dirname, '../../assets/fonts');

/**
 * Applies page style to PDF document
 */
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
 * Loads and registers fonts
 */
const registerFonts = (doc: PDFKit.PDFDocument): void => {
    try {
        // Check if fonts directory exists
        if (fs.existsSync(fontPath)) {
            // Register font with Cyrillic support
            const opensansPath = path.join(fontPath, 'OpenSans-Regular.ttf');
            if (fs.existsSync(opensansPath)) {
                // Important: register font with the name we'll use
                doc.registerFont('OpenSans', opensansPath);
                console.log('OpenSans font successfully registered');

                // Set default font immediately
                doc.font('OpenSans');
            } else {
                console.warn(`Font file not found: ${opensansPath}`);
            }
        } else {
            console.warn(`Fonts directory not found: ${fontPath}`);
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
            // Create PDF document with built-in font embedding
            const doc = new PDFDocument({
                autoFirstPage: false, // Important: don't create first page automatically
                bufferPages: true,
                compress: true, // Enable compression for smaller file size
                info: {
                    Title: 'Generated Document',
                    Creator: 'PDF Renderer Service',
                    Producer: 'PDFKit'
                },
                // Disable automatic page metadata decoration,
                // which can cause artifacts to appear
                margin: 0,
                layout: 'portrait',
                size: 'a4'
            });

            // Register fonts with Cyrillic support
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

            // Save template name for later use
            const templateName = dsl.template || 'default';

            // Render template (just store info, don't apply yet)
            renderTemplate(doc, templateName);

            // Calculate total number of pages for template replacement
            const totalPages = dsl.pages?.length || 1;

            // Add pages and render content
            if (!dsl.pages || !Array.isArray(dsl.pages) || dsl.pages.length === 0) {
                // If no pages, add empty page
                doc.addPage();
                applyTemplateToPage(doc, templateName, 1, 1);
                doc.text('Empty document', 50, 50);
            } else {
                // Process all pages
                dsl.pages.forEach((page: any, pageIndex: number) => {
                    // Add new page
                    doc.addPage();

                    // Apply template to this page
                    applyTemplateToPage(doc, templateName, pageIndex + 1, totalPages);

                    // Apply page style if specified
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
                                // Render element depending on type
                                switch (type) {
                                    case 'text':
                                        if (typeof content === 'string') {
                                            // Important: always use font with Cyrillic support
                                            doc.font('OpenSans');
                                            renderText(doc, content, {
                                                ...style,
                                                position,
                                                font: 'OpenSans'
                                            });
                                        } else {
                                            // Try to convert content to string
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

            // Finalize document
            doc.end();
        } catch (initialError) {
            console.error('Error initializing PDF generation:', initialError);
            reject(initialError);
        }
    });
};
