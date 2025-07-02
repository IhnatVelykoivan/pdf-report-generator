// frontend/src/pages/PDFPreviewPage.tsx

import { useEffect, useState } from 'react';
import { useConversation } from '../context/ConversationContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/Layout';
import MobilePDFViewer from '../components/MobilePDFViewer';

const PDFPreviewPage = () => {
    const { state } = useConversation();
    const navigate = useNavigate();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { language } = useLanguage();

    // Переводы для страницы предпросмотра
    const translations = {
        ru: {
            noReports: 'Нет созданных отчётов',
            startCreating: 'Начните с создания отчёта в чате с ИИ помощником',
            createReport: 'Создать отчёт',
            previewTitle: 'Предварительный просмотр PDF',
            previewSubtitle: 'Ваш отчёт готов для просмотра и скачивания',
            createNew: 'Создать новый',
            downloadPdf: 'Скачать PDF',
            generating: 'Генерируем PDF...',
            error: 'Ошибка при создании PDF',
            tryAgain: 'Попробовать снова',
            fileSize: 'Размер файла:',
            created: 'Создан:',
            fileType: 'Тип:',
            pdfNotCreated: 'PDF ещё не создан',
            returnToChat: 'Вернитесь в чат и нажмите кнопку "Создать PDF" для генерации отчёта',
            backToChat: 'Вернуться в чат',
            dslStructure: 'DSL Structure (Debug)'
        },
        en: {
            noReports: 'No reports created',
            startCreating: 'Start by creating a report in the AI assistant chat',
            createReport: 'Create Report',
            previewTitle: 'PDF Preview',
            previewSubtitle: 'Your report is ready for preview and download',
            createNew: 'Create New',
            downloadPdf: 'Download PDF',
            generating: 'Generating PDF...',
            error: 'Error creating PDF',
            tryAgain: 'Try Again',
            fileSize: 'File Size:',
            created: 'Created:',
            fileType: 'Type:',
            pdfNotCreated: 'PDF not created yet',
            returnToChat: 'Return to chat and click "Create PDF" to generate the report',
            backToChat: 'Back to Chat',
            dslStructure: 'DSL Structure (Debug)'
        },
        ar: {
            noReports: 'لا توجد تقارير',
            startCreating: 'ابدأ بإنشاء تقرير في محادثة مساعد الذكاء الاصطناعي',
            createReport: 'إنشاء تقرير',
            previewTitle: 'معاينة PDF',
            previewSubtitle: 'تقريرك جاهز للمعاينة والتنزيل',
            createNew: 'إنشاء جديد',
            downloadPdf: 'تحميل PDF',
            generating: 'جاري إنشاء PDF...',
            error: 'خطأ في إنشاء PDF',
            tryAgain: 'حاول مرة أخرى',
            fileSize: 'حجم الملف:',
            created: 'تم الإنشاء:',
            fileType: 'النوع:',
            pdfNotCreated: 'لم يتم إنشاء PDF بعد',
            returnToChat: 'ارجع إلى المحادثة واضغط على "إنشاء PDF" لإنشاء التقرير',
            backToChat: 'العودة إلى المحادثة',
            dslStructure: 'هيكل DSL (تصحيح)'
        }
    };

    const t = translations[language];

    useEffect(() => {
        // Определяем, мобильное ли устройство
        const checkMobile = () => {
            const width = window.innerWidth;
            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            setIsMobile(width <= 768 || isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Если есть готовый PDF blob в состоянии
        if (state.pdfBlob) {
            const url = URL.createObjectURL(state.pdfBlob);
            setPdfUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [state.pdfBlob]);

    const handleDownload = () => {
        if (state.pdfBlob) {
            const url = URL.createObjectURL(state.pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            const reportName = language === 'en' ? 'report' : language === 'ar' ? 'تقرير' : 'отчет';
            link.download = `${reportName}-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const handleCreateNew = () => {
        navigate('/conversation');
    };

    // Если нет PDF и нет данных DSL
    if (!state.pdfBlob && !state.generatedDSL && !state.messages.length) {
        return (
            <div className="preview-container">
                <div className="preview-empty">
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h2>{t.noReports}</h2>
                        <p>{t.startCreating}</p>
                        <button className="create-report-btn" onClick={handleCreateNew}>
                            💬 {t.createReport}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-container">
            <div className="preview-header">
                <div className="preview-title">
                    <h1>📄 {t.previewTitle}</h1>
                    <p>{t.previewSubtitle}</p>
                </div>

                <div className="preview-actions">
                    <button
                        className="action-btn secondary"
                        onClick={handleCreateNew}
                    >
                        ✨ {t.createNew}
                    </button>
                    {!isMobile && (
                        <button
                            className="action-btn primary"
                            onClick={handleDownload}
                            disabled={!state.pdfBlob}
                        >
                            💾 {t.downloadPdf}
                        </button>
                    )}
                </div>
            </div>

            <div className="preview-content">
                {state.isLoading && (
                    <div className="preview-loading">
                        <div className="loading-spinner"></div>
                        <p>{t.generating}</p>
                    </div>
                )}

                {state.error && (
                    <div className="preview-error">
                        <div className="error-icon">❌</div>
                        <h3>{t.error}</h3>
                        <p>{state.error}</p>
                        <button className="retry-btn" onClick={handleCreateNew}>
                            🔄 {t.tryAgain}
                        </button>
                    </div>
                )}

                {state.pdfBlob && (
                    <>
                        {isMobile ? (
                            // Мобильная версия
                            <MobilePDFViewer
                                pdfBlob={state.pdfBlob}
                                fileSize={state.pdfBlob.size}
                                language={language}
                            />
                        ) : (
                            // Десктопная версия с iframe
                            <div className="pdf-viewer">
                                <div className="pdf-frame">
                                    {pdfUrl && (
                                        <iframe
                                            src={pdfUrl}
                                            width="100%"
                                            height="800px"
                                            title="PDF Preview"
                                            style={{ border: 'none' }}
                                        />
                                    )}
                                </div>

                                <div className="pdf-info">
                                    <div className="info-item">
                                        <span className="info-label">📊 {t.fileSize}</span>
                                        <span className="info-value">
                                            {(state.pdfBlob.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">📅 {t.created}</span>
                                        <span className="info-value">
                                            {new Date().toLocaleString(language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'ru-RU')}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">🔧 {t.fileType}</span>
                                        <span className="info-value">PDF Document</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {!state.pdfBlob && state.messages.length > 0 && (
                    <div className="preview-placeholder">
                        <div className="placeholder-content">
                            <div className="placeholder-icon">⏳</div>
                            <h3>{t.pdfNotCreated}</h3>
                            <p>{t.returnToChat}</p>
                            <button className="back-to-chat-btn" onClick={handleCreateNew}>
                                💬 {t.backToChat}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Информация о DSL структуре для отладки */}
            {state.generatedDSL && process.env.NODE_ENV === 'development' && (
                <div className="debug-info">
                    <details>
                        <summary>🔧 {t.dslStructure}</summary>
                        <pre>{JSON.stringify(state.generatedDSL, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default PDFPreviewPage;