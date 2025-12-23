from typing import Dict, Any, List
from agents.orchestrator import CampaignOrchestratorAgent
from database import db
from platforms import PlatformAPI

class CampaignService:
    def __init__(self):
        self.orchestrator = CampaignOrchestratorAgent()
        self.ensure_campaigns_synced()

    def ensure_campaigns_synced(self):
        """Ensures that campaigns found in platform JSON files exist in the SQLite DB."""
        print("Syncing File System with Database...")
        file_campaigns = PlatformAPI.get_all_campaign_metadata()
        db_campaigns = db.get_campaigns()
        db_ids = {c["id"] for c in db_campaigns}
        
        for fc in file_campaigns:
            if fc["id"] not in db_ids:
                print(f"Restoring orphaned campaign: {fc['name']} ({fc['id']})")
                # Create a minimal valid campaign entry for the DB
                restored_campaign = {
                    "id": fc["id"],
                    "name": fc["name"],
                    "status": "Active",
                    "budget": 50000, # Default assumption
                    "spent": 0, # Default to 0 instead of random
                    "objective": "Sales",
                    "platforms": fc["platforms"],
                    "strategy": {"strategy": "Restored from platform data", "tactics": []},
                    "recommendation": {},
                    "roi_forecast": {"projected_roi": 0, "confidence": "Low"},
                    "timeline": {"duration_days": 30, "start_date": "2025-01-01"},
                    "broadcast_log": {"restored": True}
                }
                db.add_campaign(restored_campaign)

    def create_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        # Delegate orchestrating logic to the agent
        new_campaign = self.orchestrator.initialize_campaign(campaign_data)
        # Store in database
        db.add_campaign(new_campaign)
        return new_campaign

    def update_campaign(self, campaign_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates campaign details."""
        # Optional: Add validation logic here using agents if needed
        success = db.update_campaign(campaign_id, updates)
        if not success:
             return {"error": "Campaign not found"}
        
        # Return updated campaign
        campaigns = db.get_campaigns()
        return next((c for c in campaigns if c["id"] == campaign_id), {})

    def get_all_campaigns(self) -> List[Dict[str, Any]]:
        # Re-sync on read to ensure fresh state if files changed externally
        self.ensure_campaigns_synced()
        return db.get_campaigns()

    def update_status(self, campaign_id: str, action: str) -> Dict[str, Any]:
        campaigns = db.get_campaigns()
        campaign = next((c for c in campaigns if c["id"] == campaign_id), None)
        if not campaign:
            return {"error": "Campaign not found"}
        
        # Ask agent for the new status based on action
        decision = self.orchestrator.execute_action(campaign, action)
        new_status = decision.get("new_status", campaign["status"])
        
        # Update in database
        db.update_campaign_status(campaign_id, new_status)
        db.log_ai_decision(campaign_id, "StatusUpdate", decision)
        
        return decision

    def delete_campaign(self, campaign_id: str):
        # 1. Get campaign to know which platforms to clean up
        campaigns = db.get_campaigns()
        campaign = next((c for c in campaigns if c["id"] == campaign_id), None)
        
        if campaign:
            platforms = campaign.get("platforms", [])
            # Also check Email if it was added dynamically
            all_platforms = ["Instagram", "Facebook", "Twitter", "Google Ads", "Email"]
            
            # 2. Delete from platform files
            for p in all_platforms:
                PlatformAPI.delete_campaign_from_platform(campaign_id, p)
                
        # 3. Delete from DB
        return db.delete_campaign(campaign_id)

campaign_service = CampaignService()
