import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Link2, BarChart3, TrendingUp, DollarSign, MousePointer, 
    Globe, Smartphone, Monitor, Tablet, ArrowLeft, Loader2,
    Calendar, Info
} from 'lucide-react';
import api from '../api/axios';

function Stats() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [countries, setCountries] = useState([]);
    const [devices, setDevices] = useState([]);
    const [topLinks, setTopLinks] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAllStats();
    }, [navigate]);

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
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    const maxClicks = Math.max(...(stats?.dailyStats?.map(d => d.clicks) || [1]));

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
                            <BarChart3 className="w-6 h-6 text-primary-500" />
                            <span className="font-bold text-xl">Statystyki</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Info o podziale */}
                <div className="bg-primary-900/30 border border-primary-700 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div>
                        <p className="font-semibold text-primary-300">Podział zarobków</p>
                        <p className="text-sm text-primary-400">
                            Otrzymujesz <span className="font-bold text-white">85%</span> z każdego zarobku. 
                            Pozostałe 15% to prowizja platformy.
                        </p>
                    </div>
                </div>

                {/* Główne statystyki */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="text-slate-400 text-sm">Saldo</span>
                        </div>
                        <p className="text-2xl font-bold text-green-500">
                            ${stats?.balance?.toFixed(4) || '0.0000'}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            <span className="text-slate-400 text-sm">Całkowity zarobek</span>
                        </div>
                        <p className="text-2xl font-bold">
                            ${stats?.totalEarned?.toFixed(4) || '0.0000'}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <MousePointer className="w-5 h-5 text-yellow-500" />
                            <span className="text-slate-400 text-sm">Wszystkie kliknięcia</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats?.totalClicks || 0}
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Link2 className="w-5 h-5 text-purple-500" />
                            <span className="text-slate-400 text-sm">Linki</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {stats?.totalLinks || 0}
                        </p>
                    </div>
                </div>

                {/* Dzisiejsze statystyki */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-green-400" />
                            <span className="text-green-300">Dzisiaj - Zarobek</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">
                            ${stats?.today?.earned?.toFixed(4) || '0.0000'}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-700/50 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MousePointer className="w-5 h-5 text-blue-400" />
                            <span className="text-blue-300">Dzisiaj - Kliknięcia</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-400">
                            {stats?.today?.clicks || 0}
                        </p>
                    </div>
                </div>

                {/* Wykres ostatnich 7 dni */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        Ostatnie 7 dni
                    </h2>
                    <div className="flex items-end justify-between gap-2 h-48">
                        {stats?.dailyStats?.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-slate-700 rounded-t-lg relative" style={{ height: '160px' }}>
                                    <div 
                                        className="absolute bottom-0 w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                                        style={{ 
                                            height: `${maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0}%`,
                                            minHeight: day.clicks > 0 ? '8px' : '0'
                                        }}
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">
                                        {new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })}
                                    </p>
                                    <p className="text-sm font-semibold">{day.clicks}</p>
                                    <p className="text-xs text-green-500">${day.earned.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Kraje */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary-500" />
                            Kraje
                        </h2>
                        {countries.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">Brak danych</p>
                        ) : (
                            <div className="space-y-3">
                                {countries.slice(0, 5).map((country, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🌍</span>
                                            <span>{country.country}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{country.clicks} kliknięć</p>
                                            <p className="text-sm text-green-500">${country.earned.toFixed(4)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Urządzenia */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-primary-500" />
                            Urządzenia
                        </h2>
                        {devices.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">Brak danych</p>
                        ) : (
                            <div className="space-y-3">
                                {devices.map((device, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getDeviceIcon(device.device)}
                                            <span className="capitalize">{device.device}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{device.clicks} kliknięć</p>
                                            <p className="text-sm text-green-500">${device.earned.toFixed(4)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top linki */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        Najpopularniejsze linki
                    </h2>
                    {topLinks.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">Brak linków</p>
                    ) : (
                        <div className="space-y-3">
                            {topLinks.map((link, index) => (
                                <div key={link.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-slate-500">#{index + 1}</span>
                                        <div>
                                            <p className="font-medium truncate max-w-xs">{link.title}</p>
                                            <p className="text-sm text-slate-400">{link.shortCode}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{link.clicks} kliknięć</p>
                                        <p className="text-sm text-green-500">${link.earned.toFixed(4)}</p>
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