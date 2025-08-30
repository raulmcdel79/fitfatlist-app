import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { MinusIcon, PlusIcon, EditIcon, TrashIcon } from '../constants';

const ProductCardSimple: React.FC<{
  product: Product;
  quantityInList: number;
  onAdd: () => void;
  onRemove: () => void;
  onSetQuantity: (quantity: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  storeName?: string;
  bestPrice?: number;
}> = ({ product, quantityInList, onAdd, onRemove, onSetQuantity, onEdit, onDelete, bestPrice }) => {
  // Obtener el nombre de la categoría si existe
  const categoryName = product.categoryName || product.category || '';
  const [inputValue, setInputValue] = useState(String(quantityInList));

  useEffect(() => {
    setInputValue(String(quantityInList));
  }, [quantityInList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const newQuantity = parseInt(inputValue, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0 && newQuantity !== quantityInList) {
        onSetQuantity(newQuantity);
    } else {
        setInputValue(String(quantityInList));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      className="group w-full p-3 sm:p-4 hover:bg-bg transition-colors product-card-mobile-fix"
      role="article"
      aria-label={product.name}
      style={{minHeight:'64px'}}
    >
      {/* MOBILE: Nombre grande alineado a la izquierda, marca debajo */}
      <div className="flex flex-col gap-1 sm:hidden">
        <h3 className="font-bold text-lg text-ink leading-tight text-left w-full break-words" style={{minHeight:'2.5rem'}}>{product.name}</h3>
        <p className="text-xs text-ink-muted truncate text-left w-full">{[product.brand, product.size].filter(Boolean).join(' · ')}</p>
        {categoryName && (
          <span className="text-xs text-ink-muted font-medium mt-1 text-left w-full">{categoryName}</span>
        )}
      </div>
      {/* DESKTOP: Estructura anterior */}
      <div className="hidden sm:flex items-center w-full">
        {categoryName && (
          <div className="w-full">
            <span className="product-category-mobile">{categoryName}</span>
          </div>
        )}
        <div className="flex-grow min-w-0 pr-2 flex flex-col items-start">
          <h3 className="font-semibold text-ink truncate text-left w-full" style={{maxWidth:'120px'}}>{product.name}</h3>
          <p className="text-xs text-ink-muted truncate text-left w-full" style={{maxWidth:'120px'}}>{[product.brand, product.size].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {/* Debajo: resto de datos igual que antes, pero en móvil con margen superior */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
        <div className="flex-shrink-0 w-20 text-right pr-1" style={{minWidth:'60px',maxWidth:'90px'}}>
           {bestPrice !== undefined ? (
            <div className="flex items-baseline justify-end">
              <span className="font-semibold text-ink text-lg truncate" style={{maxWidth:'100%'}}>{bestPrice.toFixed(2)}€</span>
              <span className="text-xs text-ink-muted ml-1 truncate" style={{maxWidth:'100%'}}>/ {product.unit}</span>
            </div>
          ) : (
            <div className="flex items-baseline h-8 justify-end">
              <span className="text-xs font-medium text-ink-muted italic">Sin precio</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-24 flex items-center justify-center" style={{minWidth:'40px',maxWidth:'80px'}}>
           <div className="flex items-center border border-border rounded-lg bg-surface" onClick={e => e.stopPropagation()}>
              <button
                  onClick={(e) => handleActionClick(e, onRemove)}
                  className="h-9 px-2 text-ink-muted hover:text-danger disabled:opacity-50 transition-colors"
                  disabled={quantityInList === 0}
                  aria-label={`Reducir cantidad de ${product.name}`}
              >
                  <MinusIcon />
              </button>
              <input
                  type="number"
                  min="0"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="text-lg font-bold w-10 h-9 text-center text-ink border-x border-border bg-bg focus:outline-none focus:ring-2 focus:ring-brand [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label={`Cantidad de ${product.name}`}
              />
              <button
                  onClick={(e) => handleActionClick(e, onAdd)}
                  className="h-9 px-2 text-ink-muted hover:text-brand transition-colors disabled:opacity-50"
                  disabled={bestPrice === undefined}
                  aria-label={`Aumentar cantidad de ${product.name}`}
              >
                  <PlusIcon />
              </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-16 flex items-center justify-center gap-1" style={{minWidth:'40px',maxWidth:'60px'}}>
           <button 
              onClick={(e) => handleActionClick(e, onEdit)} 
              className="p-1 text-ink-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-surface hover:text-brand transition-all rounded-full"
              data-tooltip="Editar Producto"
          >
              <EditIcon />
          </button>

          <button 
              onClick={(e) => handleActionClick(e, onDelete)} 
              className="p-1 text-ink-muted opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-danger/10 hover:text-danger transition-all rounded-full"
              data-tooltip="Eliminar Producto"
          >
              <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSimple;