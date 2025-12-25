import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [previousBestPlatform, setPreviousBestPlatform] = useState(null);

    const addNotification = (message, type = 'info') => {
        const newNotification = {
            id: Date.now(),
            message,
            timestamp: new Date().toLocaleTimeString(),
            type
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const checkPlatformChanges = async () => {
        try {
            const response = await axios.get('/api/platforms/all/stats');
            let allPlatformStats = response.data;
            
            if (!Array.isArray(allPlatformStats) || allPlatformStats.length === 0) {
                const platforms = ['Instagram', 'Facebook', 'Twitter', 'Google Ads', 'Email'];
                const platformPromises = platforms.map(async (platform) => {
                    try {
                        const response = await axios.get(`/api/platforms/${platform}/stats`);
                        return response.data;
                    } catch (error) {
                        return null;
                    }
                });
                const results = await Promise.all(platformPromises);
                allPlatformStats = results.filter(stat => stat !== null);
            }
            
            if (allPlatformStats.length > 0) {
                const chartData = allPlatformStats.map(platformStat => {
                    const metrics = platformStat.metrics || {};
                    return {
                        platform: platformStat.platform,
                        clicks: Math.round(metrics.clicks || 0),
                        impressions: Math.round(metrics.impressions || 0),
                        conversions: Math.round(metrics.conversions || 0)
                    };
                });
                
                const best = chartData.reduce((prev, current) => {
                    const prevTotal = prev.clicks + prev.impressions + prev.conversions;
                    const currentTotal = current.clicks + current.impressions + current.conversions;
                    return currentTotal > prevTotal ? current : prev;
                });
                
                if (previousBestPlatform && previousBestPlatform.platform !== best.platform) {
                    addNotification(
                        `${best.platform} overtook ${previousBestPlatform.platform} as the best performing platform`,
                        'platform-change'
                    );
                }
                
                setPreviousBestPlatform(best);
            }
        } catch (error) {
            console.error('Error checking platform changes:', error);
        }
    };

    // Check for changes when campaigns are created/updated
    const triggerPlatformCheck = () => {
        setTimeout(checkPlatformChanges, 1000); // Delay to allow data to update
    };

    useEffect(() => {
        // Initial check only
        checkPlatformChanges();
    }, []);

    const value = {
        notifications,
        addNotification,
        clearNotifications,
        triggerPlatformCheck
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};