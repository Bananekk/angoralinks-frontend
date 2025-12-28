// Admin.jsx - KOMPLETNY DZIAŁAJĄCY PLIK Z ZAKŁADKĄ CPM
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, Users, Link2, BarChart3, DollarSign, MousePointer,
    ArrowLeft, Loader2, Trash2, UserX, UserCheck, Crown,
    TrendingUp, Calendar, Wallet, CheckCircle, XCircle, Clock, AlertCircle,
    Mail, MessageSquare, Eye, EyeOff, Menu, X, LogOut, Globe, User,
    Search, Unlock, History, MapPin, RefreshCw, ExternalLink, Edit2, Save,
    ChevronDown, ChevronUp, Filter
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

    // Adsterra state
    const [refreshingAdsterra, setRefreshingAdsterra] = useState(false);

    // CPM Rates state
    const [cpmRates, setCpmRates] = useState([]);
    const [cpmConfig, setCpmConfig] = useState(null);
    const [cpmLoading, setCpmLoading] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [cpmFilter, setCpmFilter] = useState({ tier: 0, search: '' });
    const [earningsByCountry, setEarningsByCountry] = useState(null);
    const [showEarningsStats, setShowEarningsStats] = useState(false);

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
        if (activeTab === 'cpm') {
            fetchCpmRates();
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
            setUsers(usersRes.data.users || usersRes.data || []);
            setLinks(linksRes.data.links || linksRes.data || []);
            setPayouts(payoutsRes.data.payouts || payoutsRes.data || []);
            setMessages(messagesRes.data.messages || messagesRes.data || []);
            setUnreadCount(messagesRes.data.unreadCount || 0);
        } catch (error) {
            console.error('Błąd:', error);
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
            const statusRes = await api.get('/admin/encryption-status');
            setEncryptionStatus(statusRes.data);
        } catch (error) {
            console.error('Błąd pobierania danych bezpieczeństwa:', error);
        }
    };

    const fetchCpmRates = async () => {
        setCpmLoading(true);
        try {
            const [ratesRes, earningsRes] = await Promise.all([
                api.get('/admin/cpm-rates'),
                api.get('/admin/earnings-by-country?days=30').catch(() => ({ data: null }))
            ]);
            
            setCpmRates(ratesRes.data.rates || []);
            setCpmConfig(ratesRes.data.config || null);
            setEarningsByCountry(earningsRes.data || null);
        } catch (error) {
            console.error('Błąd pobierania stawek CPM:', error);
            toast.error('Błąd pobierania stawek CPM');
        } finally {
            setCpmLoading(false);
        }
    };

    const updateCpmRate = async (countryCode, newBaseCpm) => {
        try {
            await api.put(`/admin/cpm-rates/${countryCode}`, { 
                baseCpm: parseFloat(newBaseCpm) 
            });
            toast.success(`Stawka dla ${countryCode} zaktualizowana`);
            setEditingRate(null);
            setEditValue('');
            fetchCpmRates();
        } catch (error) {
            console.error('Błąd aktualizacji:', error);
            toast.error('Błąd aktualizacji stawki');
        }
    };

    const refreshAdsterraStats = async () => {
        setRefreshingAdsterra(true);
        try {
            await api.post('/admin/adsterra-stats/refresh');
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
            toast.success('Dane Adsterra odświeżone');
        } catch (error) {
            console.error('Błąd odświeżania Adsterra:', error);
            toast.error('Błąd połączenia z Adsterra');
        } finally {
            setRefreshingAdsterra(false);
        }
    };

    const decryptUserIp = async () => {
        if (!searchId.trim()) {
            toast.error('Wprowadź ID użytkownika');
            return;
        }
        setSecurityLoading(true);
        setSearchResult(null);
        setIpHistory(null);
        try {
            const response = await api.post('/admin/decrypt-user-ip', { userId: searchId.trim() });
            setSearchResult({ type: 'user', data: response.data.user });
            toast.success('IP odszyfrowane');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Nie znaleziono użytkownika');
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
            const response = await api.post('/admin/decrypt-visit-ip', { visitId: searchId.trim() });
            setSearchResult({ type: 'visit', data: response.data.visit });
            toast.success('IP odszyfrowane');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Nie znaleziono wizyty');
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
            const response = await api.post('/admin/search-by-ip', { ip: searchId.trim() });
            setSearchResult({ type: 'ip-search', data: response.data });
            toast.success(`Znaleziono ${response.data.count} użytkowników`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Błąd wyszukiwania');
        } finally {
            setSecurityLoading(false);
        }
    };

    const fetchIpHistory = async (userId, page = 1) => {
        setSecurityLoading(true);
        try {
            const response = await api.get(`/admin/user-ip-history/${userId}?page=${page}&limit=10`);
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
            await api.put(`/admin/messages/${messageId}/read`);
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

    const getTierBadge = (tier) => {
        const styles = {
            1: 'bg-green-900/50 text-green-400 border-green-700',
            2: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
            3: 'bg-red-900/50 text-red-400 border-red-700'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs border ${styles[tier] || styles[3]}`}>
                Tier {tier}
            </span>
        );
    };

    const payoutStats = {
        pending: payouts.filter(p => p.status === 'PENDING').length,
        pendingAmount: payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
        completed: payouts.filter(p => p.status === 'COMPLETED').length,
        completedAmount: payouts.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
    };

    const formatDate = (date) => new Date(date).toLocaleString('pl-PL');

    // Filtrowanie stawek CPM
    const filteredCpmRates = cpmRates.filter(rate => {
        if (cpmFilter.tier && rate.tier !== cpmFilter.tier) return false;
        if (cpmFilter.search) {
            const search = cpmFilter.search.toLowerCase();
            return rate.countryCode.toLowerCase().includes(search) || 
                   rate.countryName.toLowerCase().includes(search);
        }
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const maxVisits = Math.max(...(stats?.dailyStats?.map(d => d.visits) || [1]));

    const tabs = [
        { id: 'stats', label: 'Statystyki', icon: BarChart3 },
        { id: 'users', label: 'Użytkownicy', icon: Users },
        { id: 'links', label: 'Linki', icon: Link2 },
        { id: 'payouts', label: 'Wypłaty', icon: Wallet, badge: payoutStats.pending },
        { id: 'messages', label: 'Wiadomości', icon: MessageSquare, badge: unreadCount },
        { id: 'cpm', label: 'Stawki CPM', icon: DollarSign },
        { id: 'security', label: 'Bezpieczeństwo', icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-red-500" />
                            <span className="font-bold text-lg sm:text-xl">Admin</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 text-slate-400 hover:text-white">
                            <Link2 className="w-5 h-5" />
                        </Link>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-400">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setMobileMenuOpen(false)} />}
            <div className={`fixed top-0 right-0 bottom-0 w-[280px] bg-slate-800 z-[101] transform transition-transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <span className="font-semibold">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X className="w-6 h-6" /></button>
                </div>
                <nav className="p-4">
                    <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                        <Link2 className="w-5 h-5" /> Dashboard
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-700 mt-auto">
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full p-3 bg-red-500/10 text-red-500 border border-red-500 rounded-lg">
                        <LogOut className="w-5 h-5" /> Wyloguj
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
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 border-b-2 transition text-sm sm:text-base ${
                                    activeTab === tab.id ? 'border-cyan-500 text-cyan-500' : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {tab.badge > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Tab: Statystyki */}
                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        {/* Główne statystyki */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Użytkownicy</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.users?.total || 0}</p>
                                <p className="text-xs text-green-500">+{stats?.users?.newToday || 0} dzisiaj</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Linki</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.links?.total || 0}</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <MousePointer className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Wizyty</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold">{stats?.visits?.total || 0}</p>
                                <p className="text-xs text-green-500">+{stats?.visits?.today || 0} dzisiaj</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Wypłacono</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-green-500">${parseFloat(stats?.earnings?.platformTotal || 0).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Sekcja Adsterra */}
                        <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 border border-orange-700/50 rounded-xl p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                        <Wallet className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">Portfel Adsterra</h3>
                                        <p className="text-xs text-slate-400">
                                            Zarobki z reklam
                                            {stats?.adsterra?.fromCache && <span className="ml-2 text-yellow-500">(cache)</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={refreshAdsterraStats}
                                        disabled={refreshingAdsterra}
                                        className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 text-orange-400 ${refreshingAdsterra ? 'animate-spin' : ''}`} />
                                    </button>
                                    <a href="https://publishers.adsterra.com/stats" target="_blank" rel="noopener noreferrer" className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition">
                                        <ExternalLink className="w-4 h-4 text-orange-400" />
                                    </a>
                                </div>
                            </div>

                            {stats?.adsterra ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-orange-400" />
                                            <span className="text-xs text-slate-400">Dzisiaj</span>
                                        </div>
                                        <p className="text-xl font-bold text-orange-400">${(stats.adsterra.today || 0).toFixed(4)}</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                            <span className="text-xs text-slate-400">7 dni</span>
                                        </div>
                                        <p className="text-xl font-bold text-green-400">${(stats.adsterra.last7Days || 0).toFixed(4)}</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wallet className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs text-slate-400">Miesiąc</span>
                                        </div>
                                        <p className="text-xl font-bold text-blue-400">${(stats.adsterra.monthlyRevenue || 0).toFixed(4)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-800/30 rounded-xl p-6 text-center">
                                    <AlertCircle className="w-10 h-10 text-orange-400/50 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">Brak danych Adsterra</p>
                                    <p className="text-xs text-slate-500">Sprawdź ADSTERRA_API_TOKEN</p>
                                </div>
                            )}
                        </div>

                        {/* Wykres wizyt */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-500" />
                                Ostatnie 7 dni
                            </h2>
                            <div className="flex items-end justify-between gap-2 h-32 sm:h-48">
                                {stats?.dailyStats?.map((day, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-slate-700 rounded-t-lg relative" style={{ height: '100px' }}>
                                            <div 
                                                className="absolute bottom-0 w-full bg-cyan-500 rounded-t-lg transition-all" 
                                                style={{ height: `${maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0}%`, minHeight: day.visits > 0 ? '8px' : '0' }} 
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400">{new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}</p>
                                            <p className="text-xs font-semibold">{day.visits}</p>
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
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="font-semibold">Użytkownicy ({users.length})</h2>
                        </div>
                        <div className="divide-y divide-slate-700">
                            {users.map(user => (
                                <div key={user.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {user.isAdmin && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                                        <div className="min-w-0">
                                            <p className="truncate">{user.email}</p>
                                            <p className="text-xs text-slate-400">
                                                <span className="text-green-500">${parseFloat(user.balance || 0).toFixed(2)}</span>
                                                <span className="mx-2">•</span>
                                                {user.linksCount || user._count?.links || 0} linków
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                            {user.isActive ? 'Aktywny' : 'Zablokowany'}
                                        </span>
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
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab: Linki */}
                {activeTab === 'links' && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="font-semibold">Linki ({links.length})</h2>
                        </div>
                        <div className="divide-y divide-slate-700">
                            {links.map(link => (
                                <div key={link.id} className="p-4 flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-cyan-500">{link.shortCode}</p>
                                        <p className="text-xs text-slate-400 truncate">{link.originalUrl}</p>
                                        <p className="text-xs text-slate-500">{link.user?.email}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm">{link.totalClicks} kliknięć</p>
                                            <p className="text-xs text-green-500">${parseFloat(link.totalEarned || 0).toFixed(4)}</p>
                                        </div>
                                        <button onClick={() => deleteLink(link.id)} className="p-2 text-red-400 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab: Wypłaty */}
                {activeTab === 'payouts' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                    <span className="text-slate-400 text-xs">Oczekujące</span>
                                </div>
                                <p className="text-xl font-bold text-yellow-500">{payoutStats.pending}</p>
                                <p className="text-xs text-yellow-500/70">${payoutStats.pendingAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-slate-400 text-xs">Zrealizowane</span>
                                </div>
                                <p className="text-xl font-bold text-green-500">{payoutStats.completed}</p>
                                <p className="text-xs text-green-500/70">${payoutStats.completedAmount.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700">
                                <h2 className="font-semibold">Wypłaty ({payouts.length})</h2>
                            </div>
                            {payouts.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">Brak wypłat</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700">
                                    {payouts.map(payout => (
                                        <div key={payout.id} className="p-4 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-green-500">${parseFloat(payout.amount || 0).toFixed(2)}</p>
                                                <p className="text-xs text-slate-400">{payout.user?.email}</p>
                                                <p className="text-xs text-slate-500">{getMethodLabel(payout.method)} • {new Date(payout.createdAt).toLocaleDateString('pl-PL')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getPayoutStatusBadge(payout.status)}
                                                {payout.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => updatePayoutStatus(payout.id, 'COMPLETED')} className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => updatePayoutStatus(payout.id, 'REJECTED')} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Wiadomości */}
                {activeTab === 'messages' && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="font-semibold">Wiadomości ({messages.length})</h2>
                        </div>
                        {messages.length === 0 ? (
                            <div className="p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">Brak wiadomości</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {messages.map(message => (
                                    <div key={message.id} className={`p-4 ${!message.isRead ? 'bg-blue-900/10' : ''}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {!message.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                                                    <span className="font-semibold">{message.name}</span>
                                                    <span className="text-slate-400 text-sm">({message.email})</span>
                                                </div>
                                                <p className="text-cyan-400 text-sm mb-2">{message.subject}</p>
                                                <p className="text-slate-300 text-sm">{message.message}</p>
                                                <p className="text-slate-500 text-xs mt-2">{formatDate(message.createdAt)}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {!message.isRead && (
                                                    <button onClick={() => markAsRead(message.id)} className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <a href={`mailto:${message.email}?subject=Re: ${message.subject}`} className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg">
                                                    <Mail className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => deleteMessage(message.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Stawki CPM */}
                {activeTab === 'cpm' && (
                    <div className="space-y-6">
                        {/* Konfiguracja systemu */}
                        {cpmConfig && (
                            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-700/50 rounded-xl p-4 sm:p-6">
                                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-cyan-400" />
                                    Konfiguracja systemu zarobków
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <p className="text-xs text-slate-400 mb-1">Udział użytkownika</p>
                                        <p className="text-2xl font-bold text-green-400">{(cpmConfig.userShare * 100).toFixed(0)}%</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <p className="text-xs text-slate-400 mb-1">Udział platformy</p>
                                        <p className="text-2xl font-bold text-orange-400">{(cpmConfig.platformShare * 100).toFixed(0)}%</p>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                        <p className="text-xs text-slate-400 mb-1">Min. wypłata</p>
                                        <p className="text-2xl font-bold text-cyan-400">${cpmConfig.minPayout}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Statystyki zarobków per kraj */}
                        {earningsByCountry && (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => setShowEarningsStats(!showEarningsStats)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition"
                                >
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        Zarobki per kraj (30 dni)
                                    </h3>
                                    {showEarningsStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                                
                                {showEarningsStats && (
                                    <div className="border-t border-slate-700">
                                        {/* Totals */}
                                        <div className="p-4 bg-slate-700/30 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400">Wizyty</p>
                                                <p className="text-lg font-bold">{earningsByCountry.totals?.totalVisits || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Unikalne</p>
                                                <p className="text-lg font-bold">{earningsByCountry.totals?.uniqueVisits || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Dla użytkowników</p>
                                                <p className="text-lg font-bold text-green-400">${(earningsByCountry.totals?.userEarnings || 0).toFixed(4)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Dla platformy</p>
                                                <p className="text-lg font-bold text-orange-400">${(earningsByCountry.totals?.platformEarnings || 0).toFixed(4)}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Countries list */}
                                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-700">
                                            {earningsByCountry.countries?.slice(0, 10).map(country => (
                                                <div key={country.country} className="p-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{country.country}</span>
                                                        <span className="text-slate-400 text-sm">{country.countryName}</span>
                                                        {getTierBadge(country.tier)}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-400 font-mono">${country.userEarnings.toFixed(4)}</p>
                                                        <p className="text-xs text-slate-400">{country.uniqueVisits} wizyt</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Filtry i tabela stawek */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="font-semibold flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-cyan-500" />
                                        Stawki CPM ({filteredCpmRates.length})
                                    </h2>
                                    <div className="flex gap-2">
                                        <select
                                            value={cpmFilter.tier}
                                            onChange={(e) => setCpmFilter({...cpmFilter, tier: parseInt(e.target.value)})}
                                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option value={0}>Wszystkie Tiery</option>
                                            <option value={1}>Tier 1</option>
                                            <option value={2}>Tier 2</option>
                                            <option value={3}>Tier 3</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Szukaj kraju..."
                                            value={cpmFilter.search}
                                            onChange={(e) => setCpmFilter({...cpmFilter, search: e.target.value})}
                                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm w-40"
                                        />
                                        <button 
                                            onClick={fetchCpmRates}
                                            disabled={cpmLoading}
                                            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition"
                                        >
                                            <RefreshCw className={`w-4 h-4 text-cyan-400 ${cpmLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {cpmLoading ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700/50 text-xs text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Kraj</th>
                                                <th className="px-4 py-3 text-left">Tier</th>
                                                <th className="px-4 py-3 text-right">Bazowy CPM</th>
                                                <th className="px-4 py-3 text-right">CPM użytkownika</th>
                                                <th className="px-4 py-3 text-right">Za wizytę</th>
                                                <th className="px-4 py-3 text-center">Źródło</th>
                                                <th className="px-4 py-3 text-center">Akcje</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {filteredCpmRates.map(rate => (
                                                <tr key={rate.countryCode} className="hover:bg-slate-700/30">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-cyan-400">{rate.countryCode}</span>
                                                            <span className="text-slate-400 text-sm hidden sm:inline">{rate.countryName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getTierBadge(rate.tier)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono">
                                                        {editingRate === rate.countryCode ? (
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-20 bg-slate-600 border border-cyan-500 rounded px-2 py-1 text-right text-sm"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="text-white">${rate.baseCpm.toFixed(2)}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-green-400">
                                                        ${rate.userCpm.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-400 text-sm">
                                                        ${rate.perVisit.toFixed(6)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                                            rate.source === 'database' ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-slate-400'
                                                        }`}>
                                                            {rate.source === 'database' ? 'DB' : 'Config'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {editingRate === rate.countryCode ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => updateCpmRate(rate.countryCode, editValue)}
                                                                    className="p-1 text-green-400 hover:bg-green-900/30 rounded"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => { setEditingRate(null); setEditValue(''); }}
                                                                    className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setEditingRate(rate.countryCode); setEditValue(rate.baseCpm.toString()); }}
                                                                className="p-1 text-cyan-400 hover:bg-cyan-900/30 rounded"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Security */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Encryption Status */}
                        {encryptionStatus && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${encryptionStatus.encryptionEnabled ? 'bg-green-900/20 border border-green-700/50' : 'bg-red-900/20 border border-red-700/50'}`}>
                                {encryptionStatus.encryptionEnabled ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="font-semibold text-green-400">Szyfrowanie aktywne</p>
                                            <p className="text-xs text-green-500/70">Algorytm: {encryptionStatus.algorithm}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="font-semibold text-red-400">Problem z szyfrowaniem!</p>
                                            <p className="text-xs text-red-500/70">Sprawdź ENCRYPTION_KEY</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Search Section */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Search className="w-4 h-4 text-cyan-500" />
                                Wyszukaj i odszyfruj IP
                            </h3>

                            <div className="flex gap-2 mb-4 flex-wrap">
                                <button
                                    onClick={() => { setSearchType('user'); setSearchResult(null); setIpHistory(null); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${searchType === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                >
                                    <User className="w-4 h-4 inline mr-1" /> Użytkownik
                                </button>
                                <button
                                    onClick={() => { setSearchType('visit'); setSearchResult(null); setIpHistory(null); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${searchType === 'visit' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                >
                                    <Eye className="w-4 h-4 inline mr-1" /> Wizyta
                                </button>
                                <button
                                    onClick={() => { setSearchType('ip'); setSearchResult(null); setIpHistory(null); }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${searchType === 'ip' ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                                >
                                    <Globe className="w-4 h-4 inline mr-1" /> Adres IP
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSecuritySearch()}
                                    placeholder={
                                        searchType === 'user' ? 'ID użytkownika' :
                                        searchType === 'visit' ? 'ID wizyty' :
                                        'Adres IP'
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
                                            </div>
                                            <button
                                                onClick={() => fetchIpHistory(searchResult.data.id)}
                                                className="mt-4 w-full py-2 border border-cyan-500 text-cyan-500 rounded-lg hover:bg-cyan-500/10 transition flex items-center justify-center gap-2"
                                            >
                                                <History className="w-4 h-4" /> Historia logowań
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
                                                    <span className="text-slate-400">Link:</span>
                                                    <span className="font-mono text-cyan-400">{searchResult.data.link?.shortCode}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Zarobek:</span>
                                                    <span className="text-green-400">${parseFloat(searchResult.data.earned || 0).toFixed(4)}</span>
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
                                                <p className="text-slate-400 text-center py-4">Nie znaleziono</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {searchResult.data.results.map(user => (
                                                        <div key={user.id} className="bg-slate-600/50 rounded-lg p-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold">{user.email}</span>
                                                                <span className={user.isActive ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                                                                    {user.isActive ? '● Aktywny' : '● Zablokowany'}
                                                                </span>
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
                                        <History className="w-4 h-4" /> Historia: {ipHistory.user.email}
                                    </h4>
                                    {ipHistory.logs.length === 0 ? (
                                        <p className="text-slate-400 text-center py-4">Brak historii</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {ipHistory.logs.map(log => (
                                                <div key={log.id} className="bg-slate-600/50 rounded-lg p-3 flex items-center justify-between">
                                                    <div>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${log.action === 'LOGIN' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="font-mono text-yellow-400 text-sm ml-2">{log.ip}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                                                </div>
                                            ))}
                                        </div>
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