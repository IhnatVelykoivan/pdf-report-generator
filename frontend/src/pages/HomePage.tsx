import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="hero-section">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">
                        PDF Report Generator
                    </h1>
                    <p className="hero-subtitle">
                        Создавайте профессиональные PDF отчёты с помощью ИИ.
                        Просто опишите, что нужно, и получите готовый документ.
                    </p>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🤖</div>
                            <h3>ИИ Генерация</h3>
                            <p>Умный помощник создаст структуру отчёта на основе ваших требований</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h3>Гибкие Шаблоны</h3>
                            <p>Поддержка различных типов отчётов: аналитика, презентации, документы</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h3>Быстрое Создание</h3>
                            <p>От идеи до готового PDF за несколько минут</p>
                        </div>
                    </div>

                    <div className="cta-section">
                        <Link to="/conversation" className="cta-button">
                            🚀 Начать создание отчёта
                        </Link>
                        <p className="cta-subtext">
                            Бесплатно • Без регистрации • Готов за минуты
                        </p>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="mock-pdf">
                        <div className="pdf-header"></div>
                        <div className="pdf-content">
                            <div className="pdf-line long"></div>
                            <div className="pdf-line medium"></div>
                            <div className="pdf-line short"></div>
                            <div className="pdf-chart"></div>
                            <div className="pdf-line medium"></div>
                            <div className="pdf-line long"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;