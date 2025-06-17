from flask import Blueprint, request, jsonify, session
from app.models import db, Game, User

#from app.game.engine import Game as GameLogic, GameError, Move, BoardMove, Direction

game_bp = Blueprint('game', __name__)

#@game_bp.route('/create', methods=['POST'])
#def create_game():
#    user_id = session.get('user_id')
#    if not user_id:
#        return jsonify({'error': 'Unauthorized'}), 401
#
#    new_game_logic = GameLogic()
#    game = Game(
#        boards=new_game_logic.boards,
#        player_turn=1,
#        player1_id=user_id,
#        status='waiting'
#    )
#    db.session.add(game)
#    db.session.commit()
#
#    return jsonify({'message': 'game created', 'game': game.to_dict()}), 201
#
#@game_bp.route('/<int:game_id>', methods=['GET'])
#def get_game_state(game_id):
#    user_id = session.get('user_id')
#    if not user_id:
#        return jsonify({'error': 'unauthorized'}), 401
#        
#    game = db.session.get(Game, game_id)
#    if not game:
#        return jsonify({'error': 'game not found'}), 404
#
#    if user_id not in [game.player1_id, game.player2_id]:
#         return jsonify({'error': 'you are not a player in this game'}), 403
#        
#    return jsonify(game.to_dict())
#
#@game_bp.route('/<int:game_id>/move', methods=['POST'])
#def make_move(game_id):
#    user_id = session.get('user_id')
#    if not user_id:
#        return jsonify({'error': 'unauthorized'}), 401
#
#    game_db = db.session.get(Game, game_id)
#    if not game_db:
#        return jsonify({'error': 'game not found'}), 404
#
#    player_number = 1 if user_id == game_db.player1_id else 2
#    
#    if game_db.status == 'finished':
#        return jsonify({'error': 'game has already finished'}), 400
#    if player_number != game_db.player_turn:
#        return jsonify({'error': "it's not your turn"}), 403
#    
#    data = request.json
#    move_data = data.get('move')
#    if not move_data:
#        return jsonify({'error': 'move data not provided'}), 400
#        
#    game_logic = GameLogic()
#    game_logic.load_game_state(game_db.boards, game_db.player_turn, game_db.winner)
#    
#    try:
#        move = Move(
#            passive=BoardMove(**move_data['passive']),
#            active=BoardMove(**move_data['active']),
#            direction=Direction(**move_data['direction']),
#        )
#        game_logic.play_move(move)
#    except (GameError, ValueError, KeyError, TypeError) as e:
#        return jsonify({'error': f'invalid move: {e}'}), 400
#
#    game_db.boards = game_logic.boards
#    game_db.player_turn = game_logic.player_turn
#    game_db.winner = game_logic.winner
#    if game_db.winner:
#        game_db.status = 'finished'
#
#    db.session.commit()
#    return jsonify({'message': 'move successful', 'game': game_db.to_dict()})
#
