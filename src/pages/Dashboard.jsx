import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Link2, Plus, Copy, ExternalLink, Trash2, DollarSign, MousePointer, LogOut, Loader2, BarChart3, Shield, User, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', title: '' });

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        toast.success('Wylogowano');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
            {/* Navbar */}
            <nav style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(15, 23, 42, 0.8)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                            <Link2 style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>AngoraLinks</span>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Saldo</p>
                                <p style={{ fontWeight: '600', color: '#0ea5e9' }}>${user?.balance?.toFixed(4) || '0.0000'}</p>
                            </div>
                            {user?.isAdmin && (
                                <Link
                                    to="/admin"
                                    style={{ padding: '8px', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                    title="Panel Admina"
                                >
                                    <Shield style={{ width: '20px', height: '20px' }} />
                                </Link>
                            )}
                            <Link
                                to="/stats"
                                style={{ padding: '8px', color: '#94a3b8', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                title="Statystyki"
                            >
                                <BarChart3 style={{ width: '20px', height: '20px' }} />
                            </Link>
                            {/* NOWY PRZYCISK WYPŁAT */}
                            <Link
                                to="/payouts"
                                style={{ padding: '8px', color: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                title="Wypłaty"
                            >
                                <Wallet style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link
                                to="/profile"
                                style={{ padding: '8px', color: '#94a3b8', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                title="Profil"
                            >
                                <User style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{ padding: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Wyloguj"
                            >
                                <LogOut style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(14, 165, 233, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Link2 style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Wszystkie linki</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{links.length}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MousePointer style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Całkowite kliknięcia</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {links.reduce((acc, l) => acc + l.totalClicks, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(234, 179, 8, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <DollarSign style={{ width: '20px', height: '20px', color: '#eab308' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Zarobione (85%)</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    ${links.reduce((acc, l) => acc + (parseFloat(l.totalEarned) || 0), 0).toFixed(4)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Links Section */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Twoje linki</h2>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#0ea5e9',
                                color: '#ffffff',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus style={{ width: '16px', height: '16px' }} />
                            Nowy link
                        </button>
                    </div>

                    {links.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center' }}>
                            <Link2 style={{ width: '48px', height: '48px', color: '#475569', margin: '0 auto 16px' }} />
                            <p style={{ color: '#94a3b8' }}>Nie masz jeszcze żadnych linków</p>
                            <button
                                onClick={() => setShowModal(true)}
                                style={{ marginTop: '16px', color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                Utwórz pierwszy link
                            </button>
                        </div>
                    ) : (
                        <div>
                            {links.map((link) => (
                                <div key={link.id} style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <p style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {link.title || link.originalUrl}
                                            </p>
                                            <p style={{ fontSize: '14px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {link.originalUrl}
                                            </p>
                                            <p style={{ fontSize: '14px', color: '#0ea5e9', marginTop: '4px' }}>
                                                {link.shortUrl.replace(':3000', ':5173')}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Kliknięcia</p>
                                                <p style={{ fontWeight: '600' }}>{link.totalClicks}</p>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Zarobione</p>
                                                <p style={{ fontWeight: '600', color: '#22c55e' }}>
                                                    ${parseFloat(link.totalEarned || 0).toFixed(4)}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => copyLink(link.shortUrl)}
                                                    style={{ padding: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                                                    title="Kopiuj"
                                                >
                                                    <Copy style={{ width: '16px', height: '16px' }} />
                                                </button>
                                                <a
                                                    href={link.shortUrl.replace(':3000', ':5173')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ padding: '8px', color: '#94a3b8', borderRadius: '8px' }}
                                                    title="Otwórz"
                                                >
                                                    <ExternalLink style={{ width: '16px', height: '16px' }} />
                                                </a>
                                                <button
                                                    onClick={() => deleteLink(link.id)}
                                                    style={{ padding: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                                                    title="Usuń"
                                                >
                                                    <Trash2 style={{ width: '16px', height: '16px' }} />
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '400px'
                    }}>
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
                                        padding: '12px 16px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    placeholder="https://example.com/long-url"
                                    required
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
                                        padding: '12px 16px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Mój link"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#475569',
                                        color: '#ffffff',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: 'pointer'
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
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        fontWeight: '500',
                                        cursor: creating ? 'not-allowed' : 'pointer',
                                        opacity: creating ? 0.7 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
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
        </div>
    );
}

export default Dashboard;