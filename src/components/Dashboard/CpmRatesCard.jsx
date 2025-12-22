import React, { useState, useEffect } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    ChevronDown, 
    ChevronUp,
    Info,
    Globe
} from 'lucide-react';
import api from '../../services/api';

const CpmRatesCard = () => {
    const [rates, setRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedTier, setExpandedTier] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        try {
            const response = await api.get('/cpm/rates');
            setRates(response.data.data);
        } catch (err) {
            setError('Nie udało się załadować stawek CPM');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Flaga kraju z kodu
    const getFlagEmoji = (countryCode) => {
        if (!countryCode || countryCode === 'XX') return '🌍';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 rounded-xl p-6 border border-red-500/30">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    const tierConfig = {
        tier1: {
            name: 'Tier 1',
            label: 'Premium Countries',
            emoji: '🥇',
            color: 'from-yellow-500 to-amber-500',
            bgColor: 'bg-yellow-500/10',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/30'
        },
        tier2: {
            name: 'Tier 2',
            label: 'Good Countries',
            emoji: '🥈',
            color: 'from-gray-400 to-gray-500',
            bgColor: 'bg-gray-500/10',
            textColor: 'text-gray-300',
            borderColor: 'border-gray-500/30'
        },
        tier3: {
            name: 'Tier 3',
            label: 'Other Countries',
            emoji: '🥉',
            color: 'from-orange-600 to-orange-700',
            bgColor: 'bg-orange-500/10',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/30'
        }
    };

    const getAverageRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        const sum = tierRates.reduce((acc, r) => acc + r.netCpm, 0);
        return (sum / tierRates.length).toFixed(2);
    };

    const getMaxRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        return Math.max(...tierRates.map(r => r.netCpm)).toFixed(2);
    };

    const toggleTier = (tier) => {
        setExpandedTier(expandedTier === tier ? null : tier);
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">CPM Rates</h3>
                        <p className="text-sm text-gray-400">Your earnings per 1000 views</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{rates.commissionPercent} platform fee</span>
                </div>
            </div>

            {/* Tier Cards */}
            <div className="space-y-3">
                {Object.entries(rates.tiers).map(([tierKey, tierRates]) => {
                    const config = tierConfig[tierKey];
                    const isExpanded = expandedTier === tierKey;

                    return (
                        <div 
                            key={tierKey}
                            className={`border rounded-xl overflow-hidden transition-all duration-300 ${config.borderColor} ${config.bgColor}`}
                        >
                            {/* Tier Header - klikalny */}
                            <button
                                onClick={() => toggleTier(tierKey)}
                                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{config.emoji}</span>
                                    <div className="text-left">
                                        <h4 className={`font-semibold ${config.textColor}`}>
                                            {config.name}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            {config.label} • {tierRates.length} countries
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">
                                            ${getAverageRate(tierRates)} - ${getMaxRate(tierRates)}
                                        </p>
                                        <p className="text-xs text-gray-400">CPM Range</p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {/* Expanded - lista krajów */}
                            {isExpanded && (
                                <div className="border-t border-gray-700/50 p-4 bg-gray-900/30">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {tierRates.map((rate) => (
                                            <div 
                                                key={rate.countryCode}
                                                className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">
                                                        {getFlagEmoji(rate.countryCode)}
                                                    </span>
                                                    <div>
                                                        <span className="text-sm font-medium text-white">
                                                            {rate.countryCode}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">CPM:</span>
                                                        <span className={config.textColor}>
                                                            ${rate.netCpm.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-500">Per click:</span>
                                                        <span className="text-green-400 font-medium">
                                                            ${rate.earningPerClick.toFixed(4)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-white">💡 Pro Tip:</span> Share your links with audiences from 
                            <span className="text-yellow-400 font-medium"> Tier 1 countries </span> 
                            (US, UK, Germany, Canada) to maximize your earnings!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CpmRatesCard;