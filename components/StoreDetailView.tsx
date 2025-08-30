

import React, { useMemo } from 'react';
import type { Product, Store, PriceRecord, CategoryMap, PriceQuality } from '../types';
import ProductCard from './ProductCard';
import { ArrowLeftIcon, colorClassMap } from '../constants';

interface StoreDetailViewProps {
  store: Store;
  allProducts: Product[];
  priceRecords: PriceRecord[];
  categoryMap: CategoryMap;
  onAddItem: (productId: string, quantity: number) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onBack: () => void;
}

const StoreDetailView: React.FC<StoreDetailViewProps> = ({
  store,
  allProducts,
  priceRecords,
  categoryMap,
  onAddItem,
  onEditProduct,
  onDeleteProduct,
  onBack,
}) => {

  const storePricesMap = useMemo(() => {
    const map = new Map<string, { price: number; quality: PriceQuality }>();
    priceRecords
      .filter(pr => pr.storeId === store.id)
      .forEach(pr => {
        map.set(pr.productId, { price: pr.price, quality: pr.quality });
      });
    return map;
  }, [priceRecords, store.id]);

  const storeProducts = useMemo(() => {
    return allProducts.filter(p => storePricesMap.has(p.id));
  }, [allProducts, storePricesMap]);

  const groupedProducts = useMemo(() => {
    const map = new Map<string, Product[]>();
    storeProducts.forEach(p => {
      if (!map.has(p.categoryId)) {
        map.set(p.categoryId, []);
      }
      map.get(p.categoryId)!.push(p);
    });

    map.forEach(products => {
      products.sort((a, b) => a.name.localeCompare(b.name));
    });

    return map;
  }, [storeProducts]);
  
  const sortedCategoryIds = useMemo(() => {
    const storeOrder = store.aisleOrder || [];
    return [...groupedProducts.keys()].sort((a, b) => {
      const indexA = storeOrder.indexOf(a);
      const indexB = storeOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0; // if both are not in order, keep original
      if (indexA === -1) return 1; // if a is not in order, put it at the end
      if (indexB === -1) return -1; // if b is not in order, put it at the end
      return indexA - indexB;
    });
  }, [groupedProducts, store.aisleOrder]);

  const colorClasses = useMemo(() => colorClassMap[store.color] || { iconText: 'text-ink' }, [store.color]);
  
  const handleAddItemFromStore = (product: Product) => {
    onAddItem(product.id, 1);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 rounded-full transition-colors hover:bg-surface" aria-label="Volver a tiendas">
          <ArrowLeftIcon className="text-ink" />
        </button>
        <h2 className={`text-2xl font-bold ${colorClasses.iconText}`}>{store.name}</h2>
      </div>

      {storeProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-muted">No hay productos con precio para esta tienda.</p>
          <p className="mt-2 text-sm">Puedes añadir precios a los productos en la Despensa.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategoryIds.map(categoryId => {
            const category = categoryMap.get(categoryId);
            const categoryProducts = groupedProducts.get(categoryId);
            if (!category || !categoryProducts) return null;

            return (
              <section key={categoryId}>
                <h3 className="text-xl font-semibold text-ink mb-4 sticky top-16 bg-bg/80 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">{category.name}</h3>
                <div className="border-y border-border divide-y divide-border">
                  {categoryProducts.map(product => {
                    const priceInfoForThisStore = storePricesMap.get(product.id);
                    // This check is slightly redundant because of storeProducts filtering, but it's safe
                    if (priceInfoForThisStore === undefined) return null; 

                    const pricePropForCard = {
                      storeId: store.id,
                      price: priceInfoForThisStore.price,
                      quality: priceInfoForThisStore.quality,
                      storeName: store.name,
                      storeColor: store.color,
                    };

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        bestPrice={pricePropForCard}
                        onAdd={() => handleAddItemFromStore(product)}
                        onEdit={() => onEditProduct(product)}
                        onDelete={() => onDeleteProduct(product.id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StoreDetailView;