

import React from 'react';
import type { Store } from '../types';
import { EditIcon, colorClassMap } from '../constants';

interface StoresViewProps {
  stores: Store[];
  onSelectStore: (storeId: string) => void;
  onEditStore: (store: Store) => void;
}

const StoresView: React.FC<StoresViewProps> = ({ stores, onSelectStore, onEditStore }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-ink">Tiendas</h2>
      {stores.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-muted">No has añadido ninguna tienda.</p>
          <p className="mt-2 text-sm">Haz clic en el botón '+' para añadir tu primera tienda.</p>
        </div>
      ) : (
        <div className="border-y border-border">
          <ul className="divide-y divide-border">
            {stores.map(store => {
              const colorClasses = colorClassMap[store.color] || { pillBg: 'bg-pill', iconText: 'text-brand' };
              return (
              <li key={store.id} className="group">
                <div className="w-full p-4 flex items-center text-left">
                  <button onClick={() => onSelectStore(store.id)} className="flex-grow flex items-center transition-opacity">
                    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full mr-4 ${colorClasses.pillBg}`}>
                      <span className={`text-xl font-bold ${colorClasses.iconText}`}>
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={`font-semibold ${colorClasses.iconText}`}>{store.name}</span>
                  </button>
                  <button
                    onClick={() => onEditStore(store)}
                    className="ml-4 p-2 rounded-full text-ink-muted bg-bg opacity-0 group-hover:opacity-100 hover:bg-border hover:text-ink transition-all"
                    aria-label={`Editar ${store.name}`}
                  >
                    <EditIcon />
                  </button>
                </div>
              </li>
            )})}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoresView;