import React, { useState, useEffect } from 'react';
import { Play, Pause, MoreVertical, TrendingUp, DollarSign, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Sample campaign activity structure
// {
//   id: 1,
//   name: "Winter Sale Campaign",
//   status: "Active",
//   budget: 50000,
//   roi: 2.5,
//   progress: 75,
//   createdAt: "2024-01-15T10:30:00Z", // ISO timestamp
//   activityDate: "2024-01-15T10:30:00Z" // Alternative timestamp field
// }

// Time filtering function - filters activities based on selected time range
const filterActivitiesByTimeRange = (activities, selectedTimeRange) => {
    if (!activities || activities.length === 0) return [];
    if (!selectedTimeRange) return activities;
    
    const now = new Date();
    const days = parseInt(selectedTimeRange);
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    console.log('Filtering:', activities.length, 'activities with timeRange:', days, 'days');
    console.log('Cutoff date:', cutoffDate);
    
    const filtered = activities.filter(activity => {
        const activityDate = new Date(activity.createdAt || activity.created_at || now);
        const include = activityDate >= cutoffDate;
        console.log(`${activity.name}: ${activityDate} >= ${cutoffDate} = ${include}`);
        return include;
    });
    
    console.log('Filtered result:', filtered.length, 'activities');
    return filtered;
};

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

const DashboardCampaigns = ({ selectedCampaign, timeRange }) => {
    const [allActivities, setAllActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange || '1');

    // Update local time range when prop changes
    useEffect(() => {
        if (timeRange) {
            setSelectedTimeRange(timeRange);
        }
    }, [timeRange]);

    // Fetch campaign activities from API
    useEffect(() => {
        fetchActivities();
    }, [selectedCampaign]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, { 
                params: { campaign_id: selectedCampaign } 
            });
            setAllActivities(response.data.campaign_summary || []);
        } catch (error) {
            console.error("Error fetching campaign activities:", error);
        }
        
        // Always add mock data for testing (remove this in production)
        const mockActivities = [
            {
                id: 1,
                name: "Winter Sale Campaign",
                status: "Active",
                budget: 50000,
                roi: 2.5,
                progress: 75,
                createdAt: new Date().toISOString() // Today
            },
            {
                id: 2,
                name: "Summer Launch",
                status: "Paused",
                budget: 30000,
                roi: 1.8,
                progress: 45,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
            },
            {
                id: 3,
                name: "Old Campaign",
                status: "Completed",
                budget: 20000,
                roi: 3.2,
                progress: 100,
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            }
        ];
        setAllActivities(mockActivities);
        setLoading(false);
    };

    // Filter activities based on selected time range
    const filteredActivities = filterActivitiesByTimeRange(allActivities, selectedTimeRange);

    // Handle time range selection
    const handleTimeRangeChange = (range) => {
        setSelectedTimeRange(range);
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
                
                {/* Time Range Filter */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => handleTimeRangeChange(e.target.value)}
                        className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                        <option value="1">Last 24 Hours</option>
                        <option value="3">Last 3 Days</option>
                        <option value="7">Last 7 Days</option>
                        <option value="15">Last 15 Days</option>
                        <option value="30">Last 30 Days</option>
                    </select>
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredActivities.map((activity, i) => (
                    <CampaignRow key={activity.id || i} {...activity} />
                ))}
                
                {/* Empty state when no activities match time filter */}
                {filteredActivities.length === 0 && !loading && (
                    <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium italic text-sm">
                            {allActivities.length === 0 
                                ? "No campaign activities found." 
                                : `No campaign activity found for the last ${selectedTimeRange === '1' ? '24 hours' : `${selectedTimeRange} days`}.`
                            }
                        </p>
                        <p className="text-slate-300 text-xs mt-2">
                            Try selecting a different time range or create new campaigns.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCampaigns;

