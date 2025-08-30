

import React, { useMemo, useState, useCallback } from 'react';
import type { Product, StoreMap, Category, CategoryMap, PriceRecord } from '../types';
import ProductCard from './ProductCard';
import { XIcon, MinusIcon, PlusIcon, colorClassMap, SearchIcon } from '../constants';

interface PriceSelectionModalProps {
  product: Product;
  prices: { storeId: string; price: number; storeName: string; storeColor: string }[];
  onClose: () => void;
  onAddItems: (itemsToAdd: { storeId: string; quantity: number }[]) => void;
}

const PriceSelectionModal: React.FC<PriceSelectionModalProps> = ({ product, prices, onClose, onAddItems }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (storeId: string, delta: number) => {
    setQuantities(prev => {
      const currentQuantity = prev[storeId] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      return { ...prev, [storeId]: newQuantity };
    });
  };

  const handleSubmit = () => {
    const itemsToAdd = Object.entries(quantities)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([storeId, quantity]) => ({ storeId, quantity: Number(quantity) }));
    
    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
    }
    onClose();
  };
  
  const totalSelectedItems = Object.values(quantities).reduce((sum: number, q) => sum + Number(q), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-sm m-4 animate-fade-in-up shadow-card" onClick={e => e.stopPropagation()}>
         <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
        `}</style>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold text-ink">Añadir <span className="text-brand">{product.name}</span></h2>
           <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
         <div className="p-4 border-b border-border">
          <p className="text-sm text-ink-muted text-center">Indica la cantidad que quieres añadir en cada tienda.</p>
        </div>
        <div className="p-2 max-h-[50vh] overflow-y-auto">
          <ul className="space-y-1">
            {prices.map(priceInfo => {
              const colorClasses = colorClassMap[priceInfo.storeColor] || colorClassMap.teal;
              return (
              <li key={priceInfo.storeId} className="w-full text-left p-3 flex justify-between items-center bg-bg rounded-xl">
                <div>
                  <p className={`font-semibold ${colorClasses.iconText}`}>{priceInfo.storeName}</p>
                  <p className="font-bold text-base text-brand">{priceInfo.price.toFixed(2)}€</p>
                </div>
                
                <div className="flex items-center border border-border rounded-lg bg-surface">
                    <button 
                        onClick={() => handleQuantityChange(priceInfo.storeId, -1)}
                        className="h-10 px-3 text-ink-muted hover:text-danger disabled:opacity-50 transition-colors"
                        disabled={(quantities[priceInfo.storeId] || 0) === 0}
                        aria-label={`Reducir cantidad de ${product.name} en ${priceInfo.storeName}`}
                    >
                        <MinusIcon />
                    </button>
                    <span className="text-lg font-bold w-12 h-10 flex items-center justify-center text-center text-ink border-x border-border bg-bg">
                        {quantities[priceInfo.storeId] || 0}
                    </span>
                    <button 
                        onClick={() => handleQuantityChange(priceInfo.storeId, 1)}
                        className="h-10 px-3 text-ink-muted hover:text-brand transition-colors"
                        aria-label={`Aumentar cantidad de ${product.name} en ${priceInfo.storeName}`}
                    >
                        <PlusIcon />
                    </button>
                </div>

              </li>
            )})}
          </ul>
        </div>
        <div className="p-4 bg-bg rounded-b-2xl border-t border-border">
      <button 
        onClick={handleSubmit}
        className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-brand-ink bg-brand hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={totalSelectedItems === 0}
      >
        Añadir {Number(totalSelectedItems) > 0 ? `${totalSelectedItems} Artículo(s)` : ''} a la Lista
      </button>
        </div>
      </div>
    </div>
  );
};

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  categoryMap: CategoryMap;
  priceRecords: PriceRecord[];
  onAddItem: (productId: string, storeId: string, quantity: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  storeMap: StoreMap;
}

const CatalogView: React.FC<CatalogViewProps> = ({ products, categories, categoryMap, priceRecords, onAddItem, onEditProduct, storeMap, onDeleteProduct }) => {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceModalData, setPriceModalData] = useState<{
    product: Product;
    prices: { storeId: string; price: number; storeName: string; storeColor: string }[];
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleAddItemRequest = useCallback((product: Product) => {
    const availablePrices = priceRecords
      .filter(pr => pr.productId === product.id)
      .map(pr => {
        const store = storeMap.get(pr.storeId);
        return {
          storeId: pr.storeId,
          price: pr.price,
          storeName: store?.name || 'Desconocida',
          storeColor: store?.color || 'teal',
        };
      })
      .sort((a, b) => a.price - b.price);

    if (availablePrices.length === 0) {
      alert('Este producto no tiene precios. Añade uno desde la pantalla de edición.');
      return;
    }

    if (availablePrices.length === 1) {
      onAddItem(product.id, availablePrices[0].storeId, 1);
      return;
    }

    setPriceModalData({ product, prices: availablePrices });
    setIsPriceModalOpen(true);
  }, [priceRecords, storeMap, onAddItem]);

  const handleMultipleItemsAdd = useCallback((itemsToAdd: { storeId: string; quantity: number }[]) => {
    if (priceModalData) {
      itemsToAdd.forEach(item => {
        onAddItem(priceModalData.product.id, item.storeId, item.quantity);
      });
    }
    setIsPriceModalOpen(false);
    setPriceModalData(null);
  }, [priceModalData, onAddItem]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (selectedCategory === 'all') return true;
        return p.categoryId === selectedCategory;
      })
      .filter(p => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
          p.name.toLowerCase().includes(term) ||
          (p.brand && p.brand.toLowerCase().includes(term)) ||
          (p.aliases && p.aliases.some(a => a.toLowerCase().includes(term)))
        );
      });
  }, [products, searchTerm, selectedCategory]);

  const groupedProducts = useMemo(() => {
      const map = new Map<string, Product[]>();
      filteredProducts.forEach(p => {
          if (!map.has(p.categoryId)) {
              map.set(p.categoryId, []);
          }
          map.get(p.categoryId)!.push(p);
      });
      
      map.forEach(products => {
        products.sort((a, b) => a.name.localeCompare(b.name));
      });

      return map;
  }, [filteredProducts]);

  const categoryOrder = useMemo(() => categories.map(c => c.id), [categories]);

  const sortedCategoryIds = useMemo(() => {
    return [...groupedProducts.keys()].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
  }, [groupedProducts, categoryOrder]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-ink">Despensa</h2>
      
      <div className="mb-4 flex items-center gap-2 -mx-4 px-4 py-2 border-b border-border">
        <div className="relative flex-grow">
          <input 
            type="text"
            placeholder="Buscar producto, marca..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            <SearchIcon />
          </div>
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl font-semibold py-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-brand focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {products.length > 0 && filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-muted">No se encontraron productos.</p>
          <p className="mt-2 text-sm">Prueba a cambiar los filtros o el término de búsqueda.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-muted">Tu despensa está vacía.</p>
          <p className="mt-2 text-sm">Haz clic en el botón '+' para añadir tu primer producto.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {sortedCategoryIds.map(categoryId => {
                const category = categoryMap.get(categoryId);
                const categoryProducts = groupedProducts.get(categoryId);
                if (!category || !categoryProducts) return null;

                return (
                    <section key={categoryId}>
                        <h3 className="text-xl font-semibold text-ink mb-4 py-2 -mx-4 px-4 border-b border-border">{category.name}</h3>
                        <div className="border-y border-border divide-y divide-border">
                          {categoryProducts.map(product => {
                              const availablePrices = priceRecords
                                .filter(pr => pr.productId === product.id)
                                .map(pr => {
                                  const store = storeMap.get(pr.storeId);
                                  return {
                                    storeId: pr.storeId,
                                    price: pr.price,
                                    quality: pr.quality,
                                    storeName: store?.name || 'Desconocida',
                                    storeColor: store?.color || 'teal',
                                  };
                                })
                                .sort((a, b) => a.price - b.price);
                              
                              const bestPrice = availablePrices.length > 0 ? availablePrices[0] : null;

                // Pasar categoryName como prop extra para móvil
                return (
                  <ProductCard
                    key={product.id}
                    product={{...product, categoryName: category?.name || ''}}
                    bestPrice={bestPrice}
                    onAdd={() => handleAddItemRequest(product)}
                    onEdit={() => onEditProduct(product)}
                    onDelete={() => onDeleteProduct(product.id)}
                  />
                );
                          })}
                        </div>
                    </section>
                )
            })}
        </div>
      )}
       {isPriceModalOpen && priceModalData && (
        <PriceSelectionModal
          product={priceModalData.product}
          prices={priceModalData.prices}
          onClose={() => setIsPriceModalOpen(false)}
          onAddItems={handleMultipleItemsAdd}
        />
      )}
    </div>
  );
};

export default CatalogView;