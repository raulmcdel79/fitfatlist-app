

import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { ListItem, Product, Store, PriceRecord, UserMap } from '../types';
import { ListItemStatus } from '../types';
import { MinusIcon, PlusIcon, TrashIcon, colorClassMap, StarRatingDisplay } from '../constants';

interface ListItemComponentProps {
  item: ListItem;
  product: Product;
  onUpdate: (item: ListItem) => void;
  onDeleteItem: (itemId: string) => void;
  stores: Store[];
  priceRecords: PriceRecord[];
  usersMap: UserMap;
}

const ListItemComponent: React.FC<ListItemComponentProps> = ({ item, product, onUpdate, onDeleteItem, stores, priceRecords, usersMap }) => {
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPicked = item.status === ListItemStatus.PICKED;

  const availablePrices = useMemo(() => {
    return priceRecords.filter(p => p.productId === product.id);
  }, [priceRecords, product.id]);

  const store = useMemo(() => stores.find(s => s.id === item.storeId), [stores, item.storeId]);
  const colorClasses = useMemo(() => store ? (colorClassMap[store.color] || null) : null, [store]);
  
  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
        onDeleteItem(item.id);
    } else {
        onUpdate({ ...item, quantity: newQuantity });
    }
  };

  const handleStoreSelect = (newStoreId: string, newPrice: number) => {
    onUpdate({
        ...item,
        storeId: newStoreId,
        priceSnapshot: newPrice
    });
    setIsStoreMenuOpen(false);
  };

  const togglePicked = () => {
    onUpdate({
      ...item,
      status: isPicked ? ListItemStatus.PENDING : ListItemStatus.PICKED,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  const totalItemPrice = (item.priceSnapshot || 0) * item.quantity;
  const pickedByUser = item.pickedBy ? usersMap.get(item.pickedBy) : null;
  
  return (
    <li
      className={`group flex items-center p-4 transition-colors hover:bg-bg ${isPicked ? 'opacity-60' : ''}`}
      role="listitem"
    >
      {/* Product Information */}
      <div 
        className="flex-1 min-w-0 pr-4 cursor-pointer"
        onClick={togglePicked}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && togglePicked()}
        aria-label={`Marcar ${product.name} como ${isPicked ? 'pendiente' : 'comprado'}`}
      >
        <h3 className={`font-semibold text-ink truncate ${isPicked ? 'line-through' : ''}`} title={product.name}>{product.name}</h3>
         {isPicked && pickedByUser ? (
            <p className="text-xs text-accent font-semibold">
                ✓ Comprado por {pickedByUser.name}
            </p>
         ) : (
            <p className="text-xs text-ink-muted truncate">{[product.brand, product.size].filter(Boolean).join(' · ')}</p>
         )}
      </div>

      {/* Controls and Info */}
      <div className="flex items-center gap-4">
        {!isPicked ? (
        <>
            <div className="flex items-center border border-border rounded-lg bg-surface" onClick={e => e.stopPropagation()}>
                <button
                    onClick={() => handleQuantityChange(-1)}
                    className="h-9 px-3 text-ink-muted hover:text-danger transition-colors"
                    aria-label={`Reducir cantidad de ${product.name}`}
                >
                    <MinusIcon />
                </button>
                <span className="text-base font-bold w-10 h-9 flex items-center justify-center text-center text-ink border-x border-border bg-bg">
                    {item.quantity}
                </span>
                <button
                    onClick={() => handleQuantityChange(1)}
                    className="h-9 px-3 text-ink-muted hover:text-brand transition-colors"
                    aria-label={`Aumentar cantidad de ${product.name}`}
                >
                    <PlusIcon />
                </button>
            </div>
            
            <div className="relative w-40" ref={dropdownRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsStoreMenuOpen(prev => !prev); }}
                className="w-full text-right p-2 rounded-xl hover:bg-surface transition-colors disabled:opacity-70 disabled:cursor-default"
                disabled={availablePrices.length <= 1}
                aria-haspopup="true"
                aria-expanded={isStoreMenuOpen}
              >
                  <p className="font-bold text-lg text-brand">{totalItemPrice.toFixed(2)}€</p>
                  <div className="flex items-center justify-end gap-1">
                      <p className={`text-xs truncate ${colorClasses ? colorClasses.iconText : 'text-ink-muted'}`}>
                          en {store?.name || 'Tienda'}
                      </p>
                      {availablePrices.length > 1 && (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${isStoreMenuOpen ? 'rotate-180' : ''} ${colorClasses ? colorClasses.iconText : 'text-ink-muted'}`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                  </div>
              </button>

              {isStoreMenuOpen && (
                 <div 
                    className="absolute top-full right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border z-20"
                    onClick={e => e.stopPropagation()}
                  >
                   <div className="p-2 text-xs font-semibold text-ink-muted border-b border-border">Cambiar tienda</div>
                   <ul className="py-1 max-h-48 overflow-y-auto">
                      {availablePrices.sort((a, b) => a.price - b.price).map(pr => {
                        const priceStore = stores.find(s => s.id === pr.storeId);
                        if (!priceStore) return null;
                        const priceStoreColorClasses = colorClassMap[priceStore.color] || colorClassMap.teal;
                        const isCurrent = item.storeId === pr.storeId;

                        return (
                          <li key={pr.id}>
                            <button
                              onClick={() => handleStoreSelect(pr.storeId, pr.price)}
                              className="w-full text-left flex justify-between items-center px-3 py-2 text-sm hover:bg-bg transition-colors"
                            >
                              <div className="flex-grow flex items-center gap-2">
                                <span className={`${priceStoreColorClasses.iconText} ${isCurrent ? 'font-bold' : ''}`}>{priceStore.name}</span>
                                <StarRatingDisplay quality={pr.quality} size="sm" /> 
                              </div>
                              <span className={`flex-shrink-0 ${isCurrent ? 'font-bold text-brand' : 'text-ink'}`}>{pr.price.toFixed(2)}€</span>
                            </button>
                          </li>
                        );
                      })}
                   </ul>
                 </div>
              )}
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
              className="p-2 text-ink-muted hover:text-danger transition rounded-full hover:bg-danger/10 opacity-0 group-hover:opacity-100 focus:opacity-100" 
              aria-label={`Eliminar ${product.name} de la lista`}
            >
              <TrashIcon className="h-5 w-5"/>
            </button>
        </>
        ) : (
             <div className="flex items-center justify-end flex-grow gap-4">
                <p className="font-bold text-lg text-ink-muted line-through">{totalItemPrice.toFixed(2)}€</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                  className="p-2 text-ink-muted hover:text-danger transition rounded-full hover:bg-danger/10 opacity-100" // Always visible when picked
                  aria-label={`Eliminar ${product.name} de la lista`}
                >
                  <TrashIcon className="h-5 w-5"/>
                </button>
             </div>
        )}
      </div>
    </li>
  );
};

export default ListItemComponent;