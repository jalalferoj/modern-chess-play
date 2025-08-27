import { ChessPiece as ChessPieceType, Position } from '../types/chess';
import { ChessPiece } from './ChessPiece';

interface ChessSquareProps {
  position: Position;
  piece: ChessPieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: (position: Position) => void;
}

export const ChessSquare = ({ 
  position, 
  piece, 
  isSelected, 
  isValidMove, 
  onClick 
}: ChessSquareProps) => {
  const { row, col } = position;
  const isLight = (row + col) % 2 === 0;
  
  const getSquareClass = () => {
    let baseClass = `
      w-20 h-20 flex items-center justify-center
      cursor-pointer transition-all duration-200 ease-out
      relative border border-border/20
    `;
    
    if (isSelected) {
      baseClass += ' bg-chess-selected shadow-lg scale-105 z-10';
    } else if (isValidMove) {
      baseClass += ` ${isLight ? 'bg-chess-light' : 'bg-chess-dark'} 
        ring-4 ring-chess-valid-move/60 ring-inset`;
    } else if (isLight) {
      baseClass += ' bg-chess-light hover:bg-chess-hover';
    } else {
      baseClass += ' bg-chess-dark hover:brightness-110';
    }
    
    return baseClass;
  };

  return (
    <div 
      className={getSquareClass()}
      onClick={() => onClick(position)}
    >
      {piece && <ChessPiece piece={piece} isSelected={isSelected} />}
      {isValidMove && !piece && (
        <div className="w-6 h-6 rounded-full bg-chess-valid-move/70 shadow-lg" />
      )}
    </div>
  );
};