import { Link } from 'react-router-dom';
import { useLanguage } from '../components/Layout';

const HomePage = () => {
    const { language } = useLanguage();

    // Переводы для главной страницы
    const translations = {
        ru: {
            title: 'От слов — к делу.',
            subtitle: 'ИИ подготовит точный и понятный PDF-отчёт за считаные секунды.',
            feature1Title: 'Умный помощник',
            feature1Desc: 'ИИ сам предложит структуру и содержание — вам остаётся только подставить данные.',
            feature2Title: 'Гибкие шаблоны',
            feature2Desc: 'Маркетинг, продажи, финансы, аналитика — выбирайте готовое или создавайте своё.',
            feature3Title: 'Быстрый результат',
            feature3Desc: 'Полноценный отчёт — без дизайнеров, вёрстки и шаблонов.',
            ctaButton: 'Создать отчёт',
            ctaSubtext: '• Готов за минуты • На любом языке'
        },
        en: {
            title: 'From prompt to PDF.',
            subtitle: 'AI turns your input into a clear, professional report in seconds.',
            feature1Title: 'Smart Assistant',
            feature1Desc: 'Describe your needs — the AI builds a full report structure instantly.',
            feature2Title: 'Flexible Templates',
            feature2Desc: 'Marketing, Sales, Finance, Analytics — use ready templates or build your own.',
            feature3Title: 'Fast Results',
            feature3Desc: 'Professional reports without designers or manual formatting.',
            ctaButton: 'Create Report',
            ctaSubtext: '• Ready in minutes • Multilingual'
        },
        ar: {
            title: 'من الكلمات إلى التقرير.',
            subtitle: 'الذكاء الاصطناعي يُعد لك تقريرًا احترافيًا وواضحًا خلال ثوانٍ.',
            feature1Title: 'مساعد ذكي',
            feature1Desc: 'صف ما تحتاجه، وسيتولى الذكاء الاصطناعي بناء التقرير بالكامل.',
            feature2Title: 'قوالب مرنة',
            feature2Desc: 'التسويق، المبيعات، المالي، التحليلات — استخدم القوالب أو أنشئ بنفسك.',
            feature3Title: 'نتائج سريعة',
            feature3Desc: 'تقارير جاهزة دون تصميم أو تنسيق يدوي.',
            ctaButton: 'إنشاء التقرير',
            ctaSubtext: 'بدون تسجيل • جاهز خلال دقائق •'
        }
    };


    const t = translations[language];

    return (
        <div className="hero-section">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="hero-title">
                        {t.title}
                    </h1>
                    <p className="hero-subtitle">
                        {t.subtitle}
                    </p>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🤖</div>
                            <div>
                                <h3>{t.feature1Title}</h3>
                                <p>{t.feature1Desc}</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <div>
                                <h3>{t.feature2Title}</h3>
                                <p>{t.feature2Desc}</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <div>
                                <h3>{t.feature3Title}</h3>
                                <p>{t.feature3Desc}</p>
                            </div>
                        </div>
                    </div>

                    <div className="cta-section">
                        <Link to="/conversation" className="cta-button">
                            🚀 {t.ctaButton}
                        </Link>
                        <p className="cta-subtext">
                            {t.ctaSubtext}
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