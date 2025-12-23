// Stats.jsx - RESPONSYWNY
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Link2, BarChart3, TrendingUp, DollarSign, MousePointer, 
    Globe, Smartphone, Monitor, Tablet, ArrowLeft, Loader2,
    Calendar, Info, Menu, X, Shield, Wallet, User, LogOut
} from 'lucide-react';
import api from '../api/axios';

function Stats() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [countries, setCountries] = useState([]);
    const [devices, setDevices] = useState([]);
    const [topLinks, setTopLinks] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token) {
            navigate('/login');
            return;
        }
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {}
        }
        fetchAllStats();
    }, [navigate]);

    // Close menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Lock scroll when menu open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    const fetchAllStats = async () => {
        try {
            const [overviewRes, countriesRes, devicesRes, linksRes] = await Promise.all([
                api.get('/stats/overview'),
                api.get('/stats/countries'),
                api.get('/stats/devices'),
                api.get('/stats/links')
            ]);

            setStats(overviewRes.data);
            setCountries(countriesRes.data.countries);
            setDevices(devicesRes.data.devices);
            setTopLinks(linksRes.data.links);
        } catch (error) {
            console.error('Błąd pobierania statystyk:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getDeviceIcon = (device) => {
        switch (device?.toLowerCase()) {
            case 'mobile': return <Smartphone className="w-5 h-5" />;
            case 'tablet': return <Tablet className="w-5 h-5" />;
            default: return <Monitor className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const maxClicks = Math.max(...(stats?.dailyStats?.map(d => d.clicks) || [1]));

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
                            <BarChart3 className="w-5 sm:w-6 h-5 sm:h-6 text-cyan-500" />
                            <span className="font-bold text-lg sm:text-xl">Statystyki</span>
                        </div>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Saldo</p>
                            <p className="font-semibold text-cyan-500">${stats?.balance?.toFixed(4) || '0.0000'}</p>
                        </div>
                        <Link to="/dashboard" className="p-2 text-slate-400 hover:text-white" title="Dashboard">
                            <Link2 className="w-5 h-5" />
                        </Link>
                        <Link to="/cpm-rates" className="p-2 text-green-500" title="CPM">
                            <Globe className="w-5 h-5" />
                        </Link>
                        <Link to="/payouts" className="p-2 text-slate-400 hover:text-white" title="Wypłaty">
                            <Wallet className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Mobile Menu Drawer */}
            <div className={`fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-slate-800 z-[101] transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <span className="font-semibold text-lg">Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 border-b border-slate-700 bg-cyan-500/10">
                    <p className="text-xs text-slate-400">Saldo</p>
                    <p className="text-2xl font-bold text-cyan-500">${stats?.balance?.toFixed(4) || '0.0000'}</p>
                </div>
                <nav className="flex-1 overflow-auto">
                    <Link to="/dashboard" className="flex items-center gap-3 p-4 border-b border-slate-700 text-slate-100" onClick={() => setMobileMenuOpen(false)}>
                        <Link2 className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link to="/stats" className="flex items-center gap-3 p-4 border-b border-slate-700 text-cyan-500 bg-cyan-500/10" onClick={() => setMobileMenuOpen(false)}>
                        <BarChart3 className="w-5 h-5" /> Statystyki
                    </Link>
                    <Link to="/cpm-rates" className="flex items-center gap-3 p-4 border-b border-slate-700 text-green-500" onClick={() => setMobileMenuOpen(false)}>
                        <Globe className="w-5 h-5" /> Stawki CPM
                    </Link>
                    <Link to="/payouts" className="flex items-center gap-3 p-4 border-b border-slate-700 text-slate-100" onClick={() => setMobileMenuOpen(false)}>
                        <Wallet className="w-5 h-5" /> Wypłaty
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 p-4 border-b border-slate-700 text-slate-100" onClick={() => setMobileMenuOpen(false)}>
                        <User className="w-5 h-5" /> Profil
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 w-full p-3 bg-red-500/10 text-red-500 border border-red-500 rounded-lg font-medium">
                        <LogOut className="w-5 h-5" /> Wyloguj się
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* Info o podziale */}
                <div className="bg-cyan-900/30 border border-cyan-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-8 flex items-start gap-3">
                    <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-cyan-300 text-sm sm:text-base">Podział zarobków</p>
                        <p className="text-xs sm:text-sm text-cyan-400">
                            Otrzymujesz <span className="font-bold text-white">85%</span> z każdego zarobku. 
                            Pozostałe 15% to prowizja platformy.
                        </p>
                    </div>
                </div>

                {/* Główne statystyki */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                            <span className="text-slate-400 text-xs sm:text-sm">Saldo</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-green-500">
                            ${stats?.balance?.toFixed(4) || '0.0000'}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                            <span className="text-slate-400 text-xs sm:text-sm">Całkowity</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold">
                            ${stats?.totalEarned?.toFixed(4) || '0.0000'}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <MousePointer className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-500" />
                            <span className="text-slate-400 text-xs sm:text-sm">Kliknięcia</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold">
                            {stats?.totalClicks || 0}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <Link2 className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
                            <span className="text-slate-400 text-xs sm:text-sm">Linki</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold">
                            {stats?.totalLinks || 0}
                        </p>
                    </div>
                </div>

                {/* Dzisiejsze statystyki */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-8">
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/50 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                            <span className="text-green-300 text-sm sm:text-base">Dzisiaj - Zarobek</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400">
                            ${stats?.today?.earned?.toFixed(4) || '0.0000'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/50 rounded-xl p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MousePointer className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
                            <span className="text-blue-300 text-sm sm:text-base">Dzisiaj - Kliknięcia</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                            {stats?.today?.clicks || 0}
                        </p>
                    </div>
                </div>

                {/* Wykres ostatnich 7 dni */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-8">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                        Ostatnie 7 dni
                    </h2>
                    <div className="flex items-end justify-between gap-1 sm:gap-2 h-36 sm:h-48 overflow-x-auto">
                        {stats?.dailyStats?.map((day, index) => (
                            <div key={index} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 sm:gap-2">
                                <div className="w-full bg-slate-700 rounded-t-lg relative" style={{ height: '100px' }}>
                                    <div 
                                        className="absolute bottom-0 w-full bg-cyan-500 rounded-t-lg transition-all duration-500"
                                        style={{ 
                                            height: `${maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0}%`,
                                            minHeight: day.clicks > 0 ? '8px' : '0'
                                        }}
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-400">
                                        {new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}
                                    </p>
                                    <p className="text-xs sm:text-sm font-semibold">{day.clicks}</p>
                                    <p className="text-[10px] sm:text-xs text-green-500">${day.earned.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                    {/* Kraje */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                            Kraje
                        </h2>
                        {countries.length === 0 ? (
                            <p className="text-slate-400 text-center py-4 text-sm">Brak danych</p>
                        ) : (
                            <div className="space-y-3">
                                {countries.slice(0, 5).map((country, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🌍</span>
                                            <span className="text-sm sm:text-base">{country.country}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm sm:text-base">{country.clicks}</p>
                                            <p className="text-xs sm:text-sm text-green-500">${country.earned.toFixed(4)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Urządzenia */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                            <Smartphone className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                            Urządzenia
                        </h2>
                        {devices.length === 0 ? (
                            <p className="text-slate-400 text-center py-4 text-sm">Brak danych</p>
                        ) : (
                            <div className="space-y-3">
                                {devices.map((device, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getDeviceIcon(device.device)}
                                            <span className="capitalize text-sm sm:text-base">{device.device}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm sm:text-base">{device.clicks}</p>
                                            <p className="text-xs sm:text-sm text-green-500">${device.earned.toFixed(4)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top linki */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 mt-4 sm:mt-8">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-500" />
                        Najpopularniejsze linki
                    </h2>
                    {topLinks.length === 0 ? (
                        <p className="text-slate-400 text-center py-4 text-sm">Brak linków</p>
                    ) : (
                        <div className="space-y-3">
                            {topLinks.map((link, index) => (
                                <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-700/30 rounded-lg gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-slate-500">#{index + 1}</span>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate text-sm sm:text-base">{link.title}</p>
                                            <p className="text-xs sm:text-sm text-slate-400">{link.shortCode}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex sm:flex-col gap-4 sm:gap-0 justify-end">
                                        <p className="font-semibold text-sm sm:text-base">{link.clicks} klik.</p>
                                        <p className="text-xs sm:text-sm text-green-500">${link.earned.toFixed(4)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Stats;