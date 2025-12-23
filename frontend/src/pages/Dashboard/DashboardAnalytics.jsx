import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Loader2, Eye, MousePointer2, Users, DollarSign, TrendingUp, Target, Hash, Percent } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const DashboardAnalytics = ({ selectedCampaign, timeRange }) => {
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedCampaign]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, trendsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/dashboard/stats`, { params: { campaign_id: selectedCampaign } }),
                axios.get(`${API_BASE_URL}/dashboard/trends`, { params: { campaign_id: selectedCampaign, days: timeRange || 30 } })
            ]);

            setStats(statsRes.data);
            setTrends(trendsRes.data);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Parsing Channel Deltas...</p>
            </div>
        );
    }

    const safeStats = stats || {};
    const channels = safeStats.channels || [];

    const dataPie = channels.map(c => ({
        name: c.name,
        value: c.spend,
        color: (c.color || 'bg-slate-200').replace('bg-', '#').replace('indigo-500', '4F46E5').replace('blue-500', '3B82F6').replace('teal-500', '14B8A6').replace('emerald-500', '10B981').replace('amber-500', 'F59E0B')
    }));

    // Fallback if no data
    if (dataPie.length === 0) {
        return (
            <div className="py-20 text-center glass-card border-dashed border-2 border-slate-200">
                <p className="text-slate-400 font-medium italic">No performance data available. Launch a campaign to see analytics.</p>
            </div>
        );
    }

    const totalSpend = `₹${(safeStats.total_spend || 0).toLocaleString()}`;

    // Helper map for Tailwind bg classes to HEX for Recharts
    const colorMap = {
        'bg-indigo-500': '#4F46E5',
        'bg-blue-500': '#3B82F6',
        'bg-teal-500': '#14B8A6',
        'bg-emerald-500': '#10B981',
        'bg-amber-500': '#F59E0B'
    };

    const finalDataPie = dataPie.map(d => ({
        ...d,
        color: colorMap[(channels.find(c => c.name === d.name)?.color)] || '#cbd5e1'
    }));

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Top Metrics Grid - 8 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Row 1 */}
                <div className="glass-card p-6 border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium text-sm">Total Impressions</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {(safeStats.total_impressions || 0) > 1000000
                                    ? `${((safeStats.total_impressions || 0) / 1000000).toFixed(1)}M`
                                    : (safeStats.total_impressions || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Eye className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">+12.5% vs last period</span>
                    </div>
                </div>

                <div className="glass-card p-6 border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium text-sm">Total Clicks</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {(safeStats.total_clicks || 0) > 1000
                                    ? `${((safeStats.total_clicks || 0) / 1000).toFixed(1)}K`
                                    : (safeStats.total_clicks || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <MousePointer2 className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">+8.2% vs last period</span>
                    </div>
                </div>

                <div className="glass-card p-6 border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium text-sm">Conversions</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">
                                {(safeStats.total_conversions || 0) > 1000
                                    ? `${((safeStats.total_conversions || 0) / 1000).toFixed(1)}K`
                                    : (safeStats.total_conversions || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">+15.7% vs last period</span>
                    </div>
                </div>

                <div className="glass-card p-6 border border-slate-200 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 font-medium text-sm">Total Spend</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-2">{totalSpend}</h3>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-lg">
                            <DollarSign className="w-6 h-6 text-rose-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">+5.3% vs last period</span>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="glass-card p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-500 font-medium text-sm">Click-Through Rate</p>
                    <h3 className="text-3xl font-bold text-emerald-500 mt-2 mb-2">{safeStats.avg_ctr || 0}%</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Above Average</span>
                </div>

                <div className="glass-card p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-500 font-medium text-sm">Cost Per Click</p>
                    <h3 className="text-3xl font-bold text-blue-500 mt-2 mb-2">₹{safeStats.avg_cpc || 0}</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Optimized</span>
                </div>

                <div className="glass-card p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-500 font-medium text-sm">Cost Per Mille</p>
                    <h3 className="text-3xl font-bold text-purple-500 mt-2 mb-2">₹{safeStats.avg_cpm || 0}</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Competitive</span>
                </div>

                <div className="glass-card p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-500 font-medium text-sm">Conversion Rate</p>
                    <h3 className="text-3xl font-bold text-emerald-600 mt-2 mb-2">{safeStats.avg_conversion_rate || 0}%</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Excellent</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-8 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 font-primary">Spend Distribution (Cycle {timeRange}D)</h3>
                    <div className="h-[300px] flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={finalDataPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={125}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={4}
                                >
                                    {finalDataPie.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#0f172a' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{totalSpend}</span>
                            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Cycle Spend</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 border border-slate-200">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Channel Efficiency</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Real-time performance distribution</p>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest">AGENTIC FEED</span>
                    </div>
                    <div className="space-y-10 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {stats.channels.map((item) => (
                            <div key={item.name} className="space-y-3 group">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                        <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-emerald-600 block uppercase tracking-tighter">{item.roi}x ROI</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Allocated: ₹{item.spend.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${item.color}`}
                                        style={{ width: `${(item.spend / stats.total_spend) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>CPC: ₹{item.cpc || '0.00'}</span>
                                    <span className="group-hover:text-indigo-600 transition-colors">CTR: {item.ctr || 0}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Trends Section */}
            <div className="glass-card p-8 border border-slate-200 mt-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 font-primary">Performance Over Time</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div>
                            <span className="text-xs font-bold text-slate-500">Impressions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
                            <span className="text-xs font-bold text-slate-500">Clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-sm bg-red-400"></div>
                            <span className="text-xs font-bold text-slate-500">Conversions</span>
                        </div>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="impressions"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="clicks"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="conversions"
                                stroke="#F87171"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#F87171', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;

