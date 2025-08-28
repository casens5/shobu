from flask import Blueprint

from .auth import auth_bp
from .game import game_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(game_bp, url_prefix="/game")
