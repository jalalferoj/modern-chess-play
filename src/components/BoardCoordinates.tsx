import { FILE_LETTERS, RANK_NUMBERS } from '../types/chess';

interface BoardCoordinatesProps {
  isFullscreen?: boolean;
}

export const BoardCoordinates = ({ isFullscreen = false }: BoardCoordinatesProps) => {
  const textSize = isFullscreen ? 'text-xs sm:text-sm' : 'text-sm';

  return (
    <>
      {/* File letters (a-h) at the bottom */}
      <div className={`absolute -bottom-6 left-0 right-0 flex justify-between px-2 ${textSize} text-muted-foreground`}>
        {FILE_LETTERS.map((letter) => (
          <span key={letter} className="font-mono">
            {letter}
          </span>
        ))}
      </div>

      {/* Rank numbers (1-8) on the left */}
      <div className={`absolute -left-6 top-0 bottom-0 flex flex-col justify-between py-2 ${textSize} text-muted-foreground`}>
        {RANK_NUMBERS.map((number) => (
          <span key={number} className="font-mono">
            {number}
          </span>
        ))}
      </div>
    </>
  );
};
