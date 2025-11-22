import os
from dotenv import load_dotenv

from flask import Flask
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS for all routes and origins
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    app.config.from_mapping(
        SECRET_KEY='dev',
        MONGO_URI=os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'),
        MONGO_DB_NAME=os.environ.get('MONGO_DB_NAME', 'football_app'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initialize database
    from . import db
    db.init_app(app)

    # Register blueprints (controllers)
    from .controllers.matches import bp as matches_bp
    from .controllers.players import bp as players_bp
    app.register_blueprint(matches_bp)
    app.register_blueprint(players_bp)

    return app