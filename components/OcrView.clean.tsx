import React from 'react';
import { XIcon } from '../constants';

export const TicketLineItem = ({
  line,
  onDelete,
  onUpdateLineProductName,
  onUpdateLineBrand,
  onUpdateLineSize,
  categories,
  onUpdateLineCategory,
  onAddCategory
}) => {
  const inputStyles = "bg-transparent border border-border rounded-md focus:bg-surface focus:ring-1 focus:ring-brand outline-none transition-all";
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "--new--") {
      const newCat = prompt("Nombre de la nueva categoría:");
      if (newCat && newCat.trim()) {
        onAddCategory(newCat.trim()).then(cat => {
          onUpdateLineCategory(line.id, cat.name);
        });
      }
    } else {
      onUpdateLineCategory(line.id, value);
    }
  };
  return (
    <div className="bg-bg rounded-xl border border-border px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={line.productName || ''}
          onChange={e => onUpdateLineProductName(line.id, e.target.value)}
          className="font-semibold text-sm bg-transparent rounded-md p-1 focus:bg-surface focus:ring-1 focus:ring-brand outline-none transition-all min-w-[100px] max-w-[160px] flex-shrink"
          aria-label="Nombre del producto"
        />
        <input
          id={`brand-${line.id}`}
          type="text"
          value={line.brandGuess || ''}
          onChange={e => onUpdateLineBrand(line.id, e.target.value)}
          className={inputStyles + ' text-xs px-2 py-1 min-w-[60px] max-w-[90px]'}
          placeholder="Marca"
        />
        <input
          id={`size-${line.id}`}
          type="text"
          value={line.sizeGuess || ''}
          onChange={e => onUpdateLineSize(line.id, e.target.value)}
          className={inputStyles + ' text-xs px-2 py-1 min-w-[70px] max-w-[100px]'}
          placeholder="Tamaño (ej. 500g)"
        />
        <select
          id={`category-${line.id}`}
          value={line.suggestedCategoryName || ''}
          onChange={handleCategoryChange}
          className={inputStyles + ' text-xs px-2 py-1 min-w-[120px] max-w-[160px]'}
          style={{ width: '100%' }}
        >
          <option value="" disabled>Categoría...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name} className="bg-surface text-ink">{cat.name}</option>
          ))}
          <option value="--new--" className="font-bold text-brand bg-surface">
            + Nueva categoría...
          </option>
        </select>
        {line.suggestedCategoryName && !categories.some(cat => cat.name === line.suggestedCategoryName) && (
          <div className="p-2 rounded-xl bg-warn/20 border border-warn flex items-center gap-2">
            <span className="font-bold text-warn">⚠️</span>
            <span className="text-warn font-semibold">La categoría "{line.suggestedCategoryName}" para el producto "{line.productName}" no es válida. Por favor, revisa la categoría antes de aplicar.</span>
          </div>
        )}
        <span className="font-bold text-ink text-sm whitespace-nowrap ml-auto">{line.totalPrice?.toFixed(2) ?? ''}€</span>
        <span className="text-xs text-ink-muted whitespace-nowrap">{line.qty} x {line.unitPrice?.toFixed(2) ?? ''}</span>
        <button 
          onClick={() => onDelete(line.id)}
          className="flex-shrink-0 p-1.5 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
          aria-label={`Eliminar línea: ${line.productName || line.rawText}`}
        >
          <XIcon className="h-5 w-5"/>
        </button>
      </div>
    </div>
  );
};
