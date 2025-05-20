/**
 * Renders a chart to the PDF document
 */
import PDFKit from 'pdfkit';
import { prepareText } from '../../utils/bidirectionalTextUtil';

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

        // Setting the dimensions
        const width = style?.width || 400;
        const height = style?.height || 300;

        // Drawing a rectangle for the chart background
        doc.rect(position.x, position.y, width, height)
            .fillAndStroke(style?.backgroundColor || '#f8f8f8', style?.borderColor || '#cccccc');

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
                    'NotoSansArabic',
                    'DejaVuSans',
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
        }

        // Drawing the chart title with RTL support
        if (chartData.title) {
            // Prepare title text with proper RTL markers
            const titleText = prepareText(chartData.title, isRTL);

            // Set alignment based on text direction
            const titleAlign = isRTL ? 'right' : 'center';

            // Calculate position for title
            const titleX = position.x + (isRTL ? width - 20 : width / 2);

            doc.fontSize(16)
                .fillColor('#000000')
                .text(titleText, titleX, position.y + 20, {
                    width: width - 40,
                    align: titleAlign
                });
        }

        // Drawing the chart type label
        const typeLabelY = chartData.title ? position.y + 45 : position.y + 20;
        const typeText = prepareText(`${chartData.type?.toUpperCase() || 'BAR'} Chart`, isRTL);

        doc.fontSize(14)
            .fillColor('#333333')
            .text(typeText, position.x + (isRTL ? width - 20 : width / 2), typeLabelY, {
                width: width - 40,
                align: isRTL ? 'right' : 'center'
            });

        // Rendering the chart data
        const dataY = chartData.title ? position.y + 80 : position.y + 50;

        if (chartData.data?.datasets && chartData.data.datasets.length > 0) {
            const dataset = chartData.data.datasets[0];
            const data = dataset.data || [];
            const labels = chartData.data.labels || [];
            const maxValue = Math.max(...data, 1); // Prevent division by zero

            // Display dataset label with RTL support
            const datasetLabelText = prepareText(`Dataset: ${dataset.label || 'Unnamed dataset'}`, isRTL);

            doc.fontSize(12)
                .fillColor('#333333')
                .text(datasetLabelText, position.x + (isRTL ? width - 20 : 20), dataY, {
                    width: width - 40,
                    align: isRTL ? 'right' : 'left'
                });

            // Defining the area for the chart
            const chartAreaX = position.x + 60;
            const chartAreaY = dataY + 30;
            const chartAreaWidth = width - 80;
            const chartAreaHeight = height - (chartAreaY - position.y) - 30;

            // Drawing the axes
            doc.strokeColor('#333333')
                .lineWidth(1)
                .moveTo(chartAreaX, chartAreaY)
                .lineTo(chartAreaX, chartAreaY + chartAreaHeight)
                .lineTo(chartAreaX + chartAreaWidth, chartAreaY + chartAreaHeight)
                .stroke();

            // Drawing the chart based on the type
            if (chartData.type === 'bar' && data.length > 0) {
                const barWidth = Math.min(30, (chartAreaWidth / data.length) * 0.7);
                const barSpacing = (chartAreaWidth / data.length);

                // Drawing the bars
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    const value = data[i];
                    const barHeight = (value / maxValue) * chartAreaHeight;

                    // Adjust position for RTL if needed
                    const barX = isRTL ?
                        chartAreaX + chartAreaWidth - ((i + 1) * barSpacing) + (barSpacing - barWidth) / 2 :
                        chartAreaX + (i * barSpacing) + (barSpacing - barWidth) / 2;
                    const barY = chartAreaY + chartAreaHeight - barHeight;

                    // Choose color
                    let barColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        barColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    } else if (typeof dataset.backgroundColor === 'string') {
                        barColor = dataset.backgroundColor;
                    }

                    // Drawing the bar
                    doc.fillColor(barColor)
                        .rect(barX, barY, barWidth, barHeight)
                        .fill();

                    // Adding the label with RTL support
                    const labelText = prepareText(labels[i], isRTL);

                    // Properly position the label based on direction
                    const labelX = isRTL ?
                        barX - barWidth/2 :
                        barX;

                    doc.fontSize(10)
                        .fillColor('#000000')
                        .text(labelText, labelX, chartAreaY + chartAreaHeight + 5, {
                            width: barWidth,
                            align: 'center'
                        });

                    // Adding the value above the bar
                    doc.fontSize(9)
                        .text(value.toString(), barX, barY - 15, {
                            width: barWidth,
                            align: 'center'
                        });
                }
            } else if (chartData.type === 'line' && data.length > 0) {
                // Drawing the line chart
                const pointSpacing = chartAreaWidth / (data.length - 1 || 1);

                // Setting the line color
                let lineColor = '#FF5722';
                if (dataset.borderColor) {
                    lineColor = typeof dataset.borderColor === 'string'
                        ? dataset.borderColor
                        : dataset.borderColor[0] || '#FF5722';
                }

                // Calculate points for the line considering direction
                const points: Array<{x: number, y: number}> = [];

                for (let i = 0; i < data.length; i++) {
                    const pointX = isRTL
                        ? chartAreaX + chartAreaWidth - i * pointSpacing
                        : chartAreaX + i * pointSpacing;
                    const pointY = chartAreaY + chartAreaHeight - (data[i] / maxValue) * chartAreaHeight;
                    points.push({x: pointX, y: pointY});
                }

                // Drawing the line
                doc.strokeColor(lineColor)
                    .lineWidth(2);

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
                        doc.circle(points[i].x, points[i].y, 3)
                            .fill(lineColor);
                    }
                }

                // Adding X-axis labels with RTL support
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    const pointX = points[i]?.x || chartAreaX + (isRTL ? chartAreaWidth - i * pointSpacing : i * pointSpacing);
                    const labelText = prepareText(labels[i], isRTL);

                    doc.fontSize(9)
                        .fillColor('#000000')
                        .text(labelText, pointX - pointSpacing/2, chartAreaY + chartAreaHeight + 5, {
                            width: pointSpacing,
                            align: 'center'
                        });
                }
            } else if (chartData.type === 'pie' && data.length > 0) {
                // Drawing the pie chart
                const centerX = chartAreaX + chartAreaWidth / 2;
                const centerY = chartAreaY + chartAreaHeight / 2;
                const radius = Math.min(chartAreaWidth, chartAreaHeight) / 2 - 20;

                // Calculating the sum of the values
                const sum = data.reduce((acc: number, val: number) => acc + val, 0);

                if (sum > 0) {
                    // Set starting angle (always consistent regardless of RTL/LTR)
                    let currentAngle = -Math.PI / 2; // Starting from top (12 o'clock position)

                    // Drawing the segments
                    for (let i = 0; i < data.length; i++) {
                        if (data[i] <= 0) continue; // Skip zero or negative values

                        // Calculate angles for the segment
                        const startAngle = currentAngle;
                        const portionAngle = (data[i] / sum) * 2 * Math.PI;
                        const endAngle = currentAngle + portionAngle;

                        // Choose color
                        let segmentColor = '#4285F4';
                        if (Array.isArray(dataset.backgroundColor)) {
                            segmentColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                        }

                        // Draw pie segment using paths (not arc which doesn't exist in PDFKit type)
                        doc.save();
                        doc.fillColor(segmentColor);

                        // Move to center
                        doc.moveTo(centerX, centerY);

                        // Draw arc path manually using multiple small lines
                        const steps = 40; // More steps for smoother curve
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
                        doc.restore();

                        // Update current angle for next segment
                        currentAngle = endAngle;
                    }
                }

                // Adding the legend with RTL support
                const legendY = chartAreaY + chartAreaHeight - (data.length * 15) - 5;

                for (let i = 0; i < data.length && i < labels.length; i++) {
                    if (data[i] <= 0) continue; // Skip zero or negative values

                    // Calculate percentage
                    const percentage = Math.round((data[i] / sum) * 100);

                    // Select color
                    let legendColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        legendColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    }

                    // Adjust positioning based on text direction
                    const squareX = isRTL ? centerX + radius - 15 : centerX - radius + 5;
                    const textX = isRTL ? centerX + radius - 30 : centerX - radius + 20;

                    // Draw color square
                    doc.fillColor(legendColor)
                        .rect(squareX, legendY + (i * 15), 10, 10)
                        .fill();

                    // Create legend text with RTL support - use proper formatting for RTL
                    let legendTextContent;
                    if (isRTL) {
                        legendTextContent = prepareText(`${percentage}% :${labels[i]} (${data[i]})`, isRTL);
                    } else {
                        legendTextContent = prepareText(`${labels[i]}: ${data[i]} (${percentage}%)`, isRTL);
                    }

                    // Render legend text
                    doc.fillColor('#000000')
                        .fontSize(9)
                        .text(legendTextContent, textX, legendY + (i * 15), {
                            width: radius * 2 - 30,
                            align: isRTL ? 'right' : 'left'
                        });
                }
            }
        }

        // Restoring the state after drawing the chart
        doc.restore();
    } catch (error) {
        console.error('Error rendering chart:', error);
        // Display a placeholder for the failed chart
        doc.rect(position.x, position.y, style?.width || 400, style?.height || 300)
            .stroke()
            .fontSize(12)
            .text('Chart Error', position.x + (style?.width || 400) / 2 - 30, position.y + (style?.height || 300) / 2 - 10);
    }
};