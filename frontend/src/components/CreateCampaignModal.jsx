import React, { useState, useEffect } from 'react';
import { X, Share2, Target, CreditCard, Loader2, Calendar, Users, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useToast } from './Toast';

const API_BASE_URL = '/api';

const CreateCampaignModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast, ToastContainer } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        objective: 'Brand Awareness',
        targetAudience: '',
        budget: '',
        platforms: [],
        startDate: '',
        endDate: '',
        aiStrategyNotes: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    objective: initialData.objective || 'Brand Awareness',
                    targetAudience: initialData.targetAudience || '',
                    budget: initialData.budget || '',
                    platforms: initialData.platforms || [],
                    startDate: initialData.timeline?.start_date || '',
                    endDate: initialData.timeline?.end_date || '',
                    aiStrategyNotes: initialData.aiStrategyNotes || ''
                });
            } else {
                setFormData({ 
                    name: '', 
                    objective: 'Brand Awareness', 
                    targetAudience: '', 
                    budget: '', 
                    platforms: [], 
                    startDate: '', 
                    endDate: '', 
                    aiStrategyNotes: '' 
                });
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

    const generateAIStrategy = () => {
        // Check if required fields are filled
        if (!formData.name || !formData.targetAudience || formData.platforms.length === 0) {
            alert('Please fill Campaign Name, Target Audience, and select at least one Platform before generating AI strategy.');
            return;
        }

        const platformText = formData.platforms.length > 1 
            ? formData.platforms.slice(0, -1).join(', ') + ' and ' + formData.platforms.slice(-1)
            : formData.platforms[0];

        const strategies = [
            `Multi-channel approach targeting ${formData.targetAudience} with ${formData.objective.toLowerCase()} focus. Recommended budget allocation across ${platformText}: 40% content creation, 35% paid ads, 25% influencer partnerships.`,
            `Data-driven campaign "${formData.name}" leveraging behavioral insights for ${formData.objective.toLowerCase()}. Suggested A/B testing on ${platformText} with performance optimization every 48 hours targeting ${formData.targetAudience}.`,
            `Omnichannel strategy for "${formData.name}" emphasizing customer journey mapping. Focus on ${platformText} integration with personalized messaging for maximum ${formData.objective.toLowerCase()} impact among ${formData.targetAudience}.`
        ];
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        setFormData(prev => ({ ...prev, aiStrategyNotes: randomStrategy }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const campaignData = {
                name: formData.name,
                objective: formData.objective,
                targetAudience: formData.targetAudience,
                budget: parseFloat(formData.budget),
                platforms: formData.platforms,
                startDate: formData.startDate,
                endDate: formData.endDate,
                aiStrategyNotes: formData.aiStrategyNotes,
                status: 'Draft', // Default status for new campaigns
                createdAt: new Date().toISOString(), // Add timestamp
                created_at: new Date().toISOString() // Alternative timestamp field
            };

            let response;
            if (initialData) {
                response = await axios.put(`${API_BASE_URL}/campaigns/${initialData.id}`, campaignData);
            } else {
                response = await axios.post(`${API_BASE_URL}/campaigns`, campaignData);
            }
            onSuccess(response.data);
            showToast(
                initialData 
                    ? 'Campaign updated successfully!' 
                    : 'Campaign created successfully!', 
                'success'
            );
            onClose();
        } catch (error) {
            console.error("Error saving campaign:", error);
            showToast(
                initialData 
                    ? 'Failed to update campaign. Please try again.' 
                    : 'Failed to create campaign. Please try again.', 
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <ToastContainer />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{initialData ? 'Reconfigure Strategy Node' : 'Initialize Strategic Node'}</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">AI Strategist analyzes objective for optimal deployment</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campaign Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Name</label>
                            <div className="relative group">
                                <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Winter Sale Campaign"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Campaign Objective */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Objective</label>
                            <div className="relative group">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                                    value={formData.objective}
                                    onChange={e => setFormData({ ...formData, objective: e.target.value })}
                                >
                                    <option value="Brand Awareness">Brand Awareness</option>
                                    <option value="Lead Generation">Lead Generation</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Engagement">Engagement</option>
                                </select>
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                            <div className="relative group">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Young professionals 25-35"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.targetAudience}
                                    onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget (₹)</label>
                            <div className="relative group">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="number"
                                    placeholder="50000"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Platform Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Selection</label>
                        <div className="flex flex-wrap gap-2">
                            {['Email', 'Google Ads', 'Instagram', 'Facebook', 'Twitter'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => togglePlatform(p)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        formData.platforms.includes(p)
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Strategy Notes */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Strategy Notes</label>
                            <button
                                type="button"
                                onClick={generateAIStrategy}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                            >
                                <Sparkles className="w-3 h-3" />
                                Generate AI Strategy
                            </button>
                        </div>
                        <textarea
                            placeholder="AI-generated strategy recommendations will appear here..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-medium text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                            rows={3}
                            value={formData.aiStrategyNotes}
                            onChange={e => setFormData({ ...formData, aiStrategyNotes: e.target.value })}
                        />
                    </div>

                    <div className="pt-6 flex gap-4 border-t border-slate-100">
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
                            className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[56px]"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> {initialData ? 'Updating...' : 'Creating Campaign...'}</>
                            ) : (
                                initialData ? 'Update Campaign' : 'Create Campaign'
                            )}
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
        </>
    );
};

export default CreateCampaignModal;
