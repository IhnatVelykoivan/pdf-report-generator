import { useEffect, useState } from 'react';
import { useConversation } from '../context/ConversationContext';
import { useNavigate } from 'react-router-dom';

const PDFPreviewPage = () => {
    const { state } = useConversation();
    const navigate = useNavigate();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

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
            link.download = `report-${new Date().toISOString().slice(0, 10)}.pdf`;
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
                        <h2>Нет созданных отчётов</h2>
                        <p>Начните с создания отчёта в чате с ИИ помощником</p>
                        <button className="create-report-btn" onClick={handleCreateNew}>
                            💬 Создать отчёт
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
                    <h1>📄 Предварительный просмотр PDF</h1>
                    <p>Ваш отчёт готов для просмотра и скачивания</p>
                </div>

                <div className="preview-actions">
                    <button
                        className="action-btn secondary"
                        onClick={handleCreateNew}
                    >
                        ✨ Создать новый
                    </button>
                    <button
                        className="action-btn primary"
                        onClick={handleDownload}
                        disabled={!state.pdfBlob}
                    >
                        💾 Скачать PDF
                    </button>
                </div>
            </div>

            <div className="preview-content">
                {state.isLoading && (
                    <div className="preview-loading">
                        <div className="loading-spinner"></div>
                        <p>Генерируем PDF...</p>
                    </div>
                )}

                {state.error && (
                    <div className="preview-error">
                        <div className="error-icon">❌</div>
                        <h3>Ошибка при создании PDF</h3>
                        <p>{state.error}</p>
                        <button className="retry-btn" onClick={handleCreateNew}>
                            🔄 Попробовать снова
                        </button>
                    </div>
                )}

                {state.pdfBlob && pdfUrl && (
                    <div className="pdf-viewer">
                        <div className="pdf-frame">
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="800px"
                                title="PDF Preview"
                                style={{ border: 'none' }}
                            />
                        </div>

                        <div className="pdf-info">
                            <div className="info-item">
                                <span className="info-label">📊 Размер файла:</span>
                                <span className="info-value">
                  {(state.pdfBlob.size / 1024).toFixed(1)} KB
                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">📅 Создан:</span>
                                <span className="info-value">
                  {new Date().toLocaleString('ru-RU')}
                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">🔧 Тип:</span>
                                <span className="info-value">PDF Document</span>
                            </div>
                        </div>
                    </div>
                )}

                {!state.pdfBlob && state.messages.length > 0 && (
                    <div className="preview-placeholder">
                        <div className="placeholder-content">
                            <div className="placeholder-icon">⏳</div>
                            <h3>PDF ещё не создан</h3>
                            <p>Вернитесь в чат и нажмите кнопку "Создать PDF" для генерации отчёта</p>
                            <button className="back-to-chat-btn" onClick={handleCreateNew}>
                                💬 Вернуться в чат
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Информация о DSL структуре для отладки */}
            {state.generatedDSL && process.env.NODE_ENV === 'development' && (
                <div className="debug-info">
                    <details>
                        <summary>🔧 DSL Structure (Debug)</summary>
                        <pre>{JSON.stringify(state.generatedDSL, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default PDFPreviewPage;