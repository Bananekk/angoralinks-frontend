import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, Users, Link2, BarChart3, DollarSign, MousePointer,
    ArrowLeft, Loader2, Trash2, UserX, UserCheck, Crown,
    TrendingUp, Calendar, Wallet, CheckCircle, XCircle, Clock, AlertCircle,
    Mail, MessageSquare, Eye, EyeOff
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

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.isAdmin) {
            navigate('/dashboard');
            toast.error('Brak uprawnień administratora');
            return;
        }
        fetchData();
    }, [navigate]);

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
        const statusLabels = {
            'PROCESSING': 'przetwarzanie',
            'COMPLETED': 'zrealizowana',
            'REJECTED': 'odrzucona'
        };

        if (!confirm(`Czy na pewno chcesz zmienić status na "${statusLabels[newStatus]}"?`)) return;

        try {
            await api.put(`/admin/payouts/${payoutId}`, { status: newStatus });
            setPayouts(payouts.map(p => 
                p.id === payoutId 
                    ? { ...p, status: newStatus, processedAt: new Date().toISOString() } 
                    : p
            ));
            toast.success(`Status zmieniony na: ${statusLabels[newStatus]}`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd zmiany statusu');
        }
    };

    // Funkcje dla wiadomości
    const markAsRead = async (messageId) => {
        try {
            await api.put(`/admin/messages/${messageId}/read`, { sendNotification: true });
            setMessages(messages.map(m => 
                m.id === messageId ? { ...m, isRead: true } : m
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Oznaczono jako przeczytane - użytkownik otrzymał powiadomienie');
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
            if (!message.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Wiadomość usunięta');
        } catch (error) {
            toast.error('Błąd usuwania wiadomości');
        }
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
                {s.text}
            </span>
        );
    };

    const getMethodLabel = (method) => {
        const methods = {
            'paypal': 'PayPal',
            'PAYPAL': 'PayPal',
            'btc': 'Bitcoin',
            'BITCOIN': 'Bitcoin',
            'bitcoin': 'Bitcoin',
            'usdt_trc20': 'USDT (TRC20)',
            'ltc': 'Litecoin'
        };
        return methods[method] || method;
    };

    const payoutStats = {
        pending: payouts.filter(p => p.status === 'PENDING').length,
        pendingAmount: payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0),
        completed: payouts.filter(p => p.status === 'COMPLETED').length,
        completedAmount: payouts.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const maxVisits = Math.max(...(stats?.dailyStats?.map(d => d.visits) || [1]));

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6 text-red-500" />
                            <span className="font-bold text-xl">Panel Admina</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-4 overflow-x-auto">
                        {[
                            { id: 'stats', label: 'Statystyki', icon: BarChart3 },
                            { id: 'users', label: 'Użytkownicy', icon: Users },
                            { id: 'links', label: 'Linki', icon: Link2 },
                            { id: 'payouts', label: 'Wypłaty', icon: Wallet, badge: payoutStats.pending },
                            { id: 'messages', label: 'Wiadomości', icon: MessageSquare, badge: unreadCount }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-primary-500 text-primary-500'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Tab: Statystyki */}
                {activeTab === 'stats' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span className="text-slate-400 text-sm">Użytkownicy</span>
                                </div>
                                <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
                                <p className="text-sm text-green-500">+{stats?.users?.newToday || 0} dzisiaj</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Link2 className="w-5 h-5 text-purple-500" />
                                    <span className="text-slate-400 text-sm">Linki</span>
                                </div>
                                <p className="text-2xl font-bold">{stats?.links?.total || 0}</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <MousePointer className="w-5 h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-sm">Wizyty</span>
                                </div>
                                <p className="text-2xl font-bold">{stats?.visits?.total || 0}</p>
                                <p className="text-sm text-green-500">+{stats?.visits?.today || 0} dzisiaj</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                    <span className="text-slate-400 text-sm">Zarobek platformy</span>
                                </div>
                                <p className="text-2xl font-bold text-green-500">
                                    ${stats?.earnings?.platformTotal?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary-500" />
                                Ostatnie 7 dni
                            </h2>
                            <div className="flex items-end justify-between gap-2 h-48">
                                {stats?.dailyStats?.map((day, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-slate-700 rounded-t-lg relative" style={{ height: '160px' }}>
                                            <div 
                                                className="absolute bottom-0 w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                                                style={{ 
                                                    height: `${maxVisits > 0 ? (day.visits / maxVisits) * 100 : 0}%`,
                                                    minHeight: day.visits > 0 ? '8px' : '0'
                                                }}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400">
                                                {new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}
                                            </p>
                                            <p className="text-sm font-semibold">{day.visits}</p>
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
                            <h2 className="font-semibold">Wszyscy użytkownicy ({users.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
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
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    user.isActive 
                                                        ? 'bg-green-900/50 text-green-400' 
                                                        : 'bg-red-900/50 text-red-400'
                                                }`}>
                                                    {user.isActive ? 'Aktywny' : 'Zablokowany'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                                                        className={`p-2 rounded-lg transition ${
                                                            user.isActive
                                                                ? 'text-red-400 hover:bg-red-900/30'
                                                                : 'text-green-400 hover:bg-green-900/30'
                                                        }`}
                                                        title={user.isActive ? 'Zablokuj' : 'Odblokuj'}
                                                    >
                                                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleUserAdmin(user.id, user.isAdmin)}
                                                        className={`p-2 rounded-lg transition ${
                                                            user.isAdmin
                                                                ? 'text-yellow-400 hover:bg-yellow-900/30'
                                                                : 'text-slate-400 hover:bg-slate-700'
                                                        }`}
                                                        title={user.isAdmin ? 'Usuń admina' : 'Nadaj admina'}
                                                    >
                                                        <Crown className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                                        title="Usuń"
                                                    >
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
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="font-semibold">Wszystkie linki ({links.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
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
                                                <p className="font-mono text-primary-500">{link.shortCode}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-xs">{link.originalUrl}</p>
                                            </td>
                                            <td className="p-4 text-sm">{link.userEmail}</td>
                                            <td className="p-4">{link.totalClicks}</td>
                                            <td className="p-4 text-green-500">${link.totalEarned.toFixed(4)}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => deleteLink(link.id)}
                                                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                                    title="Usuń"
                                                >
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
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-sm">Oczekujące</span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-500">{payoutStats.pending}</p>
                                <p className="text-sm text-yellow-500/70">${payoutStats.pendingAmount.toFixed(2)}</p>
                            </div>

                            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-slate-400 text-sm">Zrealizowane</span>
                                </div>
                                <p className="text-2xl font-bold text-green-500">{payoutStats.completed}</p>
                                <p className="text-sm text-green-500/70">${payoutStats.completedAmount.toFixed(2)}</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Wallet className="w-5 h-5 text-blue-500" />
                                    <span className="text-slate-400 text-sm">Wszystkie</span>
                                </div>
                                <p className="text-2xl font-bold">{payouts.length}</p>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-purple-500" />
                                    <span className="text-slate-400 text-sm">Łączna wartość</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-500">
                                    ${payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700">
                                <h2 className="font-semibold">Wszystkie wypłaty ({payouts.length})</h2>
                            </div>

                            {payouts.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">Brak wypłat</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
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
                                                    <td className="p-4 text-sm text-slate-400">
                                                        {new Date(payout.createdAt).toLocaleDateString('pl-PL')}
                                                    </td>
                                                    <td className="p-4 text-sm">{payout.userEmail}</td>
                                                    <td className="p-4 font-semibold text-green-500">
                                                        ${(payout.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="p-4 text-sm">{getMethodLabel(payout.method)}</td>
                                                    <td className="p-4">{getPayoutStatusBadge(payout.status)}</td>
                                                    <td className="p-4">
                                                        {payout.status === 'PENDING' && (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => updatePayoutStatus(payout.id, 'COMPLETED')}
                                                                    className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition"
                                                                    title="Zatwierdź"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => updatePayoutStatus(payout.id, 'REJECTED')}
                                                                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                                                    title="Odrzuć"
                                                                >
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
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Wiadomości */}
                {activeTab === 'messages' && (
                    <div className="space-y-6">
                        {/* Statystyki wiadomości */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Mail className="w-5 h-5 text-blue-500" />
                                    <span className="text-slate-400 text-sm">Wszystkie</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-500">{messages.length}</p>
                            </div>

                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <EyeOff className="w-5 h-5 text-yellow-500" />
                                    <span className="text-slate-400 text-sm">Nieprzeczytane</span>
                                </div>
                                <p className="text-2xl font-bold text-yellow-500">{unreadCount}</p>
                            </div>

                            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Eye className="w-5 h-5 text-green-500" />
                                    <span className="text-slate-400 text-sm">Przeczytane</span>
                                </div>
                                <p className="text-2xl font-bold text-green-500">{messages.length - unreadCount}</p>
                            </div>
                        </div>

                        {/* Lista wiadomości */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700">
                                <h2 className="font-semibold">Wiadomości kontaktowe</h2>
                            </div>

                            {messages.length === 0 ? (
                                <div className="p-12 text-center">
                                    <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">Brak wiadomości</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700">
                                    {messages.map(message => (
                                        <div 
                                            key={message.id} 
                                            className={`p-4 ${!message.isRead ? 'bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {!message.isRead && (
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                        <span className="font-semibold">{message.name}</span>
                                                        <span className="text-slate-400 text-sm">({message.email})</span>
                                                    </div>
                                                    <p className="text-primary-400 text-sm mb-2">
                                                        Temat: {message.subject}
                                                    </p>
                                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                                                        {message.message}
                                                    </p>
                                                    <p className="text-slate-500 text-xs mt-2">
                                                        {new Date(message.createdAt).toLocaleString('pl-PL')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!message.isRead && (
                                                        <button
                                                            onClick={() => markAsRead(message.id)}
                                                            className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition"
                                                            title="Oznacz jako przeczytane"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <a
                                                        href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                                                        className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition"
                                                        title="Odpowiedz"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => deleteMessage(message.id)}
                                                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                                        title="Usuń"
                                                    >
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
            </main>
        </div>
    );
}

export default Admin;