// frontend/src/pages/PDFPreviewPage.tsx

import { useEffect, useState } from 'react';
import { useConversation } from '../context/ConversationContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/Layout';
import MobilePDFViewer from '../components/MobilePDFViewer';
import JsonEditor from '../components/JsonEditor';
import { simplePdfApiService } from '../services/pdfApi';

const PDFPreviewPage = () => {
    const { state, dispatch } = useConversation();
    const navigate = useNavigate();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDSL, setCurrentDSL] = useState<any>(null);
    const [isApplying, setIsApplying] = useState(false);
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
            edit: 'Редактировать',
            apply: 'Применить',
            cancel: 'Отмена',
            downloadPdf: 'Скачать PDF',
            generating: 'Генерируем PDF...',
            applying: 'Применяем изменения...',
            error: 'Ошибка при создании PDF',
            tryAgain: 'Попробовать снова',
            fileSize: 'Размер файла:',
            created: 'Создан:',
            fileType: 'Тип:',
            pdfNotCreated: 'PDF ещё не создан',
            returnToChat: 'Вернитесь в чат и нажмите кнопку "Создать PDF" для генерации отчёта',
            backToChat: 'Вернуться в чат',
            dslStructure: 'DSL Structure (Debug)',
            editMode: 'Режим редактирования DSL'
        },
        en: {
            noReports: 'No reports created',
            startCreating: 'Start by creating a report in the AI assistant chat',
            createReport: 'Create Report',
            previewTitle: 'PDF Preview',
            previewSubtitle: 'Your report is ready for preview and download',
            createNew: 'Create New',
            edit: 'Edit',
            apply: 'Apply',
            cancel: 'Cancel',
            downloadPdf: 'Download PDF',
            generating: 'Generating PDF...',
            applying: 'Applying changes...',
            error: 'Error creating PDF',
            tryAgain: 'Try Again',
            fileSize: 'File Size:',
            created: 'Created:',
            fileType: 'Type:',
            pdfNotCreated: 'PDF not created yet',
            returnToChat: 'Return to chat and click "Create PDF" to generate the report',
            backToChat: 'Back to Chat',
            dslStructure: 'DSL Structure (Debug)',
            editMode: 'DSL Edit Mode'
        },
        ar: {
            noReports: 'لا توجد تقارير',
            startCreating: 'ابدأ بإنشاء تقرير في محادثة مساعد الذكاء الاصطناعي',
            createReport: 'إنشاء تقرير',
            previewTitle: 'معاينة PDF',
            previewSubtitle: 'تقريرك جاهز للمعاينة والتنزيل',
            createNew: 'إنشاء جديد',
            edit: 'تحرير',
            apply: 'تطبيق',
            cancel: 'إلغاء',
            downloadPdf: 'تحميل PDF',
            generating: 'جاري إنشاء PDF...',
            applying: 'جاري تطبيق التغييرات...',
            error: 'خطأ في إنشاء PDF',
            tryAgain: 'حاول مرة أخرى',
            fileSize: 'حجم الملف:',
            created: 'تم الإنشاء:',
            fileType: 'النوع:',
            pdfNotCreated: 'لم يتم إنشاء PDF بعد',
            returnToChat: 'ارجع إلى المحادثة واضغط على "إنشاء PDF" لإنشاء التقرير',
            backToChat: 'العودة إلى المحادثة',
            dslStructure: 'هيكل DSL (تصحيح)',
            editMode: 'وضع تحرير DSL'
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

    useEffect(() => {
        // Инициализируем DSL из состояния
        if (state.generatedDSL) {
            setCurrentDSL(state.generatedDSL);
        }
    }, [state.generatedDSL]);

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

    const handleEditToggle = async () => {
        if (!isEditMode && !currentDSL) {
            // Сначала пытаемся получить DSL с сервера
            const serverResult = await simplePdfApiService.getLastGeneratedDSL();

            if (serverResult.success && serverResult.dsl) {
                console.log('✅ DSL получен с сервера');
                setCurrentDSL(serverResult.dsl);
            } else {
                // Если на сервере нет DSL, создаем базовый
                console.log('🔨 Создаем базовый DSL');
                const basicDSL = {
                    template: "default",
                    defaultFont: "DejaVuSans",
                    defaultDirection: language === 'ar' ? 'rtl' : 'ltr',
                    pages: [{
                        elements: [
                            {
                                type: "text",
                                content: language === 'en' ? "Edit this report" :
                                    language === 'ar' ? "تحرير هذا التقرير" :
                                        "Отредактируйте этот отчёт",
                                position: { x: 50, y: 100 },
                                style: {
                                    fontSize: 24,
                                    color: "#2C3E50",
                                    width: 495,
                                    align: "center",
                                    font: "DejaVuSans",
                                    direction: language === 'ar' ? 'rtl' : 'ltr'
                                }
                            },
                            {
                                type: "text",
                                content: language === 'en' ? "You can modify any element in the JSON editor on the left" :
                                    language === 'ar' ? "يمكنك تعديل أي عنصر في محرر JSON على اليسار" :
                                        "Вы можете изменить любой элемент в JSON редакторе слева",
                                position: { x: 50, y: 150 },
                                style: {
                                    fontSize: 14,
                                    color: "#7F8C8D",
                                    width: 495,
                                    align: "center",
                                    font: "DejaVuSans",
                                    direction: language === 'ar' ? 'rtl' : 'ltr'
                                }
                            }
                        ]
                    }]
                };
                setCurrentDSL(basicDSL);
            }
        }
        setIsEditMode(!isEditMode);
    };

    const handleDSLChange = (newDSL: any) => {
        setCurrentDSL(newDSL);
    };

    const handleApplyChanges = async () => {
        if (!currentDSL) return;

        setIsApplying(true);
        try {
            console.log('📤 Отправляем DSL на рендеринг...');

            const result = await simplePdfApiService.renderDSL({ dsl: currentDSL });

            if (result.success && result.pdfBlob) {
                // Обновляем состояние
                dispatch({ type: 'SET_PDF_BLOB', payload: result.pdfBlob });
                dispatch({ type: 'SET_DSL', payload: currentDSL });

                // Выходим из режима редактирования
                setIsEditMode(false);
            } else {
                throw new Error(result.error || 'Ошибка рендеринга PDF');
            }

        } catch (error) {
            console.error('❌ Ошибка применения изменений:', error);
            alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        } finally {
            setIsApplying(false);
        }
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
                    <h1>📄 {isEditMode ? t.editMode : t.previewTitle}</h1>
                    <p>{t.previewSubtitle}</p>
                </div>

                <div className="preview-actions">
                    <button
                        className="action-btn secondary"
                        onClick={handleCreateNew}
                    >
                        ✨ {t.createNew}
                    </button>
                    {(state.pdfBlob || currentDSL) && !isMobile && (
                        <button
                            className={`action-btn ${isEditMode ? 'warning' : 'secondary'}`}
                            onClick={handleEditToggle}
                        >
                            {isEditMode ? '❌ ' + t.cancel : '✏️ ' + t.edit}
                        </button>
                    )}
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
                {isEditMode ? (
                    // Режим редактирования
                    <div className="edit-mode-container">
                        <div className="edit-panel">
                            <JsonEditor
                                initialValue={currentDSL}
                                onChange={handleDSLChange}
                                height="calc(100vh - 320px)"
                            />
                            <div className="edit-actions">
                                <button
                                    className="apply-btn"
                                    onClick={handleApplyChanges}
                                    disabled={isApplying || !currentDSL}
                                >
                                    {isApplying ? (
                                        <>
                                            <span className="loading-spinner-inline"></span>
                                            {t.applying}
                                        </>
                                    ) : (
                                        <>✅ {t.apply}</>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="preview-panel">
                            {state.pdfBlob && pdfUrl && (
                                <iframe
                                    src={pdfUrl}
                                    width="100%"
                                    height="100%"
                                    title="PDF Preview"
                                    style={{ border: 'none' }}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    // Обычный режим просмотра
                    <>
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
                                    <MobilePDFViewer
                                        pdfBlob={state.pdfBlob}
                                        fileSize={state.pdfBlob.size}
                                        language={language}
                                    />
                                ) : (
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
                    </>
                )}
            </div>

            {/*/!* Стили для режима редактирования *!/*/}
            {/*<style>{`*/}
            {/*    .edit-mode-container {*/}
            {/*        display: flex;*/}
            {/*        gap: 1rem;*/}
            {/*        height: calc(100vh - 260px);*/}
            {/*        background: #f5f5f5;*/}
            {/*        border-radius: 12px;*/}
            {/*        overflow: hidden;*/}
            {/*    }*/}

            {/*    .edit-panel {*/}
            {/*        flex: 1;*/}
            {/*        display: flex;*/}
            {/*        flex-direction: column;*/}
            {/*        background: white;*/}
            {/*        border-radius: 12px 0 0 12px;*/}
            {/*        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);*/}
            {/*    }*/}

            {/*    .preview-panel {*/}
            {/*        flex: 1;*/}
            {/*        background: white;*/}
            {/*        border-radius: 0 12px 12px 0;*/}
            {/*        overflow: hidden;*/}
            {/*    }*/}

            {/*    .edit-actions {*/}
            {/*        padding: 1rem;*/}
            {/*        background: #f8f9fa;*/}
            {/*        border-top: 1px solid #e5e7eb;*/}
            {/*        text-align: center;*/}
            {/*    }*/}

            {/*    .apply-btn {*/}
            {/*        padding: 0.75rem 2rem;*/}
            {/*        background: linear-gradient(135deg, #10b981, #059669);*/}
            {/*        color: white;*/}
            {/*        border: none;*/}
            {/*        border-radius: 8px;*/}
            {/*        font-size: 1rem;*/}
            {/*        font-weight: 600;*/}
            {/*        cursor: pointer;*/}
            {/*        transition: all 0.2s ease;*/}
            {/*        display: inline-flex;*/}
            {/*        align-items: center;*/}
            {/*        gap: 0.5rem;*/}
            {/*    }*/}

            {/*    .apply-btn:hover:not(:disabled) {*/}
            {/*        transform: translateY(-2px);*/}
            {/*        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);*/}
            {/*    }*/}

            {/*    .apply-btn:disabled {*/}
            {/*        background: #9ca3af;*/}
            {/*        cursor: not-allowed;*/}
            {/*        transform: none;*/}
            {/*    }*/}

            {/*    .action-btn.warning {*/}
            {/*        background: #f59e0b;*/}
            {/*        color: white;*/}
            {/*    }*/}

            {/*    .action-btn.warning:hover {*/}
            {/*        background: #d97706;*/}
            {/*        transform: translateY(-1px);*/}
            {/*    }*/}

            {/*    @media (max-width: 1024px) {*/}
            {/*        .edit-mode-container {*/}
            {/*            flex-direction: column;*/}
            {/*        }*/}

            {/*        .edit-panel {*/}
            {/*            border-radius: 12px 12px 0 0;*/}
            {/*        }*/}

            {/*        .preview-panel {*/}
            {/*            border-radius: 0 0 12px 12px;*/}
            {/*            height: 400px;*/}
            {/*        }*/}
            {/*    }*/}

            {/*    @media (max-width: 768px) {*/}
            {/*        .edit-mode-container {*/}
            {/*            height: auto;*/}
            {/*        }*/}

            {/*        .preview-actions {*/}
            {/*            flex-wrap: wrap;*/}
            {/*        }*/}

            {/*        .action-btn {*/}
            {/*            flex: 1;*/}
            {/*            min-width: 120px;*/}
            {/*        }*/}
            {/*    }*/}
            {/*`}</style>*/}

            {/* Информация о DSL структуре для отладки */}
            {state.generatedDSL && process.env.NODE_ENV === 'development' && !isEditMode && (
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