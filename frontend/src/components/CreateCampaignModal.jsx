import React, { useState, useEffect } from 'react';
import { X, Share2, Target, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api';

const CreateCampaignModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        objective: '', // Changed to empty for placeholder visibility
        budget: '',
        platforms: [],
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // If objective is a string (e.g. 'Brand Awareness'), we might want to show a numeric 1000 or the initial val
                // But the user wants HIGH visibility in edit. Let's try to extract numeric if possible or default.
                const numericObjective = parseInt(initialData.objective);
                setFormData({
                    name: initialData.name,
                    objective: isNaN(numericObjective) ? '1000' : numericObjective.toString(),
                    budget: initialData.budget || '',
                    platforms: initialData.platforms || [],
                    startDate: initialData.timeline?.start_date || '',
                    endDate: ''
                });
            } else {
                setFormData({ name: '', objective: '', budget: '', platforms: [], startDate: '', endDate: '' });
            }
        }
    }, [isOpen, initialData]);

    const togglePlatform = (p) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(p)
                ? prev.platforms.filter(x => x !== p)
                : [...prev.platforms, p]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let response;
            if (initialData) {
                // Edit Logic
                response = await axios.put(`${API_BASE_URL}/campaigns/${initialData.id}`, {
                    name: formData.name,
                    budget: parseFloat(formData.budget),
                    objective: formData.objective,
                    platforms: formData.platforms
                });
            } else {
                // Create Logic
                response = await axios.post(`${API_BASE_URL}/campaigns`, {
                    name: formData.name,
                    budget: parseFloat(formData.budget),
                    objective: formData.objective,
                    platforms: formData.platforms
                });
            }
            onSuccess(response.data);
            onClose();
        } catch (error) {
            console.error("Error saving campaign:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{initialData ? 'Reconfigure Strategy Node' : 'Initialize Strategic Node'}</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">AI Strategist analyzes objective for optimal deployment</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sequence Name</label>
                            <div className="relative group">
                                <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Winter Sale v4"
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!!initialData}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience (Size)</label>
                            <div className="relative group">
                                <Target className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${initialData ? 'text-indigo-600' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                                <input
                                    required
                                    type="number"
                                    placeholder="e.g. 1000"
                                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all ${initialData ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200'}`}
                                    value={formData.objective}
                                    onChange={e => setFormData({ ...formData, objective: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocated Budget (₹)</label>
                            <div className="relative group">
                                <CreditCard className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${initialData ? 'text-indigo-600' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
                                <input
                                    required
                                    type="number"
                                    placeholder="50000"
                                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all ${initialData ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200'}`}
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Platforms</label>
                            <div className="flex flex-wrap gap-2">
                                {['Instagram', 'Facebook', 'Google Ads', 'Twitter', 'Email'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        disabled={!!initialData}
                                        onClick={() => togglePlatform(p)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.platforms.includes(p)
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                            } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {initialData ? 'Optimizing...' : 'Analyzing Strategy...'}</> : (initialData ? 'Save Configuration' : 'Confirm Activation')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCampaignModal;
