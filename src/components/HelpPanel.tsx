import { HelpCircle, Keyboard, Mouse } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';

interface HelpPanelProps {
  isFullscreen?: boolean;
}

export const HelpPanel = ({ isFullscreen = false }: HelpPanelProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={isFullscreen ? 'sm' : 'default'}
          className="flex items-center gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span className={isFullscreen ? 'text-xs' : 'text-sm'}>Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>How to Play Chess</DialogTitle>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Mouse className="w-4 h-4" />
              Mouse Controls
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Click a piece to select it</li>
              <li>• Click a highlighted square to move</li>
              <li>• Drag and drop pieces to move them</li>
              <li>• Click the same piece to deselect</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd> - Undo last move</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+N</kbd> - New game</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+F</kbd> - Toggle fullscreen</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Game Features</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Move history with algebraic notation</li>
              <li>• Captured pieces tracking</li>
              <li>• Multiple board themes</li>
              <li>• Game statistics and timer</li>
              <li>• Undo functionality</li>
              <li>• Fullscreen mode</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
