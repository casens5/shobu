import numpy as np
import re
from dataclasses import dataclass, replace
from typing import List, Optional, Literal, NamedTuple, Union
from copy import deepcopy

PlayerColorType = Literal["black", "white"]
PlayerNumberType = Literal[0, 1]
MoveLengthType = Literal[1, 2]
CoordinateType = Literal[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
BoardNumberType = Literal[0, 1, 2, 3]
BoardLetterType = Literal["a", "b", "c", "d"]
CardinalLetterType = Literal["n", "ne", "e", "se", "s", "sw", "w", "nw"]
CardinalNumberType = Literal[0, 1, 2, 3, 4, 5, 6, 7]
BoardType = List[Optional[PlayerNumberType]]
BoardsType = List[BoardType]

# from .monte_carlo_ai import MonteCarloAI


LETTER_TO_INDEX = {"a": 0, "b": 1, "c": 2, "d": 3}
INDEX_TO_LETTER = {v: k for k, v in LETTER_TO_INDEX.items()}

CARDINAL_TO_INDEX = {"n": 0, "ne": 1, "e": 2, "se": 3, "s": 4, "sw": 5, "w": 6, "nw": 7}
INDEX_TO_CARDINAL = {v: k for k, v in CARDINAL_TO_INDEX.items()}


def board_letter_to_index(letter: BoardLetterType) -> BoardNumberType:
    return LETTER_TO_INDEX[letter.lower()]  # type: ignore


def index_to_board_letter(index: BoardNumberType) -> BoardLetterType:
    return INDEX_TO_LETTER[index]  # type: ignore


def cardinal_to_index(cardinal: CardinalLetterType) -> CardinalNumberType:
    return CARDINAL_TO_INDEX[cardinal.lower()]  # type: ignore


def index_to_cardinal(index: CardinalNumberType) -> CardinalLetterType:
    return INDEX_TO_CARDINAL[index]  # type: ignore


def player_color_to_number(player_color: PlayerColorType) -> PlayerNumberType:
    return 0 if player_color == "black" else 1


def player_number_to_color(player_number: PlayerNumberType) -> PlayerColorType:
    return "black" if player_number == 0 else "white"


@dataclass(frozen=True)
class BoardMove:
    board: BoardNumberType
    origin: CoordinateType
    destination: CoordinateType
    is_push: Optional[bool] = None
    push_destination: Optional[CoordinateType] = None

    def __repr__(self) -> str:
        return (
            "BoardMove(\n"
            f"  board=            {repr(self.board)},\n"
            f"  origin=           {repr(self.origin)},\n"
            f"  destination=      {repr(self.destination)},\n"
            f"  is_push=          {repr(self.is_push)},\n"
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
    passive: BoardMove
    active: BoardMove
    direction: Direction

    def __repr__(self) -> str:
        return (
            "Move(\n"
            f"  passive=\n{repr(self.passive)},\n"
            f"  active=\n{repr(self.active)},\n"
            f"  direction=\n{repr(self.direction)}\n"
            ")"
        )


@dataclass(frozen=True)
class GameState:
    boards: BoardsType
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
        return cls(boards=boards, player_turn=0)


# Actions
@dataclass(frozen=True)
class PlayMoveAction:
    move: Move


@dataclass(frozen=True)
class RestartAction:
    pass


@dataclass(frozen=True)
class QuitAction:
    pass


@dataclass(frozen=True)
class ReadAction:
    pass


ActionType = Union[PlayMoveAction, RestartAction, QuitAction, ReadAction]


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
    def apply_action(state: GameState, action: ActionType) -> GameResult:
        if isinstance(action, QuitAction):
            return GameResult(state=state, should_quit=True)

        elif isinstance(action, RestartAction):
            return GameResult(state=GameState.initial_state(), message="game restarted")

        elif isinstance(action, ReadAction):
            return GameResult(state=state, message=GameEngine._format_game_state(state))

        elif isinstance(action, PlayMoveAction):
            return GameEngine._apply_move(state, action.move)

        else:
            raise ValueError(f"unknown action type: {type(action)}")

    @staticmethod
    def _apply_move(state: GameState, move: Move) -> GameResult:
        if state.winner is not None:
            return GameResult(
                state=state, message="game is already over. use restart to play again"
            )

        enhanced_move = GameEngine._enhance_move_with_push_info(move, state.boards)

        is_legal, reason = GameEngine._is_move_legal(
            enhanced_move, state.boards, state.player_turn
        )
        if not is_legal:
            return GameResult(state=state, message=reason)

        new_boards = GameEngine._update_boards(
            state.boards, enhanced_move, state.player_turn
        )
        winner = GameEngine._check_winner(new_boards)
        new_turn = (state.player_turn + 1) % 2  # type: ignore

        new_state = GameState(boards=new_boards, player_turn=new_turn, winner=winner)

        message = GameEngine._format_game_state(new_state)
        if winner is not None:
            message += f"\n{player_number_to_color(winner)} wins"

        return GameResult(state=new_state, message=message)

    @staticmethod
    def _enhance_move_with_push_info(move: Move, boards: BoardsType) -> Move:
        if GameEngine._is_move_push(move.active, move.direction.length, boards):
            push_destination = GameEngine._get_move_destination(
                move.active.origin,
                move.direction.cardinal,
                move.direction.length + 1,  # type: ignore
            )

            enhanced_active = replace(
                move.active, is_push=True, push_destination=push_destination
            )
            return replace(move, active=enhanced_active)

        return move

    @staticmethod
    def _is_move_legal(
        move: Move, boards: BoardsType, player: PlayerNumberType
    ) -> ValidationResult:
        is_legal, reason = GameEngine._is_passive_legal(
            move.passive, move.direction, boards, player
        )
        if not is_legal:
            return ValidationResult(is_legal, reason)

        is_legal, reason = GameEngine._is_active_legal(
            move.active, move.passive, move.direction, boards, player
        )
        return ValidationResult(is_legal, reason)

    @staticmethod
    def _is_passive_legal(
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
            GameEngine._get_move_midpoint(passive_move.origin, passive_move.destination)
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
    def _is_active_legal(
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

        if active_move.is_push:
            stones = int(bool(boards[active_move.board][active_move.destination]))

            midpoint = None
            if direction.length == 2:
                midpoint = GameEngine._get_move_midpoint(
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
    def _is_move_push(
        move: BoardMove, length: MoveLengthType, boards: BoardsType
    ) -> bool:
        if length == 2:
            midpoint = GameEngine._get_move_midpoint(move.origin, move.destination)
            if boards[move.board][midpoint] is not None:
                return True
        if boards[move.board][move.destination] is not None:
            return True
        return False

    @staticmethod
    def _get_move_midpoint(
        origin: CoordinateType, destination: CoordinateType
    ) -> CoordinateType:
        return origin + ((destination - origin) // 2)  # type: ignore

    @staticmethod
    def _get_move_destination(
        origin: CoordinateType, direction: CoordinateType, length: Literal[1, 2, 3]
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
            return (y * 4) + x  # type: ignore

    @staticmethod
    def _update_boards(
        boards: BoardsType, move: Move, player: PlayerNumberType
    ) -> BoardsType:
        new_boards = deepcopy(boards)

        new_boards[move.passive.board][move.passive.origin] = None
        new_boards[move.passive.board][move.passive.destination] = player
        new_boards[move.active.board][move.active.origin] = None
        new_boards[move.active.board][move.active.destination] = player

        if move.active.is_push:
            opponent = 1 if player == 0 else 0
            if move.active.push_destination is not None:
                new_boards[move.active.board][move.active.push_destination] = opponent
            if move.direction.length == 2:
                midpoint = GameEngine._get_move_midpoint(
                    move.active.origin, move.active.destination
                )
                new_boards[move.active.board][midpoint] = None

        return new_boards

    @staticmethod
    def _check_winner(boards: BoardsType) -> Optional[PlayerNumberType]:
        if any(1 not in board for board in boards):
            return 0
        elif any(0 not in board for board in boards):
            return 1
        return None

    @staticmethod
    def _format_game_state(state: GameState) -> str:
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


class InputParser:
    @staticmethod
    def parse_command(command: str) -> ActionType:
        command = command.strip().lower()

        if command in ["quit", "q", ":q"]:
            return QuitAction()
        elif command == "read":
            return ReadAction()
        elif command == "restart":
            return RestartAction()
        else:
            # Try to parse as move
            move = InputParser._parse_move(command)
            return PlayMoveAction(move=move)

    @staticmethod
    def _parse_move(command: str) -> Move:
        move_pattern = r"""
            ^                         
            ([a-d])               
            (\d{1,2})               
            (n|nw|w|sw|s|se|e|ne)     
            ([1-2])
            [,\s]+               
            ([a-d])          
            (\d{1,2})          
            .*                
            $                         
        """

        move_regex = re.compile(move_pattern, re.VERBOSE | re.IGNORECASE)
        match = move_regex.match(command)

        if not match:
            raise GameError(f"i don't understand input: {command}")

        groups = match.groups()

        passive_origin = int(groups[1]) - 1
        active_origin = int(groups[5]) - 1

        if not (0 <= passive_origin <= 15):
            raise GameError(
                f"passive move must be between 1 and 16 inclusive, got {groups[1]}"
            )
        if not (0 <= active_origin <= 15):
            raise GameError(
                f"active move must be between 1 and 16 inclusive, got {groups[5]}"
            )

        direction = Direction(
            cardinal=cardinal_to_index(groups[2]), length=int(groups[3])  # type: ignore
        )

        passive_dest = GameEngine._get_move_destination(
            passive_origin, direction.cardinal, direction.length
        )
        active_dest = GameEngine._get_move_destination(
            active_origin, direction.cardinal, direction.length
        )

        if passive_dest is None:
            raise GameError(f"passive move destination is out of bounds")
        if active_dest is None:
            raise GameError(f"active move destination is out of bounds")

        return Move(
            passive=BoardMove(
                board=board_letter_to_index(groups[0]),
                origin=passive_origin,
                destination=passive_dest,
            ),
            active=BoardMove(
                board=board_letter_to_index(groups[4]),
                origin=active_origin,
                destination=active_dest,
            ),
            direction=direction,
        )


# for testing
def run_terminal_game():
    state = GameState.initial_state()
    print(GameEngine._format_game_state(state))
    print("enter 'quit' to exit, 'read' to see board, 'restart' to restart")

    while True:
        try:
            user_input = input("~> ").strip()
            action = InputParser.parse_command(user_input)
            result = GameEngine.apply_action(state, action)

            if result.message:
                print(result.message)

            if result.should_quit:
                print("exiting...")
                break

            state = result.state

        except GameError as e:
            print(f"error: {e}")
        except KeyboardInterrupt:
            print("\nexiting...")
            break
        except Exception as e:
            print(f"unexpected error: {e}")


if __name__ == "__main__":
    run_terminal_game()
