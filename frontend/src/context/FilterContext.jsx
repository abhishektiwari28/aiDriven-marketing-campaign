import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
    const [selectedCampaign, setSelectedCampaign] = useState('all');
    const [timeRange, setTimeRange] = useState('1'); // Default to 24 hours
    const [campaigns, setCampaigns] = useState([{ id: 'all', name: 'All Campaigns', goal: 'System Wide' }]);

    React.useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/campaigns');
            if (response.ok) {
                const data = await response.json();
                setCampaigns([{ id: 'all', name: 'All Campaigns', goal: 'System Wide' }, ...data]);
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const addCampaign = (newCampaign) => {
        setCampaigns(prev => [prev[0], newCampaign, ...prev.slice(1)]);
    };

    const updateCampaign = (updatedCampaign) => {
        setCampaigns(prev => prev.map(c => 
            c.id === updatedCampaign.id ? updatedCampaign : c
        ));
    };

    const removeCampaign = (campaignId) => {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    };

    return (
        <FilterContext.Provider value={{
            selectedCampaign,
            setSelectedCampaign,
            timeRange,
            setTimeRange,
            campaigns,
            refreshCampaigns: fetchCampaigns,
            addCampaign,
            updateCampaign,
            removeCampaign
        }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
};
