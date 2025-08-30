import React from 'react';
import type { Store, ListItem, ProductMap, CategoryMap, PriceRecord, UserMap } from '../types';
import ListItemComponent from './ListItem';
import { colorClassMap } from '../constants';

interface StoreSectionProps {
  store: Store;
  items: ListItem[];
  onUpdateItem: (item: ListItem) => void;
  onDeleteItem: (itemId: string) => void;
  productMap: ProductMap;
  categoryMap: CategoryMap;
  stores: Store[];
  priceRecords: PriceRecord[];
  subtotal: number;
  usersMap: UserMap;
}

const StoreSection: React.FC<StoreSectionProps> = ({ store, items, onUpdateItem, onDeleteItem, productMap, categoryMap, stores, priceRecords, subtotal, usersMap }) => {
  let lastCategoryId: string | null = null;
  const colorClasses = colorClassMap[store.color] || colorClassMap.teal;

  return (
    <section>
      <div className="flex justify-between items-center px-4 py-3 border-b-2 border-border">
        <h3 className={`text-lg font-bold ${colorClasses.iconText}`}>{store.name}</h3>
        <span className="font-bold px-2 py-1 rounded-md text-sm bg-border text-ink">{subtotal.toFixed(2)}€</span>
      </div>
      <ul className="divide-y divide-border border-b border-border">
          {items.map(item => {
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
                <ListItemComponent
                  item={item}
                  product={product}
                  onUpdate={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                  stores={stores}
                  priceRecords={priceRecords}
                  usersMap={usersMap}
                />
              </React.Fragment>
            );
          })}
        </ul>
    </section>
  );
};

export default StoreSection;