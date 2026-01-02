// src/components/LanguagePopup.jsx - Popup z propozycją zmiany języka
import { X, Globe } from 'lucide-react';
import { useTranslation } from '../i18n';

const LanguagePopup = () => {
    const { showPopup, switchToEnglish, keepPolish, dismissPopup, t, language } = useTranslation();

    if (!showPopup) return null;

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                    backdropFilter: 'blur(4px)'
                }}
                onClick={() => dismissPopup(false)}
            />

            {/* Popup */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    padding: '24px',
                    maxWidth: '400px',
                    width: '90%',
                    zIndex: 9999,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid #334155'
                }}
            >
                {/* Close button */}
                <button
                    onClick={() => dismissPopup(false)}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '16px'
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Globe size={32} color="white" />
                    </div>
                </div>

                {/* Title */}
                <h3
                    style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '8px',
                        color: '#f8fafc'
                    }}
                >
                    {t('languagePopup.title')}
                </h3>

                {/* Message */}
                <p
                    style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        marginBottom: '24px',
                        fontSize: '14px'
                    }}
                >
                    {t('languagePopup.message')}
                </p>

                {/* Buttons */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}
                >
                    {/* Switch to English */}
                    <button
                        onClick={switchToEnglish}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'scale(1.02)';
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        🇬🇧 {t('languagePopup.yes')}
                    </button>

                    {/* Keep Polish */}
                    <button
                        onClick={keepPolish}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'transparent',
                            color: '#94a3b8',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s, color 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.borderColor = '#64748b';
                            e.target.style.color = '#f8fafc';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.borderColor = '#334155';
                            e.target.style.color = '#94a3b8';
                        }}
                    >
                        🇵🇱 {t('languagePopup.no')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default LanguagePopup;