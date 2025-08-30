import React from 'react';
import { CameraIcon, MicrophoneIcon, PlusIcon, SunIcon, MoonIcon, LogOutIcon } from '../constants';

type Theme = 'light' | 'dark';

interface HeaderProps {
    onScanTicket: () => void;
    onStartVoiceCommand: () => void;
    onSignOut: () => void;
    isListening: boolean;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    primaryAction?: {
        onClick: () => void;
        icon: React.ReactNode;
        label: string;
    };
}

const ThemeSwitcher: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void; }> = ({ theme, setTheme }) => {
    const isDark = theme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-10 w-10 rounded-xl border border-border text-ink-muted hover:text-ink hover:bg-surface transition-colors"
            aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            data-tooltip={isDark ? "Tema Claro" : "Tema Oscuro"}
        >
            {isDark ? (
                <SunIcon className="w-6 h-6" />
            ) : (
                <MoonIcon className="w-6 h-6" />
            )}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ onScanTicket, onStartVoiceCommand, isListening, theme, setTheme, primaryAction, onSignOut }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-bg/80 backdrop-blur-sm border-b border-border z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand">FitFatList</h1>
        <div className="flex items-center gap-2">
            {primaryAction && (
                 <button 
                    onClick={primaryAction.onClick}
                    className="flex items-center justify-center h-10 w-10 rounded-xl border border-border text-ink hover:bg-surface transition-colors"
                    aria-label={primaryAction.label}
                    data-tooltip={primaryAction.label}
                >
                    <PlusIcon className="block h-6 w-6" />
                </button>
            )}
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            <button 
                onClick={onStartVoiceCommand}
                className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${isListening ? 'bg-danger/10 text-danger border-danger/50 animate-pulse' : 'border-border text-ink hover:bg-surface'}`}
                aria-label="Comando de voz"
                data-tooltip="Comando de Voz"
            >
                <MicrophoneIcon />
            </button>
             <button 
                onClick={onSignOut}
                className="flex items-center justify-center h-10 w-10 rounded-xl border border-border text-ink-muted hover:text-ink hover:bg-surface transition-colors"
                aria-label="Cerrar sesión"
                data-tooltip="Cerrar Sesión"
            >
                <LogOutIcon className="w-5 h-5" />
            </button>
            <button 
                onClick={onScanTicket}
                className="tooltip-align-right flex items-center gap-2 bg-brand text-brand-ink font-semibold text-sm py-2 px-3 rounded-xl hover:opacity-90 transition-opacity"
                aria-label="Escanear Ticket"
                data-tooltip="Escanear Ticket"
            >
                <CameraIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Ticket</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;