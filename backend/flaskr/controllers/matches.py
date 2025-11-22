"""Matches controller for handling match-related endpoints."""
from flask import Blueprint, jsonify
from ..db import get_db
from ..services import MatchService

bp = Blueprint('matches', __name__, url_prefix='/matches')


@bp.route('', methods=['GET'])
def get_matches():
    """
    GET /matches
    Fetch and return matches from MongoDB grouped by match day.
    """
    db = get_db()
    match_service = MatchService(db)
    
    matches_by_day = match_service.get_all_matches()
    
    return jsonify({'matches_by_day': matches_by_day}), 200


@bp.route('/<string:match_id>', methods=['GET'])
def get_match_details(match_id):
    """
    GET /matches/<match_id>
    Fetch details for a specific match from MongoDB.
    """
    db = get_db()
    match_service = MatchService(db)
    
    match = match_service.get_match_by_id(match_id)
    
    if not match:
        return jsonify({'error': f'Match {match_id} not found'}), 404
    
    return jsonify(match), 200
