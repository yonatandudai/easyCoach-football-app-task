"""Service layer for player-related business logic."""
from typing import Optional, Dict


class PlayerService:
    """Service for handling player data operations."""
    
    def __init__(self, db):
        """Initialize with database connection."""
        self.db = db
        self.players_collection = db.players
    
    def get_player_by_id(self, player_id: str) -> Optional[Dict]:
        """
        Fetch details for a specific player.
        
        Args:
            player_id: The unique identifier for the player
            
        Returns:
            Player details dictionary or None if not found
        """
        # Fetch player from MongoDB
        player = self.players_collection.find_one({'_id': player_id})
        
        return player
