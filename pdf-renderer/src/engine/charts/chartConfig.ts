/*** Configuration for chart rendering*/


export interface ChartConfig {
    type: string;
    data: {
        labels: string[];
        datasets: Array<{
            label?: string;
            data: number[];
            backgroundColor?: string | string[];
            borderColor?: string | string[];
            borderWidth?: number;
            [key: string]: any;
        }>;
    };
    options: {
        responsive?: boolean;
        animation?: boolean | { duration: number };
        scales?: {
            y?: {
                beginAtZero?: boolean;
            };
        };
        [key: string]: any;
    };
}

/*** Creates a default chart configuration*/


export const createDefaultChartConfig = (): ChartConfig => {
    return {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: 'Sample Data',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
};