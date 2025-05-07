import PDFDocument from 'pdfkit';

/**
 * Renders a chart to the PDF document
 */
export const renderChart = async (
    doc: PDFKit.PDFDocument,
    chartData: any,
    position: { x: number, y: number },
    style: any = {}
): Promise<void> => {
    try {
        // Сохраняем текущее состояние перед рисованием графика
        doc.save();

        // Устанавливаем размеры
        const width = style?.width || 400;
        const height = style?.height || 300;

        // Рисуем прямоугольник для фона графика
        doc.rect(position.x, position.y, width, height)
            .fillAndStroke(style?.backgroundColor || '#f0f0f0', style?.borderColor || '#cccccc');

        // Рисуем заголовок графика
        if (chartData.title) {
            doc.fontSize(16)
                .fillColor('#000000')
                .text(chartData.title, position.x + width / 2, position.y + 20, {
                    width: width,
                    align: 'center'
                });
        }

        // Рисуем тип графика
        const typeLabelY = chartData.title ? position.y + 45 : position.y + 20;
        doc.fontSize(14)
            .fillColor('#333333')
            .text(`${chartData.type?.toUpperCase() || 'BAR'} Chart`, position.x + width / 2, typeLabelY, {
                width: width,
                align: 'center'
            });

        // Отображаем данные графика
        const dataY = chartData.title ? position.y + 80 : position.y + 50;

        if (chartData.data?.datasets && chartData.data.datasets.length > 0) {
            const dataset = chartData.data.datasets[0];
            const data = dataset.data || [];
            const labels = chartData.data.labels || [];
            const maxValue = Math.max(...data, 1); // Предотвращаем деление на ноль

            doc.fontSize(12)
                .fillColor('#333333')
                .text(`Dataset: ${dataset.label || 'Unnamed dataset'}`, position.x + 20, dataY);

            // Определяем область для графика
            const chartAreaX = position.x + 60;
            const chartAreaY = dataY + 30;
            const chartAreaWidth = width - 80;
            const chartAreaHeight = height - (chartAreaY - position.y) - 30;

            // Рисуем оси
            doc.strokeColor('#333333')
                .lineWidth(1)
                .moveTo(chartAreaX, chartAreaY)
                .lineTo(chartAreaX, chartAreaY + chartAreaHeight)
                .lineTo(chartAreaX + chartAreaWidth, chartAreaY + chartAreaHeight)
                .stroke();

            // Рисуем график в зависимости от типа
            if (chartData.type === 'bar' && data.length > 0) {
                const barWidth = Math.min(30, (chartAreaWidth / data.length) * 0.7);
                const barSpacing = (chartAreaWidth / data.length);

                // Рисуем полосы
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    const value = data[i];
                    const barHeight = (value / maxValue) * chartAreaHeight;
                    const barX = chartAreaX + (i * barSpacing) + (barSpacing - barWidth) / 2;
                    const barY = chartAreaY + chartAreaHeight - barHeight;

                    // Выбираем цвет
                    let barColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        barColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    } else if (typeof dataset.backgroundColor === 'string') {
                        barColor = dataset.backgroundColor;
                    }

                    // Рисуем полосу
                    doc.fillColor(barColor)
                        .rect(barX, barY, barWidth, barHeight)
                        .fill();

                    // Добавляем метку
                    doc.fontSize(8)
                        .fillColor('#000000')
                        .text(labels[i], barX, chartAreaY + chartAreaHeight + 5, {
                            width: barWidth,
                            align: 'center'
                        });

                    // Добавляем значение над полосой
                    doc.text(value.toString(), barX, barY - 15, {
                        width: barWidth,
                        align: 'center'
                    });
                }
            } else if (chartData.type === 'line' && data.length > 0) {
                // Рисуем линейный график
                const pointSpacing = chartAreaWidth / (data.length - 1 || 1);

                // Устанавливаем цвет линии
                let lineColor = '#FF5722';
                if (dataset.borderColor) {
                    lineColor = typeof dataset.borderColor === 'string'
                        ? dataset.borderColor
                        : dataset.borderColor[0] || '#FF5722';
                }

                // Начинаем рисовать линию
                doc.strokeColor(lineColor)
                    .lineWidth(2)
                    .moveTo(chartAreaX, chartAreaY + chartAreaHeight - (data[0] / maxValue) * chartAreaHeight);

                // Соединяем точки
                for (let i = 1; i < data.length; i++) {
                    const pointX = chartAreaX + i * pointSpacing;
                    const pointY = chartAreaY + chartAreaHeight - (data[i] / maxValue) * chartAreaHeight;
                    doc.lineTo(pointX, pointY);
                }

                // Завершаем линию
                doc.stroke();

                // Добавляем метки оси X
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
                // Рисуем круговую диаграмму
                const centerX = chartAreaX + chartAreaWidth / 2;
                const centerY = chartAreaY + chartAreaHeight / 2;
                const radius = Math.min(chartAreaWidth, chartAreaHeight) / 2 - 10;

                // Рассчитываем сумму значений
                const sum = data.reduce((acc: number, val: number) => acc + val, 0);

                // Начальный угол
                let currentAngle = 0;

                // Рисуем сегменты
                for (let i = 0; i < data.length; i++) {
                    // Рассчитываем углы для сегмента
                    const portionAngle = (data[i] / sum) * 2 * Math.PI;

                    // Выбираем цвет
                    let segmentColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        segmentColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    }

                    // Рисуем сегмент - заменяем arc на более сложную, но поддерживаемую PDFKit геометрию
                    doc.fillColor(segmentColor);
                    doc.moveTo(centerX, centerY);

                    // Вместо arc используем линии для рисования сегмента круга
                    const stepCount = 20; // количество шагов для аппроксимации дуги
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

                    // Обновляем угол
                    currentAngle += portionAngle;
                }

                // Добавляем легенду
                let legendY = chartAreaY + chartAreaHeight + 20;
                for (let i = 0; i < data.length && i < labels.length; i++) {
                    // Выбираем цвет
                    let legendColor = '#4285F4';
                    if (Array.isArray(dataset.backgroundColor)) {
                        legendColor = dataset.backgroundColor[i % dataset.backgroundColor.length];
                    }

                    // Рисуем цветной квадрат
                    doc.fillColor(legendColor)
                        .rect(position.x + 20, legendY, 10, 10)
                        .fill();

                    // Добавляем текст легенды
                    const percentage = Math.round((data[i] / sum) * 100);
                    doc.fillColor('#000000')
                        .fontSize(8)
                        .text(`${labels[i]}: ${data[i]} (${percentage}%)`, position.x + 35, legendY);

                    legendY += 15;
                }
            }
        }

        // Восстанавливаем состояние после рисования графика
        doc.restore();
    } catch (error) {
        console.error('Error rendering chart:', error);
        // Выводим заполнитель для неудачного графика
        doc.rect(position.x, position.y, 400, 300)
            .stroke()
            .fontSize(12)
            .text('Chart Error', position.x + 160, position.y + 140);
    }
};