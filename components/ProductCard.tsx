import React from 'react';
import type { Product, PriceQuality } from '../types';
import { EditIcon, TrashIcon, PlusIcon, colorClassMap, StarRatingDisplay, HealthScoreDisplay } from '../constants';

interface ProductCardProps {
  product: Product;
  bestPrice: { storeId: string; price: number; storeName: string; storeColor: string; quality: PriceQuality } | null;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, bestPrice, onAdd, onEdit, onDelete }) => {
  // Obtener el nombre de la categoría si existe
  const categoryName = product.categoryName || product.category || '';
  // Obtener color de la tienda si existe
  const colorClasses = bestPrice && bestPrice.storeColor ? colorClassMap[bestPrice.storeColor] : null;

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <article
      className="group w-full p-3 sm:p-4 hover:bg-bg transition-colors product-card-mobile-fix"
      aria-label={product.name}
      style={{minHeight:'64px'}}
    >
        {/* MOBILE: Bloque superior con nombre grande y valoraciones a la derecha */}
        <div className="flex flex-col gap-1 sm:hidden">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col w-full items-end">
              <span className="text-xs text-ink-muted font-medium mb-0.5 text-right w-full" style={{display:'block'}}>{product.name}</span>
              <h3 className="font-bold text-lg text-ink leading-tight text-right w-full break-words" title={product.name} style={{minHeight:'2.5rem'}}>{product.brand}</h3>
            </div>
            <div className="flex flex-col items-end gap-1 ml-2">
              <HealthScoreDisplay product={product} />
              {bestPrice && <StarRatingDisplay quality={bestPrice.quality} size="sm" />}
            </div>
          </div>
          {categoryName && (
            <span className="text-xs text-ink-muted font-medium mt-1">{categoryName}</span>
          )}
        </div>
        {/* DESKTOP: Estructura anterior */}
        <div className="hidden sm:flex items-center gap-2 w-full">
          {categoryName && (
            <div className="w-full">
              <span className="product-category-mobile">{categoryName}</span>
            </div>
          )}
          <div className="flex-grow flex items-center gap-2 min-w-0">
            <div className="flex-grow min-w-0 flex flex-col items-end">
              <span className="text-xs text-ink-muted font-medium mb-0.5 text-right w-full" style={{display:'block'}}>{product.name}</span>
              <h3 className="font-semibold text-ink text-right w-full break-words" title={product.brand}>{product.brand}</h3>
              <p className="text-sm text-ink-muted text-right w-full break-words" title={product.size}>{product.size}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1">
                <HealthScoreDisplay product={product} />
                {bestPrice && <StarRatingDisplay quality={bestPrice.quality} size="sm" />}
            </div>
          </div>
        </div>
        {/* Debajo: resto de datos igual que antes, pero en móvil con margen superior */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
          <div className="flex-grow min-w-0">
            <p className="text-xs text-ink-muted truncate" title={[product.brand, product.size].filter(Boolean).join(' · ')}>{[product.brand, product.size].filter(Boolean).join(' · ')}</p>
          </div>
          <div className="flex-shrink-0 text-right flex flex-col justify-center" style={{ width: '6.5rem', minWidth:'80px', maxWidth:'110px' }}>
            {bestPrice ? (
              <>
                <p className="font-bold text-lg text-ink truncate" style={{maxWidth:'100%'}}>{bestPrice.price.toFixed(2)}€</p>
                <p className={`text-xs font-medium ${colorClasses ? colorClasses.iconText : 'text-ink-muted'} truncate`} title={bestPrice.storeName} style={{maxWidth:'100%'}}>
                  en {bestPrice.storeName}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted italic">Sin precios</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1" style={{minWidth:'40px'}}>
      <div className="flex items-center opacity-40 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button 
          onClick={(e) => handleActionClick(e, onEdit)} 
          className="flex items-center justify-center h-9 w-9 text-ink-muted hover:bg-surface hover:text-brand transition-all rounded-full"
          aria-label={`Editar ${product.name}`}
          data-tooltip="Editar"
        >
          <EditIcon />
        </button>
        <button 
          onClick={(e) => handleActionClick(e, onDelete)} 
          className="flex items-center justify-center h-9 w-9 text-ink-muted hover:bg-surface hover:text-danger transition-all rounded-full"
          aria-label={`Eliminar ${product.name}`}
          data-tooltip="Eliminar"
        >
          <TrashIcon />
        </button>
      </div>
      <button 
        onClick={(e) => handleActionClick(e, onAdd)} 
        className="flex items-center justify-center h-9 w-9 bg-brand/10 text-brand hover:bg-brand/20 transition-all rounded-full disabled:opacity-50 disabled:bg-border disabled:text-ink-muted"
        disabled={!bestPrice}
        aria-label={`Añadir ${product.name} a la lista`}
        data-tooltip="Añadir"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
      </div>
    </div>
    </article>
  );
};

export default ProductCard;