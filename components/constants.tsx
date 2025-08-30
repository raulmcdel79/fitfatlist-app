import React, { useState, useRef, useEffect } from 'react';
import type { Product, PriceQuality } from '../types';

// --- SECCIONES/CATEGORÍAS VÁLIDAS ---
export const SECTIONS = [
    { id: 'cat-arroz', name: 'Arroz' },
    { id: 'cat-cereales', name: 'Cereales' },
    { id: 'cat-pasta', name: 'Pasta' },
    { id: 'cat-cereales-pasta', name: 'Cereales y Pasta' }, // Nueva sección
    { id: 'cat-higiene', name: 'Higiene' },
    { id: 'cat-mascotas', name: 'Mascotas' },
    { id: 'cat-bebe', name: 'Bebé' },
    // ...agrega aquí todas las secciones/categorías válidas de tu app...
];

// Array de ids de secciones válidas para validación IA
// Ejemplo de uso: si quieres validar si un producto pertenece a una sección válida:
// if (SECTION_IDS.includes(product.categoryId)) { ... }
export const SECTION_IDS = SECTIONS.map(s => s.id);

// Standardized Icon Pattern:
// - Use className prop with a default value.
// - Default className includes `block` for consistent rendering.
// - The passed className will REPLACE the default, not merge.

// --- NAVIGATION ICONS ---

export const HomeIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m2 9 10-7 10 7v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
);

export const CatalogIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 3v18"/>
    </svg>
);

export const ListIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
      <path d="M14 2v6h6"/>
      <path d="M12 18v-6"/>
      <path d="M9 15h6"/>
    </svg>
);

export const StoreIcon: React.FC<{className?: string}> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 21H6a2 2 0 0 1-2-2V7l8-5 8 5v12a2 2 0 0 1-2 2Z"/>
      <path d="M12 12H4"/><path d="M12 12h8"/>
      <path d="M12 21V12"/>
    </svg>
);

// --- ACTION ICONS ---

export const CameraIcon: React.FC<{className?: string}> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
);

export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);

export const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
);

// --- THEME ICONS ---

export const SunIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);


// --- UI & CONTROL ICONS ---

export const PlusIcon: React.FC<{className?: string}> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14"/>
      <path d="M5 12h14"/>
    </svg>
);

export const MinusIcon: React.FC<{className?: string}> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14"/>
    </svg>
);

export const XIcon: React.FC<{className?: string}> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = 'block h-8 w-8 text-ink-muted opacity-25' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
    </svg>
);

export const CheckedCircleIcon: React.FC<{className?: string}> = ({ className = "block h-8 w-8 text-accent" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <path d="m9 11 3 3L22 4"/>
    </svg>
);

export const ArrowLeftIcon: React.FC<{className?: string}> = ({ className = 'block h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 12H5"/>
      <path d="m12 19-7-7 7-7"/>
    </svg>
);

export const SearchIcon: React.FC<{className?: string}> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
);

export const SparklesIcon: React.FC<{className?: string}> = ({ className = 'block h-5 w-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 20l-2-4-4-2 4-2 2-4 2 4 4 2-4 2-2 4Z"/>
      <path d="m22 10-2-4-4-2 4-2 2-4 2 4 4 2-4 2-2 4Z"/>
    </svg>
);


// --- UTILITY DATA & COMPONENTS ---

export const qualityToStars: Record<PriceQuality, number> = { 'Mala': 1, 'Normal': 2, 'Buena': 3 };
export const starsToQuality: Readonly<PriceQuality[]> = ['Mala', 'Normal', 'Buena'];

export const starColorMapQuality: Record<PriceQuality, string> = {
    'Mala': 'text-danger',
    'Normal': 'text-warn',
    'Buena': 'text-accent',
};

export const StarRatingDisplay: React.FC<{ quality: PriceQuality, size?: 'sm' | 'md' }> = ({ quality, size = 'md' }) => {
    const starCount = qualityToStars[quality];
    const color = starColorMapQuality[quality];
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
        <div className="flex items-center" data-tooltip={quality}>
            {[...Array(3)].map((_, i) => (
                <StarIcon key={i} className={`block ${sizeClass} ${i < starCount ? color : 'text-border'}`} />
            ))}
        </div>
    );
};

export const healthScoreInfo: Record<number, { label: string; color: string; dotClass: string; }> = {
  1: { label: 'Malo', color: 'var(--danger)', dotClass: 'bg-danger' },
  2: { label: 'Malo', color: 'var(--danger)', dotClass: 'bg-danger' },
  3: { label: 'Regular', color: 'var(--warn)', dotClass: 'bg-warn' },
  4: { label: 'Bueno', color: 'var(--accent)', dotClass: 'bg-accent' },
  5: { label: 'Bueno', color: 'var(--accent)', dotClass: 'bg-accent' },
};
const defaultHealthScoreInfo = healthScoreInfo[3];

export const HealthScoreDisplay: React.FC<{ product: Product | null }> = ({ product }) => {
    const nonNutritionalCategories = ['cat-higiene', 'cat-mascotas', 'cat-bebe'];

    if (product && nonNutritionalCategories.includes(product.categoryId)) {
        return (
             <div className="w-4 h-4 flex items-center justify-center" data-tooltip="No aplica valoración nutricional">
                <div className="w-3 h-3 rounded-sm bg-white border border-border"></div>
            </div>
        );
    }
    
    if (!product?.healthScore) return null;

    const score = product.healthScore;
    const info = healthScoreInfo[score] || defaultHealthScoreInfo;

    return (
        <div className="w-4 h-4 flex items-center justify-center" data-tooltip={`Nutrición: ${info.label}`}>
            <div className={`w-3 h-3 rounded-full ${info.dotClass}`}></div>
        </div>
    );
};

export const HealthScoreInput: React.FC<{ score?: number, setScore: (score: number) => void }> = ({ score, setScore }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const scoreLevels = [
        { level: 2, label: 'Malo', dotClass: 'bg-danger' },
        { level: 3, label: 'Regular', dotClass: 'bg-warn' },
        { level: 5, label: 'Bueno', dotClass: 'bg-accent' },
    ];
    
    const currentLevel = score && score >= 4 ? 5 : (score === 3 ? 3 : 2);
    const currentLevelInfo = scoreLevels.find(s => s.level === currentLevel) || scoreLevels[1];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (level: number) => {
        setScore(level);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen(prev => !prev); }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isOpen ? 'ring-2 ring-offset-2 ring-offset-surface ring-brand border-brand' : 'border-transparent'}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={`Puntuación nutricional actual: ${currentLevelInfo.label}. Toca para cambiar.`}
            >
                <div className={`w-full h-full rounded-full ${currentLevelInfo.dotClass}`} />
            </button>

            {isOpen && (
                <div 
                    className="absolute top-full -translate-x-1/2 left-1/2 mt-2 p-2 bg-surface rounded-xl border border-border shadow-lg z-10 flex items-center gap-2"
                    role="menu"
                >
                    {scoreLevels.map(({ level, label, dotClass }) => (
                         <button
                            type="button"
                            role="menuitem"
                            key={label}
                            onClick={(e) => { e.stopPropagation(); handleSelect(level); }}
                            className="w-8 h-8 rounded-full border-2 border-transparent transition-all flex items-center justify-center text-xs text-white font-bold ring-offset-2 ring-offset-surface hover:ring-2 hover:ring-brand"
                            aria-label={`Marcar como ${label}`}
                            data-tooltip={label}
                        >
                             <div className={`w-full h-full rounded-full ${dotClass}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


export const availableColors = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink'];

export const colorClassMap: Record<string, { bg500: string; border700: string; ring700: string; pillBg: string; iconText: string; }> = {
    red:    { bg500: 'bg-red-500',    border700: 'border-red-700',    ring700: 'ring-red-700',    pillBg: 'bg-red-100 dark:bg-red-500/20',    iconText: 'text-red-600 dark:text-red-400' },
    orange: { bg500: 'bg-orange-500', border700: 'border-orange-700', ring700: 'ring-orange-700', pillBg: 'bg-orange-100 dark:bg-orange-500/20', iconText: 'text-orange-600 dark:text-orange-400' },
    yellow: { bg500: 'bg-yellow-500', border700: 'border-yellow-700', ring700: 'ring-yellow-700', pillBg: 'bg-yellow-100 dark:bg-yellow-500/20', iconText: 'text-yellow-600 dark:text-yellow-400' },
    green:  { bg500: 'bg-green-500',  border700: 'border-green-700',  ring700: 'ring-green-700',  pillBg: 'bg-green-100 dark:bg-green-500/20',  iconText: 'text-green-600 dark:text-green-400' },
    teal:   { bg500: 'bg-teal-500',   border700: 'border-teal-700',   ring700: 'ring-teal-700',   pillBg: 'bg-teal-100 dark:bg-teal-500/20',   iconText: 'text-teal-600 dark:text-teal-400' },
    blue:   { bg500: 'bg-blue-500',   border700: 'border-blue-700',   ring700: 'ring-blue-700',   pillBg: 'bg-blue-100 dark:bg-blue-500/20',   iconText: 'text-blue-600 dark:text-blue-400' },
    indigo: { bg500: 'bg-indigo-500', border700: 'border-indigo-700', ring700: 'ring-indigo-700', pillBg: 'bg-indigo-100 dark:bg-indigo-500/20', iconText: 'text-indigo-600 dark:text-indigo-400' },
    purple: { bg500: 'bg-purple-500', border700: 'border-purple-700', ring700: 'ring-purple-700', pillBg: 'bg-purple-100 dark:bg-purple-500/20', iconText: 'text-purple-600 dark:text-purple-400' },
    pink:   { bg500: 'bg-pink-500',   border700: 'border-pink-700',   ring700: 'ring-pink-700',   pillBg: 'bg-pink-100 dark:bg-pink-500/20',   iconText: 'text-pink-600 dark:text-pink-400' },
};