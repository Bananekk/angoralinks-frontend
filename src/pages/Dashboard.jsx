// Dashboard.jsx - RESPONSYWNY
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Link2, Plus, Copy, ExternalLink, Trash2, DollarSign, MousePointer, 
    LogOut, Loader2, BarChart3, Shield, User, Wallet, Globe, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

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
    
    const [user, setUser] = useState(null);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', title: '' });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
            console.error('Błąd pobierania danych użytkownika:', error);
        }
    };

    const fetchLinks = async () => {
        try {
            const response = await api.get('/links');
            setLinks(response.data.links);
        } catch (error) {
            toast.error('Błąd pobierania linków');
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
            toast.success('Link utworzony!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd tworzenia linka');
        } finally {
            setCreating(false);
        }
    };

    const deleteLink = async (id) => {
        if (!confirm('Czy na pewno chcesz usunąć ten link?')) return;

        try {
            await api.delete(`/links/${id}`);
            setLinks(links.filter(l => l.id !== id));
            toast.success('Link usunięty');
        } catch (error) {
            toast.error('Błąd usuwania linka');
        }
    };

    const copyLink = (shortUrl) => {
        const frontendUrl = shortUrl.replace(':3000', ':5173');
        navigator.clipboard.writeText(frontendUrl);
        toast.success('Skopiowano do schowka!');
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
        toast.success('Wylogowano');
    };

    // 🎨 Responsywne style
    const styles = {
        // Navbar
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
        
        // Desktop nav
        desktopNav: {
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        
        // Mobile menu button
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
        
        // Mobile menu overlay
        mobileMenuOverlay: {
            display: mobileMenuOpen ? 'block' : 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100
        },
        
        // Mobile menu drawer
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
        
        // Mobile menu header
        mobileMenuHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #334155'
        },
        
        // Mobile menu items
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            color: '#f8fafc',
            textDecoration: 'none',
            borderBottom: '1px solid #334155'
        },
        
        // Main content
        main: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '16px 12px' : isTablet ? '24px 16px' : '32px 16px'
        },
        
        // Stats grid
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '12px' : '16px',
            marginBottom: isMobile ? '20px' : '32px'
        },
        
        // Stat card
        statCard: {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: isMobile ? '10px' : '12px',
            padding: isMobile ? '16px' : '24px'
        },
        
        // Links section
        linksSection: {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: isMobile ? '10px' : '12px'
        },
        
        // Links header
        linksHeader: {
            padding: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '12px' : '0'
        },
        
        // Link item
        linkItem: {
            padding: isMobile ? '12px 16px' : '16px 24px',
            borderBottom: '1px solid #1e293b'
        },
        
        // Link item content
        linkItemContent: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '12px' : '16px'
        },
        
        // Link item stats row (mobile)
        linkItemStats: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: isMobile ? '12px' : '24px',
            flexWrap: 'wrap'
        },
        
        // New link button
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
        
        // Modal
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
            maxWidth: isMobile ? '100%' : '400px',
            maxHeight: isMobile ? '90vh' : 'auto',
            overflow: 'auto'
        },
        
        // Nav icon button
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
        
        // Action button (copy, delete, etc)
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
                        {/* Logo */}
                        <Link to="/" style={styles.logo}>
                            <Link2 style={styles.logoIcon} />
                            <span style={styles.logoText}>AngoraLinks</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div style={styles.desktopNav}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Saldo</p>
                                <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0 }}>
                                    ${user?.balance?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            {user?.isAdmin && (
                                <Link to="/admin" style={{ ...styles.navIconButton, color: '#ef4444' }} title="Panel Admina">
                                    <Shield style={{ width: '20px', height: '20px' }} />
                                </Link>
                            )}
                            <Link to="/stats" style={styles.navIconButton} title="Statystyki">
                                <BarChart3 style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/cpm-rates" style={{ ...styles.navIconButton, color: '#22c55e' }} title="Stawki CPM">
                                <Globe style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/payouts" style={styles.navIconButton} title="Wypłaty">
                                <Wallet style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/profile" style={styles.navIconButton} title="Profil">
                                <User style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <button onClick={handleLogoutClick} style={styles.actionButton} title="Wyloguj">
                                <LogOut style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>

                        {/* Mobile: Balance + Hamburger */}
                        {isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ textAlign: 'right', marginRight: '4px' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Saldo</p>
                                    <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0, fontSize: '14px' }}>
                                        ${user?.balance?.toFixed(4) || '0.0000'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setMobileMenuOpen(true)} 
                                    style={styles.mobileMenuButton}
                                    aria-label="Otwórz menu"
                                >
                                    <Menu style={{ width: '24px', height: '24px' }} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                style={styles.mobileMenuOverlay} 
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div style={styles.mobileMenuDrawer}>
                <div style={styles.mobileMenuHeader}>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>Menu</span>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        style={styles.actionButton}
                        aria-label="Zamknij menu"
                    >
                        <X style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>

                {/* Mobile Balance Card */}
                <div style={{ padding: '16px', borderBottom: '1px solid #334155', backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>Twoje saldo</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>
                        ${user?.balance?.toFixed(4) || '0.0000'}
                    </p>
                </div>

                {/* Mobile Menu Items */}
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {user?.isAdmin && (
                        <Link 
                            to="/admin" 
                            style={{ ...styles.mobileMenuItem, color: '#ef4444' }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Shield style={{ width: '20px', height: '20px' }} />
                            Panel Admina
                        </Link>
                    )}
                    <Link 
                        to="/stats" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <BarChart3 style={{ width: '20px', height: '20px' }} />
                        Statystyki
                    </Link>
                    <Link 
                        to="/cpm-rates" 
                        style={{ ...styles.mobileMenuItem, color: '#22c55e' }}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Globe style={{ width: '20px', height: '20px' }} />
                        Stawki CPM
                    </Link>
                    <Link 
                        to="/payouts" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Wallet style={{ width: '20px', height: '20px' }} />
                        Wypłaty
                    </Link>
                    <Link 
                        to="/profile" 
                        style={styles.mobileMenuItem}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <User style={{ width: '20px', height: '20px' }} />
                        Profil
                    </Link>
                </div>

                {/* Logout at bottom */}
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
                        Wyloguj się
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main style={styles.main}>
                {/* Stats Cards */}
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
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Wszystkie linki</p>
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
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Całkowite kliknięcia</p>
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
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Zarobione (85%)</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                                    ${links.reduce((acc, l) => acc + (parseFloat(l.totalEarned) || 0), 0).toFixed(4)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links Section */}
                <div style={styles.linksSection}>
                    <div style={styles.linksHeader}>
                        <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '600', margin: 0 }}>
                            Twoje linki
                        </h2>
                        <button onClick={() => setShowModal(true)} style={styles.newLinkButton}>
                            <Plus style={{ width: '16px', height: '16px' }} />
                            Nowy link
                        </button>
                    </div>

                    {links.length === 0 ? (
                        <div style={{ padding: isMobile ? '32px 16px' : '48px', textAlign: 'center' }}>
                            <Link2 style={{ width: '48px', height: '48px', color: '#475569', margin: '0 auto 16px' }} />
                            <p style={{ color: '#94a3b8' }}>Nie masz jeszcze żadnych linków</p>
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
                                Utwórz pierwszy link
                            </button>
                        </div>
                    ) : (
                        <div>
                            {links.map((link) => (
                                <div key={link.id} style={styles.linkItem}>
                                    <div style={styles.linkItemContent}>
                                        {/* Link Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
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

                                        {/* Stats + Actions */}
                                        <div style={styles.linkItemStats}>
                                            <div style={{ textAlign: 'center', minWidth: '60px' }}>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Kliknięcia</p>
                                                <p style={{ fontWeight: '600', margin: 0, fontSize: isMobile ? '16px' : '14px' }}>
                                                    {link.totalClicks}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Zarobione</p>
                                                <p style={{ fontWeight: '600', color: '#22c55e', margin: 0, fontSize: isMobile ? '16px' : '14px' }}>
                                                    ${parseFloat(link.totalEarned || 0).toFixed(4)}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <button
                                                    onClick={() => copyLink(link.shortUrl)}
                                                    style={styles.actionButton}
                                                    title="Kopiuj"
                                                >
                                                    <Copy style={{ width: '18px', height: '18px' }} />
                                                </button>
                                                <a
                                                    href={link.shortUrl.replace(':3000', ':5173')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={styles.actionButton}
                                                    title="Otwórz"
                                                >
                                                    <ExternalLink style={{ width: '18px', height: '18px' }} />
                                                </a>
                                                <button
                                                    onClick={() => deleteLink(link.id)}
                                                    style={{ ...styles.actionButton, color: '#ef4444' }}
                                                    title="Usuń"
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
            </main>

            {/* Create Link Modal */}
            {showModal && (
                <div 
                    style={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowModal(false);
                    }}
                >
                    <div style={styles.modalContent}>
                        {/* Mobile drag indicator */}
                        {isMobile && (
                            <div style={{ 
                                width: '40px', 
                                height: '4px', 
                                backgroundColor: '#475569', 
                                borderRadius: '2px', 
                                margin: '0 auto 16px' 
                            }} />
                        )}
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Nowy link</h2>
                        <form onSubmit={createLink}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>
                                    URL do skrócenia *
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
                                    placeholder="https://example.com/long-url"
                                    required
                                    autoFocus={!isMobile}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>
                                    Tytuł (opcjonalnie)
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
                                    placeholder="Mój link"
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
                                    Anuluj
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
                                        'Utwórz'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div 
                    style={styles.modalOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowLogoutModal(false);
                    }}
                >
                    <div style={{ ...styles.modalContent, textAlign: 'center' }}>
                        {/* Mobile drag indicator */}
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
                            Wylogowanie
                        </h2>

                        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
                            Czy na pewno chcesz się wylogować z konta?
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
                                Anuluj
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
                                Wyloguj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;