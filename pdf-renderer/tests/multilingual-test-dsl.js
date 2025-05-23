const multilingualTestDSL = {
    template: "default",
    defaultFont: "DejaVuSans",
    defaultDirection: "ltr",
    pages: [
        {
            elements: [
                {
                    type: "text",
                    content: "Multilingual PDF Document",
                    position: { x: 50, y: 100 }, // Start below template header
                    style: {
                        fontSize: 24,
                        color: "#2C3E50",
                        font: "DejaVuSans-Bold",
                        width: 495 // Limit width
                    }
                },
                {
                    type: "text",
                    content: "English (Left-to-Right)",
                    position: { x: 50, y: 140 },
                    style: {
                        fontSize: 16,
                        color: "#34495E",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "This is a test document that demonstrates multilingual support in our PDF Renderer Service. The service supports both left-to-right languages like English and right-to-left languages like Arabic.",
                    position: { x: 50, y: 170 },
                    style: {
                        fontSize: 12,
                        color: "#2C3E50",
                        width: 495,
                        lineBreak: true
                    }
                },
                {
                    type: "text",
                    content: "العربية (من اليمين إلى اليسار)",
                    position: { x: 50, y: 230 },
                    style: {
                        fontSize: 16,
                        color: "#E74C3C",
                        direction: "rtl",
                        font: "DejaVuSans-Bold",
                        width: 495,
                        align: "right"
                    }
                },
                {
                    type: "text",
                    content: "هذه وثيقة اختبار توضح دعم اللغات المتعددة في خدمة عرض PDF الخاصة بنا. تدعم الخدمة كلاً من اللغات من اليسار إلى اليمين مثل الإنجليزية واللغات من اليمين إلى اليسار مثل العربية.",
                    position: { x: 50, y: 260 },
                    style: {
                        fontSize: 12,
                        color: "#8E44AD",
                        width: 495,
                        direction: "rtl",
                        font: "DejaVuSans",
                        align: "right",
                        lineBreak: true
                    }
                },
                {
                    type: "text",
                    content: "Mixed Content / محتوى مختلط",
                    position: { x: 50, y: 340 },
                    style: {
                        fontSize: 16,
                        color: "#16A085",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "This document contains both English (LTR) and Arabic (RTL) text. هذه الوثيقة تحتوي على نص إنجليزي (من اليسار إلى اليمين) وعربي (من اليمين إلى اليسار).",
                    position: { x: 50, y: 370 },
                    style: {
                        fontSize: 12,
                        color: "#2C3E50",
                        width: 495,
                        lineBreak: true
                    }
                },
                {
                    type: "chart",
                    content: {
                        type: "bar",
                        title: "Sales Data",
                        data: {
                            labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                            datasets: [{
                                label: "Sales 2023",
                                data: [12, 19, 8, 5, 15],
                                backgroundColor: [
                                    '#E74C3C',
                                    '#3498DB',
                                    '#F39C12',
                                    '#27AE60',
                                    '#9B59B6'
                                ],
                                borderColor: [
                                    '#C0392B',
                                    '#2980B9',
                                    '#E67E22',
                                    '#229954',
                                    '#8E44AD'
                                ],
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: false,
                            animation: false
                        }
                    },
                    position: { x: 50, y: 430 },
                    style: {
                        width: 495,
                        height: 250, // Reduced height
                        backgroundColor: "#FFFFFF",
                        borderColor: "#BDC3C7"
                    }
                }
            ],
            style: {
                size: "a4",
                margin: { top: 70, bottom: 70, left: 50, right: 50 },
                backgroundColor: "#FAFAFA"
            }
        },
        // Second page - OPTIMIZED
        {
            elements: [
                {
                    type: "text",
                    content: "الصفحة الثانية",
                    position: { x: 50, y: 100 },
                    style: {
                        fontSize: 22,
                        color: "#8E44AD",
                        direction: "rtl",
                        font: "DejaVuSans-Bold",
                        width: 495,
                        align: "right"
                    }
                },
                {
                    type: "text",
                    content: "هذه الصفحة تحتوي على محتوى عربي مع رسوم بيانية.",
                    position: { x: 50, y: 135 },
                    style: {
                        fontSize: 14,
                        color: "#2C3E50",
                        width: 495,
                        direction: "rtl",
                        font: "DejaVuSans",
                        align: "right",
                        lineBreak: true
                    }
                },
                {
                    type: "chart",
                    content: {
                        type: "line",
                        title: "النشاط الأسبوعي",
                        textDirection: "rtl",
                        data: {
                            labels: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
                            datasets: [{
                                label: "النشاط اليومي",
                                data: [65, 59, 80, 81, 56, 55, 40],
                                borderColor: '#E74C3C',
                                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                                borderWidth: 3
                            }]
                        },
                        options: {
                            rtl: true,
                            responsive: false,
                            animation: false,
                            font: {
                                family: 'DejaVuSans'
                            }
                        }
                    },
                    position: { x: 50, y: 170 },
                    style: {
                        width: 495,
                        height: 180, // Reduced height
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E74C3C"
                    }
                },
                {
                    type: "chart",
                    content: {
                        type: "pie",
                        title: "توزيع الألوان",
                        textDirection: "rtl",
                        data: {
                            labels: ["أحمر", "أزرق", "أخضر", "أصفر", "بنفسجي"],
                            datasets: [{
                                data: [120, 80, 150, 60, 90],
                                backgroundColor: [
                                    '#E74C3C',
                                    '#3498DB',
                                    '#27AE60',
                                    '#F1C40F',
                                    '#9B59B6'
                                ],
                                borderColor: [
                                    '#C0392B',
                                    '#2980B9',
                                    '#229954',
                                    '#F39C12',
                                    '#8E44AD'
                                ],
                                borderWidth: 2
                            }]
                        },
                        options: {
                            rtl: true,
                            responsive: false,
                            animation: false,
                            font: {
                                family: 'DejaVuSans'
                            }
                        }
                    },
                    position: { x: 50, y: 370 },
                    style: {
                        width: 495,
                        height: 270, // Compact height to fit on the page
                        backgroundColor: "#FFFFFF",
                        borderColor: "#27AE60"
                    }
                }
            ],
            style: {
                size: "a4",
                margin: { top: 70, bottom: 70, left: 50, right: 50 },
                backgroundColor: "#F8F9FA"
            }
        }
    ]
};

module.exports = multilingualTestDSL;