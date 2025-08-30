import React, { useMemo, useState } from 'react';
import type { List, ListItem, ProductMap, StoreMap, CategoryMap, Store, UserMap } from '../types';
import { ListItemStatus } from '../types';
import { XIcon, ShoppingCartIcon } from '../constants';
import ShoppingModeItem from './ShoppingModeItem';

interface ShoppingModeViewProps {
  list: List;
  onUpdateItem: (item: ListItem) => void;
  productMap: ProductMap;
  storeMap: StoreMap;
  categoryMap: CategoryMap;
  onExit: () => void;
  usersMap: UserMap;
}

const ShoppingModeStoreSection: React.FC<{
    store: Store | { id: string; name: string; aisleOrder: string[] };
    items: ListItem[];
    onUpdateItem: (item: ListItem) => void;
    productMap: ProductMap;
    categoryMap: CategoryMap;
    usersMap: UserMap;
}> = ({ store, items, onUpdateItem, productMap, categoryMap, usersMap }) => {
    
    const [pickedVisible, setPickedVisible] = useState(false);

    const pendingItems = items.filter(i => i.status === ListItemStatus.PENDING);
    const pickedItems = items.filter(i => i.status === ListItemStatus.PICKED);

    let lastCategoryId: string | null = null;

    if (items.length === 0) return null;

    return (
        <div className="bg-surface rounded-2xl shadow-card mb-6">
            <h3 className="text-xl font-bold text-ink px-4 py-3 border-b border-border">{store.name}</h3>
            <div className="">
                <ul className="divide-y divide-border">
                    {pendingItems.map(item => {
                         const product = productMap.get(item.productId);
                         if (!product) return null;
             
                         const showCategoryHeader = product.categoryId !== lastCategoryId;
                         lastCategoryId = product.categoryId;
                         const category = categoryMap.get(product.categoryId);

                         return (
                            <React.Fragment key={item.id}>
                                {showCategoryHeader && category && (
                                    <li className="bg-bg px-4 py-1 border-y border-border">
                                        <h4 className="text-xs font-semibold uppercase text-ink-muted tracking-wider">{category.name}</h4>
                                    </li>
                                )}
                                <ShoppingModeItem item={item} product={product} onUpdate={onUpdateItem} usersMap={usersMap} />
                            </React.Fragment>
                         );
                    })}
                </ul>

                {pendingItems.length === 0 && pickedItems.length > 0 && (
                    <div className="p-4 text-center text-ink-muted">
                        <p>¡Todo listo en esta tienda!</p>
                    </div>
                )}

                {pickedItems.length > 0 && (
                    <div className="border-t border-border">
                        <button onClick={() => setPickedVisible(!pickedVisible)} className="w-full text-left px-4 py-3 text-ink-muted font-semibold text-sm hover:bg-bg">
                            {pickedVisible ? 'Ocultar' : 'Mostrar'} {pickedItems.length} productos comprados
                        </button>
                        {pickedVisible && (
                             <ul className="divide-y divide-border border-t border-border">
                                {pickedItems.map(item => {
                                    const product = productMap.get(item.productId);
                                    if (!product) return null;
                                    return <ShoppingModeItem key={item.id} item={item} product={product} onUpdate={onUpdateItem} usersMap={usersMap} />
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({ list, onUpdateItem, productMap, storeMap, categoryMap, onExit, usersMap }) => {
  const { groupedItems, pickedItemsCount } = useMemo(() => {
    const grouped = new Map<string, ListItem[]>();
    let pickedCount = 0;

    list.items.forEach(item => {
      if(item.status === ListItemStatus.PICKED) {
        pickedCount++;
      }
      const product = productMap.get(item.productId);
      if (!product) return;
      
      const storeId = item.storeId || 'unknown';
      if (!grouped.has(storeId)) {
        grouped.set(storeId, []);
      }
      grouped.get(storeId)!.push(item);
    });

    grouped.forEach((items, storeId) => {
      const store = storeMap.get(storeId);
      items.sort((a, b) => {
        const productA = productMap.get(a.productId);
        const productB = productMap.get(b.productId);
        if (!productA || !productB) return 0;
        
        // Primary sort: by aisle order of categories if available
        if (store && store.aisleOrder) {
          const indexA = store.aisleOrder.indexOf(productA.categoryId);
          const indexB = store.aisleOrder.indexOf(productB.categoryId);
          const categoryComparison = (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          if (categoryComparison !== 0) return categoryComparison;
        }
        
        // Secondary sort: alphabetically by product name
        return productA.name.localeCompare(productB.name);
      });
    });

    const storeOrder = Array.from(storeMap.keys());
    const sortedGroupedItems = new Map([...grouped.entries()].sort(
        (a, b) => storeOrder.indexOf(a[0]) - storeOrder.indexOf(b[0])
    ));
    
    if(sortedGroupedItems.has('unknown')){
        const unknownItems = sortedGroupedItems.get('unknown');
        sortedGroupedItems.delete('unknown');
        if (unknownItems) {
            sortedGroupedItems.set('unknown', unknownItems);
        }
    }

    return { groupedItems: sortedGroupedItems, pickedItemsCount: pickedCount };
  }, [list.items, productMap, storeMap]);

  const totalItems = list.items.length;
  
  return (
    <div className="bg-bg min-h-screen">
      <header className="sticky top-0 bg-bg/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <ShoppingCartIcon className="text-brand"/>
             <h1 className="text-xl font-bold text-brand">Modo Compra</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="font-semibold text-ink text-lg">{pickedItemsCount} / {totalItems}</span>
             <button onClick={onExit} className="text-ink-muted hover:text-ink" aria-label="Salir de Modo Compra">
                <XIcon />
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
         {Array.from(groupedItems.entries()).map(([storeId, items]) => (
            <ShoppingModeStoreSection
              key={storeId}
              store={storeMap.get(storeId) || { id: 'unknown', name: 'Otros Artículos', aisleOrder: [] }}
              items={items}
              onUpdateItem={onUpdateItem}
              productMap={productMap}
              categoryMap={categoryMap}
              usersMap={usersMap}
            />
          ))}
          {list.items.length === 0 && (
            <div className="text-center py-16 mt-4 bg-surface rounded-2xl shadow-card border border-border">
                <p className="text-ink-muted">La lista está vacía.</p>
                <p className="mt-2 text-sm text-ink-muted">Sal del modo compra para añadir productos.</p>
            </div>
          )}
      </main>
    </div>
  );
};

export default ShoppingModeView;