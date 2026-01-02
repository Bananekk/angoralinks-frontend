// Dashboard.jsx - RESPONSYWNY Z EDYCJĄ LINKÓW I SEKCJĄ REFERALI
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Link2, Plus, Copy, ExternalLink, Trash2, DollarSign, MousePointer, 
    LogOut, Loader2, BarChart3, Shield, User, Wallet, Globe, Menu, X,
    Edit3, Check, AlertCircle, Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ReferralSection from '../components/ReferralSection';
import { useTranslation } from '../i18n';

// 🔥 Hook do wykrywania rozmiaru ekranu
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        ...windowSize,
        isMobile: windowSize.width < 768,
        isTablet: windowSize.width >= 768 && windowSize.width < 1024,
        isDesktop: windowSize.width >= 1024
    };
};

function Dashboard() {
    const navigate = useNavigate();
    const { isMobile, isTablet } = useWindowSize();
    const { t } = useTranslation();
    
    const [user, setUser] = useState(null);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', title: '' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 🆕 Stan dla edycji
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [editForm, setEditForm] = useState({
        originalUrl: '',
        title: '',
        description: '',
        isActive: true
    });
    const [updating, setUpdating] = useState(false);
    const [editErrors, setEditErrors] = useState({});

    // 🆕 Stan dla zakładek
    const [activeTab, setActiveTab] = useState('links'); // 'links' | 'referrals'

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchLinks();
        fetchUserData();
    }, [navigate]);

    // Zamknij menu mobilne przy zmianie rozmiaru
    useEffect(() => {
        if (!isMobile) {
            setMobileMenuOpen(false);
        }
    }, [isMobile]);

    // Blokuj scroll gdy menu jest otwarte
    useEffect(() => {
        if (mobileMenuOpen || showEditModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen, showEditModal]);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchLinks = async () => {
        try {
            const response = await api.get('/links');
            setLinks(response.data.links);
        } catch (error) {
            toast.error(t('dashboard.errors.fetchLinks'));
        } finally {
            setLoading(false);
        }
    };

    const createLink = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const response = await api.post('/links', newLink);
            setLinks([response.data.link, ...links]);
            setShowModal(false);
            setNewLink({ url: '', title: '' });
            toast.success(t('dashboard.messages.linkCreated'));
        } catch (error) {
            toast.error(error.response?.data?.error || t('dashboard.errors.createLink'));
        } finally {
            setCreating(false);
        }
    };

    const deleteLink = async (id) => {
        if (!confirm(t('dashboard.deleteConfirm'))) return;

        try {
            await api.delete(`/links/${id}`);
            setLinks(links.filter(l => l.id !== id));
            toast.success(t('dashboard.messages.linkDeleted'));
        } catch (error) {
            toast.error(t('dashboard.errors.deleteLink'));
        }
    };

    const copyLink = (shortUrl) => {
        const frontendUrl = shortUrl.replace(':3000', ':5173');
        navigator.clipboard.writeText(frontendUrl);
        toast.success(t('common.copiedToClipboard'));
    };

    // 🆕 Funkcje edycji
    const openEditModal = (link) => {
        setEditingLink(link);
        setEditForm({
            originalUrl: link.originalUrl || '',
            title: link.title || '',
            description: link.description || '',
            isActive: link.isActive !== false
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingLink(null);
        setEditForm({
            originalUrl: '',
            title: '',
            description: '',
            isActive: true
        });
        setEditErrors({});
    };

    const validateEditForm = () => {
        const errors = {};

        if (!editForm.originalUrl.trim()) {
            errors.originalUrl = t('dashboard.validation.urlRequired');
        } else {
            try {
                const url = new URL(editForm.originalUrl);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    errors.originalUrl = t('dashboard.validation.urlProtocol');
                }
            } catch {
                errors.originalUrl = t('dashboard.validation.urlInvalid');
            }
        }

        if (editForm.title && editForm.title.length > 100) {
            errors.title = t('dashboard.validation.titleMaxLength');
        }

        if (editForm.description && editForm.description.length > 500) {
            errors.description = t('dashboard.validation.descriptionMaxLength');
        }

        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!validateEditForm()) {
            return;
        }

        setUpdating(true);

        try {
            const response = await api.put(`/links/${editingLink.id}`, {
                originalUrl: editForm.originalUrl.trim(),
                title: editForm.title.trim() || null,
                description: editForm.description.trim() || null,
                isActive: editForm.isActive
            });

            setLinks(links.map(l => 
                l.id === editingLink.id 
                    ? { ...l, ...response.data.link }
                    : l
            ));

            closeEditModal();
            toast.success(t('dashboard.messages.linkUpdated'));
        } catch (error) {
            toast.error(error.response?.data?.error || t('dashboard.errors.updateLink'));
        } finally {
            setUpdating(false);
        }
    };

    const handleLogoutClick = () => {
        setMobileMenuOpen(false);
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutModal(false);
        navigate('/');
        toast.success(t('logout.success'));
    };

    // 🎨 Responsywne style
    const styles = {
        navbar: {
            borderBottom: '1px solid #1e293b',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(8px)'
        },
        navContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '0 12px' : '0 16px'
        },
        navContent: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: isMobile ? '56px' : '64px'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'inherit'
        },
        logoIcon: {
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            color: '#0ea5e9'
        },
        logoText: {
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 'bold'
        },
        desktopNav: {
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        mobileMenuButton: {
            display: isMobile ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            borderRadius: '8px'
        },
        mobileMenuOverlay: {
            display: mobileMenuOpen ? 'block' : 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100
        },
        mobileMenuDrawer: {
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '280px',
            maxWidth: '80vw',
            backgroundColor: '#1e293b',
            zIndex: 101,
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
        },
        mobileMenuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #334155'
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            color: '#f8fafc',
            textDecoration: 'none',
            borderBottom: '1px solid #334155'
        },
        main: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '16px 12px' : isTablet ? '24px 16px' : '32px 16px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '12px' : '16px',
            marginBottom: isMobile ? '20px' : '32px'
        },
        statCard: {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: isMobile ? '10px' : '12px',
            padding: isMobile ? '16px' : '24px'
        },
        tabsContainer: {
            display: 'flex',
            gap: '8px',
            marginBottom: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #334155',
            paddingBottom: '0'
        },
        tab: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: isMobile ? '12px 16px' : '14px 24px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: '2px solid transparent',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '15px',
            fontWeight: '500',
            transition: 'all 0.2s',
            marginBottom: '-1px'
        },
        activeTab: {
            color: '#0ea5e9',
            borderBottomColor: '#0ea5e9'
        },
        linksSection: {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: isMobile ? '10px' : '12px'
        },
        linksHeader: {
            padding: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '12px' : '0'
        },
        linkItem: {
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderBottom: '1px solid #1e293b'
        },
        linkItemContent: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '12px' : '16px'
        },
        linkItemStats: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: isMobile ? '12px' : '24px',
            flexWrap: 'wrap'
        },
        newLinkButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
            padding: isMobile ? '12px 16px' : '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '500',
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
            minHeight: '44px'
        },
        modalOverlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: isMobile ? '0' : '16px'
        },
        modalContent: {
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: isMobile ? '16px 16px 0 0' : '16px',
            padding: isMobile ? '20px 16px 32px' : '24px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '500px',
            maxHeight: isMobile ? '90vh' : '85vh',
            overflow: 'auto'
        },
        navIconButton: {
            padding: '8px',
            color: '#94a3b8',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            minWidth: '44px',
            minHeight: '44px',
            justifyContent: 'center'
        },
        actionButton: {
            padding: '10px',
            color: '#94a3b8',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        inputGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#cbd5e1',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '14px 16px',
            color: '#f8fafc',
            fontSize: '16px',
            boxSizing: 'border-box'
        },
        inputError: {
            borderColor: '#ef4444'
        },
        textarea: {
            width: '100%',
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '14px 16px',
            color: '#f8fafc',
            fontSize: '16px',
            boxSizing: 'border-box',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit'
        },
        errorText: {
            color: '#ef4444',
            fontSize: '12px',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        charCount: {
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'right',
            marginTop: '4px'
        },
        toggleContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            marginBottom: '16px'
        },
        toggle: {
            position: 'relative',
            width: '52px',
            height: '28px',
            cursor: 'pointer'
        },
        toggleTrack: (isActive) => ({
            position: 'absolute',
            inset: 0,
            backgroundColor: isActive ? '#22c55e' : '#475569',
            borderRadius: '14px',
            transition: 'background-color 0.2s'
        }),
        toggleKnob: (isActive) => ({
            position: 'absolute',
            top: '2px',
            left: isActive ? '26px' : '2px',
            width: '24px',
            height: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            transition: 'left 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }),
        inactiveIndicator: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: '12px',
            borderRadius: '4px',
            marginLeft: '8px'
        }
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#0f172a' 
            }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={styles.navContainer}>
                    <div style={styles.navContent}>
                        <Link to="/" style={styles.logo}>
                            <Link2 style={styles.logoIcon} />
                            <span style={styles.logoText}>AngoraLinks</span>
                        </Link>

                        <div style={styles.desktopNav}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>{t('dashboard.stats.balance')}</p>
                                <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0 }}>
                                    ${user?.balance?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            {user?.isAdmin && (
                                <Link to="/admin" style={{ ...styles.navIconButton, color: '#ef4444' }} title={t('navbar.admin')}>
                                    <Shield style={{ width: '20px', height: '20px' }} />
                                </Link>
                            )}
                            <Link to="/stats" style={styles.navIconButton} title={t('navbar.stats')}>
                                <BarChart3 style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/cpm-rates" style={{ ...styles.navIconButton, color: '#22c55e' }} title={t('cpmRates.title')}>
                                <Globe style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/payouts" style={styles.navIconButton} title={t('navbar.payouts')}>
                                <Wallet style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/profile" style={styles.navIconButton} title={t('navbar.profile')}>
                                <User style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <button onClick={handleLogoutClick} style={styles.actionButton} title={t('navbar.logout')}>
                                <LogOut style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>

                        {isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ textAlign: 'right', marginRight: '4px' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{t('dashboard.stats.balance')}</p>
                                    <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0, fontSize: '14px' }}>
                                        ${user?.balance?.toFixed(4) || '0.0000'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setMobileMenuOpen(true)} 
                                    style={styles.mobileMenuButton}
                                    aria-label={t('common.menu')}
                                >
                                    <Menu style={{ width: '24px', height: '24px' }} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div 
                style={styles.mobileMenuOverlay} 
                onClick={() => setMobileMenuOpen(false)}
            />

            <div style={styles.mobileMenuDrawer}>
                <div style={styles.mobileMenuHeader}>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>{t('common.menu')}</span>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        style={styles.actionButton}
                        aria-label={t('common.close')}
                    >
                        <X style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>

                <div style={{ padding: '16px', borderBottom: '1px solid #334155', backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>{t('dashboard.stats.balance')}</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>
                        ${user?.balance?.toFixed(4) || '0.0000'}
                    </p>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    {user?.isAdmin && (
                        <Link 
                            to="/admin" 
                            style={{ ...styles.mobileMenuItem, color: '#ef4444' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Shield style={{ width: '20px', height: '20px' }} />
                            {t('navbar.admin')}
                        </Link>
                    )}
                    <Link 
                        to="/stats" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <BarChart3 style={{ width: '20px', height: '20px' }} />
                        {t('navbar.stats')}
                    </Link>
                    <Link 
                        to="/cpm-rates" 
                        style={{ ...styles.mobileMenuItem, color: '#22c55e' }}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Globe style={{ width: '20px', height: '20px' }} />
                        {t('cpmRates.title')}
                    </Link>
                    <Link 
                        to="/payouts" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Wallet style={{ width: '20px', height: '20px' }} />
                        {t('navbar.payouts')}
                    </Link>
                    <Link 
                        to="/profile" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <User style={{ width: '20px', height: '20px' }} />
                        {t('navbar.profile')}
                    </Link>
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
                    <button
                        onClick={handleLogoutClick}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        <LogOut style={{ width: '20px', height: '20px' }} />
                        {t('navbar.logout')}
                    </button>
                </div>
            </div>

            <main style={styles.main}>
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                backgroundColor: 'rgba(14, 165, 233, 0.2)', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Link2 style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>{t('dashboard.stats.allLinks')}</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{links.length}</p>
                            </div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                backgroundColor: 'rgba(34, 197, 94, 0.2)', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <MousePointer style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>{t('dashboard.stats.totalClicks')}</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                                    {links.reduce((acc, l) => acc + l.totalClicks, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                backgroundColor: 'rgba(234, 179, 8, 0.2)', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <DollarSign style={{ width: '20px', height: '20px', color: '#eab308' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>{t('dashboard.stats.earned')}</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                                    ${links.reduce((acc, l) => acc + (parseFloat(l.totalEarned) || 0), 0).toFixed(4)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.tabsContainer}>
                    <button
                        onClick={() => setActiveTab('links')}
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'links' ? styles.activeTab : {})
                        }}
                    >
                        <Link2 style={{ width: '18px', height: '18px' }} />
                        {t('dashboard.tabs.links')}
                    </button>
                    <button
                        onClick={() => setActiveTab('referrals')}
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'referrals' ? styles.activeTab : {})
                        }}
                    >
                        <Gift style={{ width: '18px', height: '18px' }} />
                        {t('dashboard.tabs.referrals')}
                    </button>
                </div>

                {activeTab === 'referrals' ? (
                    <ReferralSection isMobile={isMobile} />
                ) : (
                    <div style={styles.linksSection}>
                        <div style={styles.linksHeader}>
                            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '600', margin: 0 }}>
                                {t('dashboard.yourLinks')}
                            </h2>
                            <button onClick={() => setShowModal(true)} style={styles.newLinkButton}>
                                <Plus style={{ width: '16px', height: '16px' }} />
                                {t('dashboard.links.create')}
                            </button>
                        </div>

                        {links.length === 0 ? (
                            <div style={{ padding: isMobile ? '32px 16px' : '48px', textAlign: 'center' }}>
                                <Link2 style={{ width: '48px', height: '48px', color: '#475569', margin: '0 auto 16px' }} />
                                <p style={{ color: '#94a3b8' }}>{t('dashboard.links.noLinks')}</p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    style={{ 
                                        marginTop: '16px', 
                                        color: '#0ea5e9', 
                                        background: 'none', 
                                        border: 'none', 
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        fontSize: '16px'
                                    }}
                                >
                                    {t('dashboard.links.createFirst')}
                                </button>
                            </div>
                        ) : (
                            <div>
                                {links.map((link) => (
                                    <div 
                                        key={link.id} 
                                        style={{
                                            ...styles.linkItem,
                                            opacity: link.isActive === false ? 0.6 : 1
                                        }}
                                    >
                                        <div style={styles.linkItemContent}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <p style={{ 
                                                        fontWeight: '500', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap', 
                                                        margin: 0,
                                                        fontSize: isMobile ? '15px' : '16px'
                                                    }}>
                                                        {link.title || link.originalUrl}
                                                    </p>
                                                    {link.isActive === false && (
                                                        <span style={styles.inactiveIndicator}>
                                                            <X style={{ width: '12px', height: '12px' }} />
                                                            {t('dashboard.links.inactive')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ 
                                                    fontSize: '13px', 
                                                    color: '#94a3b8', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', 
                                                    whiteSpace: 'nowrap', 
                                                    margin: '4px 0' 
                                                }}>
                                                    {link.originalUrl}
                                                </p>
                                                <p style={{ fontSize: '14px', color: '#0ea5e9', margin: 0 }}>
                                                    {link.shortUrl.replace(':3000', ':5173')}
                                                </p>
                                            </div>

                                            <div style={styles.linkItemStats}>
                                                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{t('dashboard.links.clicks')}</p>
                                                    <p style={{ fontWeight: '600', margin: 0, fontSize: isMobile ? '16px' : '14px' }}>
                                                        {link.totalClicks}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{t('dashboard.links.earned')}</p>
                                                    <p style={{ fontWeight: '600', color: '#22c55e', margin: 0, fontSize: isMobile ? '16px' : '14px' }}>
                                                        ${parseFloat(link.totalEarned || 0).toFixed(4)}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <button
                                                        onClick={() => openEditModal(link)}
                                                        style={{ ...styles.actionButton, color: '#0ea5e9' }}
                                                        title={t('common.edit')}
                                                    >
                                                        <Edit3 style={{ width: '18px', height: '18px' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => copyLink(link.shortUrl)}
                                                        style={styles.actionButton}
                                                        title={t('dashboard.links.copyLink')}
                                                    >
                                                        <Copy style={{ width: '18px', height: '18px' }} />
                                                    </button>
                                                    <a
                                                        href={link.shortUrl.replace(':3000', ':5173')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={styles.actionButton}
                                                        title={t('dashboard.links.openOriginal')}
                                                    >
                                                        <ExternalLink style={{ width: '18px', height: '18px' }} />
                                                    </a>
                                                    <button
                                                        onClick={() => deleteLink(link.id)}
                                                        style={{ ...styles.actionButton, color: '#ef4444' }}
                                                        title={t('common.delete')}
                                                    >
                                                        <Trash2 style={{ width: '18px', height: '18px' }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {showModal && (
                <div 
                    style={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                >
                    <div style={styles.modalContent}>
                        {isMobile && (
                            <div style={{ 
                                width: '40px', 
                                height: '4px', 
                                backgroundColor: '#475569', 
                                borderRadius: '2px', 
                                margin: '0 auto 16px' 
                            }} />
                        )}
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>{t('dashboard.createModal.title')}</h2>
                        <form onSubmit={createLink}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>
                                    {t('dashboard.createModal.urlLabel')} *
                                </label>
                                <input
                                    type="url"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                        padding: '14px 16px',
                                        color: '#f8fafc',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder={t('dashboard.createModal.urlPlaceholder')}
                                    required
                                    autoFocus={!isMobile}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>
                                    {t('dashboard.createModal.titleLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={newLink.title}
                                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #475569',
                                        borderRadius: '8px',
                                        padding: '14px 16px',
                                        color: '#f8fafc',
                                        fontSize: '16px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder={t('dashboard.createModal.titlePlaceholder')}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#475569',
                                        color: '#ffffff',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        minHeight: '48px'
                                    }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#0ea5e9',
                                        color: '#ffffff',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: creating ? 'not-allowed' : 'pointer',
                                        opacity: creating ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        minHeight: '48px'
                                    }}
                                >
                                    {creating ? (
                                        <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                    ) : (
                                        t('dashboard.createModal.create')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && editingLink && (
                <div 
                    style={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeEditModal();
                    }}
                >
                    <div style={styles.modalContent}>
                        {isMobile && (
                            <div style={{ 
                                width: '40px', 
                                height: '4px', 
                                backgroundColor: '#475569', 
                                borderRadius: '2px', 
                                margin: '0 auto 16px' 
                            }} />
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{t('dashboard.editModal.title')}</h2>
                            <button
                                onClick={closeEditModal}
                                style={{ ...styles.actionButton, padding: '8px' }}
                            >
                                <X style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>

                        <div style={{ 
                            padding: '12px 16px', 
                            backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                            borderRadius: '8px', 
                            marginBottom: '20px' 
                        }}>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>{t('dashboard.editModal.shortUrl')}</p>
                            <p style={{ fontSize: '14px', color: '#0ea5e9', margin: 0, fontWeight: '500' }}>
                                {editingLink.shortUrl?.replace(':3000', ':5173')}
                            </p>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    {t('dashboard.editModal.urlLabel')} *
                                </label>
                                <input
                                    type="url"
                                    value={editForm.originalUrl}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, originalUrl: e.target.value });
                                        if (editErrors.originalUrl) {
                                            setEditErrors({ ...editErrors, originalUrl: null });
                                        }
                                    }}
                                    style={{
                                        ...styles.input,
                                        ...(editErrors.originalUrl ? styles.inputError : {})
                                    }}
                                    placeholder="https://example.com/page"
                                />
                                {editErrors.originalUrl && (
                                    <p style={styles.errorText}>
                                        <AlertCircle style={{ width: '14px', height: '14px' }} />
                                        {editErrors.originalUrl}
                                    </p>
                                )}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    {t('dashboard.editModal.titleLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, title: e.target.value });
                                        if (editErrors.title) {
                                            setEditErrors({ ...editErrors, title: null });
                                        }
                                    }}
                                    style={{
                                        ...styles.input,
                                        ...(editErrors.title ? styles.inputError : {})
                                    }}
                                    placeholder={t('dashboard.createModal.titlePlaceholder')}
                                    maxLength={100}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {editErrors.title ? (
                                        <p style={styles.errorText}>
                                            <AlertCircle style={{ width: '14px', height: '14px' }} />
                                            {editErrors.title}
                                        </p>
                                    ) : <span />}
                                    <p style={styles.charCount}>{editForm.title.length}/100</p>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    {t('dashboard.editModal.descriptionLabel')}
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, description: e.target.value });
                                        if (editErrors.description) {
                                            setEditErrors({ ...editErrors, description: null });
                                        }
                                    }}
                                    style={{
                                        ...styles.textarea,
                                        ...(editErrors.description ? styles.inputError : {})
                                    }}
                                    placeholder={t('dashboard.editModal.descriptionPlaceholder')}
                                    maxLength={500}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {editErrors.description ? (
                                        <p style={styles.errorText}>
                                            <AlertCircle style={{ width: '14px', height: '14px' }} />
                                            {editErrors.description}
                                        </p>
                                    ) : <span />}
                                    <p style={styles.charCount}>{editForm.description.length}/500</p>
                                </div>
                            </div>

                            <div style={styles.toggleContainer}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '500', fontSize: '14px' }}>{t('dashboard.editModal.statusLabel')}</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                                        {editForm.isActive ? t('dashboard.editModal.statusActive') : t('dashboard.editModal.statusInactive')}
                                    </p>
                                </div>
                                <div 
                                    style={styles.toggle}
                                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                                >
                                    <div style={styles.toggleTrack(editForm.isActive)} />
                                    <div style={styles.toggleKnob(editForm.isActive)} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column-reverse' : 'row', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#475569',
                                        color: '#ffffff',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        minHeight: '48px'
                                    }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#22c55e',
                                        color: '#ffffff',
                                        padding: '14px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: updating ? 'not-allowed' : 'pointer',
                                        opacity: updating ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        minHeight: '48px'
                                    }}
                                >
                                    {updating ? (
                                        <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                    ) : (
                                        <>
                                            <Check style={{ width: '18px', height: '18px' }} />
                                            {t('dashboard.editModal.save')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div 
                    style={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowLogoutModal(false);
                    }}
                >
                    <div style={{ ...styles.modalContent, textAlign: 'center' }}>
                        {isMobile && (
                            <div style={{ 
                                width: '40px', 
                                height: '4px', 
                                backgroundColor: '#475569', 
                                borderRadius: '2px', 
                                margin: '0 auto 16px' 
                            }} />
                        )}
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <LogOut style={{ width: '32px', height: '32px', color: '#ef4444' }} />
                        </div>

                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#f8fafc' }}>
                            {t('logout.confirmTitle')}
                        </h2>

                        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
                            {t('logout.confirmMessage')}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#475569',
                                    color: '#ffffff',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    minHeight: '48px'
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleLogoutConfirm}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    minHeight: '48px'
                                }}
                            >
                                <LogOut style={{ width: '16px', height: '16px' }} />
                                {t('navbar.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;