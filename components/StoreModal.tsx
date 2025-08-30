import React, { useState, useEffect } from 'react';
import { XIcon } from '../constants';
import type { Store } from '../types';

interface StoreModalProps {
  storeToEdit: Store | null;
  onClose: () => void;
  onSave: (data: { id?: string, name: string }) => void;
}

const StoreModal: React.FC<StoreModalProps> = ({ storeToEdit, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (storeToEdit) {
      setName(storeToEdit.name);
    } else {
      // Reset for new store
      setName('');
    }
  }, [storeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ 
          id: storeToEdit?.id, 
          name: name.trim(), 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-20 flex justify-center items-center" onClick={onClose}>
      <div className="bg-surface rounded-2xl border border-border w-full max-w-sm m-4 animate-fade-in-up shadow-card" onClick={e => e.stopPropagation()}>
         <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
        `}</style>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold text-ink">{storeToEdit ? 'Editar Tienda' : 'Añadir Nueva Tienda'}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <XIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-ink-muted mb-1">Nombre de la Tienda</label>
                <input
                  type="text"
                  id="storeName"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bg border border-border rounded-xl placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
                  autoFocus
                  placeholder="Ej. Supermercado El Barrio"
                />
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 bg-bg rounded-b-2xl border-t border-border">
            <button type="button" onClick={onClose} className="bg-surface py-2 px-4 border border-border rounded-xl text-sm font-medium text-ink hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
              Cancelar
            </button>
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-brand-ink bg-brand hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
              Guardar Tienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreModal;