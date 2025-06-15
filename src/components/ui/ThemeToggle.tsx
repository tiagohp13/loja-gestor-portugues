
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Sun className={`h-4 w-4 transition-colors ${isDark ? 'text-muted-foreground' : 'text-yellow-500'}`} />
        <Label htmlFor="theme-toggle" className="text-sm font-medium text-foreground">
          {isDark ? 'Modo Escuro' : 'Modo Claro'}
        </Label>
        <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-blue-400' : 'text-muted-foreground'}`} />
      </div>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-input"
      />
    </div>
  );
};

export default ThemeToggle;
