import { ChessPiece as ChessPieceType, PIECE_SYMBOLS } from '../types/chess';

interface ChessPieceProps {
  piece: ChessPieceType;
  isSelected: boolean;
  isFullscreen?: boolean;
}

export const ChessPiece = ({ piece, isSelected, isFullscreen = false }: ChessPieceProps) => {
  return (
    <div 
      className={`
        select-none cursor-pointer transition-all duration-300 ease-out font-bold
        ${isSelected ? 'scale-110 drop-shadow-2xl' : 'hover:scale-105'}
        ${piece.color === 'white' ? 'text-white' : 'text-gray-800'}
        ${isFullscreen 
          ? 'text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl' 
          : 'text-3xl sm:text-4xl md:text-6xl'
        }
      `}
      style={{
        filter: isSelected ? 'drop-shadow(0 0 20px hsl(var(--chess-selected)))' : undefined,
        textShadow: piece.color === 'white' 
          ? '2px 2px 4px rgba(0,0,0,0.9)' 
          : '1px 1px 2px rgba(255,255,255,0.5)'
      }}
    >
      {PIECE_SYMBOLS[piece.color][piece.type]}
    </div>
  );
};