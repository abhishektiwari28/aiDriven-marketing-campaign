import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Target, Brain, Download, Facebook, Instagram, Mail, Twitter } from 'lucide-react';
import jsPDF from 'jspdf';

const DeepAnalyticsModal = ({ isOpen, onClose, selectedCampaign }) => {
  const [activeSection, setActiveSection] = useState('performance');
  const [platformData, setPlatformData] = useState({});

  useEffect(() => {
    if (isOpen && selectedCampaign) {
      fetchPlatformData();
    }
  }, [isOpen, selectedCampaign]);

  const fetchPlatformData = async () => {
    try {
      const platforms = selectedCampaign.platforms || [];
      const data = {};
      
      for (const platform of platforms) {
        const response = await fetch(`http://localhost:8000/api/platform-data/${platform}`);
        if (response.ok) {
          const platformInfo = await response.json();
          data[platform] = platformInfo;
        }
      }
      setPlatformData(data);
    } catch (error) {
      console.error('Error fetching platform data:', error);
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Facebook': { icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
      'Instagram': { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
      'Email': { icon: Mail, color: 'text-green-600', bg: 'bg-green-50' },
      'Twitter': { icon: Twitter, color: 'text-cyan-600', bg: 'bg-cyan-50' },
      'Google Ads': { icon: Target, color: 'text-red-600', bg: 'bg-red-50' }
    };
    return icons[platform] || { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  if (!isOpen || !selectedCampaign) return null;

  const generateReportData = (section) => {
    const baseData = {
      campaign: selectedCampaign.name,
      dateGenerated: new Date().toISOString(),
      section: section
    };

    switch (section) {
      case 'performance':
        let totalSpend = 0, totalImpressions = 0, totalClicks = 0, totalConversions = 0;
        let avgCtr = 0, avgCpc = 0, avgRoas = 0, avgConversionRate = 0;
        let platformCount = 0;
        
        selectedCampaign.platforms?.forEach(platform => {
          const data = platformData[platform];
          if (data && data.campaigns) {
            // Get any campaign from this platform for demo data
            const campaigns = Object.values(data.campaigns);
            if (campaigns.length > 0) {
              const campaignData = campaigns[0]; // Use first available campaign
              totalSpend += campaignData.metrics.cost || 0;
              totalImpressions += campaignData.metrics.impressions || 0;
              totalClicks += campaignData.metrics.clicks || 0;
              totalConversions += campaignData.metrics.conversions || 0;
              avgCtr += campaignData.metrics.ctr || 0;
              avgCpc += campaignData.metrics.cpc || 0;
              avgRoas += campaignData.metrics.roi || 0;
              avgConversionRate += campaignData.metrics.conversion_rate || 0;
              platformCount++;
            }
          }
        });
        
        // Fallback to demo data if no platform data
        if (platformCount === 0) {
          totalSpend = 15420;
          totalImpressions = 125000;
          totalClicks = 3250;
          totalConversions = 185;
          avgCtr = 2.6;
          avgCpc = 1.85;
          avgRoas = 3.2;
          avgConversionRate = 5.7;
          platformCount = 1;
        }
        
        return {
          ...baseData,
          metrics: {
            totalSpend: Math.round(totalSpend),
            impressions: totalImpressions,
            clicks: totalClicks,
            conversions: totalConversions,
            ctr: platformCount > 0 ? (avgCtr / platformCount).toFixed(2) : 0,
            cpc: platformCount > 0 ? (avgCpc / platformCount).toFixed(2) : 0,
            roas: platformCount > 0 ? (avgRoas / platformCount).toFixed(1) : 0,
            conversionRate: platformCount > 0 ? (avgConversionRate / platformCount).toFixed(2) : 0
          }
        };
      case 'audience':
        let maleTotal = 0, femaleTotal = 0, totalGender = 0;
        selectedCampaign.platforms?.forEach(platform => {
          const data = platformData[platform];
          const campaignData = data?.campaigns?.[selectedCampaign.id];
          if (campaignData?.metrics?.audience_insight?.gender) {
            maleTotal += campaignData.metrics.audience_insight.gender.Male || 0;
            femaleTotal += campaignData.metrics.audience_insight.gender.Female || 0;
            totalGender++;
          }
        });
        
        return {
          ...baseData,
          demographics: {
            'Age 25-34': 35,
            'Age 35-44': 28,
            'Age 18-24': 22,
            'Age 45+': 15
          },
          gender: totalGender > 0 ? {
            'Male': Math.round(maleTotal / totalGender),
            'Female': Math.round(femaleTotal / totalGender)
          } : { 'Male': 55, 'Female': 45 },
          interests: {
            'Technology': 42,
            'Business': 31,
            'Lifestyle': 27
          }
        };
      case 'channels':
        const realPlatformData = [];
        selectedCampaign.platforms?.forEach(platform => {
          const data = platformData[platform];
          if (data && data.campaigns) {
            const campaignData = data.campaigns[selectedCampaign.id];
            if (campaignData) {
              realPlatformData.push({
                name: platform,
                performance: Math.round((campaignData.metrics.roi || 1) * 30),
                spend: campaignData.metrics.cost || 0,
                conversions: campaignData.metrics.conversions || 0,
                ctr: campaignData.metrics.ctr || 0,
                cpc: campaignData.metrics.cpc || 0,
                demographics: campaignData.metrics.audience_insight || {}
              });
            }
          }
        });
        return {
          ...baseData,
          platforms: realPlatformData.length > 0 ? realPlatformData : selectedCampaign.platforms?.map(platform => ({
            name: platform,
            performance: Math.floor(Math.random() * 40 + 60),
            spend: Math.floor(Math.random() * 5000 + 1000),
            conversions: Math.floor(Math.random() * 100 + 20)
          })) || []
        };
      case 'predictions':
        return {
          ...baseData,
          recommendations: [
            'Increase Facebook budget by 15%',
            'Shift 20% budget from Google to Instagram',
            'Target lookalike audiences',
            'A/B test creative variations'
          ],
          predictions: {
            conversionIncrease: 23,
            cpaReduction: 12,
            roasImprovement: 18,
            engagementBoost: 31
          }
        };
      default:
        return baseData;
    }
  };

  const downloadReport = () => {
    const pdf = new jsPDF();
    let yPos = 30;
    
    // Header
    pdf.setFontSize(28);
    pdf.setTextColor(37, 99, 235);
    pdf.text('Deep Insights', 20, yPos);
    yPos += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(100, 100, 100);
    pdf.text('COMPREHENSIVE ANALYTICS REPORT', 20, yPos);
    yPos += 8;
    pdf.setFontSize(10);
    pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, yPos);
    yPos += 25;
    
    // Performance Section
    pdf.setFontSize(20);
    pdf.setTextColor(37, 99, 235);
    pdf.text('PERFORMANCE OVERVIEW', 20, yPos);
    yPos += 15;
    
    const performanceData = generateReportData('performance');
    pdf.setFontSize(12);
    pdf.setTextColor(51, 51, 51);
    
    // Performance metrics in structured format
    pdf.text('Campaign Investment & Returns:', 20, yPos);
    yPos += 8;
    pdf.text(`  Total Campaign Spend: $${performanceData.metrics.totalSpend.toLocaleString()}`, 25, yPos);
    pdf.text(`  Total Impressions: ${performanceData.metrics.impressions.toLocaleString()}`, 25, yPos + 6);
    pdf.text(`  Total Clicks Generated: ${performanceData.metrics.clicks.toLocaleString()}`, 25, yPos + 12);
    pdf.text(`  Total Conversions: ${performanceData.metrics.conversions.toLocaleString()}`, 25, yPos + 18);
    yPos += 30;
    
    pdf.text('Key Performance Indicators:', 20, yPos);
    yPos += 8;
    pdf.text(`  Click-Through Rate (CTR): ${performanceData.metrics.ctr}%`, 25, yPos);
    pdf.text(`  Cost Per Click (CPC): $${performanceData.metrics.cpc}`, 25, yPos + 6);
    pdf.text(`  Return on Ad Spend (ROAS): ${performanceData.metrics.roas}x`, 25, yPos + 12);
    pdf.text(`  Conversion Rate: ${performanceData.metrics.conversionRate}%`, 25, yPos + 18);
    yPos += 35;
    
    // Audience Section
    pdf.setFontSize(20);
    pdf.setTextColor(16, 185, 129);
    pdf.text('AUDIENCE INSIGHTS', 20, yPos);
    yPos += 15;
    
    const audienceData = generateReportData('audience');
    pdf.setFontSize(12);
    pdf.setTextColor(51, 51, 51);
    
    pdf.text('Gender Distribution Analysis:', 20, yPos);
    yPos += 8;
    Object.entries(audienceData.gender).forEach(([gender, percent]) => {
      pdf.text(`  ${gender}: ${percent}% of total audience`, 25, yPos);
      yPos += 6;
    });
    yPos += 6;
    
    pdf.text('Age Group Breakdown:', 20, yPos);
    yPos += 8;
    Object.entries(audienceData.demographics).forEach(([age, percent]) => {
      pdf.text(`  ${age}: ${percent}% of audience`, 25, yPos);
      yPos += 6;
    });
    yPos += 6;
    
    pdf.text('Primary Interest Categories:', 20, yPos);
    yPos += 8;
    Object.entries(audienceData.interests).forEach(([interest, percent]) => {
      pdf.text(`  ${interest}: ${percent}% engagement`, 25, yPos);
      yPos += 6;
    });
    yPos += 15;
    
    // New page if needed
    if (yPos > 250) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Channels Section
    pdf.setFontSize(20);
    pdf.setTextColor(147, 51, 234);
    pdf.text('PLATFORM PERFORMANCE', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(51, 51, 51);
    pdf.text('Individual Platform Analysis:', 20, yPos);
    yPos += 10;
    
    ['Facebook', 'Instagram', 'Google Ads', 'Email', 'Twitter'].forEach(platform => {
      const data = platformData[platform];
      let campaignData = null;
      if (data && data.campaigns) {
        const campaigns = Object.values(data.campaigns);
        campaignData = campaigns[0];
      }
      
      const spend = campaignData?.metrics.cost || Math.floor(Math.random() * 5000 + 1000);
      const conversions = campaignData?.metrics.conversions || Math.floor(Math.random() * 100 + 20);
      const roi = campaignData?.metrics.roi || (Math.random() * 3 + 1).toFixed(1);
      
      pdf.text(`${platform}:`, 25, yPos);
      pdf.text(`  Investment: $${spend.toLocaleString()}`, 30, yPos + 6);
      pdf.text(`  Conversions Generated: ${conversions}`, 30, yPos + 12);
      pdf.text(`  Return on Investment: ${roi}x`, 30, yPos + 18);
      pdf.text(`  Performance Rating: ${Math.round(roi * 30)}% efficiency`, 30, yPos + 24);
      yPos += 35;
    });
    
    // AI Predictions Section
    if (yPos > 200) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFontSize(20);
    pdf.setTextColor(245, 101, 101);
    pdf.text('AI STRATEGIC RECOMMENDATIONS', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.setTextColor(51, 51, 51);
    
    const predictionsData = generateReportData('predictions');
    pdf.text('Recommended Optimization Actions:', 20, yPos);
    yPos += 10;
    predictionsData.recommendations.forEach((rec, index) => {
      const impact = ['High', 'Medium', 'High', 'Medium'][index];
      pdf.text(`${index + 1}. ${rec} (Impact: ${impact})`, 25, yPos);
      yPos += 8;
    });
    yPos += 10;
    
    pdf.text('Projected Performance Improvements:', 20, yPos);
    yPos += 10;
    pdf.text(`  Expected Conversion Increase: +${predictionsData.predictions.conversionIncrease}%`, 25, yPos);
    pdf.text(`  Projected Cost Reduction: -${predictionsData.predictions.cpaReduction}% in CPA`, 25, yPos + 6);
    pdf.text(`  ROAS Enhancement: +${predictionsData.predictions.roasImprovement}% improvement`, 25, yPos + 12);
    pdf.text(`  Audience Engagement Growth: +${predictionsData.predictions.engagementBoost}%`, 25, yPos + 18);
    yPos += 30;
    
    // Summary
    pdf.setFontSize(16);
    pdf.setTextColor(37, 99, 235);
    pdf.text('EXECUTIVE SUMMARY', 20, yPos);
    yPos += 12;
    pdf.setFontSize(10);
    pdf.setTextColor(51, 51, 51);
    pdf.text(`This comprehensive analysis shows strong performance across`, 20, yPos);
    pdf.text(`multiple platforms with a total investment of $${performanceData.metrics.totalSpend.toLocaleString()} generating`, 20, yPos + 5);
    pdf.text(`${performanceData.metrics.conversions.toLocaleString()} conversions. Implementation of AI recommendations could`, 20, yPos + 10);
    pdf.text(`potentially increase performance by up to ${predictionsData.predictions.conversionIncrease}%.`, 20, yPos + 15);
    
    pdf.save(`${selectedCampaign.name}-Complete-Analytics-Report.pdf`);
  };

  const sections = [
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'channels', label: 'Channels', icon: Target },
    { id: 'predictions', label: 'AI Predictions', icon: Brain }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'performance':
        const performanceData = generateReportData('performance');
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-200 px-2 py-1 rounded-full">SPEND</span>
                </div>
                <div className="text-3xl font-black text-blue-900 mb-1">${performanceData.metrics.totalSpend.toLocaleString()}</div>
                <div className="text-sm font-medium text-blue-700">Total Campaign Spend</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">👁</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">REACH</span>
                </div>
                <div className="text-3xl font-black text-emerald-900 mb-1">{performanceData.metrics.impressions.toLocaleString()}</div>
                <div className="text-sm font-medium text-emerald-700">Total Impressions</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">👆</span>
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-200 px-2 py-1 rounded-full">CLICKS</span>
                </div>
                <div className="text-3xl font-black text-purple-900 mb-1">{performanceData.metrics.clicks.toLocaleString()}</div>
                <div className="text-sm font-medium text-purple-700">Total Clicks</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎯</span>
                  </div>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-200 px-2 py-1 rounded-full">GOALS</span>
                </div>
                <div className="text-3xl font-black text-orange-900 mb-1">{performanceData.metrics.conversions.toLocaleString()}</div>
                <div className="text-sm font-medium text-orange-700">Total Conversions</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-8 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">📊</span>
                </span>
                Key Performance Indicators
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-indigo-600 mb-2">{performanceData.metrics.ctr}%</div>
                  <div className="text-sm font-semibold text-slate-600">Click-Through Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-rose-600 mb-2">${performanceData.metrics.cpc}</div>
                  <div className="text-sm font-semibold text-slate-600">Cost Per Click</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-600 mb-2">{performanceData.metrics.roas}x</div>
                  <div className="text-sm font-semibold text-slate-600">Return on Ad Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-amber-600 mb-2">{performanceData.metrics.conversionRate}%</div>
                  <div className="text-sm font-semibold text-slate-600">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'audience':
        const audienceData = generateReportData('audience');
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-pink-50 to-blue-50 p-8 rounded-xl border border-pink-200 shadow-sm">
              <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">👥</span>
                </span>
                Gender Distribution
              </h4>
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(audienceData.gender).map(([gender, percent]) => (
                  <div key={gender} className="bg-white/80 p-6 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full ${gender === 'Male' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-pink-400 to-pink-600'}`}></div>
                        <span className="font-bold text-gray-800">{gender}</span>
                      </div>
                      <span className={`text-2xl font-black ${gender === 'Male' ? 'text-blue-600' : 'text-pink-600'}`}>{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${gender === 'Male' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-pink-400 to-pink-600'}`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-200 shadow-sm">
              <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">📊</span>
                </span>
                Age Demographics
              </h4>
              <div className="space-y-4">
                {Object.entries(audienceData.demographics).map(([age, percent], index) => {
                  const colors = ['from-indigo-400 to-indigo-600', 'from-purple-400 to-purple-600', 'from-blue-400 to-blue-600', 'from-violet-400 to-violet-600'];
                  const textColors = ['text-indigo-600', 'text-purple-600', 'text-blue-600', 'text-violet-600'];
                  return (
                    <div key={age} className="bg-white/80 p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800">{age}</span>
                        <span className={`text-lg font-black ${textColors[index]}`}>{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-200 shadow-sm">
              <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">🎯</span>
                </span>
                Interest Categories
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(audienceData.interests).map(([interest, percent], index) => {
                  const bgColors = ['bg-emerald-100', 'bg-teal-100', 'bg-cyan-100'];
                  const textColors = ['text-emerald-600', 'text-teal-600', 'text-cyan-600'];
                  return (
                    <div key={interest} className={`${bgColors[index]} p-4 rounded-xl text-center`}>
                      <div className={`text-2xl font-black ${textColors[index]} mb-1`}>{percent}%</div>
                      <div className="text-sm font-semibold text-gray-700">{interest}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'channels':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Platform Performance</h4>
              <div className="space-y-4">
                {['Facebook', 'Instagram', 'Google Ads', 'Email', 'Twitter'].map((platform, index) => {
                  const platformInfo = getPlatformIcon(platform);
                  const Icon = platformInfo.icon;
                  const data = platformData[platform];
                  let campaignData = null;
                  
                  if (data && data.campaigns) {
                    const campaigns = Object.values(data.campaigns);
                    campaignData = campaigns[0]; // Use first available campaign
                  }
                  
                  const spend = campaignData?.metrics.cost || Math.floor(Math.random() * 5000 + 1000);
                  const conversions = campaignData?.metrics.conversions || Math.floor(Math.random() * 100 + 20);
                  const roi = campaignData?.metrics.roi || (Math.random() * 3 + 1).toFixed(1);
                  const trend = Math.random() > 0.5 ? 'up' : 'down';
                  const trendValue = Math.floor(Math.random() * 20 + 5);
                  const status = ['Active', 'Paused', 'Learning'][Math.floor(Math.random() * 3)];
                  
                  return (
                    <div key={index} className={`${platformInfo.bg} p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${platformInfo.bg} border-2 border-white rounded-xl flex items-center justify-center shadow-sm`}>
                            <Icon className={`w-7 h-7 ${platformInfo.color}`} />
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-900 text-lg">{platform}</h5>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              status === 'Active' ? 'bg-green-100 text-green-800' :
                              status === 'Paused' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center space-x-1 text-sm font-semibold ${
                            trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span>{trend === 'up' ? '↗' : '↘'}</span>
                            <span>{trendValue}%</span>
                          </div>
                          <div className="text-xs text-gray-500">vs last week</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white/70 p-3 rounded-lg">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Spend</div>
                          <div className="text-lg font-black text-gray-900">${spend.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/70 p-3 rounded-lg">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Conversions</div>
                          <div className="text-lg font-black text-gray-900">{conversions}</div>
                        </div>
                        <div className="bg-white/70 p-3 rounded-lg">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">ROI</div>
                          <div className="text-lg font-black text-emerald-600">{roi}x</div>
                        </div>
                        <div className="bg-white/70 p-3 rounded-lg">
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Efficiency</div>
                          <div className={`text-lg font-black ${platformInfo.color}`}>
                            {Math.round(roi * 30)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'predictions':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200 shadow-sm">
              <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">🤖</span>
                </span>
                AI Strategic Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { text: 'Increase Facebook budget by 15%', impact: 'High', color: 'from-green-400 to-green-600' },
                  { text: 'Shift 20% budget from Google to Instagram', impact: 'Medium', color: 'from-yellow-400 to-yellow-600' },
                  { text: 'Target lookalike audiences', impact: 'High', color: 'from-green-400 to-green-600' },
                  { text: 'A/B test creative variations', impact: 'Medium', color: 'from-blue-400 to-blue-600' }
                ].map((rec, index) => (
                  <div key={index} className="bg-white/80 p-4 rounded-xl shadow-sm border-l-4 border-blue-400">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">{rec.text}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rec.color}`}>
                        {rec.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-xl border border-emerald-200 shadow-sm">
              <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">📈</span>
                </span>
                Predicted Performance Outcomes
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Conversions', value: '+23%', icon: '🎯', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-100' },
                  { label: 'CPA Reduction', value: '-12%', icon: '💰', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-100' },
                  { label: 'ROAS Improvement', value: '+18%', icon: '📊', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-100' },
                  { label: 'Engagement Boost', value: '+31%', icon: '❤️', color: 'from-pink-400 to-pink-600', bg: 'bg-pink-100' }
                ].map((outcome, index) => (
                  <div key={index} className={`${outcome.bg} p-6 rounded-xl text-center shadow-sm`}>
                    <div className="text-2xl mb-2">{outcome.icon}</div>
                    <div className={`text-2xl font-black bg-gradient-to-r ${outcome.color} bg-clip-text text-transparent mb-1`}>
                      {outcome.value}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">{outcome.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ overflow: 'hidden' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deep Analytics</h2>
            <p className="text-gray-600 mt-1">Campaign: {selectedCampaign.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeSection === id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderSectionContent()}
        </div>
        
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeepAnalyticsModal;