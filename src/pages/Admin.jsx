// Admin.jsx - PEŁNY PLIK Z ZAKŁADKĄ SECURITY
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, Users, Link2, BarChart3, DollarSign, MousePointer,
    ArrowLeft, Loader2, Trash2, UserX, UserCheck, Crown,
    TrendingUp, Calendar, Wallet, CheckCircle, XCircle, Clock, AlertCircle,
    Mail, MessageSquare, Eye, EyeOff, Menu, X, LogOut, Globe, User,
    Search, Lock, Unlock, History, MapPin, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Admin() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [links, setLinks] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Security tab state
    const [securityLoading, setSecurityLoading] = useState(false);
    const [encryptionStatus, setEncryptionStatus] = useState(null);
    const [securityStats, setSecurityStats] = useState(null);
    const [searchType, setSearchType] = useState('user');
    const [searchId, setSearchId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [ipHistory, setIpHistory] = useState(null);
    const [historyPage, setHistoryPage] = useState(1);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.isAdmin) {
            navigate('/dashboard');
            toast.error('Brak uprawnień administratora');
            return;
        }
        setCurrentUser(user);
        fetchData();
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSecurityData();
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, linksRes, payoutsRes, messagesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/links'),
                api.get('/admin/payouts'),
                api.get('/admin/messages')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.users);
            setLinks(linksRes.data.links);
            setPayouts(payoutsRes.data.payouts || []);
            setMessages(messagesRes.data.messages || []);
            setUnreadCount(messagesRes.data.unreadCount || 0);
        } catch (error) {
            toast.error('Błąd pobierania danych');
            if (error.response?.status === 403) {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSecurityData = async () => {
        try {
            const [statusRes, statsRes] = await Promise.all([
                api.get('/admin/security/encryption-status'),
                api.get('/admin/security/stats')
            ]);
            setEncryptionStatus(statusRes.data);
            setSecurityStats(statsRes.data.stats);
        } catch (error) {
            console.error('Błąd pobierania danych bezpieczeństwa:', error);
        }
    };

    // Security functions
    const decryptUserIp = async () => {
        if (!searchId.trim()) {
            toast.error('Wprowadź ID użytkownika');
            return;
        }
        setSecurityLoading(true);
        setSearchResult(null);
        setIpHistory(null);
        try {
            const response = await api.post('/admin/security/decrypt-user-ip', { userId: searchId.trim() });
            setSearchResult({ type: 'user', data: response.data.user });
            toast.success('IP odszyfrowane');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Nie znaleziono użytkownika');
        } finally {
            setSecurityLoading(false);
        }
    };

    const decryptVisitIp = async () => {
        if (!searchId.trim()) {
            toast.error('Wprowadź ID wizyty');
            return;
        }
        setSecurityLoading(true);
        setSearchResult(null);
        try {
            const response = await api.post('/admin/security/decrypt-visit-ip', { visitId: searchId.trim() });
            setSearchResult({ type: 'visit', data: response.data.visit });
            toast.success('IP odszyfrowane');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Nie znaleziono wizyty');
        } finally {
            setSecurityLoading(false);
        }
    };

    const searchByIp = async () => {
        if (!searchId.trim()) {
            toast.error('Wprowadź adres IP');
            return;
        }
        setSecurityLoading(true);
        setSearchResult(null);
        try {
            const response = await api.post('/admin/security/search-by-ip', { ip: searchId.trim() });
            setSearchResult({ type: 'ip-search', data: response.data });
            toast.success(`Znaleziono ${response.data.count} użytkowników`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd wyszukiwania');
        } finally {
            setSecurityLoading(false);
        }
    };

    const fetchIpHistory = async (userId, page = 1) => {
        setSecurityLoading(true);
        try {
            const response = await api.get(`/admin/security/user-ip-history/${userId}?page=${page}&limit=10`);
            setIpHistory(response.data);
            setHistoryPage(page);
        } catch (error) {
            toast.error('Nie udało się pobrać historii');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleSecuritySearch = () => {
        switch (searchType) {
            case 'user': decryptUserIp(); break;
            case 'visit': decryptVisitIp(); break;
            case 'ip': searchByIp(); break;
        }
    };

    const toggleUserStatus = async (userId, isActive) => {
        try {
            await api.put(`/admin/users/${userId}`, { isActive: !isActive });
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
            toast.success('Status użytkownika zmieniony');
        } catch (error) {
            toast.error('Błąd zmiany statusu');
        }
    };

    const toggleUserAdmin = async (userId, isAdmin) => {
        try {
            await api.put(`/admin/users/${userId}`, { isAdmin: !isAdmin });
            setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !isAdmin } : u));
            toast.success('Uprawnienia zmienione');
        } catch (error) {
            toast.error('Błąd zmiany uprawnień');
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
            toast.success('Użytkownik usunięty');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd usuwania');
        }
    };

    const deleteLink = async (linkId) => {
        if (!confirm('Czy na pewno chcesz usunąć ten link?')) return;
        try {
            await api.delete(`/admin/links/${linkId}`);
            setLinks(links.filter(l => l.id !== linkId));
            toast.success('Link usunięty');
        } catch (error) {
            toast.error('Błąd usuwania linka');
        }
    };

    const updatePayoutStatus = async (payoutId, newStatus) => {
        const statusLabels = { 'PROCESSING': 'przetwarzanie', 'COMPLETED': 'zrealizowana', 'REJECTED': 'odrzucona' };
        if (!confirm(`Czy na pewno chcesz zmienić status na "${statusLabels[newStatus]}"?`)) return;
        try {
            await api.put(`/admin/payouts/${payoutId}`, { status: newStatus });
            setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status: newStatus, processedAt: new Date().toISOString() } : p));
            toast.success(`Status zmieniony na: ${statusLabels[newStatus]}`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd zmiany statusu');
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await api.put(`/admin/messages/${messageId}/read`, { sendNotification: true });
            setMessages(messages.map(m => m.id === messageId ? { ...m, isRead: true } : m));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Oznaczono jako przeczytane');
        } catch (error) {
            toast.error('Błąd oznaczania wiadomości');
        }
    };

    const deleteMessage = async (messageId) => {
        if (!confirm('Czy na pewno chcesz usunąć tę wiadomość?')) return;
        try {
            const message = messages.find(m => m.id === messageId);
            await api.delete(`/admin/messages/${messageId}`);
            setMessages(messages.filter(m => m.id !== messageId));
            if (!message.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Wiadomość usunięta');
        } catch (error) {
            toast.error('Błąd usuwania wiadomości');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        toast.success('Wylogowano');
    };

    const getPayoutStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: 'bg-yellow-900/50', color: 'text-yellow-400', icon: Clock, text: 'Oczekuje' },
            PROCESSING: { bg: 'bg-blue-900/50', color: 'text-blue-400', icon: Loader2, text: 'Przetwarzanie' },
            COMPLETED: { bg: 'bg-green-900/50', color: 'text-green-400', icon: CheckCircle, text: 'Zrealizowana' },
            REJECTED: { bg: 'bg-red-900/50', color: 'text-red-400', icon: XCircle, text: 'Odrzucona' }
        };
        const s = styles[status] || styles.PENDING;
        const Icon = s.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${s.bg} ${s.color}`}>
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{s.text}</span>
            </span>
        );
    };

    const getMethodLabel = (method) => {
        const methods = { 'paypal': 'PayPal', 'PAYPAL': 'PayPal', 'btc': 'Bitcoin', 'BITCOIN': 'Bitcoin', 'bitcoin': 'Bitcoin', 'usdt_trc20': 'USDT', 'ltc': 'Litecoin' };
        return methods[method] || method;
    };

    const payoutStats = {
        pending: payouts.filter(p => p.status === 'PENDING').length,
        pendingAmount: payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0),
        completed: payouts.filter(p => p.status === 'COMPLETED').length,
        completedAmount: payouts.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    const formatDate = (date) => new Date(date).toLocaleString('pl-PL');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const maxVisits = Math.max(...(stats?.dailyStats?.map(d => d.visits) || [1]));
    const maxSecurityChart = securityStats?.last7Days ? Math.max(...securityStats.last7Days.map(d => d.count), 1) : 1;

    const tabs = [
        { id: 'stats', label: 'Statystyki', icon: BarChart3 },
        { id: 'users', label: 'Użytkownicy', icon: Users },
        { id: 'links', label: 'Linki', icon: Link2 },
        { id: 'payouts', label: 'Wypłaty', icon: Wallet, badge: payoutStats.pending },
        { id: 'messages', label: 'Wiadomości', icon: MessageSquare, badge: unreadCount },
        { id: 'security', label: 'Bezpieczeństwo', icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-red-500" />
                            <span className="font-bold text-lg sm:text-xl">Admin</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 text-slate-400 hover:text-white" title="Dashboard">
                            <Link2 className="w-5 h-5" />
                        </Link>
                        <Link to="/cpm-rates" className="p-2 text-green-500" title="CPM">
                            <Globe className="w-5 h-5" />
                        </Link>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white" title="Wyloguj">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setMobileMenuOpen(false)} />}

            {/* Mobile Menu Drawer */}
            <div className={`fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-slate-800 z-[101] transform transition-transform duration-300 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <span className="font-semibold text-lg">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400"><X className="w-6 h-6" /></button>
                </div>
                <nav className="flex-1 overflow-auto">
                    <Link to="/dashboard" className="flex items-center gap-3 p-4 border-b border-slate-700" onClick={() => setMobileMenuOpen(false)}><Link2 className="w-5 h-5" /> Dashboard</Link>
                    <Link to="/stats" className="flex items-center gap-3 p-4 border-b border-slate-700" onClick={() => setMobileMenuOpen(false)}><BarChart3 className="w-5 h-5" /> Statystyki</Link>
                    <Link to="/cpm-rates" className="flex items-center gap-3 p-4 border-b border-slate-700 text-green-500" onClick={() => setMobileMenuOpen(false)}><Globe className="w-5 h-5" /> Stawki CPM</Link>
                    <Link to="/payouts" className="flex items-center gap-3 p-4 border-b border-slate-700" onClick={() => setMobileMenuOpen(false)}><Wallet className="w-5 h-5" /> Wypłaty</Link>
                    <Link to="/profile" className="flex items-center gap-3 p-4 border-b border-slate-700" onClick={() => setMobileMenuOpen(false)}><User className="w-5 h-5" /> Profil</Link>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full p-3 bg-red-500/10 text-red-500 border border-red-500 rounded-lg font-medium">
                        <LogOut className="w-5 h-5" /> Wyloguj się
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-800 overflow-x-auto">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex gap-1 sm:gap-4 min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 transition whitespace-nowrap text-sm sm:text-base min-h-[48px] ${
                                    activeTab === tab.id ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{tab.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Tab: Statystyki */}
                {activeTab === 'stats' && (
                    <div className="space-y-4 sm:space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Użytkownicy</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.users?.total || 0}</p>
                                <p className="text-xs sm:text-sm text-green-500">+{stats?.users?.newToday || 0} dzisiaj</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <Link2 className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Linki</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.links?.total || 0}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <MousePointer className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Wizyty</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.visits?.total || 0}</p>
                                <p className="text-xs sm:text-sm text-green-500">+{stats?.visits?.today || 0} dzisiaj</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Zarobek</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-green-500">${stats?.earnings?.platformTotal?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                            <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                                Ostatnie 7 dni
                            </h2>
                            <div className="flex items-end justify-between gap-1 sm:gap-2 h-32 sm:h-48 overflow-x-auto">
                                {stats?.dailyStats?.map((day, index) => (
                                    <div key={index} className="flex-1 min-w-[36px] flex flex-col items-center gap-1 sm:gap-2">
                                        <div className="w-full bg-slate-700 rounded-t-lg relative" style={{ height: '80px' }}>
                                            <div className="absolute bottom-0 w-full bg-cyan-500 rounded-t-lg transition-all duration-500" style={{ height: `${maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0}%`, minHeight: day.visits > 0 ? '8px' : '0' }} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] sm:text-xs text-slate-400">{new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}</p>
                                            <p className="text-xs sm:text-sm font-semibold">{day.visits}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Użytkownicy */}
                {activeTab === 'users' && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-3 sm:p-4 border-b border-slate-700">
                            <h2 className="font-semibold text-sm sm:text-base">Użytkownicy ({users.length})</h2>
                        </div>
                        <div className="md:hidden divide-y divide-slate-700">
                            {users.map(user => (
                                <div key={user.id} className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {user.isAdmin && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                                            <span className="text-sm truncate">{user.email}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                            {user.isActive ? 'Aktywny' : 'Zablokowany'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-slate-400">
                                            <span className="text-green-500">${user.balance.toFixed(2)}</span>
                                            <span className="mx-2">•</span>
                                            <span>{user.linksCount} linków</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => toggleUserStatus(user.id, user.isActive)} className={`p-2 rounded-lg ${user.isActive ? 'text-red-400' : 'text-green-400'}`}>
                                                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => toggleUserAdmin(user.id, user.isAdmin)} className={`p-2 rounded-lg ${user.isAdmin ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                <Crown className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteUser(user.id)} className="p-2 text-red-400 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Email</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Saldo</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Linki</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {user.isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                                                    <span>{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-green-500">${user.balance.toFixed(4)}</td>
                                            <td className="p-4">{user.linksCount}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                    {user.isActive ? 'Aktywny' : 'Zablokowany'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => toggleUserStatus(user.id, user.isActive)} className={`p-2 rounded-lg transition ${user.isActive ? 'text-red-400 hover:bg-red-900/30' : 'text-green-400 hover:bg-green-900/30'}`}>
                                                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => toggleUserAdmin(user.id, user.isAdmin)} className={`p-2 rounded-lg transition ${user.isAdmin ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-slate-400 hover:bg-slate-700'}`}>
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteUser(user.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Linki */}
                {activeTab === 'links' && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-3 sm:p-4 border-b border-slate-700">
                            <h2 className="font-semibold text-sm sm:text-base">Linki ({links.length})</h2>
                        </div>
                        <div className="md:hidden divide-y divide-slate-700">
                            {links.map(link => (
                                <div key={link.id} className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-mono text-cyan-500 text-sm">{link.shortCode}</p>
                                            <p className="text-xs text-slate-400 truncate">{link.originalUrl}</p>
                                        </div>
                                        <button onClick={() => deleteLink(link.id)} className="p-2 text-red-400 flex-shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">{link.userEmail}</span>
                                        <div className="flex items-center gap-3">
                                            <span>{link.totalClicks} klik.</span>
                                            <span className="text-green-500">${link.totalEarned.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Kod</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Użytkownik</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Kliknięcia</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Zarobek</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-400">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {links.map(link => (
                                        <tr key={link.id} className="hover:bg-slate-700/30">
                                            <td className="p-4">
                                                <p className="font-mono text-cyan-500">{link.shortCode}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-xs">{link.originalUrl}</p>
                                            </td>
                                            <td className="p-4 text-sm">{link.userEmail}</td>
                                            <td className="p-4">{link.totalClicks}</td>
                                            <td className="p-4 text-green-500">${link.totalEarned.toFixed(4)}</td>
                                            <td className="p-4">
                                                <button onClick={() => deleteLink(link.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Wypłaty */}
                {activeTab === 'payouts' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Oczekujące</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-yellow-500">{payoutStats.pending}</p>
                                <p className="text-xs sm:text-sm text-yellow-500/70">${payoutStats.pendingAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Zrealizowane</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-green-500">{payoutStats.completed}</p>
                                <p className="text-xs sm:text-sm text-green-500/70">${payoutStats.completedAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Wszystkie</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{payouts.length}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Łącznie</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-purple-500">${payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-3 sm:p-4 border-b border-slate-700">
                                <h2 className="font-semibold text-sm sm:text-base">Wypłaty ({payouts.length})</h2>
                            </div>
                            {payouts.length === 0 ? (
                                <div className="p-8 sm:p-12 text-center">
                                    <Wallet className="w-10 sm:w-12 h-10 sm:h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 text-sm">Brak wypłat</p>
                                </div>
                            ) : (
                                <>
                                    <div className="md:hidden divide-y divide-slate-700">
                                        {payouts.map(payout => (
                                            <div key={payout.id} className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold text-green-500">${(payout.amount || 0).toFixed(2)}</p>
                                                        <p className="text-xs text-slate-400">{payout.userEmail}</p>
                                                    </div>
                                                    {getPayoutStatusBadge(payout.status)}
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="text-slate-400">
                                                        <span>{getMethodLabel(payout.method)}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{new Date(payout.createdAt).toLocaleDateString('pl-PL')}</span>
                                                    </div>
                                                    {payout.status === 'PENDING' && (
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => updatePayoutStatus(payout.id, 'COMPLETED')} className="p-2 text-green-400">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => updatePayoutStatus(payout.id, 'REJECTED')} className="p-2 text-red-400">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-700/50">
                                                <tr>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Data</th>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Użytkownik</th>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Kwota</th>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Metoda</th>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Akcje</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                                {payouts.map(payout => (
                                                    <tr key={payout.id} className="hover:bg-slate-700/30">
                                                        <td className="p-4 text-sm text-slate-400">{new Date(payout.createdAt).toLocaleDateString('pl-PL')}</td>
                                                        <td className="p-4 text-sm">{payout.userEmail}</td>
                                                        <td className="p-4 font-semibold text-green-500">${(payout.amount || 0).toFixed(2)}</td>
                                                        <td className="p-4 text-sm">{getMethodLabel(payout.method)}</td>
                                                        <td className="p-4">{getPayoutStatusBadge(payout.status)}</td>
                                                        <td className="p-4">
                                                            {payout.status === 'PENDING' && (
                                                                <div className="flex items-center gap-1">
                                                                    <button onClick={() => updatePayoutStatus(payout.id, 'COMPLETED')} className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => updatePayoutStatus(payout.id, 'REJECTED')} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition">
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Wiadomości */}
                {activeTab === 'messages' && (
                    <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm hidden sm:inline">Wszystkie</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-blue-500">{messages.length}</p>
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <EyeOff className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm hidden sm:inline">Nowe</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-yellow-500">{unreadCount}</p>
                            </div>
                            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm hidden sm:inline">Przeczytane</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-green-500">{messages.length - unreadCount}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-3 sm:p-4 border-b border-slate-700">
                                <h2 className="font-semibold text-sm sm:text-base">Wiadomości</h2>
                            </div>
                            {messages.length === 0 ? (
                                <div className="p-8 sm:p-12 text-center">
                                    <MessageSquare className="w-10 sm:w-12 h-10 sm:h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 text-sm">Brak wiadomości</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700">
                                    {messages.map(message => (
                                        <div key={message.id} className={`p-3 sm:p-4 ${!message.isRead ? 'bg-blue-900/10' : ''}`}>
                                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        {!message.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                                                        <span className="font-semibold text-sm sm:text-base">{message.name}</span>
                                                        <span className="text-slate-400 text-xs sm:text-sm truncate">({message.email})</span>
                                                    </div>
                                                    <p className="text-cyan-400 text-xs sm:text-sm mb-2 truncate">{message.subject}</p>
                                                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">{message.message}</p>
                                                    <p className="text-slate-500 text-xs mt-2">{new Date(message.createdAt).toLocaleString('pl-PL')}</p>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {!message.isRead && (
                                                        <button onClick={() => markAsRead(message.id)} className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <a href={`mailto:${message.email}?subject=Re: ${message.subject}`} className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => deleteMessage(message.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition min-w-[40px] min-h-[40px] flex items-center justify-center">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Security */}
                {activeTab === 'security' && (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Encryption Status */}
                        {encryptionStatus && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${encryptionStatus.encryptionEnabled ? 'bg-green-900/20 border border-green-700/50' : 'bg-red-900/20 border border-red-700/50'}`}>
                                {encryptionStatus.encryptionEnabled ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-green-400">Szyfrowanie aktywne</p>
                                            <p className="text-xs text-green-500/70">Algorytm: {encryptionStatus.algorithm}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-red-400">Problem z szyfrowaniem!</p>
                                            <p className="text-xs text-red-500/70">Sprawdź zmienną ENCRYPTION_KEY</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Security Stats */}
                        {securityStats && (
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <History className="w-4 h-4 text-blue-500" />
                                        <span className="text-slate-400 text-xs">Logi IP</span>
                                    </div>
                                    <p className="text-xl font-bold">{securityStats.totalIpLogs}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-cyan-500" />
                                        <span className="text-slate-400 text-xs">Dzisiaj</span>
                                    </div>
                                    <p className="text-xl font-bold">{securityStats.todayIpLogs}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-green-500" />
                                        <span className="text-slate-400 text-xs">Logowania</span>
                                    </div>
                                    <p className="text-xl font-bold">{securityStats.loginCount}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <UserCheck className="w-4 h-4 text-purple-500" />
                                        <span className="text-slate-400 text-xs">Rejestracje</span>
                                    </div>
                                    <p className="text-xl font-bold">{securityStats.registerCount}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye className="w-4 h-4 text-yellow-500" />
                                        <span className="text-slate-400 text-xs">Wizyty z IP</span>
                                    </div>
                                    <p className="text-xl font-bold">{securityStats.visitsWithIp}</p>
                                </div>
                            </div>
                        )}

                        {/* Activity Chart */}
                        {securityStats?.last7Days && (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-cyan-500" />
                                    Aktywność ostatnich 7 dni
                                </h3>
                                <div className="flex items-end justify-between gap-1 sm:gap-2 h-24">
                                    {securityStats.last7Days.map((day, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="w-full bg-slate-700 rounded-t relative" style={{ height: '60px' }}>
                                                <div 
                                                    className="absolute bottom-0 w-full bg-cyan-500 rounded-t transition-all"
                                                    style={{ height: `${(day.count / maxSecurityChart) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}</span>
                                            <span className="text-xs font-semibold">{day.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search Section */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                <Search className="w-4 h-4 text-cyan-500" />
                                Wyszukaj i odszyfruj IP
                            </h3>

                            {/* Search Type Tabs */}
                            <div className="flex gap-2 mb-4 flex-wrap">
                                <button
                                    onClick={() => { setSearchType('user'); setSearchResult(null); setIpHistory(null); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${searchType === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                >
                                    <User className="w-4 h-4 inline mr-1" /> Użytkownik
                                </button>
                                <button
                                    onClick={() => { setSearchType('visit'); setSearchResult(null); setIpHistory(null); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${searchType === 'visit' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                >
                                    <Eye className="w-4 h-4 inline mr-1" /> Wizyta
                                </button>
                                <button
                                    onClick={() => { setSearchType('ip'); setSearchResult(null); setIpHistory(null); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${searchType === 'ip' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                >
                                    <Globe className="w-4 h-4 inline mr-1" /> Adres IP
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSecuritySearch()}
                                    placeholder={
                                        searchType === 'user' ? 'ID użytkownika (np. clx123...)' :
                                        searchType === 'visit' ? 'ID wizyty (np. clx456...)' :
                                        'Adres IP (np. 192.168.1.100)'
                                    }
                                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                />
                                <button
                                    onClick={handleSecuritySearch}
                                    disabled={securityLoading}
                                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {securityLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                                    <span className="hidden sm:inline">Odszyfruj</span>
                                </button>
                            </div>

                            {/* Search Results */}
                            {searchResult && (
                                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                                    {searchResult.type === 'user' && (
                                        <>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <User className="w-4 h-4" /> Dane użytkownika
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">ID:</span>
                                                    <span className="font-mono text-xs bg-slate-600 px-2 py-0.5 rounded">{searchResult.data.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Email:</span>
                                                    <span>{searchResult.data.email}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">IP rejestracji:</span>
                                                    <span className="font-mono bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                                                        {searchResult.data.registrationIp || 'brak'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Ostatnie IP:</span>
                                                    <span className="font-mono bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                                                        {searchResult.data.lastLoginIp || 'brak'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Ostatnie logowanie:</span>
                                                    <span>{searchResult.data.lastLoginAt ? formatDate(searchResult.data.lastLoginAt) : 'nigdy'}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => fetchIpHistory(searchResult.data.id)}
                                                className="mt-4 w-full py-2 border border-cyan-500 text-cyan-500 rounded-lg hover:bg-cyan-500/10 transition flex items-center justify-center gap-2"
                                            >
                                                <History className="w-4 h-4" /> Pokaż historię logowań
                                            </button>
                                        </>
                                    )}

                                    {searchResult.type === 'visit' && (
                                        <>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Eye className="w-4 h-4" /> Dane wizyty
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">IP:</span>
                                                    <span className="font-mono bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                                                        {searchResult.data.ip || 'brak'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Kraj:</span>
                                                    <span>{searchResult.data.country}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Urządzenie:</span>
                                                    <span>{searchResult.data.device}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Link:</span>
                                                    <span className="font-mono text-cyan-400">{searchResult.data.link?.shortCode}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Właściciel:</span>
                                                    <span>{searchResult.data.link?.ownerEmail}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Zarobek:</span>
                                                    <span className="text-green-400">${parseFloat(searchResult.data.earned || 0).toFixed(4)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Data:</span>
                                                    <span>{formatDate(searchResult.data.createdAt)}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {searchResult.type === 'ip-search' && (
                                        <>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" /> 
                                                Użytkownicy z IP: <span className="font-mono text-yellow-400">{searchResult.data.searchedIp}</span>
                                            </h4>
                                            {searchResult.data.results.length === 0 ? (
                                                <p className="text-slate-400 text-center py-4">Nie znaleziono użytkowników</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {searchResult.data.results.map(user => (
                                                        <div key={user.id} className="bg-slate-600/50 rounded-lg p-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-semibold">{user.email}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                                    user.matchType === 'both' ? 'bg-green-900/50 text-green-400' :
                                                                    user.matchType === 'registration' ? 'bg-blue-900/50 text-blue-400' :
                                                                    'bg-yellow-900/50 text-yellow-400'
                                                                }`}>
                                                                    {user.matchType === 'both' ? 'Rej + Login' : user.matchType === 'registration' ? 'Rejestracja' : 'Login'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                <span className={user.isActive ? 'text-green-400' : 'text-red-400'}>
                                                                    {user.isActive ? '● Aktywny' : '● Zablokowany'}
                                                                </span>
                                                                <span className="mx-2">•</span>
                                                                <span>ID: {user.id.substring(0, 8)}...</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* IP History */}
                            {ipHistory && (
                                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <History className="w-4 h-4" /> Historia logowań: {ipHistory.user.email}
                                    </h4>
                                    {ipHistory.logs.length === 0 ? (
                                        <p className="text-slate-400 text-center py-4">Brak historii</p>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                {ipHistory.logs.map(log => (
                                                    <div key={log.id} className="bg-slate-600/50 rounded-lg p-3 flex items-center justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs px-2 py-0.5 rounded ${log.action === 'LOGIN' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>
                                                                    {log.action}
                                                                </span>
                                                                <span className="font-mono text-yellow-400 text-sm">{log.ip}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-1 truncate">{log.userAgent || 'Brak User-Agent'}</p>
                                                        </div>
                                                        <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(log.createdAt)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {ipHistory.pagination.totalPages > 1 && (
                                                <div className="flex justify-center gap-2 mt-4">
                                                    <button
                                                        onClick={() => fetchIpHistory(ipHistory.user.id, historyPage - 1)}
                                                        disabled={historyPage === 1}
                                                        className="px-3 py-1 bg-slate-600 rounded disabled:opacity-50"
                                                    >
                                                        ←
                                                    </button>
                                                    <span className="px-3 py-1">{historyPage} / {ipHistory.pagination.totalPages}</span>
                                                    <button
                                                        onClick={() => fetchIpHistory(ipHistory.user.id, historyPage + 1)}
                                                        disabled={historyPage === ipHistory.pagination.totalPages}
                                                        className="px-3 py-1 bg-slate-600 rounded disabled:opacity-50"
                                                    >
                                                        →
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Admin;