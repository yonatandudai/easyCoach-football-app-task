"""Script to populate MongoDB with matches and players data."""
import requests
import json
import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URI = os.environ.get('MONGO_URI')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'football_app')
client = MongoClient(MONGO_URI)
db = client[MONGO_DB_NAME]

# EasyCoach API configuration
EASYCOACH_API_URL = os.environ.get('EASYCOACH_API_URL', '')
LEAGUE = "/league"
MATCH = "/match"

DEFAULT_PARAMS = {
    'league_id': 726,
    'season_id': 26,
    'user_token': os.environ.get('EASYCOACH_API_TOKEN', '')
}

def fetch_matches_from_api():
    """Fetch all matches from the API."""
    try:
        print("Fetching matches from API...")
        response = requests.get(EASYCOACH_API_URL + LEAGUE, params=DEFAULT_PARAMS, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'ok':
            print(f"API returned error status: {data}")
            return []
        
        matches = data.get('matches', [])
        print(f"Fetched {len(matches)} matches from API")
        return matches
    except Exception as e:
        print(f"Error fetching matches: {e}")
        return []

def fetch_match_details(match_id):
    """Fetch detailed match data from the API."""
    try:
        print(f"Fetching details for match {match_id}...")
        params = {
            'match_id': match_id,
            'user_token': DEFAULT_PARAMS['user_token']
        }
        response = requests.get(EASYCOACH_API_URL + MATCH, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'ok':
            print(f"API returned error for match {match_id}")
            return None
        
        return data
    except Exception as e:
        print(f"Error fetching match {match_id} details: {e}")
        return None

def load_breakdown_json():
    """Load the breakdown JSON file for match 1061429."""
    try:
        # JSON file is at backend root level (one level up from utils/)
        backend_dir = os.path.dirname(os.path.dirname(__file__))
        breakdown_file = os.path.join(backend_dir, 'breakdown_game_1061429_league_726.json')
        
        if os.path.exists(breakdown_file):
            print("Loading breakdown JSON for match 1061429...")
            with open(breakdown_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            print(f"Breakdown file not found: {breakdown_file}")
            return None
    except Exception as e:
        print(f"Error loading breakdown JSON: {e}")
        return None

def extract_events_from_breakdown(breakdown_data):
    """Extract events from breakdown data."""
    events = []
    
    first_half_start = breakdown_data.get('first_half_start', 0)
    second_half_start = breakdown_data.get('second_half_start', 0)
    
    def calculate_video_timestamp(match_minute, match_second):
        if match_minute < 45:
            return first_half_start + (match_minute * 60 + match_second)
        else:
            return second_half_start + ((match_minute - 45) * 60 + match_second)
    
    # Process home team players
    for player in breakdown_data.get('home_team_players', []):
        player_events = player.get('events', {})
        if not isinstance(player_events, dict):
            continue
        
        player_name = f"{player.get('fname', '')} {player.get('lname', '')}".strip()
        player_id = player.get('player_id')
        team_id = breakdown_data.get('home_team_id')
        
        # Goals
        for goal in player_events.get('goals', []):
            match_minute = goal.get('start_minute', 0)
            match_second = goal.get('start_second', 0)
            events.append({
                'id': f"goal_{player_id}_{goal.get('event_id')}",
                'minute': match_minute,
                'player_id': player_id,
                'player_name': player_name,
                'team_id': team_id,
                'event_type': 'goal',
                'timestamp': match_minute * 60 + match_second,
                'video_timestamp': calculate_video_timestamp(match_minute, match_second)
            })
        
        # Yellow cards
        for yellow in player_events.get('yellows', []):
            match_minute = yellow.get('start_minute', 0)
            match_second = yellow.get('start_second', 0)
            events.append({
                'id': f"yellow_{player_id}_{yellow.get('event_id')}",
                'minute': match_minute,
                'player_id': player_id,
                'player_name': player_name,
                'team_id': team_id,
                'event_type': 'yellow_card',
                'timestamp': match_minute * 60 + match_second,
                'video_timestamp': calculate_video_timestamp(match_minute, match_second)
            })
        
        # Red cards
        for red in player_events.get('reds', []):
            match_minute = red.get('start_minute', 0)
            match_second = red.get('start_second', 0)
            events.append({
                'id': f"red_{player_id}_{red.get('event_id')}",
                'minute': match_minute,
                'player_id': player_id,
                'player_name': player_name,
                'team_id': team_id,
                'event_type': 'red_card',
                'timestamp': match_minute * 60 + match_second,
                'video_timestamp': calculate_video_timestamp(match_minute, match_second)
            })
    
    # Process away team players
    for player in breakdown_data.get('away_team_players', []):
        player_events = player.get('events', {})
        if not isinstance(player_events, dict):
            continue
        
        player_name = f"{player.get('fname', '')} {player.get('lname', '')}".strip()
        player_id = player.get('player_id')
        team_id = breakdown_data.get('away_team_id')
        
        # Goals
        for goal in player_events.get('goals', []):
            match_minute = goal.get('start_minute', 0)
            match_second = goal.get('start_second', 0)
            events.append({
                'id': f"goal_{player_id}_{goal.get('event_id')}",
                'minute': match_minute,
                'player_id': player_id,
                'player_name': player_name,
                'team_id': team_id,
                'event_type': 'goal',
                'timestamp': match_minute * 60 + match_second,
                'video_timestamp': calculate_video_timestamp(match_minute, match_second)
            })
        
        # Yellow cards
        for yellow in player_events.get('yellows', []):
            match_minute = yellow.get('start_minute', 0)
            match_second = yellow.get('start_second', 0)
            events.append({
                'id': f"yellow_{player_id}_{yellow.get('event_id')}",
                'minute': match_minute,
                'player_id': player_id,
                'player_name': player_name,
                'team_id': team_id,
                'event_type': 'yellow_card',
                'timestamp': match_minute * 60 + match_second,
                'video_timestamp': calculate_video_timestamp(match_minute, match_second)
            })
        
        # Red cards
        for red in player_events.get('reds', []):
            match_minute = red.get('start_minute', 0)
            match_second = red.get('start_second', 0)
            events.append({
                'id': f"red_{player_id}_{red.get('event_id')}",
                'minute': match_minute,
                'player_id': player_id,
                'player_name': player_name,
                'team_id': team_id,
                'event_type': 'red_card',
                'timestamp': match_minute * 60 + match_second,
                'video_timestamp': calculate_video_timestamp(match_minute, match_second)
            })
    
    events.sort(key=lambda x: x.get('minute', 0))
    return events

def populate_matches():
    """Populate matches collection from API and breakdown JSON."""
    matches_collection = db.matches
    
    # Clear existing matches
    print("Clearing existing matches...")
    matches_collection.delete_many({})
    
    # Fetch matches from API
    api_matches = fetch_matches_from_api()
    
    for match in api_matches:
        match_id = match.get('game_id')
        if not match_id:
            continue
        
        # Parse date and time
        date_str = match.get('date')  # Format: "17/08/24"
        time_str = match.get('hour')  # Format: "08:30"
        
        match_date = None
        kickoff_datetime = None
        
        if date_str:
            try:
                date_obj = datetime.strptime(date_str, '%d/%m/%y')
                match_date = date_obj.strftime('%Y-%m-%d')
                if time_str:
                    kickoff_datetime = f"{match_date}T{time_str}:00"
                else:
                    kickoff_datetime = f"{match_date}T00:00:00"
            except ValueError:
                match_date = date_str
                kickoff_datetime = date_str
        
        # Parse scores
        home_score = None
        away_score = None
        result = match.get('result')
        if result and '-' in str(result):
            try:
                scores = str(result).split('-')
                home_score = int(scores[0].strip())
                away_score = int(scores[1].strip())
            except (ValueError, IndexError):
                pass
        
        # Fetch detailed match data
        match_details = fetch_match_details(match_id)
        
        lineups = {'home': {'first_11': [], 'substitutes': []}, 'away': {'first_11': [], 'substitutes': []}}
        pixellot_id = None
        
        if match_details:
            teams = match_details.get('teams', [])
            home_team_data = teams[0] if len(teams) > 0 else {}
            away_team_data = teams[1] if len(teams) > 1 else {}
            
            # Extract lineups
            for player in home_team_data.get('players', []):
                player_info = {
                    'id': player.get('player_id'),
                    'name': player.get('player_name', 'Unknown'),
                    'name_en': player.get('player_name_en'),
                    'shirt_number': int(player.get('shirt_number', 0)),
                    'position': 'GK' if player.get('goalkeeper') == '1' else None,
                    'captain': player.get('captain') == '1'
                }
                if player.get('main') == '1':
                    lineups['home']['first_11'].append(player_info)
                else:
                    lineups['home']['substitutes'].append(player_info)
            
            for player in away_team_data.get('players', []):
                player_info = {
                    'id': player.get('player_id'),
                    'name': player.get('player_name', 'Unknown'),
                    'name_en': player.get('player_name_en'),
                    'shirt_number': int(player.get('shirt_number', 0)),
                    'position': 'GK' if player.get('goalkeeper') == '1' else None,
                    'captain': player.get('captain') == '1'
                }
                if player.get('main') == '1':
                    lineups['away']['first_11'].append(player_info)
                else:
                    lineups['away']['substitutes'].append(player_info)
            
            # Extract video URL
            video_data = match_details.get('match_details', {}).get('video', {})
            video_url = video_data.get('pano_hls')
            if video_url and 'cloudfront' in video_url:
                pixellot_id = video_url
        
        # Create match document
        match_doc = {
            '_id': match_id,
            'match_info': {
                'id': match_id,
                'home_team': {
                    'id': match.get('team_a_id'),
                    'name': match.get('team_a_name_en') or match.get('team_a_name', 'Unknown'),
                    'logo': None
                },
                'away_team': {
                    'id': match.get('team_b_id'),
                    'name': match.get('team_b_name_en') or match.get('team_b_name', 'Unknown'),
                    'logo': None
                },
                'kickoff_time': kickoff_datetime,
                'competition_name': match.get('fixture_name_en') or match.get('fixture_name', 'Unknown'),
                'home_score': home_score,
                'away_score': away_score,
                'status': match.get('status', 'Scheduled'),
                'stadium': match.get('stadium_name_en') or match.get('stadium_name'),
                'match_date': match_date,
                'pixellot_id': pixellot_id
            },
            'lineups': lineups,
            'events': []
        }
        
        # Insert match
        matches_collection.insert_one(match_doc)
        print(f"Inserted match {match_id}: {match_doc['match_info']['home_team']['name']} vs {match_doc['match_info']['away_team']['name']}")
    
    # Handle match 1061429 with breakdown JSON
    breakdown_data = load_breakdown_json()
    if breakdown_data:
        match_id = '1061429'
        
        # Extract events
        events = extract_events_from_breakdown(breakdown_data)
        
        # Create lineups from breakdown
        lineups = {'home': {'first_11': [], 'substitutes': []}, 'away': {'first_11': [], 'substitutes': []}}
        
        for player in breakdown_data.get('home_team_players', []):
            player_info = {
                'id': player.get('player_id'),
                'name': f"{player.get('fname', '')} {player.get('lname', '')}".strip(),
                'shirt_number': int(player.get('number', 0)),
                'position': player.get('position'),
                'captain': False,
                'game_time': player.get('game_time')  # Real minutes played
            }
            if player.get('is_sub') == 0:
                lineups['home']['first_11'].append(player_info)
            else:
                lineups['home']['substitutes'].append(player_info)
        
        for player in breakdown_data.get('away_team_players', []):
            player_info = {
                'id': player.get('player_id'),
                'name': f"{player.get('fname', '')} {player.get('lname', '')}".strip(),
                'shirt_number': int(player.get('number', 0)),
                'position': player.get('position'),
                'captain': False,
                'game_time': player.get('game_time')  # Real minutes played
            }
            if player.get('is_sub') == 0:
                lineups['away']['first_11'].append(player_info)
            else:
                lineups['away']['substitutes'].append(player_info)
        
        # Parse match date
        match_date_str = breakdown_data.get('match_date', '2025-10-25 10:00:00')
        try:
            match_dt = datetime.strptime(match_date_str, '%Y-%m-%d %H:%M:%S')
            kickoff_datetime = match_dt.isoformat()
            match_date = match_dt.strftime('%Y-%m-%d')
        except:
            kickoff_datetime = match_date_str
            match_date = '2025-10-25'
        
        home_label = breakdown_data.get('home_label', 'Home Team').replace('&#039;', "'")
        away_label = breakdown_data.get('away_label', 'Away Team').replace('&#039;', "'")
        
        # Create match document
        match_doc = {
            '_id': match_id,
            'match_info': {
                'id': match_id,
                'home_team': {
                    'id': breakdown_data.get('home_team_id'),
                    'name': home_label,
                    'logo': None
                },
                'away_team': {
                    'id': breakdown_data.get('away_team_id'),
                    'name': away_label,
                    'logo': None
                },
                'kickoff_time': kickoff_datetime,
                'competition_name': 'League 726',
                'home_score': breakdown_data.get('home_team_score', 0),
                'away_score': breakdown_data.get('away_team_score', 0),
                'status': 'Finished',
                'stadium': None,
                'match_date': match_date,
                'pixellot_id': 'https://dn3dopmbo1yw3.cloudfront.net/ifaLeagues/68f7f50964d66d80d7584b32/venue_hls/pano_hls/pano_hls.m3u8'
            },
            'lineups': lineups,
            'events': events,
            'breakdown_data': {
                'first_half_start': breakdown_data.get('first_half_start'),
                'second_half_start': breakdown_data.get('second_half_start')
            }
        }
        
        # Upsert (update or insert)
        matches_collection.update_one(
            {'_id': match_id},
            {'$set': match_doc},
            upsert=True
        )
        print(f"Updated match 1061429 with breakdown data and {len(events)} events")
    
    print(f"\nTotal matches in database: {matches_collection.count_documents({})}")

if __name__ == '__main__':
    print("Starting database population...")
    populate_matches()
    print("\nDatabase population complete!")
