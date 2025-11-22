"""Script to populate players collection by aggregating match data."""
import random
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'football_app')
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

# Skill categories for radar charts
SKILL_CATEGORIES = ['passing', 'dribbling', 'speed', 'strength', 'vision', 'defending']

def generate_mock_skills(position=None):
    """Generate mock skill values based on position."""
    # Base skills (random 4-8)
    skills = {skill: random.randint(4, 8) for skill in SKILL_CATEGORIES}
    
    # Adjust based on position
    if position == 'GK':
        skills['defending'] = random.randint(7, 10)
        skills['strength'] = random.randint(6, 9)
        skills['passing'] = random.randint(4, 7)
        skills['dribbling'] = random.randint(2, 5)
        skills['speed'] = random.randint(4, 7)
    elif position in ['CB', 'LB', 'RB']:
        skills['defending'] = random.randint(7, 10)
        skills['strength'] = random.randint(6, 9)
        skills['speed'] = random.randint(5, 8)
    elif position in ['CM', 'CDM', 'CAM']:
        skills['passing'] = random.randint(7, 10)
        skills['vision'] = random.randint(7, 10)
        skills['dribbling'] = random.randint(6, 9)
    elif position in ['LW', 'RW', 'ST', 'CF']:
        skills['speed'] = random.randint(7, 10)
        skills['dribbling'] = random.randint(7, 10)
        skills['passing'] = random.randint(5, 8)
    
    return skills

def populate_players():
    """Populate players collection from matches data."""
    matches_collection = db.matches
    players_collection = db.players
    
    # Clear existing players
    print("Clearing existing players...")
    players_collection.delete_many({})
    
    # Dictionary to store player data
    players_dict = {}
    
    # Fetch all matches
    print("Fetching matches...")
    matches = list(matches_collection.find({}))
    print(f"Processing {len(matches)} matches...")
    
    for match in matches:
        match_id = match['_id']
        match_info = match.get('match_info', {})
        lineups = match.get('lineups', {})
        events = match.get('events', [])
        
        match_date = match_info.get('match_date')
        
        # Process home team
        home_team_id = match_info.get('home_team', {}).get('id')
        home_team_name = match_info.get('home_team', {}).get('name', 'Unknown')
        away_team_name = match_info.get('away_team', {}).get('name', 'Unknown')
        
        for player in lineups.get('home', {}).get('first_11', []) + lineups.get('home', {}).get('substitutes', []):
            player_id = str(player.get('id'))
            if not player_id:
                continue
            
            # Initialize player if not exists
            if player_id not in players_dict:
                position = player.get('position') or 'Unknown'
                # Use English name for profile, fallback to Hebrew if not available
                player_name = player.get('name_en') or player.get('name', 'Unknown')
                players_dict[player_id] = {
                    '_id': player_id,
                    'name': player_name,
                    'position': position,
                    'shirt_number': player.get('shirt_number'),
                    'team_id': home_team_id,
                    'team_name': home_team_name,
                    'is_captain': player.get('captain', False),
                    'matches_played': [],
                    'total_stats': {
                        'matches': 0,
                        'goals': 0,
                        'yellow_cards': 0,
                        'red_cards': 0,
                        'minutes_played': 0
                    },
                    'skills': generate_mock_skills(position)
                }
            else:
                # Update position if we find a better one (not Unknown/None)
                if player.get('position') and player.get('position') != 'Unknown':
                    if players_dict[player_id]['position'] in ['Unknown', None]:
                        players_dict[player_id]['position'] = player.get('position')
                        # Regenerate skills with correct position
                        players_dict[player_id]['skills'] = generate_mock_skills(player.get('position'))
            
            # Add match to player's history
            is_starting = player in lineups.get('home', {}).get('first_11', [])
            # Only store real game_time if available (from breakdown JSON), otherwise None
            minutes_played = player.get('game_time') if player.get('game_time') is not None else None
            
            match_entry = {
                'match_id': match_id,
                'match_date': match_date,
                'player_team': home_team_name,
                'opponent': away_team_name,
                'home_away': 'home',
                'competition': match_info.get('competition_name', 'League'),
                'minutes_played': minutes_played,
                'started': is_starting,
                'goals': 0,
                'yellow_cards': 0,
                'red_cards': 0
            }
            
            # Count events for this player in this match
            for event in events:
                if str(event.get('player_id')) == player_id:
                    if event['event_type'] == 'goal':
                        match_entry['goals'] += 1
                        players_dict[player_id]['total_stats']['goals'] += 1
                    elif event['event_type'] == 'yellow_card':
                        match_entry['yellow_cards'] += 1
                        players_dict[player_id]['total_stats']['yellow_cards'] += 1
                    elif event['event_type'] == 'red_card':
                        match_entry['red_cards'] += 1
                        players_dict[player_id]['total_stats']['red_cards'] += 1
            
            players_dict[player_id]['matches_played'].append(match_entry)
            players_dict[player_id]['total_stats']['matches'] += 1
            # Only add real minutes to total
            if minutes_played is not None:
                players_dict[player_id]['total_stats']['minutes_played'] += minutes_played
        
        # Process away team
        away_team_id = match_info.get('away_team', {}).get('id')
        away_team_name = match_info.get('away_team', {}).get('name', 'Unknown')
        home_team_name = match_info.get('home_team', {}).get('name', 'Unknown')
        
        for player in lineups.get('away', {}).get('first_11', []) + lineups.get('away', {}).get('substitutes', []):
            player_id = str(player.get('id'))
            if not player_id:
                continue
            
            # Initialize player if not exists
            if player_id not in players_dict:
                position = player.get('position') or 'Unknown'
                # Use English name for profile, fallback to Hebrew if not available
                player_name = player.get('name_en') or player.get('name', 'Unknown')
                players_dict[player_id] = {
                    '_id': player_id,
                    'name': player_name,
                    'position': position,
                    'shirt_number': player.get('shirt_number'),
                    'team_id': away_team_id,
                    'team_name': away_team_name,
                    'is_captain': player.get('captain', False),
                    'matches_played': [],
                    'total_stats': {
                        'matches': 0,
                        'goals': 0,
                        'yellow_cards': 0,
                        'red_cards': 0,
                        'minutes_played': 0
                    },
                    'skills': generate_mock_skills(position)
                }
            else:
                # Update position if we find a better one (not Unknown/None)
                if player.get('position') and player.get('position') != 'Unknown':
                    if players_dict[player_id]['position'] in ['Unknown', None]:
                        players_dict[player_id]['position'] = player.get('position')
                        # Regenerate skills with correct position
                        players_dict[player_id]['skills'] = generate_mock_skills(player.get('position'))
            
            # Add match to player's history
            is_starting = player in lineups.get('away', {}).get('first_11', [])
            # Only store real game_time if available (from breakdown JSON), otherwise None
            minutes_played = player.get('game_time') if player.get('game_time') is not None else None
            
            match_entry = {
                'match_id': match_id,
                'match_date': match_date,
                'player_team': away_team_name,
                'opponent': home_team_name,
                'home_away': 'away',
                'competition': match_info.get('competition_name', 'League'),
                'minutes_played': minutes_played,
                'started': is_starting,
                'goals': 0,
                'yellow_cards': 0,
                'red_cards': 0
            }
            
            # Count events for this player in this match
            for event in events:
                if str(event.get('player_id')) == player_id:
                    if event['event_type'] == 'goal':
                        match_entry['goals'] += 1
                        players_dict[player_id]['total_stats']['goals'] += 1
                    elif event['event_type'] == 'yellow_card':
                        match_entry['yellow_cards'] += 1
                        players_dict[player_id]['total_stats']['yellow_cards'] += 1
                    elif event['event_type'] == 'red_card':
                        match_entry['red_cards'] += 1
                        players_dict[player_id]['total_stats']['red_cards'] += 1
            
            players_dict[player_id]['matches_played'].append(match_entry)
            players_dict[player_id]['total_stats']['matches'] += 1
            # Only add real minutes to total
            if minutes_played is not None:
                players_dict[player_id]['total_stats']['minutes_played'] += minutes_played
    
    # Sort each player's matches by date (most recent first)
    for player_data in players_dict.values():
        player_data['matches_played'].sort(
            key=lambda x: x.get('match_date') or '1900-01-01',
            reverse=True
        )
    
    # Insert all players
    if players_dict:
        print(f"Inserting {len(players_dict)} players...")
        players_collection.insert_many(list(players_dict.values()))
        print(f"Successfully inserted {len(players_dict)} players")
    else:
        print("No players found to insert")
    
    # Print some stats
    total_matches = sum(p['total_stats']['matches'] for p in players_dict.values())
    total_goals = sum(p['total_stats']['goals'] for p in players_dict.values())
    print(f"\nStats:")
    print(f"- Total players: {len(players_dict)}")
    print(f"- Total match appearances: {total_matches}")
    print(f"- Total goals: {total_goals}")
    
    print(f"\nTotal players in database: {players_collection.count_documents({})}")

if __name__ == '__main__':
    print("Starting players database population...")
    populate_players()
    print("\nPlayers database population complete!")
