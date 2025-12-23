import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, MousePointer, Users, MessageSquare, Phone, Instagram, Send, Facebook, Twitter, Search, Zap, TrendingUp, BarChart3, Heart, Smile, UserCheck } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api';

const ChannelCard = ({ name, icon: Icon, description, active, onClick }) => (
    <button
        onClick={onClick}
        className={`glass-card p-8 flex flex-col items-center text-center gap-6 group transition-all duration-500 border-2 ${active ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200'}`}
    >
        <div className={`p-5 rounded-3xl bg-white shadow-sm border border-slate-100 ${active ? 'text-indigo-600 scale-110 shadow-indigo-200/50' : 'text-slate-400 group-hover:text-indigo-400'} transition-all duration-500`}>
            <Icon className="w-10 h-10" />
        </div>
        <div>
            <h4 className={`text-lg font-black transition-colors uppercase tracking-tight ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{name}</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">{description}</p>
        </div>
    </button>
);

const MetricCard = ({ label, value, subtext, icon: Icon, colorClass }) => (
    <div className="glass-card p-8 border border-slate-200 flex items-start justify-between group hover:bg-slate-50 transition-all shadow-sm">
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <h4 className="text-3xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors tracking-tighter">{value}</h4>
            <p className="text-xs text-slate-500 font-medium">{subtext}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-white border border-slate-200 ${colorClass} transition-transform group-hover:scale-110 shadow-inner`}>
            <Icon className="w-8 h-8" />
        </div>
    </div>
);

const AIMarketing = () => {
    const [activeChannel, setActiveChannel] = useState('Instagram');
    const [allPlatformData, setAllPlatformData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [lastOptimization, setLastOptimization] = useState(null);

    const channels = [
        { name: 'Instagram', icon: Instagram, description: 'Visual Engagement' },
        { name: 'Facebook', icon: Facebook, description: 'Community Reach' },
        { name: 'Twitter', icon: Twitter, description: 'Real-time Signal' },
        { name: 'Email', icon: Mail, description: 'Direct Pipeline' },
        { name: 'Google Ads', icon: Search, description: 'Intent Capture' },
    ];

    useEffect(() => {
        fetchMetrics();
    }, [activeChannel]);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            // Fetch AGGREGATED platform statistics (Platform Level Data)
            const response = await axios.get(`${API_BASE_URL}/platforms/${activeChannel}/stats`);
            setAllPlatformData(response.data);
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    const runOptimization = async () => {
        setOptimizing(true);
        try {
            // Pass the active channel as context for the AI agent
            const response = await axios.post(`${API_BASE_URL}/campaigns/1/optimize`, null, {
                params: { platform: activeChannel }
            });
            setLastOptimization(response.data);
            fetchMetrics();
        } catch (error) {
            console.error("Error optimizing campaign:", error);
        } finally {
            setOptimizing(false);
        }
    };

    const metrics = allPlatformData?.metrics;
    const detailedStats = allPlatformData?.detailed_stats;
    const audience = allPlatformData?.audience_insight;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">AI Deployment Center</h1>
                    <p className="text-slate-500 font-medium">Global autonomous node orchestration for campaign performance.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={runOptimization}
                        disabled={optimizing}
                        className={`btn-primary px-8 py-4 shadow-xl shadow-indigo-600/20 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${optimizing ? 'opacity-70 animate-pulse' : ''}`}
                    >
                        <Zap className="w-4 h-4" /> {optimizing ? `Scanning ${activeChannel} Nodes...` : `Optimize ${activeChannel} Matrix`}
                    </button>
                </div>
            </header>

            {/* Channels Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {channels.map((ch) => (
                    <ChannelCard
                        key={ch.name}
                        {...ch}
                        active={activeChannel === ch.name}
                        onClick={() => setActiveChannel(ch.name)}
                    />
                ))}
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-1.5 bg-white border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-50 p-10 h-full">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-widest inline-block">NODE ACTIVE: {activeChannel.toUpperCase()}</span>
                                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                                    <Smile className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sentiment: {metrics?.sentiment_score}</span>
                                </div>
                            </div>

                            <h2 className="text-4xl font-black text-slate-900 mb-5 tracking-tight uppercase">Agent Insights</h2>

                            {loading ? (
                                <div className="space-y-4 animate-pulse py-10">
                                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <p className="text-slate-500 max-w-lg leading-relaxed font-medium text-lg">
                                        The <strong>Performance Analysis Agent</strong> has detected <strong>{audience?.engagement_depth}</strong> engagement depth for the <strong>{audience?.primary_segment}</strong> segment on {activeChannel}.
                                    </p>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {detailedStats && Object.entries(detailedStats).map(([key, val]) => (
                                            <div key={key} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{key}</p>
                                                <p className="text-xl font-black text-slate-900">{val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 p-5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                        <UserCheck className="w-6 h-6" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Primary Audience</p>
                                            <p className="text-sm font-bold">{audience?.primary_segment} — Most active on {activeChannel}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 border border-slate-200 bg-white">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" /> Strategic Signals
                    </h3>
                    <div className="space-y-6">
                        {lastOptimization ? (
                            <>
                                {lastOptimization.strategic_signals && lastOptimization.strategic_signals.length > 0 ? (
                                    <div className="space-y-4">
                                        {lastOptimization.strategic_signals.map((signal, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">COMPARATIVE ANALYSIS</p>
                                                <p className="text-sm font-bold text-slate-700 leading-snug">{signal}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Fallback to legacy view if no detailed signals */
                                    <>
                                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">CONSISTENCY AUDIT</p>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-700">Audit Complete</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium italic">{lastOptimization.performance_analysis?.summary}</p>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-400 font-medium italic">No active optimization decisions. Trigger AI to analyze.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
                <MetricCard
                    label="Platform Reach"
                    value={metrics ? `${(metrics.impressions / 1000).toFixed(1)}K` : '--'}
                    subtext="Live node impact"
                    icon={Users}
                    colorClass="text-indigo-600"
                />
                <MetricCard
                    label="Conversion Yield"
                    value={metrics ? metrics.conversions : '--'}
                    subtext="Goal completions"
                    icon={TrendingUp}
                    colorClass="text-emerald-600"
                />
                <MetricCard
                    label="ROI Index"
                    value={metrics ? `x${metrics.roi}` : '--'}
                    subtext="Efficiency score"
                    icon={BarChart3}
                    colorClass="text-violet-600"
                />
                <MetricCard
                    label="Platform Spend"
                    value={metrics ? `₹${(metrics.cost * 80).toLocaleString()}` : '--'}
                    subtext="Current liquidity usage"
                    icon={Zap}
                    colorClass="text-amber-600"
                />
            </div>
        </div>
    );
};

export default AIMarketing;
