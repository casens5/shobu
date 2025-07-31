from collections import defaultdict
from typing import cast, DefaultDict
from app.game.types import (
    CardinalNumberType,
    MoveLengthType,
    PlayerNumberType,
    CoordinateType,
    BoardNumberType,
)
from app.game.engine import Direction, Boards


class RandoAI:
    @staticmethod
    def get_passive_candidates(boards: Boards, player: PlayerNumberType):
        if player == 0:
            home_boards = [boards[0], boards[1]]
        else:
            home_boards = [boards[2], boards[3]]

        candidates: DefaultDict[
            BoardNumberType,
            DefaultDict[Direction, list[CoordinateType]],
        ] = defaultdict(lambda: defaultdict(list))
        for board_id, board in enumerate(home_boards):
            board_id += player * 2
            board_id = cast(BoardNumberType, board_id)
            for origin, cell in enumerate(board):
                if cell is not player:
                    continue
                origin = cast(CoordinateType, origin)
                origin_x = origin % 4
                origin_y = origin // 4

                for length in range(1, 3):
                    length = cast(MoveLengthType, length)

                    for i in range(8):
                        i = cast(CardinalNumberType, i)
                        destination_x = origin_x
                        destination_y = origin_y

                        if i > 0 and i < 4:
                            # east
                            destination_x += length
                        if i > 4:
                            # west
                            destination_x -= length
                        if i < 2 or i == 7:
                            # north
                            destination_y -= length
                        if i > 2 and i < 6:
                            # south
                            destination_y += length

                        destination = (destination_y * 4) + destination_x
                        destination = cast(CoordinateType, destination)

                        if (
                            destination_x < 0
                            or destination_x > 3
                            or destination_y < 0
                            or destination_y > 3
                            or origin == destination
                        ):
                            continue

                        direction = Direction(cardinal=i, length=length)
                        candidates[board_id][direction].append(origin)

        return candidates

    @staticmethod
    def get_active_candidates_from_passive_candidates(
        boards: Boards, player: PlayerNumberType, passive_candidates
    ):
        print("baba", boards, player, passive_candidates)

    @staticmethod
    def generate_move(boards: Boards, player: PlayerNumberType):
        print("baba", boards, player)
