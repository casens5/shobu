import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from datetime import timedelta

from flask_migrate import Migrate
from config import Config
from .models import db


def create_app():
    app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
    app.config.from_object(Config)
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=24)

    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    db.init_app(app)
    Migrate(app, db)

    from .api.auth import auth_bp
    from .api.game import game_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(game_bp, url_prefix="/api/game")

    with app.app_context():
        db.create_all()

    @app.errorhandler(404)
    def not_found(e):
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        static_folder = app.static_folder
        if path != "" and os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        else:
            return send_from_directory(static_folder, "index.html")

    return app
