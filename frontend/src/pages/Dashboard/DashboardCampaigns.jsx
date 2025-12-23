import React, { useState, useEffect } from 'react';
import { Play, Pause, MoreVertical, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const CampaignRow = ({ name, status, budget, roi, progress }) => (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 group transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex gap-4 items-center">
            <div className={`p-2.5 rounded-xl ${status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                {status === 'Active' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{name}</h4>
                <div className="flex gap-3 mt-1.5 focus-within:">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 border-r border-slate-200 pr-3"><DollarSign className="w-3 h-3" /> ₹{budget.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-emerald-600" /> {roi}x ROI</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-8">
            <div className="w-32 space-y-2 hidden md:block">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Reach</span>
                    <span className="text-slate-900">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const DashboardCampaigns = ({ selectedCampaign }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [selectedCampaign]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, { params: { campaign_id: selectedCampaign } });
            setCampaigns(response.data.campaign_summary || []);
        } catch (error) {
            console.error("Error fetching dashboard campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 glass-card border-slate-200">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Active Nodes...</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-8 border border-slate-200 shadow-slate-200/50 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Strategic Activity Grid</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Real-time telemetry from active deployments</p>
                </div>
                <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline transition-all">Command Library</button>
            </div>
            <div className="space-y-4">
                {campaigns.map((c, i) => (
                    <CampaignRow key={i} {...c} />
                ))}
                {campaigns.length === 0 && (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <p className="text-slate-400 font-medium italic text-sm">No active sequences found.</p>
                    </div>
                )}
            </div>
            <button className="w-full mt-10 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-indigo-400/50 hover:text-indigo-600 hover:bg-indigo-50/10 transition-all flex items-center justify-center gap-2 group">
                <span className="text-sm font-black uppercase tracking-widest">+ Initialize New Campaign Node</span>
            </button>
        </div>
    );
};

export default DashboardCampaigns;

