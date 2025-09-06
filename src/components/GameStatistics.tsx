import { GameState } from '../types/chess';
import { Clock, Move, Trophy } from 'lucide-react';

interface GameStatisticsProps {
  gameState: GameState;
  isFullscreen?: boolean;
}

export const GameStatistics = ({ gameState, isFullscreen = false }: GameStatisticsProps) => {
  const { moveNumber, gameStartTime, moveTimes } = gameState;
  const gameDuration = Math.floor((Date.now() - gameStartTime.getTime()) / 1000);
  const minutes = Math.floor(gameDuration / 60);
  const seconds = gameDuration % 60;

  const textSize = isFullscreen ? 'text-xs' : 'text-sm';
  const iconSize = isFullscreen ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className={`bg-card border rounded-lg p-3 ${isFullscreen ? 'text-xs' : 'text-sm'}`}>
      <h3 className={`font-semibold mb-2 ${isFullscreen ? 'text-sm' : 'text-base'}`}>
        Game Statistics
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Move className={iconSize} />
          <span>Move: {moveNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className={iconSize} />
          <span>Time: {minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className={iconSize} />
          <span>Status: {gameState.gameStatus}</span>
        </div>
      </div>
    </div>
  );
};
