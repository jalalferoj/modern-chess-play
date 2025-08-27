import { useState } from 'react';
import { GameState, Position, ChessPiece } from '../types/chess';
import { createInitialBoard, getValidMoves, isPositionEqual } from '../utils/chessLogic';
import { ChessSquare } from './ChessSquare';

export const ChessBoard = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    gameStatus: 'playing'
  });

  const handleSquareClick = (position: Position) => {
    const { board, selectedSquare, currentPlayer, validMoves } = gameState;
    const clickedPiece = board[position.row][position.col];

    // If no square is selected
    if (!selectedSquare) {
      // Select square if it has a piece of the current player
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        const moves = getValidMoves(board, position, clickedPiece);
        setGameState(prev => ({
          ...prev,
          selectedSquare: position,
          validMoves: moves
        }));
      }
      return;
    }

    // If clicking the same square, deselect
    if (isPositionEqual(selectedSquare, position)) {
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: []
      }));
      return;
    }

    // If clicking on a valid move
    const isValidMove = validMoves.some(move => isPositionEqual(move, position));
    if (isValidMove) {
      // Make the move
      const newBoard = board.map(row => [...row]);
      const piece = newBoard[selectedSquare.row][selectedSquare.col];
      newBoard[position.row][position.col] = piece;
      newBoard[selectedSquare.row][selectedSquare.col] = null;

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: currentPlayer === 'white' ? 'black' : 'white',
        selectedSquare: null,
        validMoves: []
      }));
      return;
    }

    // If clicking on another piece of the current player
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      const moves = getValidMoves(board, position, clickedPiece);
      setGameState(prev => ({
        ...prev,
        selectedSquare: position,
        validMoves: moves
      }));
    } else {
      // Deselect if clicking elsewhere
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: []
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      validMoves: [],
      gameStatus: 'playing'
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          Modern Chess
        </h1>
        <div className="flex items-center gap-4 justify-center">
          <p className="text-xl text-muted-foreground">
            Current Player: 
            <span className={`ml-2 font-semibold ${
              gameState.currentPlayer === 'white' ? 'text-secondary' : 'text-foreground'
            }`}>
              {gameState.currentPlayer === 'white' ? 'White' : 'Black'}
            </span>
          </p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
      
      <div 
        className="grid grid-cols-8 gap-0 p-4 rounded-2xl shadow-2xl border-2 border-border/50"
        style={{
          background: 'var(--gradient-board)',
        }}
      >
        {gameState.board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const isSelected = gameState.selectedSquare && 
              isPositionEqual(gameState.selectedSquare, position);
            const isValidMove = gameState.validMoves.some(move => 
              isPositionEqual(move, position));

            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                position={position}
                piece={piece}
                isSelected={!!isSelected}
                isValidMove={isValidMove}
                onClick={handleSquareClick}
              />
            );
          })
        )}
      </div>
      
      <div className="text-center max-w-md">
        <p className="text-muted-foreground">
          Click on a piece to select it, then click on a highlighted square to move.
          Capture opponent pieces by moving to their square.
        </p>
      </div>
    </div>
  );
};