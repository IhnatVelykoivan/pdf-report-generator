const multilingualTestDSL = {
    template: "default",
    defaultFont: "NotoSansArabic", // Setting a font that supports both Arabic and English
    pages: [
        {
            elements: [
                {
                    type: "text",
                    content: "Multilingual PDF Document",
                    position: { x: 50, y: 50 },
                    style: {
                        fontSize: 24,
                        color: "#000000",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "English (Left-to-Right)",
                    position: { x: 50, y: 90 },
                    style: {
                        fontSize: 16,
                        color: "#333333",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "This is a test document that demonstrates multilingual support in our PDF Renderer Service. The service supports both left-to-right languages like English and right-to-left languages like Arabic.",
                    position: { x: 50, y: 120 },
                    style: {
                        fontSize: 12,
                        color: "#333333",
                        width: 500
                    }
                },
                {
                    type: "text",
                    content: "العربية (من اليمين إلى اليسار)",
                    position: { x: 50, y: 200 },
                    style: {
                        fontSize: 16,
                        color: "#333333",
                        direction: "rtl",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "هذه وثيقة اختبار توضح دعم اللغات المتعددة في خدمة عرض PDF الخاصة بنا. تدعم الخدمة كلاً من اللغات من اليسار إلى اليمين مثل الإنجليزية واللغات من اليمين إلى اليسار مثل العربية.",
                    position: { x: 50, y: 230 },
                    style: {
                        fontSize: 12,
                        color: "#333333",
                        width: 500,
                        direction: "rtl",
                        font: "DejaVuSans"
                    }
                },
                {
                    type: "text",
                    content: "Mixed Content / محتوى مختلط",
                    position: { x: 50, y: 310 },
                    style: {
                        fontSize: 16,
                        color: "#333333",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "This document contains both English (LTR) and Arabic (RTL) text. هذه الوثيقة تحتوي على نص إنجليزي (من اليسار إلى اليمين) وعربي (من اليمين إلى اليسار).",
                    position: { x: 50, y: 340 },
                    style: {
                        fontSize: 12,
                        color: "#333333",
                        width: 500
                    }
                },
                {
                    type: "chart",
                    content: {
                        type: "bar",
                        title: "Sales Data / بيانات المبيعات",
                        data: {
                            labels: ["Jan/يناير", "Feb/فبراير", "Mar/مارس", "Apr/أبريل", "May/مايو"],
                            datasets: [{
                                label: "Sales 2023 / مبيعات ٢٠٢٣",
                                data: [12, 19, 3, 5, 2],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)'
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)'
                                ],
                                borderWidth: 1
                            }]
                        }
                    },
                    position: { x: 50, y: 400 },
                    style: {
                        width: 500,
                        height: 300
                    }
                }
            ],
            style: {
                size: "a4",
                margin: 50
            }
        },
        // Second page with Arabic content
        {
            elements: [
                {
                    type: "text",
                    content: "الصفحة الثانية",
                    position: { x: 50, y: 50 },
                    style: {
                        fontSize: 24,
                        color: "#000000",
                        direction: "rtl",
                        font: "DejaVuSans-Bold"
                    }
                },
                {
                    type: "text",
                    content: "هذه هي الصفحة الثانية من الوثيقة التي تحتوي على نص عربي. نحن نختبر دعم الصفحات المتعددة مع اللغة العربية.",
                    position: { x: 50, y: 90 },
                    style: {
                        fontSize: 12,
                        color: "#333333",
                        width: 500,
                        direction: "rtl",
                        font: "DejaVuSans"
                    }
                },
                {
                    type: "chart",
                    content: {
                        type: "line",
                        title: "مخطط خطي للبيانات العربية",
                        textDirection: "rtl", // Setting RTL for chart title
                        data: {
                            labels: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
                            datasets: [{
                                label: "النشاط اليومي",
                                data: [65, 59, 80, 81, 56, 55, 40],
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)'
                            }]
                        },
                        options: {
                            rtl: true, // Enable RTL for chart
                            font: {
                                family: 'DejaVuSans' // Specify font for Arabic
                            }
                        }
                    },
                    position: { x: 50, y: 150 },
                    style: {
                        width: 500,
                        height: 300
                    }
                },
                {
                    type: "chart",
                    content: {
                        type: "pie",
                        title: "الرسم البياني الدائري",
                        textDirection: "rtl",
                        data: {
                            labels: ["أحمر", "أزرق", "أصفر", "أخضر", "بنفسجي"],
                            datasets: [{
                                data: [300, 50, 100, 40, 120],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.7)',
                                    'rgba(54, 162, 235, 0.7)',
                                    'rgba(255, 206, 86, 0.7)',
                                    'rgba(75, 192, 192, 0.7)',
                                    'rgba(153, 102, 255, 0.7)'
                                ]
                            }]
                        },
                        options: {
                            rtl: true,
                            font: {
                                family: 'DejaVuSans'
                            }
                        }
                    },
                    position: { x: 50, y: 470 },
                    style: {
                        width: 400,
                        height: 300
                    }
                }
            ],
            style: {
                size: "a4",
                margin: 50
            }
        }
    ]
};

module.exports = multilingualTestDSL;