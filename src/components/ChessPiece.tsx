import { ChessPiece as ChessPieceType, PIECE_SYMBOLS } from '../types/chess';

interface ChessPieceProps {
  piece: ChessPieceType;
  isSelected: boolean;
}

export const ChessPiece = ({ piece, isSelected }: ChessPieceProps) => {
  return (
    <div 
      className={`
        text-6xl select-none cursor-pointer
        transition-all duration-300 ease-out
        ${isSelected ? 'scale-110 drop-shadow-2xl' : 'hover:scale-105'}
        ${piece.color === 'white' ? 'text-secondary drop-shadow-lg' : 'text-foreground drop-shadow-lg'}
      `}
      style={{
        filter: isSelected ? 'drop-shadow(0 0 20px hsl(var(--chess-selected)))' : undefined,
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}
    >
      {PIECE_SYMBOLS[piece.color][piece.type]}
    </div>
  );
};