// src/components/LanguageSwitcher.jsx - Przycisk zmiany języka (prawy dolny róg)
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '../i18n';

const LanguageSwitcher = () => {
    const { language, changeLanguage, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const toggleLanguage = () => {
        const newLang = language === 'pl' ? 'en' : 'pl';
        changeLanguage(newLang);
        setIsOpen(false);
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 1000
            }}
        >
            {/* Dropdown menu */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '60px',
                        right: '0',
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        padding: '8px',
                        minWidth: '140px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                        border: '1px solid #334155',
                        animation: 'fadeIn 0.2s ease'
                    }}
                >
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>

                    {/* Polski */}
                    <button
                        onClick={() => { changeLanguage('pl'); setIsOpen(false); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            background: language === 'pl' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: language === 'pl' ? '#3b82f6' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (language !== 'pl') e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseOut={(e) => {
                            if (language !== 'pl') e.target.style.background = 'transparent';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🇵🇱</span>
                        <span>Polski</span>
                        {language === 'pl' && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </button>

                    {/* English */}
                    <button
                        onClick={() => { changeLanguage('en'); setIsOpen(false); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            background: language === 'en' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            color: language === 'en' ? '#3b82f6' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '14px',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (language !== 'en') e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onMouseOut={(e) => {
                            if (language !== 'en') e.target.style.background = 'transparent';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🇬🇧</span>
                        <span>English</span>
                        {language === 'en' && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </button>
                </div>
            )}

            {/* Main button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: isOpen || isHovered 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)' 
                        : '#1e293b',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}
                title={t('languageSwitcher.tooltip')}
            >
                <Globe size={22} />
            </button>

            {/* Current language badge */}
            <div
                style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    border: '2px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    pointerEvents: 'none'
                }}
            >
                {language === 'pl' ? '🇵🇱' : '🇬🇧'}
            </div>
        </div>
    );
};

export default LanguageSwitcher;