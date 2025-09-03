import { ChessPiece, PieceColor, PieceType, Position } from '../types/chess';

export const createInitialBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Set up other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

export const getValidMoves = (
  board: (ChessPiece | null)[][],
  position: Position,
  piece: ChessPiece,
  castlingRights?: any,
  enPassantTarget?: Position | null
): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;
  
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, position, piece.color, enPassantTarget);
    case 'rook':
      return getRookMoves(board, position, piece.color);
    case 'bishop':
      return getBishopMoves(board, position, piece.color);
    case 'queen':
      return [...getRookMoves(board, position, piece.color), ...getBishopMoves(board, position, piece.color)];
    case 'knight':
      return getKnightMoves(board, position, piece.color);
    case 'king':
      return getKingMoves(board, position, piece.color, castlingRights);
    default:
      return moves;
  }
};

export const getLegalMoves = (
  board: (ChessPiece | null)[][],
  position: Position,
  piece: ChessPiece,
  castlingRights?: any,
  enPassantTarget?: Position | null
): Position[] => {
  const possibleMoves = getValidMoves(board, position, piece, castlingRights, enPassantTarget);
  const legalMoves: Position[] = [];

  for (const move of possibleMoves) {
    if (!wouldBeInCheck(board, position, move, piece.color)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
};

const getPawnMoves = (board: (ChessPiece | null)[][], position: Position, color: PieceColor, enPassantTarget?: Position | null): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;
  
  // Move forward
  if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
    moves.push({ row: row + direction, col });
    
    // Double move from starting position
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col });
    }
  }
  
  // Capture diagonally
  for (const deltaCol of [-1, 1]) {
    const newRow = row + direction;
    const newCol = col + deltaCol;
    if (isValidPosition(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      if (targetPiece && targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
      // En passant
      else if (enPassantTarget && isPositionEqual({ row: newRow, col: newCol }, enPassantTarget)) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  
  return moves;
};

const getRookMoves = (board: (ChessPiece | null)[][], position: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;
  
  // Horizontal and vertical directions
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
  for (const [deltaRow, deltaCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + deltaRow * i;
      const newCol = col + deltaCol * i;
      
      if (!isValidPosition(newRow, newCol)) break;
      
      const targetPiece = board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }
  }
  
  return moves;
};

const getBishopMoves = (board: (ChessPiece | null)[][], position: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;
  
  // Diagonal directions
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  
  for (const [deltaRow, deltaCol] of directions) {
    for (let i = 1; i < 8; i++) {
      const newRow = row + deltaRow * i;
      const newCol = col + deltaCol * i;
      
      if (!isValidPosition(newRow, newCol)) break;
      
      const targetPiece = board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }
  }
  
  return moves;
};

const getKnightMoves = (board: (ChessPiece | null)[][], position: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;
  
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [deltaRow, deltaCol] of knightMoves) {
    const newRow = row + deltaRow;
    const newCol = col + deltaCol;
    
    if (isValidPosition(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  
  return moves;
};

const getKingMoves = (board: (ChessPiece | null)[][], position: Position, color: PieceColor, castlingRights?: any): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;
  
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (const [deltaRow, deltaCol] of kingMoves) {
    const newRow = row + deltaRow;
    const newCol = col + deltaCol;
    
    if (isValidPosition(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  // Castling
  if (castlingRights && !isInCheck(board, color)) {
    const kingRow = color === 'white' ? 7 : 0;
    if (row === kingRow && col === 4) {
      // King side castling
      if ((color === 'white' && castlingRights.whiteKingSide) || 
          (color === 'black' && castlingRights.blackKingSide)) {
        if (!board[kingRow][5] && !board[kingRow][6] && board[kingRow][7]?.type === 'rook') {
          moves.push({ row: kingRow, col: 6 });
        }
      }
      // Queen side castling
      if ((color === 'white' && castlingRights.whiteQueenSide) || 
          (color === 'black' && castlingRights.blackQueenSide)) {
        if (!board[kingRow][3] && !board[kingRow][2] && !board[kingRow][1] && board[kingRow][0]?.type === 'rook') {
          moves.push({ row: kingRow, col: 2 });
        }
      }
    }
  }
  
  return moves;
};

export const isPositionEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

export const findKing = (board: (ChessPiece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const isInCheck = (board: (ChessPiece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  // Check if any opponent piece can attack the king
  const opponentColor = color === 'white' ? 'black' : 'white';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMoves(board, { row, col }, piece);
        if (moves.some(move => isPositionEqual(move, kingPos))) {
          return true;
        }
      }
    }
  }
  
  return false;
};

export const wouldBeInCheck = (
  board: (ChessPiece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean => {
  // Make a copy of the board with the move
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  return isInCheck(newBoard, color);
};

export const isCheckmate = (board: (ChessPiece | null)[][], color: PieceColor, castlingRights: any, enPassantTarget: Position | null): boolean => {
  if (!isInCheck(board, color)) return false;
  
  // Check if there are any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves(board, { row, col }, piece, castlingRights, enPassantTarget);
        if (legalMoves.length > 0) {
          return false;
        }
      }
    }
  }
  
  return true;
};

export const isStalemate = (board: (ChessPiece | null)[][], color: PieceColor, castlingRights: any, enPassantTarget: Position | null): boolean => {
  if (isInCheck(board, color)) return false;
  
  // Check if there are any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves(board, { row, col }, piece, castlingRights, enPassantTarget);
        if (legalMoves.length > 0) {
          return false;
        }
      }
    }
  }
  
  return true;
};

export const isPawnPromotion = (piece: ChessPiece, to: Position): boolean => {
  if (piece.type !== 'pawn') return false;
  return (piece.color === 'white' && to.row === 0) || (piece.color === 'black' && to.row === 7);
};