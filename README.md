# Football Match & Player Management System

A full-stack web application for viewing football matches, lineups, events, and player profiles with interactive features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Data Population](#data-population)
- [Environment Variables](#environment-variables)
- [Assumptions](#assumptions)
- [Bonus Features](#bonus-features)

## ✨ Features

### Mandatory Features
- **Match List** (3.1): View all matches grouped by date with team names, scores, and competition
- **Match Details** (3.2): 
  - Team lineups (starting 11 + substitutes)
  - Match events (goals, yellow cards, red cards) with timestamps
  - Video player integration with Pixellot
  - Click events to jump to video timestamp
- **Player Profile** (3.3):
  - Player information (name, position, team)
  - Career statistics (matches, goals, cards)
  - Skills radar chart visualization
  - Match history table

### Bonus Features Implemented
- ✅ **Editable Player Skills** (Bonus A): Interactive sliders to modify player skills with real-time radar chart updates
- ✅ **Comparison View** (Bonus B): Toggle to compare player skills against league average on radar chart
- 🔧 **Additional Enhancements**:
  - Multi-team tracking (players can play for multiple teams)
  - Real data only (no fake minutes/birthdates shown when unavailable)
  - English names for profiles (better UI alignment)
  - Hebrew names preserved for lineups (authenticity)
  - Custom SVG radar chart (React 19 compatible)

## 🛠 Tech Stack

### Backend
- **Framework**: Flask 3.1.2
- **Database**: MongoDB Atlas
- **API**: EasyCoach IFA API
- **Language**: Python 3.12+

### Frontend
- **Framework**: React 19.2.0
- **Router**: React Router v7
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Language**: TypeScript

## 📁 Project Structure

```
developer-task-football-app/
├── backend/
│   ├── flaskr/
│   │   ├── __init__.py          # Flask app initialization
│   │   ├── db.py                # MongoDB connection
│   │   ├── controllers/         # Route handlers
│   │   │   ├── matches.py       # Match routes
│   │   │   └── players.py       # Player routes
│   │   └── services/            # Business logic layer
│   │       ├── __init__.py      # Service exports
│   │       ├── match_service.py # Match data operations
│   │       └── player_service.py # Player data operations
│   ├── utils/
│   │   ├── populate_db.py       # Populate matches from API
│   │   └── populate_players.py  # Aggregate player data
│   ├── breakdown_game_1061429_league_726.json  # Match data with events
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── TeamLogo.tsx
│   │   │   └── RadarChart.tsx
│   │   ├── pages/               # Route views
│   │   │   ├── Home.tsx
│   │   │   ├── MatchList.tsx
│   │   │   ├── MatchDetails.tsx
│   │   │   └── PlayerDetails.tsx
│   │   ├── services/            # API handlers
│   │   │   ├── api.ts           # Axios config
│   │   │   ├── matchService.ts  # Match API calls
│   │   │   └── playerService.ts # Player API calls
│   │   ├── types/               # TypeScript interfaces
│   │   │   ├── match.ts
│   │   │   ├── player.ts
│   │   │   └── team.ts
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** and npm
- **MongoDB Atlas account** (or local MongoDB)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd developer-task-football-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
MONGO_DB_NAME=football_app

# Flask Configuration
FLASK_APP=flaskr
FLASK_ENV=development
SECRET_KEY=<generate-random-secret-key>

# EasyCoach API
EASYCOACH_API_URL=https://ifa.easycoach.club/en/api/v3/analytics
EASYCOACH_API_TOKEN=<your-api-token>
```

## 🏃 Running the Application

### 1. Populate the Database (First Time Only)

```bash
cd backend

# Step 1: Populate matches collection from API + breakdown JSON
python utils/populate_db.py

# Step 2: Aggregate player data from matches
python utils/populate_players.py
```

**What This Does**:

**Step 1 - `populate_db.py`** creates the **`matches` collection**:
- Fetches 307 matches from EasyCoach API (League 726, Season 26)
- Loads breakdown JSON for match 1061429 with detailed events
- Stores each match with:
  - Match info (teams, scores, date, competition)
  - Lineups (starting 11 + substitutes for both teams)
  - Events (goals, yellow/red cards with video timestamps)
  - Pixellot video URLs

**Step 2 - `populate_players.py`** creates the **`players` collection**:
- Aggregates player data from all match lineups
- Calculates career statistics (total matches, goals, cards, minutes)
- Generates position-based skills (6 attributes for radar chart)
- Tracks match history (opponent, competition, stats per match)
- Supports multi-team tracking (players can play for different teams)

**Expected Output**:
- 308 matches populated in `matches` collection
- 639 unique players populated in `players` collection
- ~11,000+ match appearances tracked

### 2. Start the Backend

```bash
cd backend

# Activate virtual environment if not already active
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Run Flask server
flask run
```

Backend will run on: `http://127.0.0.1:5000`

### 3. Start the Frontend

Open a new terminal:

```bash
cd frontend

# Run development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## 📊 Data Population

### Data Sources

1. **EasyCoach API**: 
   - 307 matches from League 726, Season 26
   - Match details, lineups, team info
   - Hebrew and English player names

2. **Breakdown JSON**: 
   - Match 1061429 with detailed events
   - Real player positions (RW, ST, LCM, etc.)
   - Actual minutes played (game_time)
   - Goal/card events with video timestamps

### Data Processing

- **Matches Collection**: Each match document stored with:
  - Match information (teams, scores, date, competition, stadium)
  - Complete lineups (starting 11 + substitutes for both teams)
  - Player details (names in Hebrew & English, shirt numbers, positions)
  - Events timeline (goals, yellow/red cards with video timestamps)
  - Pixellot video URLs for match playback
  
- **Players Collection**: Player profiles aggregated from all matches with:
  - Career statistics (matches, goals, cards, minutes)
  - Position-based skill generation (6 attributes)
  - Match history with opponent, competition, stats
  - Multi-team tracking

### Real vs. Mocked Data

**Real Data (from API/JSON)**:
- ✅ Match lineups and scores
- ✅ Player names (Hebrew + English)
- ✅ Events (goals, cards with timestamps)
- ✅ Positions for 82 players from breakdown JSON
- ✅ Minutes played for match 1061429 only

**Generated Data** (for app functionality):
- ⚠️ Player skills (6 attributes, position-based ranges)
- ⚠️ Positions marked "Unknown" when not in breakdown JSON

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | Yes |
| `MONGO_DB_NAME` | Database name | Yes |
| `FLASK_APP` | Flask application module | Yes |
| `FLASK_ENV` | Environment (development/production) | No |
| `SECRET_KEY` | Flask secret key for sessions | Yes |
| `EASYCOACH_API_URL` | EasyCoach API base URL | Yes |
| `EASYCOACH_API_TOKEN` | EasyCoach API read-only token | Yes |

### API Credentials

EasyCoach API credentials should be stored in `.env` file:

```env
EASYCOACH_API_URL=https://ifa.easycoach.club/en/api/v3/analytics
EASYCOACH_API_TOKEN=<your-token>
```

The API URL and token are used to fetch match data from EasyCoach IFA API.

## 📝 Assumptions

1. **Database**: MongoDB Atlas used instead of local MongoDB (or MYSQL) for better accessibility
2. **Backend**: Python with Flask instead of PHP CodeIgniter
2. **Player Names**: English names used in profiles for better UI consistency with English labels
3. **Hebrew Lineups**: Hebrew names preserved in match lineups for authenticity
4. **Positions**: Only 82/639 players have real positions from breakdown JSON, others marked "Unknown"
5. **Minutes Played**: Only stored when available (match 1061429), shown as "-" otherwise
6. **Skills**: Generated using position-based logic for radar chart feature
7. **Video URLs**: Pixellot URLs used directly from API, assumed to be publicly accessible
8. **Multi-team Support**: Players can appear for multiple teams across matches

## 🎁 Bonus Features

### ✅ Bonus A: Editable Player Skills
- Interactive range sliders for all 6 skill attributes
- Numeric input fields for precise values (1-10)
- Real-time radar chart updates as skills are edited
- Clean, intuitive UI for skill modification

**Implementation**:
- Component: `PlayerDetails.tsx` lines 163-180
- State management with `editableSkills` state
- Immediate visual feedback on radar chart

### ✅ Bonus B: Comparison with Average
- Toggle button to show/compare player vs average skills
- Overlay visualization with distinct colors (Blue = Player, Orange = Average)
- Average values calculated based on typical player distributions
- Legend showing which polygon represents which data

**Implementation**:
- Component: `RadarChart.tsx` with comparison polygon
- Average skills constant: `AVERAGE_SKILLS`
- Toggle state: `showComparison` in PlayerDetails

### 🔧 Additional Enhancements

1. **Custom SVG Radar Chart**
   - React 19 compatible (recharts incompatible)
   - Native SVG implementation with polar coordinates
   - Value labels on each point
   - Responsive 400x400 canvas

2. **Data Quality Focus**
   - Only real data displayed (no fake minutes/birthdates)
   - Clear indicators when data unavailable ("-")
   - Real positions preserved from breakdown JSON

3. **Multi-team Tracking**
   - Players can play for multiple teams
   - Each match tracks which team player represented
   - Profile shows all teams player has played for

4. **Clean Type System**
   - Centralized TypeScript interfaces in `types/`
   - Separation of `LineupPlayer` vs full `Player`
   - Proper type safety throughout

5. **Component Organization**
   - Reusable `RadarChart` component
   - Clean separation of concerns
   - Props-based composition

## 🐛 Known Limitations

1. **Video Player**: Pixellot URLs come from the API and may require authentication - this is expected behavior from the external video service, but therefore not all of the matches have proper a video. The video player implementation is complete and functional when URLs are accessible.
2. **Positions**: Most players (87%) have "Unknown" position (only GK and breakdown players have real positions)
3. **Skills**: All player skills are position-based mocks (not real data)
4. **Minutes**: Only match 1061429 has real minutes played
5. **API Errors**: Some match IDs return 400 errors from EasyCoach API (handled gracefully)

## 📞 API Endpoints

### Backend Routes

#### Matches
- `GET /matches` - List all matches
- `GET /matches/<match_id>` - Get match details with lineups and events

#### Players
- `GET /players/<player_id>` - Get player profile with stats and match history

### Frontend Routes
- `/` - Match list grouped by date
- `/matches/:matchId` - Match details with lineups, events, and video
- `/players/:playerId` - Player profile with skills and match history


## 📦 Dependencies

### Backend (requirements.txt)
- Flask==3.1.2
- pymongo==4.10.1
- python-dotenv==1.0.1
- requests==2.32.3
- flask-cors==5.0.0

### Frontend (package.json)
- react==19.2.0
- react-router-dom==7.1.1
- axios==1.7.9
- tailwindcss==3.4.17
- typescript==5.6.2
- vite==6.0.5

---

**Built By Yonatan Dudai- for EasyCoach Developer Task**
