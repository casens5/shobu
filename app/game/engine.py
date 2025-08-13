import numpy as np
from dataclasses import dataclass, replace
from typing import Optional, Literal, NamedTuple, cast
from copy import deepcopy
from app.game.types import (
    PlayerColorType,
    PlayerNumberType,
    MoveLengthType,
    CoordinateType,
    BoardNumberType,
    BoardLetterType,
    CardinalLetterType,
    CardinalNumberType,
    BoardsType,
)


LETTER_TO_INDEX = {"a": 0, "b": 1, "c": 2, "d": 3}
INDEX_TO_LETTER = {v: k for k, v in LETTER_TO_INDEX.items()}

CARDINAL_TO_INDEX = {"n": 0, "ne": 1, "e": 2, "se": 3, "s": 4, "sw": 5, "w": 6, "nw": 7}
INDEX_TO_CARDINAL = {v: k for k, v in CARDINAL_TO_INDEX.items()}


def board_letter_to_index(letter: BoardLetterType):
    return cast(BoardNumberType, LETTER_TO_INDEX[letter.lower()])


def index_to_board_letter(index: BoardNumberType):
    return cast(BoardLetterType, INDEX_TO_LETTER[index])


def cardinal_to_index(cardinal: CardinalLetterType):
    return cast(CardinalNumberType, CARDINAL_TO_INDEX[cardinal.lower()])


def index_to_cardinal(index: CardinalNumberType):
    return cast(CardinalLetterType, INDEX_TO_CARDINAL[index])


def player_color_to_number(player_color: PlayerColorType) -> PlayerNumberType:
    return 0 if player_color == "black" else 1


def player_number_to_color(player_number: PlayerNumberType) -> PlayerColorType:
    return "black" if player_number == 0 else "white"


@dataclass(frozen=True)
class BoardMove:
    board: BoardNumberType
    origin: CoordinateType
    destination: CoordinateType
    push_destination: Optional[CoordinateType] = None

    def __repr__(self) -> str:
        return (
            "BoardMove(\n"
            f"  board=            {repr(self.board)},\n"
            f"  origin=           {repr(self.origin)},\n"
            f"  destination=      {repr(self.destination)},\n"
            f"  push_destination= {repr(self.push_destination)},\n"
            ")"
        )

    def __post_init__(self):
        if not (0 <= self.board <= 3):
            raise ValueError(f"board must be between 0 and 3, got {self.board}")

        if not (0 <= self.origin <= 15):
            raise ValueError(f"origin must be between 0 and 15, got {self.origin}")

        if not (0 <= self.destination <= 15):
            raise ValueError(
                f"destination must be between 0 and 15, got {self.destination}"
            )

        ### this is being annoying
        #
        # if not (0 <= self.push_destination <= 15):
        #    raise ValueError(
        #        f"push_destination must be between 0 and 15, got {self.push_destination}"
        #    )


@dataclass(frozen=True)
class Direction:
    cardinal: CardinalNumberType
    length: MoveLengthType

    def __repr__(self) -> str:
        return (
            "Direction(\n"
            f"  cardinal= {repr(self.cardinal)},\n"
            f"  length=   {repr(self.length)},\n"
            ")"
        )

    def __post_init__(self):
        if not (0 <= self.cardinal <= 7):
            raise ValueError(f"cardinal must be between 0 and 7, got {self.cardinal}")

        if not (1 <= self.length <= 2):
            raise ValueError(f"length must be 1 or 2, got {self.length}")


@dataclass(frozen=True)
class Move:
    player: PlayerNumberType
    passive: BoardMove
    active: BoardMove
    direction: Direction

    def __repr__(self) -> str:
        return (
            "Move(\n"
            f"  player=\n{repr(self.player)},\n"
            f"  passive=\n{repr(self.passive)},\n"
            f"  active=\n{repr(self.active)},\n"
            f"  direction=\n{repr(self.direction)}\n"
            ")"
        )


class Boards(list):
    def __init__(self, boards: BoardsType):
        super().__init__(boards)

    def __repr__(self) -> str:
        result = []
        for i, board in enumerate(self):
            if i > 0:
                result.append("")  # empty line between boards

            # convert board to 4x4 grid
            for row in range(4):
                row_chars = []
                for col in range(4):
                    idx = row * 4 + col
                    cell = board[idx]
                    if cell is None:
                        row_chars.append(".")
                    else:
                        row_chars.append(str(cell))
                result.append(" ".join(row_chars))

        return "\n".join(result)


@dataclass(frozen=True)
class GameState:
    boards: Boards
    player_turn: PlayerNumberType
    winner: Optional[PlayerNumberType] = None

    @classmethod
    def initial_state(cls) -> "GameState":
        boards = [
            [0, 0, 0, 0, None, None, None, None, None, None, None, None, 1, 1, 1, 1],
            [0, 0, 0, 0, None, None, None, None, None, None, None, None, 1, 1, 1, 1],
            [0, 0, 0, 0, None, None, None, None, None, None, None, None, 1, 1, 1, 1],
            [0, 0, 0, 0, None, None, None, None, None, None, None, None, 1, 1, 1, 1],
        ]
        return cls(boards=Boards(boards), player_turn=0)


class ValidationResult(NamedTuple):
    is_legal: bool
    message: Optional[str]


@dataclass(frozen=True)
class GameResult:
    state: GameState
    message: Optional[str] = None
    should_quit: bool = False


class GameError(Exception):
    pass


class GameEngine:
    @staticmethod
    def apply_move(state: GameState, input_move: Move) -> GameResult:
        if state.winner is not None:
            return GameResult(
                state=state, message="game is already over. use start to play again"
            )

        move = GameEngine.enhance_move_with_push_info(input_move, state.boards)

        is_legal, reason = GameEngine.is_move_legal(
            move, state.boards, state.player_turn
        )
        if not is_legal:
            return GameResult(state=state, message=reason)

        new_boards = GameEngine.update_boards(state.boards, move, state.player_turn)
        winner = GameEngine.check_winner(new_boards)
        new_turn = (state.player_turn + 1) % 2

        new_state = GameState(boards=new_boards, player_turn=new_turn, winner=winner)

        message = GameEngine.format_game_state(new_state)
        if winner is not None:
            message += f"\n{player_number_to_color(winner)} wins"

        return GameResult(state=new_state, message=message)

    @staticmethod
    def enhance_move_with_push_info(move: Move, boards: BoardsType) -> Move:
        direction = GameEngine.get_move_direction(
            move.passive.origin, move.passive.destination
        )
        if GameEngine.is_move_push(move.active, boards):
            push_destination = GameEngine.get_destination_coordinate(
                move.active.origin,
                direction.cardinal,
                direction.length + 1,
            )

            enhanced_active = replace(move.active, push_destination=push_destination)
            return replace(move, active=enhanced_active)

        return move

    @staticmethod
    def is_move_legal(
        move: Move, boards: BoardsType, player: PlayerNumberType
    ) -> ValidationResult:
        is_legal, reason = GameEngine.is_passive_legal(
            move.passive, move.direction, boards, player
        )
        if not is_legal:
            return ValidationResult(is_legal, reason)

        is_legal, reason = GameEngine.is_active_legal(
            move.active, move.passive, move.direction, boards, player
        )
        return ValidationResult(is_legal, reason)

    @staticmethod
    def is_passive_legal(
        passive_move: BoardMove,
        direction: Direction,
        boards: BoardsType,
        player: PlayerNumberType,
    ) -> ValidationResult:
        if (player == 1 and passive_move.board < 2) or (
            player == 0 and passive_move.board > 1
        ):
            if player == 0:
                home_boards = ["a", "b"]
            else:
                home_boards = ["c", "d"]
            reason = f"the passive (first) move must be in one of your home boards.  player is {player_number_to_color(player)}, home boards are {home_boards}"
            return ValidationResult(False, reason)

        if boards[passive_move.board][passive_move.origin] is None:
            board_letter = index_to_board_letter(passive_move.board)
            reason = f"no stone exists on {board_letter}{passive_move.origin + 1}"
            return ValidationResult(False, reason)

        if boards[passive_move.board][passive_move.origin] is not player:
            board_letter = index_to_board_letter(passive_move.board)
            reason = f"{board_letter}{passive_move.origin + 1} does not belong to {player_number_to_color(player)}"
            return ValidationResult(False, reason)

        midpoint = (
            GameEngine.get_move_midpoint(passive_move.origin, passive_move.destination)
            if direction.length == 2
            else None
        )

        if boards[passive_move.board][passive_move.destination] is not None or (
            midpoint is not None and boards[passive_move.board][midpoint] is not None
        ):
            reason = "you can't push stones with the passive move"
            return ValidationResult(False, reason)

        return ValidationResult(True, None)

    @staticmethod
    def is_active_legal(
        active_move: BoardMove,
        passive_move: BoardMove,
        direction: Direction,
        boards: BoardsType,
        player: PlayerNumberType,
    ) -> ValidationResult:
        if passive_move.board == active_move.board:
            reason = "active and passive moves must be on different boards"
            return ValidationResult(False, reason)

        if (passive_move.board + active_move.board) == 3:
            reason = "active and passive moves can't be on the same color"
            return ValidationResult(False, reason)

        if boards[active_move.board][active_move.origin] is None:
            board_letter = index_to_board_letter(active_move.board)
            reason = f"no stone exists on {board_letter}{active_move.origin + 1}"
            return ValidationResult(False, reason)

        if boards[active_move.board][active_move.origin] is not player:
            board_letter = index_to_board_letter(active_move.board)
            reason = f"{board_letter}{active_move.origin + 1} does not belong to {player_number_to_color(player)}"
            return ValidationResult(False, reason)

        if active_move.push_destination is not None:
            stones = int(bool(boards[active_move.board][active_move.destination]))

            midpoint = None
            if direction.length == 2:
                midpoint = GameEngine.get_move_midpoint(
                    active_move.origin, active_move.destination
                )
                stones += int(bool(boards[active_move.board][midpoint]))

            if active_move.push_destination is not None:
                stones += int(
                    bool(boards[active_move.board][active_move.push_destination])
                )

            if stones > 1:
                reason = "you can't push 2 stones in a row"
                return ValidationResult(False, reason)

            if (
                midpoint is not None and boards[active_move.board][midpoint] == player
            ) or boards[active_move.board][active_move.destination] == player:
                reason = "you can't push your own color stones"
                return ValidationResult(False, reason)

        return ValidationResult(True, None)

    @staticmethod
    def is_move_push(move: BoardMove, boards: BoardsType) -> bool:
        direction = GameEngine.get_move_direction(move.origin, move.destination)
        if direction.length == 2:
            midpoint = GameEngine.get_move_midpoint(move.origin, move.destination)
            if boards[move.board][midpoint] is not None:
                return True
        if boards[move.board][move.destination] is not None:
            return True
        return False

    @staticmethod
    def get_move_midpoint(
        origin: CoordinateType, destination: CoordinateType
    ) -> CoordinateType:
        midpoint = origin + ((destination - origin) // 2)
        return cast(CoordinateType, midpoint)

    # length is Literal[1, 2, 3] so that this function can also calculate a push coordinate
    @staticmethod
    def get_destination_coordinate(
        origin: CoordinateType, direction: CardinalNumberType, length: Literal[1, 2, 3]
    ) -> Optional[CoordinateType]:
        x = origin % 4
        y = origin // 4

        if direction == 7 or direction < 2:
            y -= length
        if direction > 2 and direction < 6:
            y += length
        if direction > 4:
            x -= length
        if direction > 0 and direction < 4:
            x += length

        if x < 0 or y < 0 or x > 3 or y > 3:
            # out of bounds
            return None
        else:
            return cast(CoordinateType, (y * 4) + x)

    @staticmethod
    def get_move_direction(origin: CoordinateType, destination: CoordinateType):
        origin_x = origin % 4
        origin_y = origin // 4
        destination_x = destination % 4
        destination_y = destination // 4
        x_move = abs(origin_x - destination_x)
        y_move = abs(origin_y - destination_y)
        move_length = max(x_move, y_move)

        if (x_move == 0 and y_move == 0) or (
            x_move > 0 and y_move > 0 and x_move != y_move
        ):
            # only allow pure othogonal / diagonal moves
            raise Exception(
                f"invalid direction: origin: {origin}, destination: {destination}"
            )

        cardinal = 0
        if origin_x == destination_x:
            if origin_y < destination_y:
                cardinal = 0  # north
            if origin_y > destination_y:
                cardinal = 4  # south
        if origin_y == destination_y:
            if origin_x < destination_x:
                cardinal = 2  # east
            if origin_x > destination_x:
                cardinal = 6  # west
        if origin_x < destination_x:
            if origin_y < destination_y:
                cardinal = 1  # north-east
            if origin_y > destination_y:
                cardinal = 3  # south-east
        if origin_x > destination_x:
            if origin_y > destination_y:
                cardinal = 5  # south-west
            if origin_y < destination_y:
                cardinal = 7  # north-west

        # offset by 10, dicts can't have negative indicies
        # move_diff = origin - destination + 10
        # direction_dict = {
        #     14: 0,
        #     18: 0,
        #     13: 1,
        #     16: 1,
        #     9: 2,
        #     8: 2,
        #     5: 3,
        #     0: 3,
        #     2: 4,
        #     6: 4,
        #     7: 5,
        #     4: 5,
        #     11: 6,
        #     12: 6,
        #     15: 7,
        #     20: 7,
        # }
        # cardinal=direction_dict[move_diff]

        # if (
        #    (x_move == 0 and y_move == 0)
        #    or (x_move > 0 and y_move > 0 and x_move != y_move)
        #    or direction_dict[move_diff] == None
        # ):
        #    # only allow pure othogonal / diagonal moves
        #    raise Exception(
        #        f"invalid direction: origin: {origin}, destination: {destination}"
        #    )

        return Direction(
            cardinal=cast(CardinalNumberType, cardinal),
            length=cast(MoveLengthType, move_length),
        )

    @staticmethod
    def update_boards(
        boards: BoardsType, move: Move, player: PlayerNumberType
    ) -> Boards:
        new_boards = deepcopy(boards)

        new_boards[move.passive.board][move.passive.origin] = None
        new_boards[move.passive.board][move.passive.destination] = player
        new_boards[move.active.board][move.active.origin] = None
        new_boards[move.active.board][move.active.destination] = player

        if move.active.push_destination is not None:
            opponent = 1 if player == 0 else 0
            if move.active.push_destination is not None:
                new_boards[move.active.board][move.active.push_destination] = opponent
            if move.direction.length == 2:
                midpoint = GameEngine.get_move_midpoint(
                    move.active.origin, move.active.destination
                )
                new_boards[move.active.board][midpoint] = None

        return Boards(new_boards)

    @staticmethod
    def check_winner(boards: BoardsType) -> Optional[PlayerNumberType]:
        if any(1 not in board for board in boards):
            return 0
        elif any(0 not in board for board in boards):
            return 1
        else:
            return None

    @staticmethod
    def format_game_state(state: GameState) -> str:
        value_to_symbol = {None: ".", 0: "X", 1: "O"}

        grids = [np.array(row).reshape(4, 4) for row in state.boards]
        grid_layout = np.array(grids).reshape(2, 2, 4, 4)

        output = ["\n"]
        for row in grid_layout:
            for i in range(4):
                line = "    ".join(
                    " ".join(value_to_symbol.get(cell, ".") for cell in grid[i])
                    for grid in row
                )
                output.append(line)
            output.append("")

        output.append(f"{player_number_to_color(state.player_turn)}'s turn")
        return "\n".join(output)
