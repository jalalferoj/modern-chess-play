import { GameState } from '../types/chess';
import { ScrollArea } from './ui/scroll-area';

interface MoveHistoryProps {
  gameState: GameState;
  isFullscreen?: boolean;
}

export const MoveHistory = ({ gameState, isFullscreen = false }: MoveHistoryProps) => {
  const { moveHistory, moveNumber } = gameState;

  return (
    <div className={`bg-card border rounded-lg ${isFullscreen ? 'h-32' : 'h-48'}`}>
      <div className="p-3 border-b">
        <h3 className={`font-semibold ${isFullscreen ? 'text-sm' : 'text-base'}`}>
          Move History
        </h3>
      </div>
      <ScrollArea className={`${isFullscreen ? 'h-24' : 'h-40'} p-3`}>
        {moveHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">No moves yet</p>
        ) : (
          <div className="space-y-1">
            {moveHistory.map((move, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-8">
                  {Math.floor(index / 2) + 1}.
                </span>
                <span className="font-mono">{move}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
