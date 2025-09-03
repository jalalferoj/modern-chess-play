import { useState } from 'react';
import { GameState, Position, ChessPiece, PieceType } from '../types/chess';
import { createInitialBoard, getLegalMoves, isPositionEqual, isCheckmate, isStalemate, isPawnPromotion, isInCheck } from '../utils/chessLogic';
import { ChessSquare } from './ChessSquare';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

export const ChessBoard = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    gameStatus: 'playing',
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassantTarget: null,
    inCheck: false
  });

  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState<{from: Position, to: Position} | null>(null);

  const handleSquareClick = (position: Position) => {
    if (gameState.gameStatus !== 'playing') return;
    
    const { board, selectedSquare, currentPlayer, castlingRights, enPassantTarget } = gameState;
    const clickedPiece = board[position.row][position.col];

    // If no square is selected
    if (!selectedSquare) {
      // Select square if it has a piece of the current player
      if (clickedPiece && clickedPiece.color === currentPlayer) {
        const moves = getLegalMoves(board, position, clickedPiece, castlingRights, enPassantTarget);
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
    const isValidMove = gameState.validMoves.some(move => isPositionEqual(move, position));
    if (isValidMove) {
      const piece = board[selectedSquare.row][selectedSquare.col];
      
      // Check for pawn promotion
      if (piece && isPawnPromotion(piece, position)) {
        setPromotionMove({ from: selectedSquare, to: position });
        setShowPromotion(true);
        return;
      }

      makeMove(selectedSquare, position);
      return;
    }

    // If clicking on another piece of the current player
    if (clickedPiece && clickedPiece.color === currentPlayer) {
      const moves = getLegalMoves(board, position, clickedPiece, castlingRights, enPassantTarget);
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

  const makeMove = (from: Position, to: Position, promotionPiece?: PieceType) => {
    const { board, currentPlayer, castlingRights, enPassantTarget } = gameState;
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return;

    // Handle pawn promotion
    if (promotionPiece && isPawnPromotion(piece, to)) {
      newBoard[to.row][to.col] = { type: promotionPiece, color: piece.color };
    } else {
      newBoard[to.row][to.col] = piece;
    }
    
    newBoard[from.row][from.col] = null;

    // Handle castling
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const rookFromCol = to.col > from.col ? 7 : 0;
      const rookToCol = to.col > from.col ? 5 : 3;
      const rook = newBoard[from.row][rookFromCol];
      newBoard[from.row][rookToCol] = rook;
      newBoard[from.row][rookFromCol] = null;
    }

    // Handle en passant
    if (piece.type === 'pawn' && enPassantTarget && isPositionEqual(to, enPassantTarget)) {
      const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      newBoard[capturedPawnRow][to.col] = null;
    }

    // Update castling rights
    const newCastlingRights = { ...castlingRights };
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        newCastlingRights.whiteKingSide = false;
        newCastlingRights.whiteQueenSide = false;
      } else {
        newCastlingRights.blackKingSide = false;
        newCastlingRights.blackQueenSide = false;
      }
    }
    if (piece.type === 'rook') {
      if (from.row === 0) {
        if (from.col === 0) newCastlingRights.blackQueenSide = false;
        if (from.col === 7) newCastlingRights.blackKingSide = false;
      }
      if (from.row === 7) {
        if (from.col === 0) newCastlingRights.whiteQueenSide = false;
        if (from.col === 7) newCastlingRights.whiteKingSide = false;
      }
    }

    // Set en passant target
    let newEnPassantTarget: Position | null = null;
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      newEnPassantTarget = { row: (from.row + to.row) / 2, col: to.col };
    }

    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    const inCheck = isInCheck(newBoard, nextPlayer);
    
    let gameStatus: 'playing' | 'checkmate' | 'stalemate' = 'playing';
    if (isCheckmate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
      gameStatus = 'checkmate';
    } else if (isStalemate(newBoard, nextPlayer, newCastlingRights, newEnPassantTarget)) {
      gameStatus = 'stalemate';
    }

    setGameState({
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedSquare: null,
      validMoves: [],
      gameStatus,
      castlingRights: newCastlingRights,
      enPassantTarget: newEnPassantTarget,
      inCheck
    });
  };

  const handlePromotion = (pieceType: PieceType) => {
    if (promotionMove) {
      makeMove(promotionMove.from, promotionMove.to, pieceType);
      setShowPromotion(false);
      setPromotionMove(null);
    }
  };

  const resetGame = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      validMoves: [],
      gameStatus: 'playing',
      castlingRights: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassantTarget: null,
      inCheck: false
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          Modern Chess
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
          <div className="text-center">
            <p className="text-lg sm:text-xl text-muted-foreground">
              Current Player: 
              <span className={`ml-2 font-semibold ${
                gameState.currentPlayer === 'white' ? 'text-secondary' : 'text-foreground'
              }`}>
                {gameState.currentPlayer === 'white' ? 'White' : 'Black'}
              </span>
            </p>
            {gameState.inCheck && (
              <p className="text-red-500 font-semibold text-sm">Check!</p>
            )}
            {gameState.gameStatus === 'checkmate' && (
              <p className="text-red-500 font-bold text-lg">
                Checkmate! {gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!
              </p>
            )}
            {gameState.gameStatus === 'stalemate' && (
              <p className="text-yellow-500 font-bold text-lg">Stalemate! It's a draw!</p>
            )}
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
      
      <div 
        className="grid grid-cols-8 gap-0 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-border/50"
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

      <Dialog open={showPromotion} onOpenChange={setShowPromotion}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Choose Promotion Piece</DialogTitle>
          <div className="grid grid-cols-4 gap-4 py-4">
            {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((pieceType) => (
              <Button
                key={pieceType}
                onClick={() => handlePromotion(pieceType)}
                className="h-16 text-2xl"
                variant="outline"
              >
                {pieceType === 'queen' ? '♕' : 
                 pieceType === 'rook' ? '♖' : 
                 pieceType === 'bishop' ? '♗' : '♘'}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};