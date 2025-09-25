from app.game.engine import (
    Direction,
    GameEngine,
    GameState,
    cardinal_to_index,
)
import pytest


def test_get_move_direction():
    with pytest.raises(ValueError):
        # error: length is 3
        GameEngine.get_move_direction(0, 15)

    with pytest.raises(Exception):
        # error: no knight moves
        GameEngine.get_move_direction(7, 9)

    assert GameEngine.get_move_direction(12, 8) == Direction(
        cardinal_to_index("n"), 1
    )
    assert GameEngine.get_move_direction(6, 3) == Direction(
        cardinal_to_index("ne"), 1
    )
    assert GameEngine.get_move_direction(5, 7) == Direction(
        cardinal_to_index("e"), 2
    )
    assert GameEngine.get_move_direction(8, 13) == Direction(
        cardinal_to_index("se"), 1
    )
    assert GameEngine.get_move_direction(2, 10) == Direction(
        cardinal_to_index("s"), 2
    )
    assert GameEngine.get_move_direction(7, 13) == Direction(
        cardinal_to_index("sw"), 2
    )
    assert GameEngine.get_move_direction(15, 13) == Direction(
        cardinal_to_index("w"), 2
    )
    assert GameEngine.get_move_direction(7, 2) == Direction(
        cardinal_to_index("nw"), 1
    )


def test_game_initialization():
    state = GameState.initial_state()

    assert len(state.boards) == 4, "expected 4 boards"
    assert len(state.boards[1]) == 16, "expected boards length 16"
    assert state.boards[0][2] == 0, "expected black stone"
    assert state.boards[0][13] == 1, "expected white stone"
    assert state.boards[2][8] is None, "expected empty space"
    assert state.boards[2].count(0) == 4, "expected 4 black stones"
    assert state.boards[0].count(1) == 4, "expected 4 white stones"
    assert state.boards[3].count(None) == 8, "expected 8 empty spaces"
    assert state.winner is None, "no winner at the start of the game"
    assert state.player_turn is 0, "black starts the game"


# def test_is_passive_legal():
# state = GameState.initial_state()
# player = 0
# passive_move = BoardMove(board=0, origin=0, destination=4)


# def test_illegal_passive_move_onto_occupied():
#    game = Game()
#
#    if game.player_turn == 2:
#        game.change_turn()
#
#    game._boards[0] = [
#        1,
#        None,
#        1,
#        1,
#        1,
#        None,
#        None,
#        None,
#        None,
#        None,
#        None,
#        None,
#        2,
#        2,
#        2,
#        2,
#    ]
#
#    direction = Direction(cardinal=cardinal_to_index("s"), length=1)
#
#    passive = BoardMove(board=0, origin=0, destination=4)
#    active = BoardMove(board=2, origin=0, destination=4)
#    move = Move(passive=passive, active=active, direction=direction)
#
#    with pytest.raises(GameError) as exc_info:
#        game.play_move(move)
#
#    assert "can't push stones with the passive move" in str(exc_info.value)
#
#
# def test_active_push_two_stones_illegal():
#    game = Game()
#
#    game.boards[2] = [
#        1,
#        1,
#        1,
#        1,
#        None,
#        2,
#        None,
#        None,
#        None,
#        None,
#        2,
#        None,
#        2,
#        None,
#        None,
#        2,
#    ]
#
#    passive = BoardMove(board=0, origin=0, destination=10)
#    direction = Direction(cardinal=cardinal_to_index("se"), length=2)
#    active = BoardMove(board=2, origin=0, destination=10)
#
#    move = Move(passive=passive, active=active, direction=direction)
#
#    with pytest.raises(GameError) as exc_info:
#        game.play_move(move)
#
#    assert "you can't push 2 stones in a row" in str(exc_info.value)
#
#
# def test_game_winner_check():
#    game = Game()
#    game.boards[0] = [
#        None,
#        None,
#        None,
#        1,
#        None,
#        None,
#        None,
#        1,
#        None,
#        None,
#        None,
#        1,
#        None,
#        None,
#        None,
#        1,
#    ]
#
#    game.check_win()
#    assert (
#        game.winner == 1
#    ), "Black should be declared winner because board[0] has no white stones."
