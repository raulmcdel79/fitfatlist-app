import React from 'react';
import type { ListItem, Product, UserMap } from '../types';
import { ListItemStatus } from '../types';
import { CheckCircleIcon, CheckedCircleIcon } from '../constants';

interface ShoppingModeItemProps {
  item: ListItem;
  product: Product;
  onUpdate: (item: ListItem) => void;
  usersMap: UserMap;
}

const ShoppingModeItem: React.FC<ShoppingModeItemProps> = ({ item, product, onUpdate, usersMap }) => {
  const isPicked = item.status === ListItemStatus.PICKED;
  const pickedByUser = item.pickedBy ? usersMap.get(item.pickedBy) : null;

  const togglePicked = () => {
    onUpdate({
      ...item,
      status: isPicked ? ListItemStatus.PENDING : ListItemStatus.PICKED,
    });
  };

  return (
    <li
      className={`transition-all duration-200 cursor-pointer ${isPicked ? 'bg-bg opacity-60' : 'bg-surface hover:bg-bg'}`}
      onClick={togglePicked}
      role="button"
      tabIndex={0}
      aria-label={`Marcar ${product.name} como ${isPicked ? 'pendiente' : 'comprado'}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && togglePicked()}
    >
      <div className="flex items-center p-4">
        <div className="mr-4 flex-shrink-0">
          {isPicked ? <CheckedCircleIcon className="h-8 w-8 text-accent" /> : <CheckCircleIcon />}
        </div>

        <div className="flex-grow">
          <p className={`font-semibold text-lg ${isPicked ? 'text-ink-muted line-through' : 'text-ink'}`}>
            {product.name}
          </p>
          <div className={`text-sm ${isPicked ? 'text-ink-muted' : 'text-ink-muted'}`}>
             {isPicked && pickedByUser ? (
                <span className="font-semibold text-accent">✓ Comprado por {pickedByUser.name}</span>
             ) : (
                <span>{item.quantity} {product.unit} {product.brand && `(${product.brand})`}</span>
             )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ShoppingModeItem;