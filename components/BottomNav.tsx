import React from 'react';
import type { View } from '../types';
import { HomeIcon, CatalogIcon, ListIcon, StoreIcon } from '../constants';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onOpenHelp: () => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = isActive ? 'text-brand' : 'text-ink-muted';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${activeClasses} hover:text-brand`}
    >
      {icon}
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, onOpenHelp }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-border z-10">
      <div className="container mx-auto px-4 h-16 flex justify-around items-center">
        <NavItem
          label="Inicio"
          icon={<HomeIcon />}
          isActive={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          label="Despensa"
          icon={<CatalogIcon />}
          isActive={activeView === 'catalog'}
          onClick={() => setActiveView('catalog')}
        />
        <NavItem
          label="Lista"
          icon={<ListIcon />}
          isActive={activeView === 'list'}
          onClick={() => setActiveView('list')}
        />
        <NavItem
          label="Tiendas"
          icon={<StoreIcon />}
          isActive={activeView === 'stores' || activeView === 'storeDetail'}
          onClick={() => setActiveView('stores')}
        />
         <NavItem
          label="Ayuda"
          icon={<div className="h-6 w-6 flex items-center justify-center text-2xl font-bold">?</div>}
          isActive={false}
          onClick={onOpenHelp}
        />
      </div>
    </nav>
  );
};

export default BottomNav;