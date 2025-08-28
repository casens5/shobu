import sys
import re
from pathlib import Path
from typing import cast
from app.game.engine import (
    GameState,
    GameEngine,
    BoardMove,
    GameResult,
    GameError,
    Move,
    Direction,
    board_letter_to_index,
    cardinal_to_index,
    player_number_to_color,
)
from app.game.types import (
    BoardLetterType,
    CardinalLetterType,
    CoordinateType,
    MoveLengthType,
    PlayerNumberType,
)
from app.game.ai.rando import RandoAI

project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


@staticmethod
def format_game_state(state: GameState) -> str:
    output = [repr(state.boards)]

    output.append(f"{player_number_to_color(state.player_turn)}'s turn")
    return "\n".join(output)


class InputParser:
    @staticmethod
    def parse_command(
        command: str, player: PlayerNumberType, state: GameState
    ) -> GameResult:
        command = command.strip().lower()

        if command in ["quit", "q", ":q"]:
            return GameResult(state=state, game_end="INCOMPLETE")
        elif command == "read":
            return GameResult(state=state, message=format_game_state(state))
        elif command == "start":
            return GameResult(
                state=GameState.initial_state(),
                message="choose an opponent: human or rando",
            )
        else:
            move = InputParser._parse_move(command, player)
            return GameEngine.apply_move(state, move)

    @staticmethod
    def _parse_move(command: str, player: PlayerNumberType) -> Move:
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

        passive_board_letter = cast(BoardLetterType, groups[0])
        active_board_letter = cast(BoardLetterType, groups[4])
        passive_board_index = board_letter_to_index(passive_board_letter)
        active_board_index = board_letter_to_index(active_board_letter)
        direction_length = cast(MoveLengthType, int(groups[3]))
        cardinal_letter = cast(CardinalLetterType, groups[2])
        cardinal_index = cardinal_to_index(cardinal_letter)

        passive_o = int(groups[1]) - 1
        active_o = int(groups[5]) - 1

        if not (0 <= passive_o <= 15):
            raise GameError(
                f"passive move must be between 1 and 16 inclusive, got {groups[1]}"
            )
        if not (0 <= active_o <= 15):
            raise GameError(
                f"active move must be between 1 and 16 inclusive, got {groups[5]}"
            )
        passive_origin = cast(CoordinateType, passive_o)
        active_origin = cast(CoordinateType, active_o)

        direction = Direction(cardinal=cardinal_index, length=direction_length)

        passive_destination = GameEngine.get_destination_coordinate(
            passive_origin, direction.cardinal, direction.length
        )
        active_destination = GameEngine.get_destination_coordinate(
            active_origin, direction.cardinal, direction.length
        )

        if passive_destination is None:
            raise GameError("passive move destination is out of bounds")
        if active_destination is None:
            raise GameError("active move destination is out of bounds")

        return Move(
            player=player,
            passive=BoardMove(
                board=passive_board_index,
                origin=passive_origin,
                destination=passive_destination,
            ),
            active=BoardMove(
                board=active_board_index,
                origin=active_origin,
                destination=active_destination,
            ),
        )


def run_terminal_game():
    state = GameState.initial_state()
    print(format_game_state(state))
    print(
        "enter 'quit' to exit, 'read' to see board, 'start' to start new game"
    )

    while True:
        try:
            user_input = input("~> ").strip()
            result = InputParser.parse_command(user_input, state.player_turn, state)
            opponent = "rando"

            if result.message:
                print(result.message)
                if result.message == "choose an opponent: human or rando":
                    opponent_selection = input("~> ").strip()
                    if (
                        opponent_selection == "human"
                        or opponent_selection == "rando"
                    ):
                        opponent = opponent_selection
                    else:
                        print("invalid opponent")

            if result.game_end == "INCOMPLETE":
                print("exiting...")
                break

            state = result.state

            if opponent == "rando":
                print(RandoAI.get_passive_candidates(state.boards, state.player_turn))

        except GameError as e:
            print(f"error: {e}")
        except (KeyboardInterrupt, EOFError):
            print("\nexiting...")
            break
        except Exception as e:
            print(f"unexpected error: {e}")


# test with python -m app.utils.tui_game
# alias test_engine
if __name__ == "__main__":
    run_terminal_game()
