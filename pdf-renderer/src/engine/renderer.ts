import PDFDocument from 'pdfkit';
import { renderText } from './text/textRenderer';
import { renderImage } from './images/imageRenderer';
import { renderChart } from './charts/chartRenderer';
import { containsRTL, isArabicOnly } from '../utils/bidirectionalTextUtil';
import { convertColorToHex } from '../utils/colorUtils';
import path from 'path';
import fs from 'fs';

// Setting the path to fonts
const fontPath = path.resolve(__dirname, '../../assets/fonts');

/**
 * Registers fonts without creating pages
 */
const registerFonts = (doc: PDFKit.PDFDocument): void => {
    try {
        if (fs.existsSync(fontPath)) {
            const fontFiles = [
                { name: 'DejaVuSans', path: 'DejaVuSans.ttf' },
                { name: 'DejaVuSans-Bold', path: 'DejaVuSans-Bold.ttf' },
                { name: 'NotoSansArabic', path: 'NotoSansArabic-Regular.ttf' }
            ];

            for (const font of fontFiles) {
                const fontFilePath = path.join(fontPath, font.path);

                if (fs.existsSync(fontFilePath)) {
                    try {
                        doc.registerFont(font.name, fontFilePath);
                        console.log(`Font ${font.name} registered`);
                    } catch (err) {
                        console.warn(`Could not register font ${font.name}`);
                    }
                }
            }

            // Set default font
            try {
                doc.font('DejaVuSans');
            } catch (e) {
                console.warn('Could not set default font');
            }
        }
    } catch (error) {
        console.error('Error registering fonts:', error);
    }
};

/**
 * Applies simple header and footer to existing page
 */
const applySimpleTemplate = (doc: PDFKit.PDFDocument, pageNumber: number, totalPages: number): void => {
    try {
        doc.save();

        // Header
        doc.fontSize(14)
            .fillColor('#34495E')
            .text('Generated Document', 50, 25, {
                width: doc.page.width - 100,
                align: 'center'
            });

        // Header line
        doc.strokeColor('#BDC3C7')
            .lineWidth(0.5)
            .moveTo(50, 50)
            .lineTo(doc.page.width - 50, 50)
            .stroke();

        // Footer
        const footerY = doc.page.height - 35;

        // Footer line
        doc.strokeColor('#BDC3C7')
            .lineWidth(0.5)
            .moveTo(50, footerY - 10)
            .lineTo(doc.page.width - 50, footerY - 10)
            .stroke();

        // Footer text
        doc.fontSize(10)
            .fillColor('#7F8C8D')
            .text(`Page ${pageNumber} of ${totalPages}`, 50, footerY, {
                width: doc.page.width - 100,
                align: 'center'
            });

        doc.restore();
    } catch (error) {
        console.error('Error applying template:', error);
    }
};

/**
 * Applies page background color
 */
const applyPageBackground = (doc: PDFKit.PDFDocument, backgroundColor?: string): void => {
    if (backgroundColor) {
        try {
            const bgColor = convertColorToHex(backgroundColor);
            doc.save();
            doc.fillColor(bgColor)
                .rect(0, 0, doc.page.width, doc.page.height)
                .fill();
            doc.restore();
        } catch (error) {
            console.error('Error applying background:', error);
        }
    }
};

/**
 * Processes elements on a page - ASYNC FUNCTION
 */
const processPageElements = async (doc: PDFKit.PDFDocument, elements: any[], pageNumber: number): Promise<void> => {
    if (!elements || !Array.isArray(elements)) {
        console.log(`No elements on page ${pageNumber}`);
        return;
    }

    console.log(`Processing ${elements.length} elements on page ${pageNumber}`);

    for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
        const element = elements[elementIndex];

        if (!element || !element.type || !element.position) {
            console.warn(`Skipping invalid element ${elementIndex} on page ${pageNumber}`);
            continue;
        }

        const { type, content, position, style } = element;

        try {
            console.log(`Rendering ${type} at (${position.x}, ${position.y})`);

            // Set font for element
            let elementFont = 'DejaVuSans';
            if (style?.direction === 'rtl' || (typeof content === 'string' && containsRTL(content))) {
                elementFont = isArabicOnly(content) ? 'NotoSansArabic' : 'DejaVuSans';
            }

            try {
                doc.font(style?.font || elementFont);
            } catch (fontError) {
                doc.font('DejaVuSans');
            }

            // Render element
            switch (type) {
                case 'text':
                    renderText(doc, String(content || ''), {
                        ...style,
                        position,
                        direction: style?.direction || (containsRTL(String(content)) ? 'rtl' : 'ltr')
                    });
                    break;

                case 'image':
                    try {
                        await renderImage(doc, content, position, style);
                    } catch (err) {
                        console.error(`Image error:`, err);
                    }
                    break;

                case 'chart':
                    try {
                        await renderChart(doc, content, position, style);
                    } catch (err) {
                        console.error(`Chart error:`, err);
                    }
                    break;

                default:
                    console.warn(`Unknown element type: ${type}`);
            }
        } catch (elementError) {
            console.error(`Error rendering element on page ${pageNumber}:`, elementError);
        }
    }
};

/**
 * MINIMAL RENDERER WITH PROPER ASYNC HANDLING
 */
export const renderDSLToPDF = async (dsl: any): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('=== STARTING MINIMAL PDF GENERATION ===');

            // Validate input
            if (!dsl || !dsl.pages || !Array.isArray(dsl.pages)) {
                reject(new Error('Invalid DSL: pages array is required'));
                return;
            }

            const totalPages = dsl.pages.length;
            console.log(`Creating PDF with exactly ${totalPages} pages`);

            // Create PDF document with minimal settings
            const doc = new PDFDocument({
                autoFirstPage: false, // CRITICAL!
                bufferPages: false,   // Disable page buffering
                compress: false,      // Disable compression for debugging
                margin: 0,
                layout: 'portrait',
                size: 'a4'
            });

            // Register fonts
            registerFonts(doc);

            // PDF data collection
            const buffers: Buffer[] = [];
            let isFinalized = false;

            doc.on('data', (chunk) => {
                buffers.push(chunk);
            });

            doc.on('end', () => {
                if (!isFinalized) {
                    isFinalized = true;
                    console.log('=== PDF GENERATION COMPLETED ===');
                    resolve(Buffer.concat(buffers));
                }
            });

            doc.on('error', (err) => {
                if (!isFinalized) {
                    isFinalized = true;
                    reject(err);
                }
            });

            // Set document font
            try {
                doc.font('DejaVuSans').fontSize(12);
            } catch (e) {
                console.warn('Default font setup failed');
            }

            // Process each page from DSL - STRICTLY ONCE
            for (let pageIndex = 0; pageIndex < dsl.pages.length; pageIndex++) {
                const page = dsl.pages[pageIndex];
                const pageNumber = pageIndex + 1;

                console.log(`\n--- CREATING PAGE ${pageNumber} ---`);

                // Create new page - THE ONLY PLACE WHERE PAGES ARE CREATED
                doc.addPage();
                console.log(`Page ${pageNumber} created`);

                // Apply background first
                if (page.style?.backgroundColor) {
                    applyPageBackground(doc, page.style.backgroundColor);
                }

                // Apply simple template
                applySimpleTemplate(doc, pageNumber, totalPages);

                // Process elements asynchronously
                await processPageElements(doc, page.elements, pageNumber);

                console.log(`--- PAGE ${pageNumber} COMPLETED ---`);
            }

            console.log(`\n=== FINALIZING PDF ===`);

            // Finalize PDF
            doc.end();

        } catch (error) {
            console.error('Critical error in PDF generation:', error);
            reject(error);
        }
    });
};