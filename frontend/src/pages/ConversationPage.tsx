import { useState, useRef, useEffect } from 'react';
import { useConversation } from '../context/ConversationContext';
import { useNavigate } from 'react-router-dom';
import { simplePdfApiService } from '../services/pdfApi.ts';
import { claudeChatService } from '../services/claudeApi';
import { QUICK_REPORT_TYPES } from '../config/languages';
import { useLanguage } from '../components/Layout';

const ConversationPage = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [activeQuickReportType, setActiveQuickReportType] = useState<string | null>(null);
    const { state, dispatch } = useConversation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Переводы интерфейса для разных языков
    const translations = {
        ru: {
            title: 'ИИ Помощник Claude',
            subtitle: 'Опишите, какой отчёт вам нужен, и я создам его с помощью искусственного интеллекта',
            welcome: 'Привет! Я Claude, ваш ИИ-помощник по созданию PDF отчётов',
            description: 'Просто опишите, что вам нужно, и я создам профессиональный отчёт с учётом всех ваших требований',
            quickReportsTitle: 'Быстрое создание отчётов',
            inputPlaceholder: 'Опишите, какой отчёт вам нужен...',
            sendButton: 'Отправить',
            createPdfButton: 'Создать PDF',
            requestChangesButton: 'Внести изменения',
            moreDetailsButton: 'Уточнить детали',
            reportCreated: 'успешно создан!',
            fileSize: 'Размер',
            goingToPreview: 'Переходим на страницу предварительного просмотра...',
            failedToCreate: 'Не удалось создать отчет',
            aiError: 'Извините, произошла ошибка при обращении к ИИ',
            possibleReasons: 'Возможные причины',
            apiKeyProblem: 'Проблема с API ключом Claude',
            networkError: 'Сетевая ошибка',
            requestLimit: 'Превышен лимит запросов',
            tryAgainOrUse: 'Попробуйте еще раз или используйте быстрые кнопки создания отчётов ниже.',
            pdfReportCreated: 'PDF отчёт успешно создан!',
            pdfGenerationError: 'Произошла ошибка при создании PDF',
            possibleCauses: 'Возможные причины',
            pdfGeneratorNotRunning: 'PDF генератор не запущен на порту 3001',
            networkProblem: 'Проблема с сетевым подключением',
            claudeApiProblem: 'Проблема с Claude API',
            solutions: 'Решения',
            startPdfGenerator: 'Запустите PDF генератор: npm start',
            checkInternet: 'Проверьте подключение к интернету',
            useQuickButtons: 'Попробуйте использовать быстрые кнопки создания отчётов',
            changesApplied: 'Изменения учтены!',
            updates: 'Обновления',
            recreatePdf: 'Хотите пересоздать PDF с учётом изменений?',
            failedToProcess: 'Не удалось обработать запрос на изменения',
            tryRephrase: 'Попробуйте переформулировать запрос или создать новый отчёт.',
            noCurrentDsl: 'Нет текущей DSL структуры для изменения',
            tellMoreAbout: 'Расскажи подробнее о структуре отчёта'
        },
        en: {
            title: 'AI Assistant Claude',
            subtitle: 'Describe what report you need, and I will create it using artificial intelligence',
            welcome: 'Hello! I\'m Claude, your AI assistant for creating PDF reports',
            description: 'Just describe what you need, and I\'ll create a professional report tailored to your requirements',
            quickReportsTitle: 'Quick Report Creation',
            inputPlaceholder: 'Describe what report you need...',
            sendButton: 'Send',
            createPdfButton: 'Create PDF',
            requestChangesButton: 'Request Changes',
            moreDetailsButton: 'More Details',
            reportCreated: 'successfully created!',
            fileSize: 'Size',
            goingToPreview: 'Going to preview page...',
            failedToCreate: 'Failed to create report',
            aiError: 'Sorry, an error occurred while contacting AI',
            possibleReasons: 'Possible reasons',
            apiKeyProblem: 'Claude API key problem',
            networkError: 'Network error',
            requestLimit: 'Request limit exceeded',
            tryAgainOrUse: 'Try again or use the quick report creation buttons below.',
            pdfReportCreated: 'PDF report successfully created!',
            pdfGenerationError: 'An error occurred while creating PDF',
            possibleCauses: 'Possible causes',
            pdfGeneratorNotRunning: 'PDF generator not running on port 3001',
            networkProblem: 'Network connection problem',
            claudeApiProblem: 'Claude API problem',
            solutions: 'Solutions',
            startPdfGenerator: 'Start PDF generator: npm start',
            checkInternet: 'Check internet connection',
            useQuickButtons: 'Try using quick report creation buttons',
            changesApplied: 'Changes applied!',
            updates: 'Updates',
            recreatePdf: 'Want to recreate PDF with changes?',
            failedToProcess: 'Failed to process change request',
            tryRephrase: 'Try rephrasing the request or create a new report.',
            noCurrentDsl: 'No current DSL structure to modify',
            tellMoreAbout: 'Tell me more about the report structure'
        },
        ar: {
            title: 'مساعد الذكاء الاصطناعي Claude',
            subtitle: 'صف التقرير الذي تحتاجه، وسأقوم بإنشائه باستخدام الذكاء الاصطناعي',
            welcome: 'مرحبا! أنا Claude، مساعدك الذكي لإنشاء تقارير PDF',
            description: 'فقط صف ما تحتاجه، وسأقوم بإنشاء تقرير احترافي وفقًا لمتطلباتك',
            quickReportsTitle: 'إنشاء سريع للتقارير',
            inputPlaceholder: 'صف التقرير الذي تحتاجه...',
            sendButton: 'إرسال',
            createPdfButton: 'إنشاء PDF',
            requestChangesButton: 'طلب تغييرات',
            moreDetailsButton: 'المزيد من التفاصيل',
            reportCreated: 'تم إنشاؤه بنجاح!',
            fileSize: 'الحجم',
            goingToPreview: 'الانتقال إلى صفحة المعاينة...',
            failedToCreate: 'فشل إنشاء التقرير',
            aiError: 'عذراً، حدث خطأ عند الاتصال بالذكاء الاصطناعي',
            possibleReasons: 'الأسباب المحتملة',
            apiKeyProblem: 'مشكلة في مفتاح API Claude',
            networkError: 'خطأ في الشبكة',
            requestLimit: 'تم تجاوز حد الطلبات',
            tryAgainOrUse: 'حاول مرة أخرى أو استخدم أزرار إنشاء التقارير السريعة أدناه.',
            pdfReportCreated: 'تم إنشاء تقرير PDF بنجاح!',
            pdfGenerationError: 'حدث خطأ أثناء إنشاء PDF',
            possibleCauses: 'الأسباب المحتملة',
            pdfGeneratorNotRunning: 'مولد PDF غير مشغل على المنفذ 3001',
            networkProblem: 'مشكلة في اتصال الشبكة',
            claudeApiProblem: 'مشكلة في Claude API',
            solutions: 'الحلول',
            startPdfGenerator: 'شغل مولد PDF: npm start',
            checkInternet: 'تحقق من اتصال الإنترنت',
            useQuickButtons: 'جرب استخدام أزرار إنشاء التقارير السريعة',
            changesApplied: 'تم تطبيق التغييرات!',
            updates: 'التحديثات',
            recreatePdf: 'هل تريد إعادة إنشاء PDF مع التغييرات؟',
            failedToProcess: 'فشل معالجة طلب التغيير',
            tryRephrase: 'حاول إعادة صياغة الطلب أو إنشاء تقرير جديد.',
            noCurrentDsl: 'لا توجد بنية DSL حالية للتعديل',
            tellMoreAbout: 'أخبرني المزيد عن هيكل التقرير'
        }
    };

    const t = translations[language];

    // Иконки для типов отчётов
    const reportIcons: Record<string, string> = {
        marketing: '📈',
        sales: '💰',
        financial: '💼',
        analytics: '📊'
    };

    // Фильтруем отчёты по выбранному языку
    const getQuickReportsForLanguage = () => {
        return QUICK_REPORT_TYPES.filter(report => {
            if (language === 'en') return report.type.endsWith('-en');
            if (language === 'ar') return report.type.endsWith('-ar');
            return report.lang === 'ru' && !report.type.includes('-');
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.messages]);

    // Преобразование сообщений в формат для API
    const getConversationHistory = () => {
        return state.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || state.isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: inputMessage.trim(),
            timestamp: new Date(),
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        setInputMessage('');
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            console.log('🤖 Отправляем запрос в Claude API...');

            // Получаем историю разговора для контекста
            const conversationHistory = getConversationHistory();

            // Получаем ответ от Claude
            const aiResponse = await claudeChatService.analyzeUserRequest(
                userMessage.content,
                conversationHistory
            );

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: aiResponse,
                timestamp: new Date(),
            };

            dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
            console.log('✅ Получен ответ от Claude');

        } catch (error) {
            console.error('❌ Ошибка Claude API:', error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: `❌ Извините, произошла ошибка при обращении к ИИ: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}
                
Возможные причины:
- Проблема с API ключом Claude
- Сетевая ошибка
- Превышен лимит запросов

Попробуйте еще раз или используйте быстрые кнопки создания отчётов ниже.`,
                timestamp: new Date(),
            };

            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleGeneratePDF = async (useConversation = true) => {
        if (isGeneratingPDF) return;

        console.log('🚀 Начинаем генерацию PDF...');
        setIsGeneratingPDF(true);
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            // Подготавливаем запрос - отправляем только необходимые данные
            const request = {
                conversationHistory: useConversation ? getConversationHistory() : [],
                userMessage: state.messages
                    .filter(m => m.role === 'user')
                    .pop()?.content
            };

            console.log('📤 Отправляем запрос на сервер для генерации отчета...');
            const result = await simplePdfApiService.generateReport(request);

            if (result.success && result.pdfBlob) {
                dispatch({ type: 'SET_PDF_BLOB', payload: result.pdfBlob });

                const successMessage = {
                    id: Date.now().toString(),
                    role: 'assistant' as const,
                    content: `✅ **PDF отчёт успешно создан!**

📄 Размер: ${(result.pdfBlob.size / 1024).toFixed(1)} KB

Переходим на страницу предварительного просмотра...`,
                    timestamp: new Date(),
                };
                dispatch({ type: 'ADD_MESSAGE', payload: successMessage });

                setTimeout(() => navigate('/preview'), 1500);
            } else {
                throw new Error(result.error || 'Ошибка генерации PDF');
            }
        } catch (error) {
            console.error('❌ Ошибка генерации PDF:', error);
            const errorMessage = {
                id: Date.now().toString(),
                role: 'assistant' as const,
                content: `❌ **Произошла ошибка при создании PDF:**

${error instanceof Error ? error.message : 'Неизвестная ошибка'}

**Возможные причины:**
- PDF генератор не запущен на порту 3001
- Проблема с сетевым подключением  
- Проблема с Claude API

**Решения:**
- Запустите PDF генератор: \`npm start\`
- Проверьте подключение к интернету
- Попробуйте использовать быстрые кнопки создания отчётов`,
                timestamp: new Date(),
            };
            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        } finally {
            setIsGeneratingPDF(false);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleRequestChanges = async () => {
        const changeRequest = prompt('Какие изменения вы хотите внести в отчёт?');
        if (!changeRequest) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: `Внести изменения: ${changeRequest}`,
            timestamp: new Date(),
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            if (state.generatedDSL) {
                console.log('🔄 Отправляем фидбек на сервер...');

                const result = await simplePdfApiService.sendFeedback({
                    currentDSL: state.generatedDSL,
                    userFeedback: changeRequest
                });

                if (result.success) {
                    const responseMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant' as const,
                        content: `✅ **Изменения учтены!**

${result.explanation}

**Обновления:**
${result.suggestions?.map(s => `• ${s}`).join('\n')}

Хотите пересоздать PDF с учётом изменений?`,
                        timestamp: new Date(),
                    };

                    dispatch({ type: 'ADD_MESSAGE', payload: responseMessage });
                    dispatch({ type: 'SET_DSL', payload: result.dsl });
                } else {
                    throw new Error(result.error || 'Не удалось обработать фидбек');
                }
            } else {
                throw new Error('Нет текущей DSL структуры для изменения');
            }
        } catch (error) {
            console.error('❌ Ошибка обработки фидбека:', error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: `❌ Не удалось обработать запрос на изменения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}

Попробуйте переформулировать запрос или создать новый отчёт.`,
                timestamp: new Date(),
            };

            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleQuickReport = async (reportType: string, title: string) => {
        if (activeQuickReportType === reportType || state.isLoading) {
            console.log('⚠️ Запрос уже обрабатывается, игнорируем повторный клик');
            return;
        }

        setActiveQuickReportType(reportType);

        console.log('🎯 Создаём быстрый отчёт типа:', reportType);

        // Отправляем тип отчета на сервер, он сам определит язык и создаст нужный контент
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const result = await simplePdfApiService.generateReport({
                quickReportType: reportType
            });

            if (result.success && result.pdfBlob) {
                dispatch({ type: 'SET_PDF_BLOB', payload: result.pdfBlob });

                const successMessage = {
                    id: Date.now().toString(),
                    role: 'assistant' as const,
                    content: `✅ **${title} успешно создан!**

📄 Размер: ${(result.pdfBlob.size / 1024).toFixed(1)} KB

Переходим на страницу предварительного просмотра...`,
                    timestamp: new Date(),
                };
                dispatch({ type: 'ADD_MESSAGE', payload: successMessage });

                setTimeout(() => navigate('/preview'), 1500);
            } else {
                throw new Error(result.error || 'Ошибка генерации отчета');
            }
        } catch (error) {
            console.error('❌ Ошибка создания быстрого отчета:', error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: `❌ Не удалось создать отчет: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                timestamp: new Date(),
            };

            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
            setActiveQuickReportType(null);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>🤖 {t.title}</h1>
                <p>{t.subtitle}</p>
            </div>

            <div className="chat-messages">
                {state.messages.length === 0 ? (
                    <div className="welcome-section">
                        <div className="welcome-message">
                            <h2>👋 {t.welcome}</h2>
                            <p>{t.description}</p>

                            <div className="quick-reports-section">
                                <h3>{t.quickReportsTitle}</h3>
                                <div className="quick-report-cards">
                                    {getQuickReportsForLanguage().map((report) => {
                                        const cleanType = report.type.replace(/-en$|-ar$/, '');
                                        const icon = reportIcons[cleanType] || '📄';

                                        return (
                                            <div
                                                key={report.type}
                                                className={`quick-report-card ${activeQuickReportType === report.type ? 'loading' : ''}`}
                                                onClick={() => handleQuickReport(report.type, report.title)}
                                            >
                                                <div className="card-icon">{icon}</div>
                                                <h4 className="card-title">{report.title.replace(icon, '').trim()}</h4>
                                                <p className="card-description">{report.description}</p>
                                                {activeQuickReportType === report.type && (
                                                    <div className="card-loading">
                                                        <div className="loading-spinner-small"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="messages-list">
                        {state.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                            >
                                <div className="message-avatar">
                                    {message.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">
                                        {message.content}
                                    </div>
                                    {message.role === 'assistant' && !state.isLoading && (
                                        <div className="message-actions">
                                            <button
                                                className="action-button primary"
                                                onClick={() => handleGeneratePDF(true)}
                                                disabled={isGeneratingPDF}
                                            >
                                                {isGeneratingPDF ? '⏳ ...' : `📄 ${t.createPdfButton}`}
                                            </button>
                                            {state.generatedDSL && (
                                                <button
                                                    className="action-button secondary"
                                                    onClick={handleRequestChanges}
                                                    disabled={state.isLoading}
                                                >
                                                    ✏️ {t.requestChangesButton}
                                                </button>
                                            )}
                                            <button
                                                className="action-button secondary"
                                                onClick={() => setInputMessage(language === 'ru' ?
                                                    'Расскажи подробнее о структуре отчёта' :
                                                    language === 'en' ?
                                                        'Tell me more about the report structure' :
                                                        'أخبرني المزيد عن هيكل التقرير')}
                                                disabled={state.isLoading}
                                            >
                                                ❓ {t.moreDetailsButton}
                                            </button>
                                        </div>
                                    )}
                                    <div className="message-time">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {state.isLoading && (
                            <div className="message ai-message">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Быстрые кнопки для создания отчётов */}
                        {state.messages.length > 0 && !state.isLoading && (
                            <div className="quick-reports">
                                <h3>⚡ {t.quickReportsTitle}:</h3>
                                <div className="quick-reports-grid">
                                    {getQuickReportsForLanguage().map((report) => (
                                        <button
                                            key={report.type}
                                            className="quick-report-btn"
                                            onClick={() => handleQuickReport(report.type, report.title)}
                                            disabled={state.isLoading || activeQuickReportType === report.type}
                                            style={{
                                                opacity: activeQuickReportType === report.type ? 0.5 : 1,
                                                cursor: activeQuickReportType === report.type ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <div className="quick-report-title">
                                                {activeQuickReportType === report.type && '⏳ '}
                                                {report.title}
                                            </div>
                                            <div className="quick-report-desc">{report.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <div className="input-container">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t.inputPlaceholder}
                        className="message-input"
                        rows={3}
                        disabled={state.isLoading}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || state.isLoading}
                        className="send-button"
                    >
                        {state.isLoading ? '⏳' : '🚀'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConversationPage;