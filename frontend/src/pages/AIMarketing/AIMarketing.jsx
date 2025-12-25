import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, Zap, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const API_BASE_URL = '/api';

const MetricCard = ({ label, value, subtext, icon: Icon, colorClass }) => (
    <div className="glass-card p-6 border border-slate-200 flex items-start justify-between group hover:bg-slate-50 transition-all shadow-sm">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <h4 className="text-3xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors tracking-tighter">{value}</h4>
            <p className="text-xs text-slate-500 font-medium">{subtext}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-white border border-slate-200 ${colorClass} transition-transform group-hover:scale-110 shadow-inner`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

const AIMarketing = () => {
    const [platformData, setPlatformData] = useState([]);
    const [bestPlatform, setBestPlatform] = useState(null);
    const [loading, setLoading] = useState(false);
    const [optimizing, setOptimizing] = useState(false);

    const platforms = [
        { name: 'Instagram', color: '#E1306C' },
        { name: 'Facebook', color: '#1877F2' },
        { name: 'Twitter', color: '#1DA1F2' },
        { name: 'Email', color: '#34D399' },
        { name: 'Google Ads', color: '#4285F4' },
    ];

    useEffect(() => {
        fetchPlatformData();
    }, []);

    const fetchPlatformData = async () => {
        setLoading(true);
        try {
            // First try the API
            const response = await axios.get(`${API_BASE_URL}/platforms/all/stats`);
            let allPlatformStats = response.data;
            
            console.log('Raw platform stats:', allPlatformStats);
            
            // If API returns empty or single object, fallback to individual calls
            if (!Array.isArray(allPlatformStats) || allPlatformStats.length === 0) {
                console.log('Fallback to individual platform calls');
                const platformPromises = platforms.map(async (platform) => {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/platforms/${platform.name}/stats`);
                        return response.data;
                    } catch (error) {
                        console.error(`Error fetching ${platform.name}:`, error);
                        return null;
                    }
                });
                
                const results = await Promise.all(platformPromises);
                allPlatformStats = results.filter(stat => stat !== null);
            }
            
            // Transform data for chart
            const chartData = allPlatformStats.map(platformStat => {
                const platform = platforms.find(p => p.name === platformStat.platform);
                const metrics = platformStat.metrics || {};
                
                return {
                    platform: platformStat.platform,
                    clicks: Math.round(metrics.clicks || 0),
                    impressions: Math.round(metrics.impressions || 0),
                    conversions: Math.round(metrics.conversions || 0),
                    reach: Math.round(metrics.impressions || 0),
                    roiIndex: parseFloat((metrics.roi || 0).toFixed(1)),
                    spend: Math.round(metrics.cost || 0),
                    color: platform ? platform.color : '#6B7280'
                };
            });
            
            console.log('Transformed chart data:', chartData);
            
            // Filter out platforms with no meaningful data
            const validData = chartData.filter(platform => 
                platform.clicks > 0 || platform.impressions > 0 || platform.conversions > 0
            );
            
            setPlatformData(validData.length > 0 ? validData : chartData);
            
            // Calculate best platform based on composite score
            if (chartData.length > 0) {
                const best = chartData.reduce((prev, current) => {
                    const prevScore = (prev.roiIndex * 0.4) + (prev.conversions / 100 * 0.3) + (prev.reach / 1000 * 0.2) - (prev.spend / 1000 * 0.1);
                    const currentScore = (current.roiIndex * 0.4) + (current.conversions / 100 * 0.3) + (current.reach / 1000 * 0.2) - (current.spend / 1000 * 0.1);
                    return currentScore > prevScore ? current : prev;
                });
                setBestPlatform(best);
            }
        } catch (error) {
            console.error("Error fetching platform data:", error);
            // Fallback to empty data
            setPlatformData([]);
        } finally {
            setLoading(false);
        }
    };

    const runOptimization = async () => {
        setOptimizing(true);
        try {
            await axios.post(`${API_BASE_URL}/campaigns/1/optimize`);
            fetchPlatformData();
        } catch (error) {
            console.error("Error optimizing:", error);
        } finally {
            setOptimizing(false);
        }
    };

    const formatTooltipValue = (value, name) => {
        if (name === 'Impressions' && value > 1000) {
            return [`${(value / 1000).toFixed(1)}K`, name];
        }
        return [value.toLocaleString(), name];
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">AI Deployment Center</h1>
                    <p className="text-slate-500 font-medium">Global autonomous node orchestration for campaign performance.</p>
                </div>
                <button
                    onClick={runOptimization}
                    disabled={optimizing}
                    className={`btn-primary px-8 py-4 shadow-xl shadow-indigo-600/20 text-xs font-black uppercase tracking-widest flex items-center gap-2 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${optimizing ? 'opacity-70 animate-pulse' : ''}`}
                >
                    <Zap className="w-4 h-4" /> {optimizing ? 'Optimizing Matrix...' : 'Optimize Matrix'}
                </button>
            </header>

            {/* Platform Performance Chart */}
            <div className="glass-card p-8 border border-slate-200 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-indigo-50 rounded-2xl mb-4">
                        <BarChart2 className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Platform Performance Metrics</h2>
                    <p className="text-slate-500 text-sm font-medium">Clicks, Impressions, and Conversions by platform</p>
                </div>
                
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-slate-500 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            Loading platform data...
                        </div>
                    </div>
                ) : platformData.length > 0 ? (
                    <div className="h-96 w-full bg-slate-50/50 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={platformData} 
                                layout="horizontal" 
                                margin={{ left: 80, right: 120, top: 20, bottom: 40 }}
                            >
                                <XAxis 
                                    type="number" 
                                    tick={{ fontSize: 10, fontWeight: '600', fill: '#64748b' }}
                                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    tickLine={{ stroke: '#cbd5e1' }}
                                    allowDecimals={false}
                                />
                                <YAxis 
                                    dataKey="platform" 
                                    type="category" 
                                    tick={{ fontSize: 11, fontWeight: '700', fill: '#334155' }} 
                                    width={70}
                                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                    labelStyle={{ color: '#1e293b', fontWeight: '700' }}
                                    formatter={formatTooltipValue}
                                />
                                <Legend 
                                    wrapperStyle={{ 
                                        paddingTop: '15px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    }}
                                    iconType="rect"
                                />
                                <Bar 
                                    dataKey="clicks" 
                                    fill="#EF4444" 
                                    name="Clicks"
                                />
                                <Bar 
                                    dataKey="impressions" 
                                    fill="#3B82F6" 
                                    name="Impressions"
                                />
                                <Bar 
                                    dataKey="conversions" 
                                    fill="#10B981" 
                                    name="Conversions"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <div className="text-slate-400 text-lg">No platform data available</div>
                        <button 
                            onClick={fetchPlatformData}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Retry Loading Data
                        </button>
                    </div>
                )}
            </div>

            {/* Best Platform KPIs */}
            {bestPlatform && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            label="Platform Reach"
                            value={`${(bestPlatform.reach / 1000).toFixed(1)}K`}
                            subtext="Total impressions"
                            icon={Users}
                            colorClass="text-indigo-600"
                        />
                        <MetricCard
                            label="Conversion Yield"
                            value={bestPlatform.conversions}
                            subtext="Goal completions"
                            icon={TrendingUp}
                            colorClass="text-emerald-600"
                        />
                        <MetricCard
                            label="ROI Index"
                            value={`${bestPlatform.roiIndex.toFixed(1)}x`}
                            subtext="Efficiency score"
                            icon={BarChart3}
                            colorClass="text-violet-600"
                        />
                        <MetricCard
                            label="Platform Spend"
                            value={`₹${bestPlatform.spend.toLocaleString()}`}
                            subtext="Total investment"
                            icon={Zap}
                            colorClass="text-amber-600"
                        />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <span className="text-sm font-medium text-slate-500">Best overall:</span>
                        <span className="text-sm font-black text-slate-900">{bestPlatform.platform}</span>
                        <div 
                            className="w-8 h-1 rounded-full" 
                            style={{ backgroundColor: bestPlatform.color }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIMarketing;
