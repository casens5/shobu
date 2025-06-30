from flask import Blueprint, request, jsonify, session
from app.models import db, Game

from app.game.engine import (
    GameEngine,
    GameState,
    GameError,
    Move,
    BoardMove,
    get_move_direction,
    PlayMoveAction,
)

game_bp = Blueprint("game", __name__)


def parse_api_move(input):
    passive_move = input["passiveMove"]
    active_move = input["activeMove"]
    direction = get_move_direction(
        passive_move["origin"],
        passive_move["destination"],
    )

    move = Move(
        player=input["playerColor"],
        passive=BoardMove(
            board=passive_move["boardId"],
            origin=passive_move["origin"],
            destination=passive_move["destination"],
        ),
        active=BoardMove(
            board=active_move["boardId"],
            origin=active_move["origin"],
            destination=active_move["destination"],
        ),
        direction=direction,
    )
    return PlayMoveAction(move=move)


@game_bp.route("/<int:game_id>/move", methods=["POST"])
def make_move(game_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    game_db = db.session.get(Game, game_id)
    if not game_db:
        return jsonify({"error": "game not found"}), 404

    if user_id not in [game_db.player1_id, game_db.player2_id]:
        return jsonify({"error": "not a player in this game"}), 403

    player_number = 0 if user_id == game_db.player1_id else 1

    current_state = GameState(
        boards=game_db.boards, player_turn=game_db.player_turn, winner=game_db.winner
    )

    if current_state.winner is not None:
        return jsonify({"error": "game finished"}), 400

    if current_state.player_turn != player_number:
        return jsonify({"error": "not your turn"}), 403

    data = request.get_json()
    if not data or "move" not in data:
        return jsonify({"error": "move data required"}), 400

    try:
        move = parse_api_move(data["move"])
        result = GameEngine.apply_action(current_state, move)
        new_state = result.state

        game_db.boards = new_state.boards
        game_db.player_turn = new_state.player_turn
        game_db.winner = new_state.winner
        if new_state.winner is not None:
            game_db.status = "finished"

        db.session.commit()

        return jsonify(
            {
                "message": "move processed",
                "game_state": {
                    "boards": new_state.boards,
                    "player_turn": new_state.player_turn,
                    "winner": new_state.winner,
                },
            }
        )

    except GameError as e:
        print("bad error", e)
        return jsonify({"error": f"invalid move: {str(e)}"}), 400
    except Exception as e:
        print("horrible error", e)
        db.session.rollback()
        return jsonify({"error": "move processing failed"}), 500


@game_bp.route("/create", methods=["POST"])
def create_game():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}
    opponent_type = data.get("opponent", "human")

    initial_state = GameState.initial_state()

    game = Game(
        player1_id=user_id,
        player2_id=(
            None if opponent_type == "ai" else None
        ),  # set to AI_PLAYER_ID constant
        boards=initial_state.boards,
        player_turn=initial_state.player_turn,
        status="active",
        is_human_vs_ai=opponent_type == "ai",
        moves=[],
    )

    db.session.add(game)
    db.session.commit()

    return (
        jsonify(
            {
                "message": "game created",
                "game_id": game.id,
                "player1_id": game.player1_id,
                "player2_id": game.player2_id,
                "is_human_vs_ai": game.is_human_vs_ai,
                "game_state": {"boards": game.boards, "player_turn": game.player_turn},
            }
        ),
        201,
    )
