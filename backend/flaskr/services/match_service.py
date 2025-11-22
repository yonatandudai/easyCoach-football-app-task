"""Service layer for match-related business logic."""
from typing import Dict, List, Optional


class MatchService:
    """Service for handling match data operations."""
    
    def __init__(self, db):
        """Initialize with database connection."""
        self.db = db
        self.matches_collection = db.matches
    
    def get_all_matches(self) -> Dict[str, List[Dict]]:
        """
        Fetch all matches and group them by match day.
        
        Returns:
            Dictionary with dates as keys and match lists as values
        """
        from collections import defaultdict
        
        # Fetch all matches from MongoDB
        matches = list(self.matches_collection.find({}, {
            '_id': 1,
            'match_info': 1
        }))
        
        if not matches:
            return {}
        
        # Format matches and group by day
        matches_by_day = defaultdict(list)
        
        for match in matches:
            match_info = match.get('match_info', {})
            match_date = match_info.get('match_date')
            
            # Format the match for frontend
            formatted_match = {
                'id': match['_id'],
                'home_team': match_info.get('home_team', {}),
                'away_team': match_info.get('away_team', {}),
                'home_score': match_info.get('home_score', 0),
                'away_score': match_info.get('away_score', 0),
                'match_date': match_date,
                'kickoff_time': match_info.get('kickoff_time'),
                'status': match_info.get('status', 'scheduled'),
                'stadium': match_info.get('stadium'),
                'pixellot_id': match_info.get('pixellot_id')
            }
            
            if match_date:
                matches_by_day[match_date].append(formatted_match)
        
        # Sort by date
        sorted_matches_by_day = dict(sorted(matches_by_day.items()))
        
        return sorted_matches_by_day
    
    def get_match_by_id(self, match_id: str) -> Optional[Dict]:
        """
        Fetch details for a specific match.
        
        Args:
            match_id: The unique identifier for the match
            
        Returns:
            Match details dictionary or None if not found
        """
        # Fetch match from MongoDB
        match = self.matches_collection.find_one({'_id': match_id})
        
        if not match:
            return None
        
        # Format response for frontend
        response = {
            'match_info': match.get('match_info', {}),
            'lineups': match.get('lineups', {
                'home': {'first_11': [], 'substitutes': []},
                'away': {'first_11': [], 'substitutes': []}
            }),
            'events': match.get('events', []),
            'breakdown_data': match.get('breakdown_data', {})
        }
        
        return response
