/**
 * Renders a chart to the PDF document with enhanced boundary control
 */
import PDFKit from 'pdfkit';
import { prepareText } from '../../utils/bidirectionalTextUtil';
import { convertColorToHex } from '../../utils/colorUtils';

interface ChartPosition {
    x: number;
    y: number;
}

export const renderChart = async (
    doc: PDFKit.PDFDocument,
    chartData: any,
    position: ChartPosition,
    style: any = {}
): Promise<void> => {
    try {
        // Saving the current state before drawing the chart
        doc.save();

        // Setting the dimensions with page boundary checks
        const maxWidth = doc.page.width - position.x - 50; // Leave 50pt right margin
        const maxHeight = doc.page.height - position.y - 100; // Leave 100pt bottom margin

        const width = Math.min(style?.width || 400, maxWidth);
        const height = Math.min(style?.height || 300, maxHeight);

        console.log(`Chart dimensions: ${width}x${height} at position (${position.x}, ${position.y})`);
        console.log(`Page boundaries: width=${doc.page.width}, height=${doc.page.height}`);

        // Drawing a rectangle for the chart background with proper color conversion
        const bgColor = convertColorToHex(style?.backgroundColor || '#FFFFFF');
        const borderColor = convertColorToHex(style?.borderColor || '#CCCCCC');

        doc.rect(position.x, position.y, width, height)
            .fillAndStroke(bgColor, borderColor);

        // Determine if chart uses RTL direction (for Arabic)
        const isRTL = chartData.options?.rtl === true ||
            chartData.textDirection === 'rtl' ||
            style?.direction === 'rtl';

        // Set proper font for RTL text
        if (isRTL) {
            try {
                // Set appropriate font for RTL text
                const rtlFontPriority = [
                    chartData.options?.font?.family,
                    'DejaVuSans',
                    'NotoSansArabic',
                    'Helvetica'
                ].filter(Boolean); // Remove undefined values

                // Try fonts in order of priority
                let fontApplied = false;
                for (const fontName of rtlFontPriority) {
                    if (fontApplied) break;
                    try {
                        doc.font(fontName);
                        console.log(`Using ${fontName} for chart with RTL content`);
                        fontApplied = true;
                    } catch (e) {
                        console.warn(`Cannot use ${fontName} for chart, trying next font`);
                    }
                }
            } catch (fontError) {
                console.warn('Failed to set font for RTL chart, using default');
            }
        } else {
            // For LTR content, use standard fonts
            try {
                doc.font(chartData.options?.font?.family || 'DejaVuSans');
            } catch (e) {
                doc.font('DejaVuSans');
            }
        }

        // Drawing the chart title with RTL support - with boundary control
        let currentY = position.y + 15;
        if (chartData.title) {
            // Prepare title text with proper RTL markers
            const titleText = prepareText(chartData.title, isRTL);

            // Set alignment based on text direction
            const titleAlign = isRTL ? 'right' : 'center';

            // Calculate position for title with boundary check
            const titleX = position.x + (isRTL ? width - 20 : 20);
            const titleWidth = Math.min(width - 40, 400); // Limit title width

            if (currentY + 20 < doc.page.height - 50) { // Check if title fits
                doc.fontSize(14) // Reduced font size
                    .fillColor('#2C3E50')
                    .text(titleText, titleX, currentY, {
                        width: titleWidth,
                        align: titleAlign,
                        lineBreak: false // Disable line breaks for title
                    });

                currentY += 25; // Reduced spacing
            }
        }

        // Drawing the chart type label - with boundary control
        if (currentY + 15 < doc.page.height - 50) {
            const typeText = prepareText(`${chartData.type?.toUpperCase() || 'BAR'} Chart`, isRTL);

            doc.fontSize(11) // Reduced size
                .fillColor('#7F8C8D')
                .text(typeText, position.x + (isRTL ? width - 20 : 20), currentY, {
                    width: width - 40,
                    align: isRTL ? 'right' : 'center',
                    lineBreak: false
                });

            currentY += 20; // Reduced spacing
        }

        // Rendering the chart data
        if (chartData.data?.datasets && chartData.data.datasets.length > 0) {
            const dataset = chartData.data.datasets[0];
            const data = dataset.data || [];
            const labels = chartData.data.labels || [];
            const maxValue = Math.max(...data, 1); // Prevent division by zero

            // Display dataset label with RTL support - with boundary check
            if (dataset.label && currentY + 15 < doc.page.height - 50) {
                const datasetLabelText = prepareText(`${dataset.label}`, isRTL);

                doc.fontSize(10)
                    .fillColor('#34495E')
                    .text(datasetLabelText, position.x + (isRTL ? width - 20 : 20), currentY, {
                        width: width - 40,
                        align: isRTL ? 'right' : 'left',
                        lineBreak: false
                    });

                currentY += 18;
            }

            // Defining the area for the chart with boundary checks
            const chartAreaX = position.x + 50; // Reduced left margin
            const chartAreaY = currentY + 10;
            const chartAreaWidth = Math.max(width - 100, 200); // Minimum width 200pt
            const remainingHeight = doc.page.height - chartAreaY - 80; // Leave space for footer
            const chartAreaHeight = Math.min(height - (chartAreaY - position.y) - 30, remainingHeight);

            console.log(`Chart area: ${chartAreaWidth}x${chartAreaHeight} at (${chartAreaX}, ${chartAreaY})`);

            // Check if there's enough space to render the chart
            if (chartAreaHeight < 50) {
                console.warn('Insufficient space for chart rendering');
                doc.fontSize(12)
                    .fillColor('#E74C3C')
                    .text('Insufficient space for chart', position.x + 20, chartAreaY);
                doc.restore();
                return;
            }

            // Drawing the axes for bar and line charts
            if (chartData.type === 'bar' || chartData.type === 'line') {
                doc.strokeColor('#BDC3C7')
                    .lineWidth(1)
                    .moveTo(chartAreaX, chartAreaY)
                    .lineTo(chartAreaX, chartAreaY + chartAreaHeight)
                    .lineTo(chartAreaX + chartAreaWidth, chartAreaY + chartAreaHeight)
                    .stroke();
            }

            // Drawing the chart based on the type
            if (chartData.type === 'bar' && data.length > 0) {
                const barWidth = Math.min(30, (chartAreaWidth / data.length) * 0.6);
                const barSpacing = (chartAreaWidth / data.length);

                // Drawing the bars
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    const value = data[i];
                    const normalizedHeight = Math.max((value / maxValue) * (chartAreaHeight - 40), 5); // Minimum height 5pt

                    // Adjust position for RTL if needed
                    const barX = isRTL ?
                        chartAreaX + chartAreaWidth - ((i + 1) * barSpacing) + (barSpacing - barWidth) / 2 :
                        chartAreaX + (i * barSpacing) + (barSpacing - barWidth) / 2;
                    const barY = chartAreaY + chartAreaHeight - normalizedHeight - 20;

                    // Choose color and convert it properly
                    let barColor = '#3498DB';
                    if (Array.isArray(dataset.backgroundColor)) {
                        barColor = convertColorToHex(dataset.backgroundColor[i % dataset.backgroundColor.length]);
                    } else if (typeof dataset.backgroundColor === 'string') {
                        barColor = convertColorToHex(dataset.backgroundColor);
                    }

                    // Border color
                    let borderColor = barColor;
                    if (Array.isArray(dataset.borderColor)) {
                        borderColor = convertColorToHex(dataset.borderColor[i % dataset.borderColor.length]);
                    } else if (typeof dataset.borderColor === 'string') {
                        borderColor = convertColorToHex(dataset.borderColor);
                    }

                    // Drawing the bar with border
                    doc.fillColor(barColor)
                        .rect(barX, barY, barWidth, normalizedHeight)
                        .fill();

                    if (dataset.borderWidth && dataset.borderWidth > 0) {
                        doc.strokeColor(borderColor)
                            .lineWidth(dataset.borderWidth)
                            .rect(barX, barY, barWidth, normalizedHeight)
                            .stroke();
                    }

                    // Adding the label with RTL support - with boundary check
                    if (chartAreaY + chartAreaHeight + 15 < doc.page.height - 50) {
                        const labelText = prepareText(labels[i], isRTL);

                        doc.fontSize(9)
                            .fillColor('#2C3E50')
                            .text(labelText, barX - 5, chartAreaY + chartAreaHeight + 5, {
                                width: barWidth + 10,
                                align: 'center',
                                lineBreak: false
                            });
                    }

                    // Adding the value above the bar - with boundary check
                    if (barY - 15 > chartAreaY) {
                        doc.fontSize(9)
                            .fillColor('#2C3E50')
                            .text(value.toString(), barX - 5, barY - 15, {
                                width: barWidth + 10,
                                align: 'center',
                                lineBreak: false
                            });
                    }
                }
            } else if (chartData.type === 'line' && data.length > 0) {
                // Drawing the line chart
                const pointSpacing = chartAreaWidth / (data.length - 1 || 1);

                // Setting the line color
                let lineColor = '#E74C3C';
                if (dataset.borderColor) {
                    lineColor = typeof dataset.borderColor === 'string'
                        ? convertColorToHex(dataset.borderColor)
                        : convertColorToHex(dataset.borderColor[0] || '#E74C3C');
                }

                // Calculate points for the line considering direction
                const points: Array<{x: number, y: number}> = [];

                for (let i = 0; i < data.length; i++) {
                    const pointX = isRTL
                        ? chartAreaX + chartAreaWidth - i * pointSpacing
                        : chartAreaX + i * pointSpacing;
                    const pointY = chartAreaY + 20 + (chartAreaHeight - 40) - ((data[i] / maxValue) * (chartAreaHeight - 40));
                    points.push({x: pointX, y: pointY});
                }

                // Fill area under line if backgroundColor is specified
                if (dataset.backgroundColor) {
                    const fillColor = convertColorToHex(dataset.backgroundColor);
                    doc.fillColor(fillColor);

                    // Create path for filled area
                    if (points.length > 0) {
                        doc.moveTo(points[0].x, chartAreaY + chartAreaHeight - 20);
                        for (let i = 0; i < points.length; i++) {
                            doc.lineTo(points[i].x, points[i].y);
                        }
                        doc.lineTo(points[points.length - 1].x, chartAreaY + chartAreaHeight - 20);
                        doc.fill();
                    }
                }

                // Drawing the line
                doc.strokeColor(lineColor)
                    .lineWidth(dataset.borderWidth || 2);

                // Start from the first point
                if (points.length > 0) {
                    doc.moveTo(points[0].x, points[0].y);

                    // Connect points
                    for (let i = 1; i < points.length; i++) {
                        doc.lineTo(points[i].x, points[i].y);
                    }

                    // Complete the line
                    doc.stroke();

                    // Adding data points markers
                    for (let i = 0; i < points.length; i++) {
                        doc.fillColor(lineColor)
                            .circle(points[i].x, points[i].y, 3)
                            .fill();
                    }
                }

                // Adding X-axis labels with RTL support - with boundary check
                if (chartAreaY + chartAreaHeight + 15 < doc.page.height - 50) {
                    for (let i = 0; i < data.length && i < labels.length; i++) {
                        const pointX = points[i]?.x || chartAreaX + (isRTL ? chartAreaWidth - i * pointSpacing : i * pointSpacing);
                        const labelText = prepareText(labels[i], isRTL);

                        doc.fontSize(8)
                            .fillColor('#2C3E50')
                            .text(labelText, pointX - 25, chartAreaY + chartAreaHeight + 5, {
                                width: 50,
                                align: 'center',
                                lineBreak: false
                            });
                    }
                }
            } else if (chartData.type === 'pie' && data.length > 0) {
                // Drawing the pie chart
                const centerX = chartAreaX + chartAreaWidth / 2;
                const centerY = chartAreaY + Math.min(chartAreaHeight - 80, 120) / 2; // Limit center position
                const radius = Math.min(Math.min(chartAreaWidth, chartAreaHeight - 80) / 2 - 20, 80); // Maximum radius 80pt

                console.log(`Pie chart: center(${centerX}, ${centerY}), radius=${radius}`);

                // Calculating the sum of the values
                const sum = data.reduce((acc: number, val: number) => acc + val, 0);

                if (sum > 0 && radius > 10) { // Check minimum radius
                    // Set starting angle (always consistent regardless of RTL/LTR)
                    let currentAngle = -Math.PI / 2; // Starting from top (12 o'clock position)

                    // Drawing the segments
                    for (let i = 0; i < data.length; i++) {
                        if (data[i] <= 0) continue; // Skip zero or negative values

                        // Calculate angles for the segment
                        const startAngle = currentAngle;
                        const portionAngle = (data[i] / sum) * 2 * Math.PI;
                        const endAngle = currentAngle + portionAngle;

                        // Choose color and convert it properly
                        let segmentColor = '#3498DB';
                        if (Array.isArray(dataset.backgroundColor)) {
                            segmentColor = convertColorToHex(dataset.backgroundColor[i % dataset.backgroundColor.length]);
                        }

                        // Border color
                        let borderColor = segmentColor;
                        if (Array.isArray(dataset.borderColor)) {
                            borderColor = convertColorToHex(dataset.borderColor[i % dataset.borderColor.length]);
                        }

                        // Draw pie segment using paths
                        doc.save();
                        doc.fillColor(segmentColor);

                        // Move to center
                        doc.moveTo(centerX, centerY);

                        // Draw arc path manually using multiple small lines
                        const steps = 30; // Reduced steps for performance
                        for (let step = 0; step <= steps; step++) {
                            const angle = startAngle + (portionAngle * step / steps);
                            const x = centerX + Math.cos(angle) * radius;
                            const y = centerY + Math.sin(angle) * radius;

                            if (step === 0) {
                                doc.lineTo(x, y);
                            } else {
                                doc.lineTo(x, y);
                            }
                        }

                        // Close path and fill
                        doc.lineTo(centerX, centerY);
                        doc.fill();

                        // Draw border if specified
                        if (dataset.borderWidth && dataset.borderWidth > 0) {
                            doc.strokeColor(borderColor)
                                .lineWidth(dataset.borderWidth);

                            doc.moveTo(centerX, centerY);
                            for (let step = 0; step <= steps; step++) {
                                const angle = startAngle + (portionAngle * step / steps);
                                const x = centerX + Math.cos(angle) * radius;
                                const y = centerY + Math.sin(angle) * radius;
                                doc.lineTo(x, y);
                            }
                            doc.lineTo(centerX, centerY);
                            doc.stroke();
                        }

                        doc.restore();

                        // Update current angle for next segment
                        currentAngle = endAngle;
                    }
                }

                // Adding the legend with RTL support - with boundary control
                const legendStartY = centerY + radius + 20;
                let legendY = legendStartY;
                const maxLegendY = doc.page.height - 60; // Maximum legend position

                for (let i = 0; i < data.length && i < labels.length && legendY < maxLegendY; i++) {
                    if (data[i] <= 0) continue; // Skip zero or negative values

                    // Calculate percentage
                    const percentage = Math.round((data[i] / sum) * 100);

                    // Select color and convert it properly
                    let legendColor = '#3498DB';
                    if (Array.isArray(dataset.backgroundColor)) {
                        legendColor = convertColorToHex(dataset.backgroundColor[i % dataset.backgroundColor.length]);
                    }

                    // Adjust positioning based on text direction
                    const squareX = isRTL ? centerX + 60 : centerX - 120;
                    const textX = isRTL ? centerX + 40 : centerX - 100;

                    // Draw color square
                    doc.fillColor(legendColor)
                        .rect(squareX, legendY, 10, 10)
                        .fill();

                    // Create legend text with RTL support - shortened version
                    let legendTextContent;
                    if (isRTL) {
                        legendTextContent = prepareText(`${percentage}% :${labels[i]}`, isRTL);
                    } else {
                        legendTextContent = prepareText(`${labels[i]}: ${percentage}%`, isRTL);
                    }

                    // Render legend text with boundary check
                    doc.fillColor('#2C3E50')
                        .fontSize(9)
                        .text(legendTextContent, textX, legendY + 1, {
                            width: 120,
                            align: isRTL ? 'right' : 'left',
                            lineBreak: false
                        });

                    legendY += 15;
                }
            }
        }

        // Restoring the state after drawing the chart
        doc.restore();
    } catch (error) {
        console.error('Error rendering chart:', error);
        // Display a placeholder for the failed chart
        const errorBg = convertColorToHex('#FFEBEE');
        const errorBorder = convertColorToHex('#F44336');
        const errorText = convertColorToHex('#D32F2F');

        const safeWidth = Math.min(style?.width || 400, doc.page.width - position.x - 50);
        const safeHeight = Math.min(style?.height || 300, doc.page.height - position.y - 100);

        doc.save()
            .fillColor(errorBg)
            .rect(position.x, position.y, safeWidth, safeHeight)
            .fill()
            .strokeColor(errorBorder)
            .lineWidth(2)
            .rect(position.x, position.y, safeWidth, safeHeight)
            .stroke()
            .fontSize(12)
            .fillColor(errorText)
            .text('Chart Error',
                position.x + safeWidth / 2 - 35,
                position.y + safeHeight / 2 - 6,
                { align: 'center' })
            .restore();
    }
};