import { ChessPiece as ChessPieceType, Position } from '../types/chess';
import { ChessPiece } from './ChessPiece';

interface ChessSquareProps {
  position: Position;
  piece: ChessPieceType | null;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: (position: Position) => void;
  isFullscreen?: boolean;
}

export const ChessSquare = ({ 
  position, 
  piece, 
  isSelected, 
  isValidMove, 
  onClick,
  isFullscreen = false
}: ChessSquareProps) => {
  const { row, col } = position;
  const isLight = (row + col) % 2 === 0;
  
  const getSquareClass = () => {
    let baseClass = `
      flex items-center justify-center cursor-pointer transition-all duration-200 ease-out
      relative border border-border/20
      ${isFullscreen 
        ? 'w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28' 
        : 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'
      }
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
      {piece && <ChessPiece piece={piece} isSelected={isSelected} isFullscreen={isFullscreen} />}
      {isValidMove && !piece && (
        <div className={`rounded-full bg-chess-valid-move/70 shadow-lg ${
          isFullscreen 
            ? 'w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10' 
            : 'w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6'
        }`} />
      )}
    </div>
  );
};