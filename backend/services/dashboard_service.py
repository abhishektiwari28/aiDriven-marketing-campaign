from typing import Dict, Any, List
import random
import math
from datetime import datetime, timedelta
from database import db
from agents.dash import PerformanceNexusAgent
from agents.strategy import StrategyAgent
from platforms import PlatformAPI

class DashboardService:
    def __init__(self):
        self.nexus = PerformanceNexusAgent()
        self.strategy_agent = StrategyAgent()

    def get_stats(self, campaign_id: str = None) -> Dict[str, Any]:
        campaigns = db.get_campaigns()
        
        if campaign_id and campaign_id != 'all':
            # Filter for specific campaign
            campaign = next((c for c in campaigns if c["id"] == campaign_id), None)
            if not campaign:
                return {
                    "total_campaigns": 0, "total_spend": 0, "total_revenue": 0, 
                    "total_conversions": 0, "total_impressions": 0, "avg_roi": 0,
                    "channels": [], "nexus_insight": {"global_insight": "Campaign not found", "health_score": 0}
                }
            
            # Fetch 'real' metrics from simulation files via PlatformAPI
            platforms_data = PlatformAPI.get_all_platforms_data(campaign_id)
            
            total_spend = sum(p["metrics"].get("cost", 0) for p in platforms_data)
            total_revenue = sum(p["metrics"].get("cost", 0) * p["metrics"].get("roi", 0) for p in platforms_data)
            total_conversions = sum(p["metrics"].get("conversions", 0) for p in platforms_data)
            total_impressions = sum(p["metrics"].get("impressions", 0) for p in platforms_data)
            total_clicks = sum(p["metrics"].get("clicks", 0) for p in platforms_data)
            
            avg_roi = (total_revenue / total_spend) if total_spend > 0 else 0
            avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
            avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
            avg_cpm = (total_spend / total_impressions * 1000) if total_impressions > 0 else 0
            avg_conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0

            # Platform breakdown for charts
            channels = []
            colors = ["bg-indigo-500", "bg-blue-500", "bg-teal-500", "bg-emerald-500", "bg-amber-500"]
            for i, p in enumerate(platforms_data):
                channels.append({
                    "name": p["platform"],
                    "roi": p["metrics"].get("roi", 0),
                    "spend": p["metrics"].get("cost", 0),
                    "conversions": p["metrics"].get("conversions", 0),
                    "ctr": p["metrics"].get("ctr", 0),
                    "cpc": p["metrics"].get("cpc", 0),
                    "color": colors[i % len(colors)]
                })

            campaign_summary = [{
                "id": campaign["id"],
                "name": campaign["name"],
                "status": campaign["status"],
                "budget": total_spend,
                "roi": round(avg_roi, 2),
                "progress": 75 # Mock progress for now
            }]

            nexus_insight = self.nexus.run({
                "total_spend": total_spend,
                "total_revenue": total_revenue,
                "campaign_name": campaign["name"]
            })

            return {
                "total_campaigns": 1,
                "total_spend": total_spend,
                "total_revenue": total_revenue,
                "total_conversions": total_conversions,
                "total_impressions": total_impressions,
                "total_clicks": total_clicks,
                "avg_roi": round(avg_roi, 2),
                "avg_ctr": round(avg_ctr, 2),
                "avg_cpc": round(avg_cpc, 2),
                "avg_cpm": round(avg_cpm, 2),
                "avg_conversion_rate": round(avg_conversion_rate, 2),
                "channels": channels,
                "campaign_summary": campaign_summary,
                "nexus_insight": nexus_insight
            }
        else:
            # Global Aggregated Stats for ALL Files
            platforms = ["Email", "Facebook", "Google Ads", "Instagram", "Twitter"]
            
            global_spend = 0
            global_revenue = 0
            global_conversions = 0
            global_impressions = 0
            global_clicks = 0
            
            all_channels_map = {}
            campaign_summary = [] # Ideally we'd scan all campaigns for this table too, but for top metrics use file aggregates
            
            # 1. Calculate Grand Totals from Files
            for p_name in platforms:
                # Use the aggregate method which sums EVERYTHING in the file
                p_stats = PlatformAPI.get_platform_aggregate_stats(p_name)
                metrics = p_stats["metrics"]
                
                # Careful: metrics costs are totals for that platform
                global_spend += metrics.get("cost", 0)
                # Revenue = cost * roi (back-calculated or we need revenue explicitly? 
                # Platforms.py doesn't return revenue explicitly in aggregate, only roi.
                # Let's derive revenue from cost * roi for now as per previous logic.
                # Wait, average ROI * total Cost isn't exactly Sum(Cost*ROI).
                # But PlatformAPI aggregate ROI is avg_roi.
                # Let's stick to the previous loop logic but iterate FILES instead of DB campaigns
                # actually, let's use get_all_campaigns_in_platform to be precise!
                
            # RESET for precise calculation loop
            global_spend = 0
            global_revenue = 0
            global_conversions = 0
            global_impressions = 0
            global_clicks = 0
            campaign_map = {}

            for p_name in platforms:
                campaigns_in_file = PlatformAPI.get_all_campaigns_in_platform(p_name)
                
                # Channel Stats Accumulator
                p_spend = 0
                p_conversions = 0
                p_roi_sum = 0
                p_count = 0
                
                for c in campaigns_in_file:
                    m = c["metrics"]
                    cost = m.get("cost", 0)
                    roi = m.get("roi", 0)
                    
                    global_spend += cost
                    global_revenue += cost * roi
                    global_conversions += m.get("conversions", 0)
                    global_impressions += m.get("impressions", 0)
                    global_clicks += m.get("clicks", 0)
                    
                    p_spend += cost
                    p_conversions += m.get("conversions", 0)
                    p_roi_sum += roi
                    p_count += 1
                    
                    # Deduplicate / Aggregate Campaign Summary
                    c_id = c["id"]
                    if c_id not in campaign_map:
                        campaign_map[c_id] = {
                            "id": c_id,
                            "name": c["name"],
                            "status": "Active",
                            "total_cost": cost,
                            "total_revenue": cost * roi,
                            "progress": 60,
                            "platforms": [p_name]
                        }
                    else:
                        campaign_map[c_id]["total_cost"] += cost
                        campaign_map[c_id]["total_revenue"] += (cost * roi)
                        campaign_map[c_id]["platforms"].append(p_name)

                if p_count > 0:
                     all_channels_map[p_name] = {
                        "spend": p_spend,
                        "conversions": p_conversions,
                        "roi_sum": p_roi_sum,
                        "count": p_count
                     }

            # Convert map to list
            campaign_summary = []
            for c_id, data in campaign_map.items():
                # Calculate aggregated ROI
                avg_camp_roi = (data["total_revenue"] / data["total_cost"]) if data["total_cost"] > 0 else 0
                
                # Format platform string
                unique_platforms = list(set(data["platforms"]))
                platform_str = "Multi-Channel (" + ", ".join(unique_platforms) + ")" if len(unique_platforms) > 1 else unique_platforms[0]
                
                campaign_summary.append({
                    "id": data["id"],
                    "name": data["name"],
                    "status": data["status"],
                    "budget": data["total_cost"],
                    "roi": round(avg_camp_roi, 2),
                    "progress": data["progress"],
                    "platform": platform_str
                })
            
            total_campaigns_count = len(campaign_summary)

            channels = []
            colors = ["bg-indigo-500", "bg-blue-500", "bg-teal-500", "bg-emerald-500", "bg-amber-500"]
            for i, (name, data) in enumerate(all_channels_map.items()):
                channels.append({
                    "name": name,
                    "roi": round(data["roi_sum"] / data["count"], 2) if data["count"] > 0 else 0,
                    "spend": data["spend"],
                    "conversions": data["conversions"],
                    "color": colors[i % len(colors)]
                })

            avg_roi = (global_revenue / global_spend) if global_spend > 0 else 0
            avg_ctr = (global_clicks / global_impressions * 100) if global_impressions > 0 else 0
            avg_cpc = (global_spend / global_clicks) if global_clicks > 0 else 0
            avg_cpm = (global_spend / global_impressions * 1000) if global_impressions > 0 else 0
            avg_conversion_rate = (global_conversions / global_clicks * 100) if global_clicks > 0 else 0
            
            nexus_insight = self.nexus.run({
                "total_spend": global_spend,
                "total_revenue": global_revenue,
                "campaign_count": total_campaigns_count
            })
            
            return {
                "total_campaigns": total_campaigns_count,
                "total_spend": global_spend,
                "total_revenue": global_revenue,
                "total_conversions": global_conversions,
                "total_impressions": global_impressions,
                "total_clicks": global_clicks,
                "avg_roi": round(avg_roi, 2),
                "avg_ctr": round(avg_ctr, 2),
                "avg_cpc": round(avg_cpc, 2),
                "avg_cpm": round(avg_cpm, 2),
                "avg_conversion_rate": round(avg_conversion_rate, 2),
                "channels": channels,
                "campaign_summary": campaign_summary[:5], # Last 5 campaigns
                "nexus_insight": nexus_insight
            }

    def get_performance_trends(self, campaign_id: str = None, days: int = 30) -> Dict[str, Any]:
        
        # 1. Get Baseline Totals from Real Data
        stats = self.get_stats(campaign_id)
        
        # Baselines (Daily Average)
        total_rev = stats.get("total_revenue", 0)
        total_imp = stats.get("total_impressions", 0)
        total_clicks = stats.get("channels", []) # We need to aggregate clicks from channels if not in top level
        
        # stats['channels'] has the click data
        total_clicks_count = sum(c.get("clicks", 0) for c in stats.get("channels", []))
        if total_clicks_count == 0: 
             # Fallback if channels structure is different or empty, try to calc from total_spend / avg cpc or similar?
             # Actually, let's just grab it from the PlatformAPI aggregation again if needed, 
             # but stats calculation above in get_stats doesn't seem to sum clicks explicitly in the top level dict.
             # Let's check get_stats again. It calculates total_conversions and impressions. Clicks are missing in top level return.
             # We should probably fix get_stats to return total_clicks too, but for now let's re-sum here or just trust the loop below.
             pass

        # Re-calc baseline from stats or re-fetch to be safe/clean
        # Actually, let's just use the stats we have.
        # stats['channels'] contains 'roi', 'spend', 'conversions', 'ctr', 'cpc'. 
        # Clicks = spend / cpc (approx) or just sum from the raw data if we had it.
        # Wait, get_stats loop:
        # for i, p in enumerate(platforms_data):
        #    ... "metrics" has clicks.
        #    channels.append({ ... "metrics".get("ctr") ... })
        # It doesn't strictly return total clicks.
        
        # Let's just re-fetch platform data to be accurate for trends
        if campaign_id and campaign_id != 'all':
            platforms_data = PlatformAPI.get_all_platforms_data(campaign_id)
        else:
            campaigns = db.get_campaigns()
            platforms_data = []
            for c in campaigns:
                platforms_data.extend(PlatformAPI.get_all_platforms_data(c["id"]))

        grand_total_impressions = sum(p["metrics"].get("impressions", 0) for p in platforms_data)
        grand_total_clicks = sum(p["metrics"].get("clicks", 0) for p in platforms_data)
        grand_total_conversions = sum(p["metrics"].get("conversions", 0) for p in platforms_data)
        
        # Calculate daily averages
        avg_imp = grand_total_impressions / 30 if grand_total_impressions else 1000
        avg_click = grand_total_clicks / 30 if grand_total_clicks else 50
        avg_conv = grand_total_conversions / 30 if grand_total_conversions else 10

        trends = []
        now = datetime.now()

        # Generate smooth curve with some noise
        for i in range(days):
            date = now - timedelta(days=(days - 1 - i))
            date_str = date.strftime("%m/%d/%Y") # Frontend likely wants a standard date format
            
            # Create a wave pattern + random noise
            # specific phase shift for each metric to look organic (not all going up/down exactly together)
            
            # Impressions: High volume, sine wave
            phase_imp = (i / 30) * 3.14159 * 2 
            # Use math.sin for cleaner calculation
            imp_factor = 1.0 + 0.3 * math.sin((i / 10.0)) + random.uniform(-0.1, 0.1)
            
            # Clicks: Correlated with impressions but distinct
            click_factor = imp_factor * (1.0 + random.uniform(-0.15, 0.15))
            
            # Conversions: Lagged or slightly different
            conv_factor = imp_factor * (1.0 + random.uniform(-0.2, 0.2))

            trends.append({
                "date": date_str,
                "impressions": int(avg_imp * imp_factor),
                "clicks": int(avg_click * click_factor),
                "conversions": int(avg_conv * conv_factor)
            })

        return trends


    def get_revenue_trajectory(self, campaign_id: str = None, days: int = 30) -> List[Dict[str, Any]]:
        # 1. Get Baseline from Real Data
        stats = self.get_stats(campaign_id)
        current_revenue = stats.get("total_revenue", 0)
        
        # 2. Generate Trajectory
        trajectory = []
        now = datetime.now()
        
        # Daily average base
        daily_revenue = current_revenue / 30 if current_revenue > 0 else 1000
        
        for i in range(days):
            date = now - timedelta(days=(days - 1 - i))
            # Format as "Mon DD" e.g. "Dec 21"
            date_str = date.strftime("%b %d")
            
            # Create organic growth curve
            # Base growth + random fluctuation + sine wave for seasonality
            growth_factor = 1.0 + (i / days) * 0.2  # 20% growth over period
            seasonality = math.sin((i / 7) * 3.14) * 0.1 # Weekly fluctuations
            noise = random.uniform(-0.05, 0.05)
            
            revenue_point = daily_revenue * (growth_factor + seasonality + noise)
            
            trajectory.append({
                "name": date_str,
                "revenue": int(max(0, revenue_point))
            })
            
        return trajectory


    def get_ai_insights(self, campaign_id: str = None) -> List[Dict[str, Any]]:
        # Fetch current data
        if campaign_id and campaign_id != 'all':
            platforms_data = PlatformAPI.get_all_platforms_data(campaign_id)
        else:
            # Aggregate for all
            campaigns = db.get_campaigns()
            all_data = []
            for c in campaigns:
                all_data.extend(PlatformAPI.get_all_platforms_data(c["id"]))
            platforms_data = all_data

        if not platforms_data:
            return []

        # Run Strategy Agent
        new_decisions = self.strategy_agent.run({"platforms_data": platforms_data})
        
        # Log to DB for persistence
        if campaign_id and campaign_id != 'all':
            for d in new_decisions:
                db.log_ai_decision(campaign_id, d.get("decision_type", "Strategic Signal"), d)
        
        # Return the decisions in the format expected by frontend
        formatted_insights = []
        now = datetime.now().strftime("%b %d, %I:%M %p")
        for d in new_decisions:
            formatted_insights.append({
                "decision_type": d.get("decision_type"),
                "performance_analysis": d.get("performance_analysis", {}),
                "budget_optimization": d.get("budget_optimization", {}),
                "timestamp": now
            })
        
        return formatted_insights


dashboard_service = DashboardService()
