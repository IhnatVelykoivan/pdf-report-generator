// frontend/src/components/MobilePDFViewer.tsx

import { useState, useEffect } from 'react';

interface MobilePDFViewerProps {
    pdfBlob: Blob;
    fileSize: number;
    language: 'ru' | 'en' | 'ar';
}

const MobilePDFViewer = ({ pdfBlob, fileSize, language }: MobilePDFViewerProps) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [pdfBlob]);

    const translations = {
        ru: {
            title: 'PDF готов к скачиванию',
            description: 'На мобильных устройствах PDF открывается в отдельном приложении',
            downloadBtn: 'Скачать PDF',
            openBtn: 'Открыть PDF',
            shareBtn: 'Поделиться',
            fileSize: 'Размер файла',
            created: 'Создан',
            downloading: 'Загрузка...',
            downloadComplete: 'Загрузка завершена!'
        },
        en: {
            title: 'PDF is ready',
            description: 'On mobile devices, PDF opens in a separate app',
            downloadBtn: 'Download PDF',
            openBtn: 'Open PDF',
            shareBtn: 'Share',
            fileSize: 'File size',
            created: 'Created',
            downloading: 'Downloading...',
            downloadComplete: 'Download complete!'
        },
        ar: {
            title: 'PDF جاهز للتنزيل',
            description: 'على الأجهزة المحمولة، يتم فتح PDF في تطبيق منفصل',
            downloadBtn: 'تحميل PDF',
            openBtn: 'فتح PDF',
            shareBtn: 'مشاركة',
            fileSize: 'حجم الملف',
            created: 'تم الإنشاء',
            downloading: 'جاري التحميل...',
            downloadComplete: 'اكتمل التحميل!'
        }
    };

    const t = translations[language];

    const handleDownload = () => {
        if (!pdfUrl) return;

        setIsDownloading(true);

        const link = document.createElement('a');
        link.href = pdfUrl;
        const reportName = language === 'en' ? 'report' : language === 'ar' ? 'تقرير' : 'отчет';
        link.download = `${reportName}-${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Показываем сообщение об успешной загрузке
        setTimeout(() => {
            setIsDownloading(false);
        }, 2000);
    };

    const handleOpen = () => {
        if (!pdfUrl) return;

        // Открываем PDF в новой вкладке
        window.open(pdfUrl, '_blank');
    };

    return (
        <div className="mobile-pdf-viewer">
            <div className="pdf-preview-card">
                <div className="pdf-icon">
                    📄
                </div>

                <h2 className="pdf-title">{t.title}</h2>
                <p className="pdf-description">{t.description}</p>

                <div className="pdf-info-grid">
                    <div className="pdf-info-item">
                        <span className="info-icon">📊</span>
                        <span className="info-label">{t.fileSize}</span>
                        <span className="info-value">{(fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="pdf-info-item">
                        <span className="info-icon">📅</span>
                        <span className="info-label">{t.created}</span>
                        <span className="info-value">{new Date().toLocaleDateString(
                            language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'ru-RU'
                        )}</span>
                    </div>
                </div>

                <div className="pdf-actions">
                    <button
                        className="pdf-action-btn primary"
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <>
                                <span className="loading-spinner-inline"></span>
                                {t.downloading}
                            </>
                        ) : (
                            <>
                                💾 {t.downloadBtn}
                            </>
                        )}
                    </button>

                    <button
                        className="pdf-action-btn secondary"
                        onClick={handleOpen}
                    >
                        👁️ {t.openBtn}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default MobilePDFViewer;