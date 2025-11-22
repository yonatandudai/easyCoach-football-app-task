from pymongo import MongoClient
from flask import current_app, g


def get_db():
    """Get MongoDB database connection."""
    if 'db' not in g:
        client = MongoClient(current_app.config['MONGO_URI'])
        g.db = client[current_app.config['MONGO_DB_NAME']]
    return g.db


def close_db(e=None):
    """Close MongoDB connection."""
    db = g.pop('db', None)
    if db is not None:
        db.client.close()


def init_app(app):
    """Initialize database with app."""
    app.teardown_appcontext(close_db)
