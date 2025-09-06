import { Palette, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  isFullscreen?: boolean;
}

export const ThemeSelector = ({ currentTheme, onThemeChange, isFullscreen = false }: ThemeSelectorProps) => {
  const themes = [
    { id: 'classic', name: 'Classic', icon: <Palette className="w-4 h-4" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" /> }
  ];

  return (
    <div className={`bg-card border rounded-lg p-3 ${isFullscreen ? 'text-xs' : 'text-sm'}`}>
      <h3 className={`font-semibold mb-2 ${isFullscreen ? 'text-sm' : 'text-base'}`}>
        Board Theme
      </h3>
      <div className="flex gap-2">
        {themes.map((theme) => (
          <Button
            key={theme.id}
            variant={currentTheme === theme.id ? 'default' : 'outline'}
            size={isFullscreen ? 'sm' : 'default'}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center gap-1"
          >
            {theme.icon}
            <span className={isFullscreen ? 'text-xs' : 'text-sm'}>{theme.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
