import { useState, useCallback, useEffect } from 'react';
import { GameState, Position, ChessPiece, PieceType, positionToNotation, pieceToNotation } from '../types/chess';
import { createInitialBoard, getLegalMoves, isPositionEqual, isCheckmate, isStalemate, isPawnPromotion, isInCheck } from '../utils/chessLogic';
import { ChessSquare } from './ChessSquare';
import { MoveHistory } from './MoveHistory';
import { CapturedPieces } from './CapturedPieces';
import { BoardCoordinates } from './BoardCoordinates';
import { GameStatistics } from './GameStatistics';
import { ThemeSelector } from './ThemeSelector';
import { HelpPanel } from './HelpPanel';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Maximize, Minimize, Undo2 } from 'lucide-react';

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
    inCheck: false,
    moveHistory: [],
    capturedPieces: {
      white: [],
      black: []
    },
    lastMove: null,
    moveNumber: 1,
    gameStartTime: new Date(),
    moveTimes: { white: 0, black: 0 }
  });

  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState<{from: Position, to: Position} | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);
  const [boardTheme, setBoardTheme] = useState('classic');

  // Drag and drop functionality
  const isValidMoveForDrag = useCallback((from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col];
    if (!piece || piece.color !== gameState.currentPlayer) return false;
    
    const moves = getLegalMoves(gameState.board, from, piece, gameState.castlingRights, gameState.enPassantTarget);
    return moves.some(move => isPositionEqual(move, to));
  }, [gameState]);

  const handleDragMove = useCallback((from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col];
    if (!piece || piece.color !== gameState.currentPlayer) return;
    
    if (isPawnPromotion(piece, to)) {
      setPromotionMove({ from, to });
      setShowPromotion(true);
      return;
    }
    
    makeMove(from, to);
  }, [gameState]);

  const { draggedPiece, dragOverSquare, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(
    handleDragMove,
    isValidMoveForDrag
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            undoMove();
            break;
          case 'n':
            event.preventDefault();
            resetGame();
            break;
          case 'f':
            event.preventDefault();
            toggleFullscreen();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameHistory.length]);

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
    // Save current state to history for undo functionality
    setGameHistory(prev => [...prev, { ...gameState }]);
    
    const { board, currentPlayer, castlingRights, enPassantTarget, moveHistory, capturedPieces, moveNumber } = gameState;
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    
    if (!piece) return;

    // Track captured piece
    const capturedPiece = newBoard[to.row][to.col];
    const newCapturedPieces = { ...capturedPieces };
    if (capturedPiece) {
      newCapturedPieces[capturedPiece.color].push(capturedPiece);
    }

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

    // Create move notation
    const pieceNotation = pieceToNotation(piece);
    const fromNotation = positionToNotation(from);
    const toNotation = positionToNotation(to);
    const captureNotation = capturedPiece ? 'x' : '';
    const promotionNotation = promotionPiece ? `=${pieceToNotation({ type: promotionPiece, color: piece.color })}` : '';
    
    const moveNotation = `${pieceNotation}${fromNotation}${captureNotation}${toNotation}${promotionNotation}`;
    const newMoveHistory = [...moveHistory, moveNotation];

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
      inCheck,
      moveHistory: newMoveHistory,
      capturedPieces: newCapturedPieces,
      lastMove: { from, to },
      moveNumber: nextPlayer === 'white' ? moveNumber + 1 : moveNumber,
      gameStartTime: gameState.gameStartTime,
      moveTimes: gameState.moveTimes
    });
  };

  const handlePromotion = (pieceType: PieceType) => {
    if (promotionMove) {
      makeMove(promotionMove.from, promotionMove.to, pieceType);
      setShowPromotion(false);
      setPromotionMove(null);
    }
  };

  const undoMove = () => {
    if (gameHistory.length > 0) {
      const previousState = gameHistory[gameHistory.length - 1];
      setGameState(previousState);
      setGameHistory(prev => prev.slice(0, -1));
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
      inCheck: false,
      moveHistory: [],
      capturedPieces: {
        white: [],
        black: []
      },
      lastMove: null,
      moveNumber: 1,
      gameStartTime: new Date(),
      moveTimes: { white: 0, black: 0 }
    });
    setGameHistory([]);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 sm:gap-6 md:gap-8 ${isFullscreen ? 'h-screen justify-center p-1 sm:p-2 md:p-4' : ''}`}>
      <div className="text-center">
        <h1 className={`font-bold mb-2 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent ${isFullscreen ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'}`}>
          Modern Chess
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center">
          <div className="text-center">
            <p className={`text-muted-foreground ${isFullscreen ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'}`}>
              Current Player: 
              <span className={`ml-2 font-semibold ${
                gameState.currentPlayer === 'white' ? 'text-secondary' : 'text-foreground'
              }`}>
                {gameState.currentPlayer === 'white' ? 'White' : 'Black'}
              </span>
            </p>
            {gameState.inCheck && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-2 mt-2">
                <p className="text-red-500 font-bold text-sm animate-pulse">⚠️ CHECK!</p>
              </div>
            )}
            {gameState.gameStatus === 'checkmate' && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mt-2">
                <p className={`text-red-500 font-bold ${isFullscreen ? 'text-base' : 'text-lg'} animate-pulse`}>
                  🏆 CHECKMATE! {gameState.currentPlayer === 'white' ? 'Black' : 'White'} wins!
                </p>
              </div>
            )}
            {gameState.gameStatus === 'stalemate' && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 mt-2">
                <p className={`text-yellow-500 font-bold ${isFullscreen ? 'text-base' : 'text-lg'} animate-pulse`}>
                  🤝 STALEMATE! It's a draw!
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={undoMove}
              disabled={gameHistory.length === 0}
              className={`px-2 py-1 sm:px-3 sm:py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? 'text-xs sm:text-sm' : 'px-4'}`}
              title="Undo Last Move"
            >
              <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={resetGame}
              className={`px-2 py-1 sm:px-3 sm:py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors ${isFullscreen ? 'text-xs sm:text-sm' : 'px-4'}`}
            >
              New Game
            </button>
            <button
              onClick={toggleFullscreen}
              className={`px-2 py-1 sm:px-3 sm:py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors ${isFullscreen ? 'text-xs sm:text-sm' : 'px-4'}`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <HelpPanel isFullscreen={isFullscreen} />
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div 
          className={`grid grid-cols-8 gap-0 rounded-xl shadow-2xl border-2 border-border/50 chess-theme-${boardTheme} ${
            isFullscreen 
              ? 'p-2 sm:p-4 md:p-6 lg:p-8 w-[95vh] h-[95vh] max-w-[95vw] max-h-[95vw] aspect-square' 
              : 'p-2 sm:p-3 md:p-4 sm:rounded-2xl'
          }`}
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

            const isLastMove = gameState.lastMove && 
              (isPositionEqual(gameState.lastMove.from, position) || 
               isPositionEqual(gameState.lastMove.to, position));

            const isDragOver = dragOverSquare && isPositionEqual(dragOverSquare, position);

            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                position={position}
                piece={piece}
                isSelected={!!isSelected}
                isValidMove={isValidMove}
                onClick={handleSquareClick}
                isFullscreen={isFullscreen}
                isLastMove={!!isLastMove}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                isDragOver={!!isDragOver}
              />
            );
          })
        )}
        </div>
        <BoardCoordinates isFullscreen={isFullscreen} />
      </div>
      
      {!isFullscreen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          <div className="lg:col-span-2 space-y-4">
            <MoveHistory gameState={gameState} isFullscreen={isFullscreen} />
            <div className="text-center max-w-md">
              <p className="text-muted-foreground">
                Click on a piece to select it, then click on a highlighted square to move.
                Capture opponent pieces by moving to their square.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <GameStatistics gameState={gameState} isFullscreen={isFullscreen} />
            <ThemeSelector 
              currentTheme={boardTheme} 
              onThemeChange={setBoardTheme} 
              isFullscreen={isFullscreen} 
            />
            <div className="bg-card border rounded-lg p-3">
              <h3 className="font-semibold mb-2">Captured Pieces</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">White:</span>
                  <CapturedPieces 
                    capturedPieces={gameState.capturedPieces.white} 
                    color="white" 
                    isFullscreen={isFullscreen} 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Black:</span>
                  <CapturedPieces 
                    capturedPieces={gameState.capturedPieces.black} 
                    color="black" 
                    isFullscreen={isFullscreen} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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