import { useState, useRef, useEffect } from 'react';
import { useConversation } from '../context/ConversationContext';
import { useNavigate } from 'react-router-dom';
import { pdfApiService } from '../services/pdfApi';
import { claudeApiService, type ChatMessage } from '../services/claudeApi';

const ConversationPage = () => {
    const [inputMessage, setInputMessage] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [activeQuickReportType, setActiveQuickReportType] = useState<string | null>(null); // Новое состояние для защиты от дублей
    const { state, dispatch } = useConversation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.messages]);

    // Преобразование сообщений в формат для Claude API
    const getConversationHistory = (): ChatMessage[] => {
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
            const aiResponse = await claudeApiService.analyzeUserRequest(
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
            let dslResult;

            if (useConversation && state.messages.length > 0) {
                // Генерируем DSL на основе разговора с Claude
                console.log('📝 Создаём DSL из разговора через Claude...');

                const conversationHistory = getConversationHistory();
                dslResult = await claudeApiService.generateDSLFromConversation(conversationHistory);

                console.log('✅ DSL создан через Claude:', dslResult);

                // Показываем объяснение пользователю
                const explanationMessage = {
                    id: Date.now().toString(),
                    role: 'assistant' as const,
                    content: `📊 **Создаю структуру отчёта:**

${dslResult.explanation}

**Предложения для улучшения:**
${dslResult.suggestions.map(s => `• ${s}`).join('\n')}

🔄 Генерирую PDF...`,
                    timestamp: new Date(),
                };
                dispatch({ type: 'ADD_MESSAGE', payload: explanationMessage });

            } else {
                // Используем базовую DSL структуру
                console.log('📝 Используем базовую DSL структуру...');
                const lastUserMessage = state.messages
                    .filter(m => m.role === 'user')
                    .pop()?.content || 'Базовый отчёт';

                dslResult = {
                    dsl: await pdfApiService.generateDSLFromText(lastUserMessage),
                    explanation: 'Создан базовый отчёт',
                    suggestions: []
                };
            }

            dispatch({ type: 'SET_DSL', payload: dslResult.dsl });

            // Генерируем PDF
            console.log('🔄 Отправляем запрос на генерацию PDF...');
            const result = await pdfApiService.generatePDF({
                reportType: 'ai-generated',
                title: dslResult.dsl.pages?.[0]?.elements?.[0]?.content || 'ИИ Отчёт',
                description: dslResult.explanation,
                sections: dslResult.dsl.pages || []
            });

            console.log('📊 Результат генерации:', result);

            if (result.success && result.pdfBlob) {
                dispatch({ type: 'SET_PDF_BLOB', payload: result.pdfBlob });

                const successMessage = {
                    id: Date.now().toString(),
                    role: 'assistant' as const,
                    content: `✅ **PDF отчёт успешно создан!**

📄 Размер: ${(result.pdfBlob.size / 1024).toFixed(1)} KB
🎯 Тип: ${dslResult.explanation}

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
- Ошибка в DSL структуре
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
                console.log('🔄 Обрабатываем фидбек через Claude...');

                const updatedDSL = await claudeApiService.requestFeedback(
                    state.generatedDSL,
                    changeRequest
                );

                const responseMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: `✅ **Изменения учтены!**

${updatedDSL.explanation}

**Обновления:**
${updatedDSL.suggestions.map(s => `• ${s}`).join('\n')}

Хотите пересоздать PDF с учётом изменений?`,
                    timestamp: new Date(),
                };

                dispatch({ type: 'ADD_MESSAGE', payload: responseMessage });
                dispatch({ type: 'SET_DSL', payload: updatedDSL.dsl });
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

    const suggestedPrompts = [
        "Создать маркетинговый отчёт с анализом ROI за последний квартал",
        "Подготовить финансовую сводку с прогнозами на следующий год",
        "Аналитический отчёт по продажам с графиками динамики",
        "Презентация результатов проекта для руководства"
    ];

    const quickReportTypes = [
        { type: 'marketing', title: '📈 Маркетинг отчёт', description: 'Анализ кампаний и ROI с рекомендациями' },
        { type: 'sales', title: '💰 Отчёт по продажам', description: 'Динамика продаж и прогнозы развития' },
        { type: 'financial', title: '💼 Финансовый отчёт', description: 'Бюджет, расходы и рентабельность' },
        { type: 'analytics', title: '📊 Аналитика', description: 'Глубокий анализ данных и трендов' },
        { type: 'marketing-en', title: '📈 Marketing Report', description: 'Campaign analysis and ROI metrics' },
        { type: 'sales-en', title: '💰 Sales Report', description: 'Sales dynamics and forecasts' },
        { type: 'marketing-ar', title: '📈 تقرير التسويق', description: 'تحليل الحملات والعائد على الاستثمار' },
        { type: 'financial-ar', title: '💼 التقرير المالي', description: 'الميزانية والمصروفات والربحية' }
    ];

    const handleQuickReport = async (reportType: string, title: string) => {
        // Защита от двойных кликов
        if (activeQuickReportType === reportType || state.isLoading) {
            console.log('⚠️ Запрос уже обрабатывается, игнорируем повторный клик');
            return;
        }

        setActiveQuickReportType(reportType); // Устанавливаем активный тип отчета

        let reportQuery = '';

        if (reportType.includes('-en')) {
            reportQuery = `Create a professional ${title.replace(/📈|💰|💼|📊/g, '').trim()} with detailed analytics, charts, and insights for business decision-making.`;
        } else if (reportType.includes('-ar')) {
            reportQuery = `إنشاء ${title.replace(/📈|💰|💼|📊/g, '').trim()} احترافي مع تحليل مفصل ورسوم بيانية ورؤى لاتخاذ القرارات التجارية.`;
        } else {
            reportQuery = `Создать профессиональный ${title.replace(/📈|💰|💼|📊/g, '').trim().toLowerCase()} с подробной аналитикой, графиками и инсайтами для принятия бизнес-решений.`;
        }

        console.log('🎯 Создаём отчёт типа:', reportType, 'с запросом:', reportQuery);

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: reportQuery,
            timestamp: new Date(),
        };

        // Добавляем сообщение только один раз
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            console.log('🤖 Отправляем запрос в Claude API...');

            // Получаем историю разговора для контекста
            const conversationHistory = getConversationHistory();

            // Получаем ответ от Claude
            const aiResponse = await claudeApiService.analyzeUserRequest(
                reportQuery, // Используем reportQuery напрямую
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
                content: `❌ Извините, произошла ошибка при обращении к ИИ: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                timestamp: new Date(),
            };

            dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
            setActiveQuickReportType(null); // Сбрасываем активный тип отчета
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>🤖 ИИ Помощник Claude</h1>
                <p>Опишите, какой отчёт вам нужен, и я создам его с помощью искусственного интеллекта</p>
            </div>

            <div className="chat-messages">
                {state.messages.length === 0 ? (
                    <div className="welcome-section">
                        <div className="welcome-message">
                            <h2>👋 Привет! Я Claude, ваш ИИ-помощник по созданию PDF отчётов</h2>
                            <p>Просто опишите, что вам нужно, и я создам профессиональный отчёт с учётом всех ваших требований</p>

                            <div className="suggested-prompts">
                                <h3>💡 Примеры запросов:</h3>
                                {suggestedPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        className="prompt-button"
                                        onClick={() => setInputMessage(prompt)}
                                        disabled={state.isLoading}
                                    >
                                        {prompt}
                                    </button>
                                ))}
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
                                                {isGeneratingPDF ? '⏳ Создаю...' : '📄 Создать PDF'}
                                            </button>
                                            {state.generatedDSL && (
                                                <button
                                                    className="action-button secondary"
                                                    onClick={handleRequestChanges}
                                                    disabled={state.isLoading}
                                                >
                                                    ✏️ Внести изменения
                                                </button>
                                            )}
                                            <button
                                                className="action-button secondary"
                                                onClick={() => setInputMessage('Расскажи подробнее о структуре отчёта')}
                                                disabled={state.isLoading}
                                            >
                                                ❓ Уточнить детали
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
                                <h3>⚡ Быстрое создание отчётов:</h3>
                                <div className="quick-reports-grid">
                                    {quickReportTypes.map((report) => (
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
                        placeholder="Опишите, какой отчёт вам нужен..."
                        className="message-input"
                        rows={3}
                        disabled={state.isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
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