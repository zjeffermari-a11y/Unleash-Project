import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full w-9 h-9"
      title="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-500 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
