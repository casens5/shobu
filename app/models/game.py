from . import db
from sqlalchemy.orm import relationship

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    boards = db.Column(db.JSON, nullable=False)
    player_turn = db.Column(db.Integer, nullable=False, default=1)
    player1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    player2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    winner = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='waiting')

    player1 = relationship('User', foreign_keys=[player1_id])
    player2 = relationship('User', foreign_keys=[player2_id])
    
    def to_dict(self):
        """Serializes the Game object to a dictionary."""
        return {
            "id": self.id,
            "boards": self.boards,
            "player_turn": self.player_turn,
            "player1": self.player1.username if self.player1 else None,
            "player2": self.player2.username if self.player2 else "AI/Waiting",
            "winner": self.winner,
            "status": self.status
        }

