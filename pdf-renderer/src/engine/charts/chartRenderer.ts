import PDFDocument from 'pdfkit';

/*** Renders a chart to the PDF document*/


export const renderChart = async (
    doc: PDFKit.PDFDocument,
    chartData: any,
    position: { x: number, y: number },
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
            .fillAndStroke(style?.backgroundColor || '#f0f0f0', style?.borderColor || '#cccccc');

        // Drawing the chart title
        if (chartData.title) {
            doc.fontSize(16)
                .fillColor('#000000')
                .text(chartData.title, position.x + width / 2, position.y + 20, {
                    width: width,
                    align: 'center'
                });
        }

        // Drawing the chart type
        const typeLabelY = chartData.title ? position.y + 45 : position.y + 20;
        doc.fontSize(14)
            .fillColor('#333333')
            .text(`${chartData.type?.toUpperCase() || 'BAR'} Chart`, position.x + width / 2, typeLabelY, {
                width: width,
                align: 'center'
            });

        // Rendering the chart data
        const dataY = chartData.title ? position.y + 80 : position.y + 50;

        if (chartData.data?.datasets && chartData.data.datasets.length > 0) {
            const dataset = chartData.data.datasets[0];
            const data = dataset.data || [];
            const labels = chartData.data.labels || [];
            const maxValue = Math.max(...data, 1); // Предотвращаем деление на ноль

            doc.fontSize(12)
                .fillColor('#333333')
                .text(`Dataset: ${dataset.label || 'Unnamed dataset'}`, position.x + 20, dataY);

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
                    const barX = chartAreaX + (i * barSpacing) + (barSpacing - barWidth) / 2;
                    const barY = chartAreaY + chartAreaHeight - barHeight;

                    // Choosing the color
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

                    // Adding the label
                    doc.fontSize(8)
                        .fillColor('#000000')
                        .text(labels[i], barX, chartAreaY + chartAreaHeight + 5, {
                            width: barWidth,
                            align: 'center'
                        });

                    // Adding the value above the bar
                    doc.text(value.toString(), barX, barY - 15, {
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

                // Starting to draw the line
                doc.strokeColor(lineColor)
                    .lineWidth(2)
                    .moveTo(chartAreaX, chartAreaY + chartAreaHeight - (data[0] / maxValue) * chartAreaHeight);

                // Connecting the points
                for (let i = 1; i < data.length; i++) {
                    const pointX = chartAreaX + i * pointSpacing;
                    const pointY = chartAreaY + chartAreaHeight - (data[i] / maxValue) * chartAreaHeight;
                    doc.lineTo(pointX, pointY);
                }

                // Completing the line
                doc.stroke();

                // Adding X-axis labels
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    const pointX = chartAreaX + i * pointSpacing;

                    doc.fontSize(8)
                        .fillColor('#000000')
                        .text(labels[i], pointX, chartAreaY + chartAreaHeight + 5, {
                            width: pointSpacing,
                            align: 'center'
                        });
                }
            } else if (chartData.type === 'pie' && data.length > 0) {
                // Drawing the pie chart
                const centerX = chartAreaX + chartAreaWidth / 2;
                const centerY = chartAreaY + chartAreaHeight / 2;
                const radius = Math.min(chartAreaWidth, chartAreaHeight) / 2 - 10;

                // Calculating the sum of the values
                const sum = data.reduce((acc: number, val: number) => acc + val, 0);

                // Starting angle
                let currentAngle = 0;

                // Drawing the segments
                for (let i = 0; i < data.length; i++) {
                    // Calculating the angles for the segments
                    const portionAngle = (data[i] / sum) * 2 * Math.PI;

                    // Choosing the color
                    let segmentColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        segmentColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    }

                    // Drawing the segment – replacing arc with a more complex, but supported PDFKit geometry
                    doc.fillColor(segmentColor);
                    doc.moveTo(centerX, centerY);

                    // Using lines instead of arc to draw the circle segment
                    const stepCount = 20; // Number of steps for approximating the arc
                    const angleStep = portionAngle / stepCount;

                    for (let step = 0; step <= stepCount; step++) {
                        const angle = currentAngle + step * angleStep;
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;

                        if (step === 0) {
                            doc.lineTo(x, y);
                        } else {
                            doc.lineTo(x, y);
                        }
                    }

                    doc.lineTo(centerX, centerY);
                    doc.fill();

                    // Updating the angle
                    currentAngle += portionAngle;
                }

                // Adding the legend
                let legendY = chartAreaY + chartAreaHeight + 20;
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    // Selecting the color
                    let legendColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        legendColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    }

                    // Drawing a colored square
                    doc.fillColor(legendColor)
                        .rect(position.x + 20, legendY, 10, 10)
                        .fill();

                    // Adding the legend text
                    const percentage = Math.round((data[i] / sum) * 100);
                    doc.fillColor('#000000')
                        .fontSize(8)
                        .text(`${labels[i]}: ${data[i]} (${percentage}%)`, position.x + 35, legendY);

                    legendY += 15;
                }
            }
        }

        // Restoring the state after drawing the chart
        doc.restore();
    } catch (error) {
        console.error('Error rendering chart:', error);
        // Displaying a placeholder for the failed chart
        doc.rect(position.x, position.y, 400, 300)
            .stroke()
            .fontSize(12)
            .text('Chart Error', position.x + 160, position.y + 140);
    }
};