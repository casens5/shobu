from app.game.engine import GameState


def test_game_initialization():
    state = GameState.initial_state()

    assert len(state.boards) == 4, "Expected 4 boards"
    # assert state.boards[0][2] == 0, "Expected 4 boards"
    # assert state.boards[0][2] == 0, "Expected 4 boards"
    assert state.winner is None, "No winner at the start of the game"
    assert state.player_turn is 0, "black (0) starts the game"


# def test_legal_passive_move():
#    game = Game()
#
#    if game.player_turn == 2:
#        game.change_turn()
#
#    direction = Direction(cardinal=cardinal_to_index("s"), length=1)
#
#    passive = BoardMove(board=0, origin=0, destination=4)
#    active = BoardMove(board=2, origin=1, destination=5)
#
#    move = Move(passive=passive, active=active, direction=direction)
#
#    try:
#        game.play_move(move)
#    except GameError as e:
#        pytest.fail(f"Move should be legal, but raised GameError: {e}")
#
#    assert game.boards[0][0] is None, "Origin should be empty after the move"
#    assert game.boards[0][4] == 1, "Destination should now have black stone"
#
#    assert game.boards[2][1] is None, "Active origin should be empty after the move"
#    assert game.boards[2][5] == 1, "Active destination should have black stone"
#
#    assert game.player_turn == 2, "After black plays, it should be white's turn"
#
#
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
