export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  selectedSquare: Position | null;
  validMoves: Position[];
  gameStatus: 'playing' | 'checkmate' | 'stalemate';
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: Position | null;
  inCheck: boolean;
  moveHistory: string[];
  capturedPieces: {
    white: ChessPiece[];
    black: ChessPiece[];
  };
  lastMove: { from: Position; to: Position } | null;
  moveNumber: number;
  gameStartTime: Date;
  moveTimes: { white: number; black: number };
}

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

// Chess notation utilities
export const FILE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANK_NUMBERS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const positionToNotation = (position: Position): string => {
  return FILE_LETTERS[position.col] + RANK_NUMBERS[position.row];
};

export const notationToPosition = (notation: string): Position => {
  const col = FILE_LETTERS.indexOf(notation[0]);
  const row = RANK_NUMBERS.indexOf(notation[1]);
  return { row, col };
};

export const pieceToNotation = (piece: ChessPiece): string => {
  const pieceMap: Record<PieceType, string> = {
    king: 'K',
    queen: 'Q',
    rook: 'R',
    bishop: 'B',
    knight: 'N',
    pawn: ''
  };
  return pieceMap[piece.type];
};