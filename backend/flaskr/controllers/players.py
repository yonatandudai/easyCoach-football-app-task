"""Players controller for handling player-related endpoints."""
from flask import Blueprint, jsonify
from ..db import get_db
from ..services import PlayerService

bp = Blueprint('players', __name__, url_prefix='/players')


@bp.route('/<string:player_id>', methods=['GET'])
def get_player_details(player_id):
    """
    GET /players/<player_id>
    Fetch details for a specific player from MongoDB.
    """
    db = get_db()
    player_service = PlayerService(db)
    
    player = player_service.get_player_by_id(player_id)
    
    if not player:
        return jsonify({'error': f'Player {player_id} not found'}), 404
    
    return jsonify(player), 200
