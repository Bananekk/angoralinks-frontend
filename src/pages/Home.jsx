import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowRight, DollarSign, Link2, Shield, Zap, 
    User, LayoutDashboard, LogOut, Wallet, BarChart3,
    ChevronRight, Globe, Clock, TrendingUp, Users
} from 'lucide-react';
import api from '../api/axios';

function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [publicStats, setPublicStats] = useState({
        users: 0,
        clicks: 0,
        paidOut: 0,
        uptime: 99.9
    });

    useEffect(() => {
        // Sprawdź czy użytkownik jest zalogowany
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Błąd parsowania danych użytkownika');
            }
        }
        
        // Pobierz publiczne statystyki
        fetchPublicStats();
        
        setIsLoading(false);
    }, []);

    const fetchPublicStats = async () => {
        try {
            const response = await api.get('/stats/public');
            setPublicStats(response.data);
        } catch (error) {
            console.error('Błąd pobierania statystyk:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Formatowanie liczb
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-8 h-8 text-primary-500" />
                            <span className="text-xl font-bold text-white">AngoraLinks</span>
                        </div>
                        
                        {user ? (
                            // Zalogowany użytkownik
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2 text-sm">
                                    <span className="text-slate-400">Saldo:</span>
                                    <span className="text-green-500 font-semibold">
                                        ${parseFloat(user.balance || 0).toFixed(2)}
                                    </span>
                                </div>
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition text-white"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-white transition"
                                    title="Wyloguj się"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            // Niezalogowany użytkownik
                            <div className="flex items-center gap-4">
                                <Link 
                                    to="/login" 
                                    className="text-slate-300 hover:text-white transition"
                                >
                                    Zaloguj się
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition text-white"
                                >
                                    Zarejestruj się
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section - różny dla zalogowanych i niezalogowanych */}
            {user ? (
                // Hero dla zalogowanych
                <section className="pt-24 pb-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/30 rounded-2xl p-8 mb-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        Witaj, {user.email?.split('@')[0]}! 👋
                                    </h1>
                                    <p className="text-slate-400">
                                        Zarządzaj swoimi linkami i zarabiaj więcej.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center px-6 py-3 bg-slate-800/50 rounded-xl">
                                        <p className="text-2xl font-bold text-green-500">
                                            ${parseFloat(user.balance || 0).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-slate-400">Dostępne saldo</p>
                                    </div>
                                    <div className="text-center px-6 py-3 bg-slate-800/50 rounded-xl">
                                        <p className="text-2xl font-bold text-primary-500">
                                            ${parseFloat(user.totalEarned || 0).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-slate-400">Łącznie zarobione</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Szybkie akcje dla zalogowanych */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <Link 
                                to="/dashboard" 
                                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-primary-500/50 p-6 rounded-xl transition group"
                            >
                                <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600/30 transition">
                                    <LayoutDashboard className="w-6 h-6 text-primary-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Dashboard</h3>
                                <p className="text-slate-400 text-sm">Zarządzaj linkami</p>
                                <ChevronRight className="w-5 h-5 text-slate-500 mt-2 group-hover:text-primary-500 transition" />
                            </Link>

                            <Link 
                                to="/stats" 
                                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 p-6 rounded-xl transition group"
                            >
                                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition">
                                    <BarChart3 className="w-6 h-6 text-blue-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Statystyki</h3>
                                <p className="text-slate-400 text-sm">Analizuj ruch</p>
                                <ChevronRight className="w-5 h-5 text-slate-500 mt-2 group-hover:text-blue-500 transition" />
                            </Link>

                            <Link 
                                to="/payouts" 
                                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-green-500/50 p-6 rounded-xl transition group"
                            >
                                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition">
                                    <Wallet className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Wypłaty</h3>
                                <p className="text-slate-400 text-sm">Wypłać środki</p>
                                <ChevronRight className="w-5 h-5 text-slate-500 mt-2 group-hover:text-green-500 transition" />
                            </Link>

                            <Link 
                                to="/profile" 
                                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 p-6 rounded-xl transition group"
                            >
                                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition">
                                    <User className="w-6 h-6 text-purple-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1">Profil</h3>
                                <p className="text-slate-400 text-sm">Ustawienia konta</p>
                                <ChevronRight className="w-5 h-5 text-slate-500 mt-2 group-hover:text-purple-500 transition" />
                            </Link>
                        </div>
                    </div>
                </section>
            ) : (
                // Hero dla niezalogowanych
                <section className="pt-32 pb-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-primary-600/20 border border-primary-500/30 rounded-full px-4 py-2 mb-6">
                            <Zap className="w-4 h-4 text-primary-500" />
                            <span className="text-sm text-primary-400">Najlepsza platforma do zarabiania na linkach</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                            Zarabiaj na 
                            <span className="text-primary-500"> linkach</span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                            Skracaj linki i zarabiaj pieniądze za każde kliknięcie. 
                            Dołącz do tysięcy użytkowników, którzy już zarabiają z AngoraLinks.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                to="/register" 
                                className="bg-primary-600 hover:bg-primary-700 px-8 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 text-white"
                            >
                                Zacznij zarabiać
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link 
                                to="/login" 
                                className="bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-xl font-semibold text-lg transition text-white"
                            >
                                Mam już konto
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Features - pokazuj tylko dla niezalogowanych */}
            {!user && (
                <section className="py-20 px-4 bg-slate-800/30">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
                            Dlaczego AngoraLinks?
                        </h2>
                        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
                            Oferujemy najlepsze warunki dla twórców treści i marketerów
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-primary-500/50 transition">
                                <div className="w-14 h-14 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
                                    <DollarSign className="w-7 h-7 text-green-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Wysokie stawki</h3>
                                <p className="text-slate-400">
                                    Zarabiaj do $3 CPM za ruch z krajów Tier 1. 
                                    Konkurencyjne stawki dla całego świata.
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-primary-500/50 transition">
                                <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                                    <Clock className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Szybkie wypłaty</h3>
                                <p className="text-slate-400">
                                    Wypłaty już od $10. PayPal, Bitcoin, przelew bankowy. 
                                    Otrzymaj pieniądze w 24h.
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-primary-500/50 transition">
                                <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
                                    <Shield className="w-7 h-7 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Bezpieczne linki</h3>
                                <p className="text-slate-400">
                                    Wszystkie linki są sprawdzane. Ochrona przed złośliwym oprogramowaniem.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* How it works - dla niezalogowanych */}
            {!user && (
                <section className="py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
                            Jak to działa?
                        </h2>
                        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
                            Zacznij zarabiać w trzech prostych krokach
                        </p>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Zarejestruj się</h3>
                                <p className="text-slate-400">
                                    Stwórz darmowe konto w kilka sekund. Bez ukrytych opłat.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Skróć link</h3>
                                <p className="text-slate-400">
                                    Wklej dowolny link i otrzymaj skrócony URL gotowy do udostępnienia.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-white">Zarabiaj</h3>
                                <p className="text-slate-400">
                                    Udostępniaj link i zarabiaj za każde kliknięcie. To takie proste!
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Stats - PRAWDZIWE STATYSTYKI Z API */}
            <section className={`py-20 px-4 ${user ? 'bg-slate-800/30' : ''}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="p-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Users className="w-6 h-6 text-primary-500" />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-primary-500">
                                {formatNumber(publicStats.users)}
                            </div>
                            <div className="text-slate-400 mt-2">Użytkowników</div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Globe className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-blue-500">
                                {formatNumber(publicStats.clicks)}
                            </div>
                            <div className="text-slate-400 mt-2">Kliknięć</div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-green-500">
                                ${formatNumber(publicStats.paidOut)}
                            </div>
                            <div className="text-slate-400 mt-2">Wypłacone</div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-purple-500">
                                {publicStats.uptime}%
                            </div>
                            <div className="text-slate-400 mt-2">Uptime</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA dla niezalogowanych */}
            {!user && (
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                                Gotowy, żeby zacząć zarabiać?
                            </h2>
                            <p className="text-lg text-white/80 mb-8">
                                Dołącz do {publicStats.users > 0 ? formatNumber(publicStats.users) : ''} użytkowników, którzy już zarabiają z AngoraLinks
                            </p>
                            <Link 
                                to="/register" 
                                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition"
                            >
                                Zarejestruj się za darmo
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8 px-4 bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-6 h-6 text-primary-500" />
                            <span className="font-bold text-white">AngoraLinks</span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            © 2025 AngoraLinks. Wszystkie prawa zastrzeżone.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <Link to="/terms" className="hover:text-white transition">Regulamin</Link>
                            <Link to="/contact" className="hover:text-white transition">Kontakt</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;