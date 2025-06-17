# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shobu board game implementation with a Flask Python backend and React TypeScript frontend. Shobu is a 4-board abstract strategy game where players make two moves per turn: a passive move on their home board and an active move mirroring the direction and distance.

## Development Commands

### Frontend (React/TypeScript/Vite)
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production (runs typecheck first)
npm run test         # Run tests with Vitest
npm run typecheck    # Type checking without emitting
npm run prepare      # Husky git hooks setup
npm run lint-staged  # Run lint-staged (used by pre-commit hooks)
```

### Backend (Flask/Python)
```bash
python run.py        # Run Flask development server
pip install -r requirements.txt  # Install dependencies
```

## Architecture

### Backend Structure
- (out of date)

### Frontend Structure
- **Game Engine**: Core game logic in `frontend/src/game/gameEngine.tsx`
  - Handles move validation, board state, game rules
  - Implements Shobu-specific logic: passive/active moves, board shades, stone pushing
  - Pure functions for game state management
- **Game Components**: 
  - `game.tsx`: Main game controller and UI
  - `board.tsx`: Individual board rendering
  - `stone.tsx`: Stone piece components
- **Types**: Comprehensive TypeScript definitions in `types.ts` for game state, moves, coordinates, and actions

### Key Game Engine Concepts
- **4-board system**: 2 dark boards (0,3) and 2 light boards (1,2)
- **Two-move turns**: Passive move (on home board) followed by active move (matching direction/distance)
- **Stone pushing**: Can push opponent stones but not your own
- **Move validation**: Direction, distance, collision detection
- **Win conditions**: Eliminate all opponent stones from any board

## Code Quality
- Pre-commit hooks with Husky for linting and formatting
- TypeScript strict mode enabled
- Prettier and ESLint configured
- Vitest for testing

## Database
- SQLite database stored in `instance/users.db`
- User authentication with password hashing via Werkzeug
