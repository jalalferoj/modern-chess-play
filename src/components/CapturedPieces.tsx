import { ChessPiece, PIECE_SYMBOLS } from '../types/chess';

interface CapturedPiecesProps {
  capturedPieces: ChessPiece[];
  color: 'white' | 'black';
  isFullscreen?: boolean;
}

export const CapturedPieces = ({ capturedPieces, color, isFullscreen = false }: CapturedPiecesProps) => {
  if (capturedPieces.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${isFullscreen ? 'max-w-20' : 'max-w-32'}`}>
      {capturedPieces.map((piece, index) => (
        <div
          key={index}
          className={`${isFullscreen ? 'text-lg' : 'text-xl'} opacity-70`}
          title={`Captured ${piece.color} ${piece.type}`}
        >
          {PIECE_SYMBOLS[piece.color][piece.type]}
        </div>
      ))}
    </div>
  );
};
