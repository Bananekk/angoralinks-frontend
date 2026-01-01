// Admin.jsx - KOMPLETNY Z ZAKŁADKĄ REFERALI I FRAUD ALERTS
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, Users, Link2, BarChart3, DollarSign, MousePointer,
    ArrowLeft, Loader2, Trash2, UserX, UserCheck, Crown,
    TrendingUp, Calendar, Wallet, CheckCircle, XCircle, Clock, AlertCircle,
    Mail, MessageSquare, Eye, EyeOff, Menu, X, LogOut, Globe, User,
    Search, Unlock, History, MapPin, RefreshCw, ExternalLink, Edit2, Save,
    ChevronDown, ChevronUp, Filter, Gift, Percent, ToggleLeft, ToggleRight, Ban
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// 🆕 KOMPONENT ALERTÓW FRAUDU
const FraudAlertsSection = ({ stats, onRefresh }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('PENDING');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [showAlerts, setShowAlerts] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/fraud-alerts', { 
                params: { status: filter || undefined, limit: 50 } 
            });
            setAlerts(res.data.data?.alerts || []);
        } catch (error) {
            console.error('Error fetching fraud alerts:', error);
            toast.error('Błąd pobierania alertów');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showAlerts) {
            fetchAlerts();
        }
    }, [showAlerts, filter]);

    const handleResolve = async (alertId, resolution, notes = '') => {
        setActionLoading(alertId);
        try {
            await api.post(`/admin/fraud-alerts/${alertId}/resolve`, { resolution, notes });
            toast.success('Alert rozwiązany');
            fetchAlerts();
            onRefresh?.();
            setSelectedAlert(null);
        } catch (error) {
            console.error('Error resolving alert:', error);
            toast.error(error.response?.data?.message || 'Błąd');
        } finally {
            setActionLoading(null);
        }
    };

    const reasonLabels = {
        'same_ip_as_referrer': 'Ten sam IP',
        'same_device_fingerprint': 'To samo urządzenie',
        'same_user_agent': 'Ten sam User-Agent',
        'identical_device_profile': 'Identyczny profil',
        'similar_device_profile': 'Podobny profil',
        'suspicious_timing_very_fast': 'Bardzo szybko (<1h)',
        'suspicious_timing_fast': 'Szybko (<24h)',
        'ip_matches_previous_referrals': 'IP jak poprzednie ref.',
        'device_matches_previous_referrals': 'Urządzenie jak poprzednie',
        'burst_referral_pattern': 'Burst pattern (5+/24h)',
        'high_referral_frequency': 'Wysoka częstotliwość'
    };

    const getRiskColor = (score) => {
        if (score >= 70) return 'text-red-400 bg-red-900/50';
        if (score >= 40) return 'text-yellow-400 bg-yellow-900/50';
        return 'text-green-400 bg-green-900/50';
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-900/50 text-yellow-400',
            APPROVED: 'bg-green-900/50 text-green-400',
            BLOCKED_REFERRED: 'bg-red-900/50 text-red-400',
            BLOCKED_BOTH: 'bg-red-900/50 text-red-400',
            REFERRAL_DISABLED: 'bg-orange-900/50 text-orange-400'
        };
        const labels = {
            PENDING: 'Oczekuje',
            APPROVED: 'Zatwierdzony',
            BLOCKED_REFERRED: 'Zablokowany',
            BLOCKED_BOTH: 'Obaj zablokowani',
            REFERRAL_DISABLED: 'Ref. wyłączone'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || ''}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition"
            >
                <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className={`w-5 h-5 ${(stats?.pending || 0) > 0 ? 'text-red-500' : 'text-slate-500'}`} />
                    Alerty fraudu
                    {(stats?.pending || 0) > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {stats.pending}
                        </span>
                    )}
                </h3>
                {showAlerts ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showAlerts && (
                <div className="border-t border-slate-700">
                    {/* Stats */}
                    {stats && (
                        <div className="p-4 bg-slate-700/30 grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                                <p className="text-xs text-slate-400">Oczekujące</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-400">{stats.highRisk}</p>
                                <p className="text-xs text-slate-400">Wysokie ryzyko</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                                <p className="text-xs text-slate-400">Zatwierdzone</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
                                <p className="text-xs text-slate-400">Zablokowane</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-cyan-400">{stats.avgRiskScore}%</p>
                                <p className="text-xs text-slate-400">Śr. ryzyko</p>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="p-4 border-t border-slate-700 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="">Wszystkie</option>
                            <option value="PENDING">Oczekujące</option>
                            <option value="APPROVED">Zatwierdzone</option>
                            <option value="BLOCKED_REFERRED">Zablokowane</option>
                        </select>
                        <button
                            onClick={fetchAlerts}
                            disabled={loading}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Alerts list */}
                    <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>Brak alertów</p>
                            </div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className="p-4 hover:bg-slate-700/30">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRiskColor(alert.riskScore)}`}>
                                                    {alert.riskScore}%
                                                </span>
                                                {getStatusBadge(alert.status)}
                                                <span className="text-xs text-slate-500">
                                                    {new Date(alert.createdAt).toLocaleDateString('pl-PL')}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-400 text-xs">Polecający:</p>
                                                    <p className="truncate">{alert.referrer?.email}</p>
                                                    {alert.referrer?.referralDisabled && (
                                                        <span className="text-xs text-red-400">Ref. wyłączone</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-xs">Polecony:</p>
                                                    <p className="truncate">{alert.referred?.email}</p>
                                                    {!alert.referred?.isActive && (
                                                        <span className="text-xs text-red-400">Nieaktywny</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {alert.reasons?.slice(0, 3).map((reason, i) => (
                                                    <span key={i} className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                                                        {reasonLabels[reason] || reason}
                                                    </span>
                                                ))}
                                                {alert.reasons?.length > 3 && (
                                                    <span className="text-xs text-slate-500">+{alert.reasons.length - 3}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {alert.status === 'PENDING' && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleResolve(alert.id, 'APPROVED')}
                                                    disabled={actionLoading === alert.id}
                                                    className="p-1.5 text-green-400 hover:bg-green-900/30 rounded"
                                                    title="Zezwól (fałszywy alarm)"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(alert.id, 'REFERRAL_DISABLED')}
                                                    disabled={actionLoading === alert.id}
                                                    className="p-1.5 text-orange-400 hover:bg-orange-900/30 rounded"
                                                    title="Wyłącz zaproszenia"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(alert.id, 'BLOCKED_REFERRED')}
                                                    disabled={actionLoading === alert.id}
                                                    className="p-1.5 text-red-400 hover:bg-red-900/30 rounded"
                                                    title="Zablokuj poleconego"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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

    // Referral tab state
    const [referralStats, setReferralStats] = useState(null);
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralSettings, setReferralSettings] = useState({
        commissionRate: 10,
        bonusDuration: null,
        minPayout: 5,
        isActive: true
    });
    const [editingReferralSettings, setEditingReferralSettings] = useState(false);
    const [savingReferralSettings, setSavingReferralSettings] = useState(false);
    const [allReferrals, setAllReferrals] = useState([]);
    const [referralSearch, setReferralSearch] = useState('');
    const [referralPage, setReferralPage] = useState(1);
    const [referralPagination, setReferralPagination] = useState(null);
    const [showReferralsList, setShowReferralsList] = useState(false);

    // 🆕 Users search state
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [actionLoadingUser, setActionLoadingUser] = useState(null);

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
        if (activeTab === 'referrals') {
            fetchReferralData();
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

    // Fetch referral data
    const fetchReferralData = async () => {
        setReferralLoading(true);
        try {
            const statsRes = await api.get('/referrals/admin/stats');
            setReferralStats(statsRes.data);
            setReferralSettings({
                commissionRate: statsRes.data.settings.commissionRate,
                bonusDuration: statsRes.data.settings.bonusDuration,
                minPayout: statsRes.data.settings.minPayout,
                isActive: statsRes.data.settings.isActive
            });
        } catch (error) {
            console.error('Błąd pobierania danych referali:', error);
            toast.error('Błąd pobierania danych referali');
        } finally {
            setReferralLoading(false);
        }
    };

    // Fetch all referrals list
    const fetchAllReferrals = async (page = 1, search = '') => {
        try {
            const res = await api.get(`/referrals/admin/all?page=${page}&limit=20&search=${search}`);
            setAllReferrals(res.data.referrals || []);
            setReferralPagination(res.data.pagination || null);
            setReferralPage(page);
        } catch (error) {
            console.error('Błąd pobierania listy referali:', error);
            toast.error('Błąd pobierania listy referali');
        }
    };

    // Save referral settings
    const saveReferralSettings = async () => {
        setSavingReferralSettings(true);
        try {
            await api.put('/referrals/admin/settings', {
                commissionRate: referralSettings.commissionRate,
                bonusDuration: referralSettings.bonusDuration,
                minPayout: referralSettings.minPayout,
                isActive: referralSettings.isActive
            });
            toast.success('Ustawienia zapisane');
            setEditingReferralSettings(false);
            fetchReferralData();
        } catch (error) {
            console.error('Błąd zapisywania ustawień:', error);
            toast.error(error.response?.data?.error || 'Błąd zapisywania ustawień');
        } finally {
            setSavingReferralSettings(false);
        }
    };

    // Toggle referral dla użytkownika
    const toggleUserReferral = async (userId, disabled) => {
        try {
            await api.post(`/admin/users/${userId}/toggle-referral`, {
                disabled,
                reason: disabled ? 'Wyłączone przez admina' : null
            });
            toast.success(disabled ? 'Zaproszenia wyłączone' : 'Zaproszenia włączone');
            fetchReferralData();
            fetchData(); // Odśwież listę użytkowników
        } catch (error) {
            console.error('Error toggling referral:', error);
            toast.error('Błąd zmiany statusu');
        }
    };

    // 🆕 Wyłącz polecenia i wyzeruj zarobki
    const disableReferralAndResetEarnings = async (userId, userEmail) => {
        if (!confirm(`Czy na pewno chcesz wyłączyć polecenia i wyzerować zarobki z poleceń dla ${userEmail}?\n\n` +
        `⚠️ UWAGA:\n` +
        `• Wyzerowanie zarobków jest NIEODWRACALNE\n` +
        `• Wyłączenie poleceń można później cofnąć`)) {
            return;
        }
        
        setActionLoadingUser(userId);
        try {
            await api.post(`/admin/users/${userId}/disable-referral-reset-earnings`);
            toast.success('Polecenia wyłączone i zarobki wyzerowane');
            fetchData();
        } catch (error) {
            console.error('Error disabling referral:', error);
            toast.error(error.response?.data?.message || 'Błąd operacji');
        } finally {
            setActionLoadingUser(null);
        }
    };

    // 🆕 Włącz polecenia
    const enableUserReferral = async (userId) => {
        setActionLoadingUser(userId);
        try {
            await api.post(`/admin/users/${userId}/toggle-referral`, {
                disabled: false,
                reason: null
            });
            toast.success('Polecenia włączone');
            fetchData();
        } catch (error) {
            console.error('Error enabling referral:', error);
            toast.error('Błąd włączania poleceń');
        } finally {
            setActionLoadingUser(null);
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

    // 🆕 Filtrowanie użytkowników
    const filteredUsers = users.filter(user => {
        // Filtr tekstowy
        if (userSearch) {
            const search = userSearch.toLowerCase();
            if (!user.email.toLowerCase().includes(search)) {
                return false;
            }
        }
        // Filtr statusu
        if (userFilter === 'active') return user.isActive;
        if (userFilter === 'blocked') return !user.isActive;
        if (userFilter === 'admin') return user.isAdmin;
        if (userFilter === 'referralDisabled') return user.referralDisabled;
        return true;
    });

    // Oblicz liczbę zaproszonych użytkowników
    const invitedUsersCount = referralStats?.overview?.totalReferrals || 0;

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
        { id: 'referrals', label: 'Referale', icon: Gift, badge: referralStats?.fraudAlertStats?.pending || 0 },
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
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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
                            {/* Zaproszeni użytkownicy */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gift className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
                                    <span className="text-slate-400 text-xs sm:text-sm">Zaproszeni</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-purple-400">{invitedUsersCount}</p>
                                <p className="text-xs text-purple-400/70">przez referale</p>
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

                {/* Tab: Użytkownicy - ROZSZERZONE */}
                {activeTab === 'users' && (
                    <div className="space-y-4">
                        {/* 🆕 Filtry i wyszukiwarka */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Szukaj po emailu..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="all">Wszyscy</option>
                                    <option value="active">Aktywni</option>
                                    <option value="blocked">Zablokowani</option>
                                    <option value="admin">Admini</option>
                                    <option value="referralDisabled">Ref. wyłączone</option>
                                </select>
                                <button
                                    onClick={fetchData}
                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lista użytkowników */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700">
                                <h2 className="font-semibold">Użytkownicy ({filteredUsers.length})</h2>
                            </div>
                            <div className="divide-y divide-slate-700">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {user.isAdmin && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="truncate font-medium">{user.email}</p>
                                                        {user.referralDisabled && (
                                                            <span className="px-2 py-0.5 bg-orange-900/50 text-orange-400 text-xs rounded flex items-center gap-1">
                                                                <Ban className="w-3 h-3" />
                                                                Ref. OFF
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        <span className="text-green-500">${parseFloat(user.balance || 0).toFixed(2)}</span>
                                                        <span className="mx-2">•</span>
                                                        {user.linksCount || user._count?.links || 0} linków
                                                        {user.referralEarnings > 0 && (
                                                            <>
                                                                <span className="mx-2">•</span>
                                                                <span className="text-purple-400">Ref: ${parseFloat(user.referralEarnings || 0).toFixed(4)}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                                                <span className={`px-2 py-0.5 rounded text-xs ${user.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                    {user.isActive ? 'Aktywny' : 'Zablokowany'}
                                                </span>
                                                
                                                {/* Przyciski akcji */}
                                                <div className="flex items-center gap-1">
                                                    {/* Status aktywności */}
                                                    <button 
                                                        onClick={() => toggleUserStatus(user.id, user.isActive)} 
                                                        className={`p-2 rounded-lg ${user.isActive ? 'text-red-400 hover:bg-red-900/30' : 'text-green-400 hover:bg-green-900/30'}`}
                                                        title={user.isActive ? 'Zablokuj użytkownika' : 'Odblokuj użytkownika'}
                                                    >
                                                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    
                                                    {/* Admin toggle */}
                                                    <button 
                                                        onClick={() => toggleUserAdmin(user.id, user.isAdmin)} 
                                                        className={`p-2 rounded-lg ${user.isAdmin ? 'text-yellow-400 hover:bg-yellow-900/30' : 'text-slate-400 hover:bg-slate-700'}`}
                                                        title={user.isAdmin ? 'Usuń uprawnienia admina' : 'Nadaj uprawnienia admina'}
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {/* 🆕 Referral toggle */}
                                                    {user.referralDisabled ? (
                                                        <button 
                                                            onClick={() => enableUserReferral(user.id)}
                                                            disabled={actionLoadingUser === user.id}
                                                            className="p-2 rounded-lg text-green-400 hover:bg-green-900/30 disabled:opacity-50"
                                                            title="Włącz polecenia"
                                                        >
                                                            {actionLoadingUser === user.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Gift className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => disableReferralAndResetEarnings(user.id, user.email)}
                                                            disabled={actionLoadingUser === user.id}
                                                            className="p-2 rounded-lg text-orange-400 hover:bg-orange-900/30 disabled:opacity-50"
                                                            title="Wyłącz polecenia i wyzeruj zarobki"
                                                        >
                                                            {actionLoadingUser === user.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Ban className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                    
                                                    {/* Usuń */}
                                                    <button 
                                                        onClick={() => deleteUser(user.id)} 
                                                        className="p-2 text-red-400 rounded-lg hover:bg-red-900/30"
                                                        title="Usuń użytkownika"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 🆕 Dodatkowe info jeśli referral disabled */}
                                        {user.referralDisabled && user.referralDisabledReason && (
                                            <div className="mt-2 p-2 bg-orange-900/20 border border-orange-700/30 rounded-lg">
                                                <p className="text-xs text-orange-400">
                                                    <span className="font-medium">Powód blokady poleceń:</span> {user.referralDisabledReason}
                                                </p>
                                                {user.referralDisabledAt && (
                                                    <p className="text-xs text-orange-400/70">
                                                        Zablokowano: {new Date(user.referralDisabledAt).toLocaleString('pl-PL')}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {filteredUsers.length === 0 && (
                                    <div className="p-12 text-center">
                                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">Brak użytkowników spełniających kryteria</p>
                                    </div>
                                )}
                            </div>
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

                {/* Tab: Referale - ROZSZERZONE O FRAUD ALERTS */}
                {activeTab === 'referrals' && (
                    <div className="space-y-6">
                        {referralLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : (
                            <>
                                {/* Statystyki główne */}
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
                                            <span className="text-slate-400 text-xs sm:text-sm">Zaproszeni</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold text-purple-400">
                                            {referralStats?.overview?.totalReferrals || 0}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Gift className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                                            <span className="text-slate-400 text-xs sm:text-sm">Polecający</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold">
                                            {referralStats?.overview?.activeReferrers || 0}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                                            <span className="text-slate-400 text-xs sm:text-sm">Wypłacono prowizji</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold text-green-500">
                                            ${(referralStats?.overview?.totalCommissionsAmount || 0).toFixed(4)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                                            <span className="text-slate-400 text-xs sm:text-sm">Łącznie prowizji</span>
                                        </div>
                                        <p className="text-xl sm:text-2xl font-bold">
                                            {referralStats?.overview?.totalCommissions || 0}
                                        </p>
                                    </div>
                                    {/* Alerty fraudu */}
                                    <div className={`border rounded-xl p-4 sm:p-6 ${
                                        (referralStats?.fraudAlertStats?.pending || 0) > 0
                                            ? 'bg-red-900/30 border-red-700/50'
                                            : 'bg-slate-800/50 border-slate-700'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className={`w-4 sm:w-5 h-4 sm:h-5 ${
                                                (referralStats?.fraudAlertStats?.pending || 0) > 0 ? 'text-red-400' : 'text-slate-500'
                                            }`} />
                                            <span className="text-slate-400 text-xs sm:text-sm">Alerty fraudu</span>
                                        </div>
                                        <p className={`text-xl sm:text-2xl font-bold ${
                                            (referralStats?.fraudAlertStats?.pending || 0) > 0 ? 'text-red-400' : 'text-slate-500'
                                        }`}>
                                            {referralStats?.fraudAlertStats?.pending || 0}
                                        </p>
                                        {(referralStats?.fraudAlertStats?.highRisk || 0) > 0 && (
                                            <p className="text-xs text-red-400/70 mt-1">
                                                {referralStats?.fraudAlertStats?.highRisk} wysokie ryzyko
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* SEKCJA ALERTÓW FRAUDU */}
                                <FraudAlertsSection 
                                    stats={referralStats?.fraudAlertStats} 
                                    onRefresh={fetchReferralData}
                                />

                                {/* Ustawienia systemu */}
                                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                            <Percent className="w-5 h-5 text-purple-400" />
                                            Ustawienia systemu referali
                                        </h3>
                                        {!editingReferralSettings ? (
                                            <button
                                                onClick={() => setEditingReferralSettings(true)}
                                                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm flex items-center gap-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edytuj
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingReferralSettings(false)}
                                                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
                                                >
                                                    Anuluj
                                                </button>
                                                <button
                                                    onClick={saveReferralSettings}
                                                    disabled={savingReferralSettings}
                                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {savingReferralSettings ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4" />
                                                    )}
                                                    Zapisz
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Procent prowizji */}
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <p className="text-xs text-slate-400 mb-2">Prowizja od zarobków</p>
                                            {editingReferralSettings ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="50"
                                                        step="1"
                                                        value={referralSettings.commissionRate}
                                                        onChange={(e) => setReferralSettings({
                                                            ...referralSettings,
                                                            commissionRate: parseFloat(e.target.value) || 0
                                                        })}
                                                        className="w-20 bg-slate-700 border border-purple-500 rounded px-3 py-2 text-lg font-bold"
                                                    />
                                                    <span className="text-xl font-bold text-purple-400">%</span>
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-bold text-purple-400">
                                                    {referralSettings.commissionRate}%
                                                </p>
                                            )}
                                        </div>

                                        {/* Czas trwania bonusu */}
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <p className="text-xs text-slate-400 mb-2">Czas trwania bonusu</p>
                                            {editingReferralSettings ? (
                                                <select
                                                    value={referralSettings.bonusDuration === null ? 'forever' : referralSettings.bonusDuration}
                                                    onChange={(e) => setReferralSettings({
                                                        ...referralSettings,
                                                        bonusDuration: e.target.value === 'forever' ? null : parseInt(e.target.value)
                                                    })}
                                                    className="w-full bg-slate-700 border border-purple-500 rounded px-3 py-2 text-lg font-bold"
                                                >
                                                    <option value="forever">Dożywotni</option>
                                                    <option value="30">30 dni</option>
                                                    <option value="90">90 dni</option>
                                                    <option value="180">180 dni</option>
                                                    <option value="365">365 dni</option>
                                                </select>
                                            ) : (
                                                <p className="text-2xl font-bold text-cyan-400">
                                                    {referralSettings.bonusDuration === null ? 'Dożywotni' : `${referralSettings.bonusDuration} dni`}
                                                </p>
                                            )}
                                        </div>

                                        {/* Min. wypłata */}
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <p className="text-xs text-slate-400 mb-2">Min. wypłata referali</p>
                                            {editingReferralSettings ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-green-400">$</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={referralSettings.minPayout}
                                                        onChange={(e) => setReferralSettings({
                                                            ...referralSettings,
                                                            minPayout: parseFloat(e.target.value) || 5
                                                        })}
                                                        className="w-20 bg-slate-700 border border-purple-500 rounded px-3 py-2 text-lg font-bold"
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-2xl font-bold text-green-400">
                                                    ${referralSettings.minPayout}
                                                </p>
                                            )}
                                        </div>

                                        {/* Status systemu */}
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                            <p className="text-xs text-slate-400 mb-2">Status systemu</p>
                                            {editingReferralSettings ? (
                                                <button
                                                    onClick={() => setReferralSettings({
                                                        ...referralSettings,
                                                        isActive: !referralSettings.isActive
                                                    })}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${
                                                        referralSettings.isActive 
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500'
                                                    }`}
                                                >
                                                    {referralSettings.isActive ? (
                                                        <>
                                                            <ToggleRight className="w-5 h-5" />
                                                            Aktywny
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="w-5 h-5" />
                                                            Wyłączony
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className={`flex items-center gap-2 text-2xl font-bold ${
                                                    referralSettings.isActive ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {referralSettings.isActive ? (
                                                        <>
                                                            <CheckCircle className="w-6 h-6" />
                                                            Aktywny
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-6 h-6" />
                                                            Wyłączony
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Top polecający z przyciskiem wyłączania zaproszeń */}
                                {referralStats?.topReferrers?.length > 0 && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-slate-700">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Crown className="w-5 h-5 text-yellow-500" />
                                                Top polecający
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-slate-700">
                                            {referralStats.topReferrers.map((referrer, index) => (
                                                <div key={referrer.id} className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            index === 1 ? 'bg-slate-400/20 text-slate-300' :
                                                            index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                            'bg-slate-700 text-slate-400'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">{referrer.email}</p>
                                                                {referrer.referralDisabled && (
                                                                    <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded">
                                                                        Ref. wyłączone
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400">
                                                                Kod: <span className="font-mono text-purple-400">{referrer.referralCode}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-400">${referrer.earnings.toFixed(4)}</p>
                                                            <p className="text-xs text-slate-400">{referrer.referralsCount} poleconych</p>
                                                        </div>
                                                        {/* Przycisk wyłączania zaproszeń */}
                                                        <button
                                                            onClick={() => toggleUserReferral(referrer.id, !referrer.referralDisabled)}
                                                            className={`p-2 rounded-lg text-xs ${
                                                                referrer.referralDisabled
                                                                    ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                                                    : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                            }`}
                                                            title={referrer.referralDisabled ? 'Włącz zaproszenia' : 'Wyłącz zaproszenia'}
                                                        >
                                                            {referrer.referralDisabled ? (
                                                                <UserCheck className="w-4 h-4" />
                                                            ) : (
                                                                <UserX className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Ostatnie polecenia */}
                                {referralStats?.recentReferrals?.length > 0 && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                        <div className="p-4 border-b border-slate-700">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-cyan-500" />
                                                Ostatnie polecenia
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-slate-700">
                                            {referralStats.recentReferrals.map((referral) => (
                                                <div key={referral.id} className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">{referral.email}</p>
                                                            {referral.fraudFlag && (
                                                                <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs rounded flex items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3" />
                                                                    Fraud
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">
                                                            Polecony przez: <span className="text-purple-400">{referral.referredBy.email}</span>
                                                            <span className="mx-2">•</span>
                                                            <span className="font-mono">{referral.referredBy.code}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400">
                                                            {new Date(referral.joinedAt).toLocaleDateString('pl-PL')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Lista wszystkich poleceń */}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => {
                                            setShowReferralsList(!showReferralsList);
                                            if (!showReferralsList && allReferrals.length === 0) {
                                                fetchAllReferrals(1, referralSearch);
                                            }
                                        }}
                                        className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition"
                                    >
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Users className="w-5 h-5 text-purple-500" />
                                            Wszystkie polecenia ({referralStats?.overview?.totalReferrals || 0})
                                        </h3>
                                        {showReferralsList ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>

                                    {showReferralsList && (
                                        <div className="border-t border-slate-700">
                                            {/* Wyszukiwarka */}
                                            <div className="p-4 bg-slate-700/30">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Szukaj po emailu..."
                                                        value={referralSearch}
                                                        onChange={(e) => setReferralSearch(e.target.value)}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                fetchAllReferrals(1, referralSearch);
                                                            }
                                                        }}
                                                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                                                    />
                                                    <button
                                                        onClick={() => fetchAllReferrals(1, referralSearch)}
                                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition flex items-center gap-2"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tabela */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-slate-700/50 text-xs text-slate-400">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left">Polecony</th>
                                                            <th className="px-4 py-3 text-left">Polecający</th>
                                                            <th className="px-4 py-3 text-left">Data</th>
                                                            <th className="px-4 py-3 text-right">Zarobki poleconego</th>
                                                            <th className="px-4 py-3 text-right">Wygenerowana prowizja</th>
                                                            <th className="px-4 py-3 text-center">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-700">
                                                        {allReferrals.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                                                    Brak poleceń do wyświetlenia
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            allReferrals.map((referral) => (
                                                                <tr key={referral.id} className="hover:bg-slate-700/30">
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-medium">{referral.email}</p>
                                                                            {referral.fraudFlag && (
                                                                                <AlertCircle className="w-4 h-4 text-red-400" title={referral.fraudReason} />
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div>
                                                                                <p className="text-sm">{referral.referredBy.email}</p>
                                                                                <p className="text-xs text-purple-400 font-mono">{referral.referredBy.code}</p>
                                                                            </div>
                                                                            {referral.referredBy.referralDisabled && (
                                                                                <span className="px-1.5 py-0.5 bg-red-900/50 text-red-400 text-[10px] rounded">
                                                                                    OFF
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-slate-400">
                                                                        {new Date(referral.joinedAt).toLocaleDateString('pl-PL')}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right font-mono">
                                                                        ${referral.totalEarned.toFixed(4)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-right font-mono text-green-400">
                                                                        ${referral.totalCommissionGenerated.toFixed(4)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center">
                                                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                                                            referral.isActive 
                                                                                ? 'bg-green-900/50 text-green-400' 
                                                                                : 'bg-red-900/50 text-red-400'
                                                                        }`}>
                                                                            {referral.isActive ? 'Aktywny' : 'Nieaktywny'}
                                                                        </span>
                                                                        {referral.bonusExpires && (
                                                                            <p className="text-xs text-slate-500 mt-1">
                                                                                Do: {new Date(referral.bonusExpires).toLocaleDateString('pl-PL')}
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Paginacja */}
                                            {referralPagination && referralPagination.totalPages > 1 && (
                                                <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                                                    <p className="text-sm text-slate-400">
                                                        Strona {referralPage} z {referralPagination.totalPages}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => fetchAllReferrals(referralPage - 1, referralSearch)}
                                                            disabled={referralPage <= 1}
                                                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Poprzednia
                                                        </button>
                                                        <button
                                                            onClick={() => fetchAllReferrals(referralPage + 1, referralSearch)}
                                                            disabled={referralPage >= referralPagination.totalPages}
                                                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Następna
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
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