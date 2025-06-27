import { Link } from 'react-router-dom';
import { useLanguage } from '../components/Layout';

const HomePage = () => {
    const { language } = useLanguage();

    // Переводы для главной страницы
    const translations = {
        ru: {
            title: 'PDF Report Generator',
            subtitle: 'Создавайте профессиональные PDF отчёты с помощью ИИ. Просто опишите, что нужно, и получите готовый документ.',
            feature1Title: 'ИИ Генерация',
            feature1Desc: 'Умный помощник создаст структуру отчёта на основе ваших требований',
            feature2Title: 'Гибкие Шаблоны',
            feature2Desc: 'Поддержка различных типов отчётов: аналитика, презентации, документы',
            feature3Title: 'Быстрое Создание',
            feature3Desc: 'От идеи до готового PDF за несколько минут',
            ctaButton: 'Начать создание отчёта',
            ctaSubtext: 'Бесплатно • Без регистрации • Готов за минуты'
        },
        en: {
            title: 'PDF Report Generator',
            subtitle: 'Create professional PDF reports using AI. Just describe what you need and get a ready document.',
            feature1Title: 'AI Generation',
            feature1Desc: 'Smart assistant will create report structure based on your requirements',
            feature2Title: 'Flexible Templates',
            feature2Desc: 'Support for various report types: analytics, presentations, documents',
            feature3Title: 'Fast Creation',
            feature3Desc: 'From idea to ready PDF in minutes',
            ctaButton: 'Start Creating Report',
            ctaSubtext: 'Free • No Registration • Ready in Minutes'
        },
        ar: {
            title: 'مولد تقارير PDF',
            subtitle: 'قم بإنشاء تقارير PDF احترافية باستخدام الذكاء الاصطناعي. فقط صف ما تحتاجه واحصل على مستند جاهز.',
            feature1Title: 'توليد بالذكاء الاصطناعي',
            feature1Desc: 'سيقوم المساعد الذكي بإنشاء هيكل التقرير بناءً على متطلباتك',
            feature2Title: 'قوالب مرنة',
            feature2Desc: 'دعم أنواع مختلفة من التقارير: التحليلات والعروض التقديمية والمستندات',
            feature3Title: 'إنشاء سريع',
            feature3Desc: 'من الفكرة إلى PDF جاهز في دقائق',
            ctaButton: 'ابدأ إنشاء التقرير',
            ctaSubtext: 'مجاني • بدون تسجيل • جاهز في دقائق'
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