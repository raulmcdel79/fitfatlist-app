import React, { useMemo, useState, useCallback } from 'react';
import type { List, ListItem, ProductMap, StoreMap, CategoryMap, Store, PriceRecord, User, ListMemberRole, UserMap, Category } from '../types';
import ListItemComponent from './ListItem';
import StoreSection from './StoreSection';
import { ShoppingCartIcon, XIcon, TrashIcon, UsersIcon } from '../constants';

// --- Share List Modal (Inlined for simplicity as per instructions) ---

const roleNames: Record<ListMemberRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Lector',
};

const Avatar: React.FC<{ user?: User, size?: 'sm' | 'md' }> = ({ user, size = 'md' }) => {
    const sizeClasses = size === 'md' ? 'h-10 w-10 text-base' : 'h-8 w-8 text-sm';
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt={user.name} className={`${sizeClasses} rounded-full object-cover`} />;
    }
    
    return (
        <div className={`${sizeClasses} rounded-full bg-border flex items-center justify-center font-bold text-ink-muted`}>
            {user ? getInitials(user.name) : '?'}
        </div>
    );
};


const ShareListModal: React.FC<{
  list: List;
  currentUser: User;
  usersMap: UserMap;
  userEmailMap: Map<string, User>;
  onClose: () => void;
  onUpdateMembers: (listId: string, updatedMembers: Record<string, ListMemberRole>) => void;
}> = ({ list, currentUser, usersMap, userEmailMap, onClose, onUpdateMembers }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ListMemberRole>('editor');
  const [error, setError] = useState('');

  const currentUserRole = list.members[currentUser.id];
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';
  
  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;

    const userToInvite = userEmailMap.get(email);
    if (!userToInvite) {
      setError('No se ha encontrado un usuario con ese correo.');
      return;
    }
    if (list.members[userToInvite.id]) {
      setError('Este usuario ya es miembro de la lista.');
      return;
    }

    const updatedMembers = { ...list.members, [userToInvite.id]: inviteRole };
    onUpdateMembers(list.id, updatedMembers);
    setInviteEmail('');
  };

  const handleRoleChange = (userId: string, newRole: ListMemberRole) => {
    const updatedMembers = { ...list.members, [userId]: newRole };
    onUpdateMembers(list.id, updatedMembers);
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm('¿Seguro que quieres eliminar a este miembro de la lista?')) {
      const { [userId]: removed, ...rest } = list.members;
      onUpdateMembers(list.id, rest);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-lg m-4 flex flex-col max-h-[80vh] animate-fade-in-up shadow-card" onClick={e => e.stopPropagation()}>
         <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
        `}</style>
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-ink">Compartir "<span className="text-brand">{list.name}</span>"</h2>
            <div className="flex items-center gap-1 text-sm text-ink-muted mt-1">
              <UsersIcon className="h-4 w-4"/>
              <span>{Object.keys(list.members).length} Miembro(s)</span>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
            <ul className="space-y-3">
              {Object.entries(list.members).map(([userId, role]) => {
                  const user = usersMap.get(userId);
                  const isCurrentUser = userId === currentUser.id;
                  const isOwner = role === 'owner';
                  const canBeManaged = canManage && !isOwner && !(currentUserRole === 'admin' && role === 'admin');

                  return (
                    <li key={userId} className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div className="flex-grow">
                          <p className="font-semibold text-ink">{user?.name} {isCurrentUser && '(Tú)'}</p>
                          <p className="text-xs text-ink-muted">{user?.email}</p>
                      </div>
                      
                      {canBeManaged ? (
                         <select
                            value={role}
                            onChange={(e) => handleRoleChange(userId, e.target.value as ListMemberRole)}
                            className="bg-bg border border-border rounded-lg text-xs font-semibold py-1 pl-2 pr-7 appearance-none focus:ring-brand focus:border-brand transition"
                          >
                           <option value="admin">Administrador</option>
                           <option value="editor">Editor</option>
                           <option value="viewer">Lector</option>
                         </select>
                      ) : (
                         <span className="text-sm font-medium text-ink-muted px-2">{roleNames[role]}</span>
                      )}

                      {canBeManaged ? (
                        <button onClick={() => handleRemoveMember(userId)} data-tooltip="Eliminar miembro" className="p-2 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors">
                            <TrashIcon className="h-4 w-4"/>
                        </button>
                      ) : <div className="w-9 h-9"></div>}
                    </li>
                  )
              })}
            </ul>
        </div>
        
        {canManage && (
          <form onSubmit={handleInvite} className="flex-shrink-0 p-4 border-t border-border bg-bg rounded-b-2xl">
              <p className="text-sm font-semibold text-ink mb-2">Invitar a un nuevo miembro</p>
              <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => { setInviteEmail(e.target.value); setError(''); }}
                    placeholder="Correo electrónico del usuario"
                    className="flex-grow w-full px-3 py-2 bg-surface border border-border rounded-xl placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
                  />
                   <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as ListMemberRole)}
                        className="bg-surface border border-border rounded-xl text-sm py-2 pl-3 pr-8 appearance-none focus:ring-brand focus:border-brand transition"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Lector</option>
                    </select>
                  <button type="submit" className="py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-brand-ink bg-brand hover:opacity-90">Invitar</button>
              </div>
              {error && <p className="text-xs text-danger mt-2">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
};


// --- Main Shopping List View ---

interface ShoppingListViewProps {
  lists: List[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onUpdateItem: (item: ListItem) => void;
  onDeleteItem: (itemId: string) => void;
  productMap: ProductMap;
  storeMap: StoreMap;
  categoryMap: CategoryMap;
  categories: Category[];
  stores: Store[];
  priceRecords: PriceRecord[];
  onStartShopping: () => void;
  currentUser: User;
  users: User[];
  usersMap: UserMap;
  userEmailMap: Map<string, User>;
  onUpdateListMembers: (listId: string, updatedMembers: Record<string, ListMemberRole>) => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = (props) => {
  const { 
    lists, activeListId, onSelectList, onUpdateItem, onDeleteItem, productMap, 
    storeMap, categoryMap, categories, stores, priceRecords, onStartShopping,
    currentUser, usersMap, userEmailMap, onUpdateListMembers
  } = props;
  
  const [groupBy, setGroupBy] = useState<'category' | 'store'>('category');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const activeList = useMemo(() => lists.find(l => l.id === activeListId) || lists[0], [lists, activeListId]);

  const { totalEstimated, groupedItemsByCategory, categoryOrder, groupedItemsByStore, storeSubtotals } = useMemo(() => {
    if (!activeList) return { totalEstimated: 0, groupedItemsByCategory: new Map(), categoryOrder: [], groupedItemsByStore: new Map(), storeSubtotals: new Map() };
    
    let total = 0;
    const byCategory = new Map<string, ListItem[]>();
    const byStore = new Map<string, ListItem[]>();
    const subtotals = new Map<string, number>();
    
    activeList.items.forEach(item => {
        // Only count pending items in the total
        if (item.status === 'pending') {
            const price = (item.priceSnapshot || 0) * item.quantity;
            total += price;
        }

        const product = productMap.get(item.productId);
        if (product) {
            const categoryId = product.categoryId;
            if (!byCategory.has(categoryId)) {
                byCategory.set(categoryId, []);
            }
            byCategory.get(categoryId)!.push(item);
            
            const storeId = item.storeId;
            if (!byStore.has(storeId)) {
                byStore.set(storeId, []);
                subtotals.set(storeId, 0);
            }
            byStore.get(storeId)!.push(item);
            if(item.status === 'pending') {
               subtotals.set(storeId, (subtotals.get(storeId) || 0) + (item.priceSnapshot || 0) * item.quantity);
            }
        }
    });

    // Sort items within each category group alphabetically by product name
    byCategory.forEach((items) => {
        items.sort((a, b) => {
            const productA = productMap.get(a.productId);
            const productB = productMap.get(b.productId);
            return (productA?.name || '').localeCompare(productB?.name || '');
        });
    });

    // Sort items within each store group
    byStore.forEach((items, storeId) => {
        const store = storeMap.get(storeId);
        items.sort((a, b) => {
            const productA = productMap.get(a.productId);
            const productB = productMap.get(b.productId);
            if (!productA || !productB) return 0;
            // Primary sort: by aisle order of categories if available
            if (store?.aisleOrder?.length) {
                const indexA = store.aisleOrder.indexOf(productA.categoryId);
                const indexB = store.aisleOrder.indexOf(productB.categoryId);
                const categoryComparison = (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                if (categoryComparison !== 0) return categoryComparison;
            }
            // Secondary sort: alphabetically by product name
            return productA.name.localeCompare(productB.name);
        });
    });

    const fullCategoryOrder = categories.map(c => c.id);

    return { 
      totalEstimated: total,
      groupedItemsByCategory: byCategory,
      categoryOrder: fullCategoryOrder,
      groupedItemsByStore: byStore,
      storeSubtotals: subtotals,
    };
  }, [activeList, productMap, categories, storeMap]);

  const sortedCategoryIds = useMemo(() => {
    return [...groupedItemsByCategory.keys()].sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
  }, [groupedItemsByCategory, categoryOrder]);

  const storesInList = useMemo(() => {
    if (!activeList) return [];
    const storeIds = new Set(activeList.items.map(item => item.storeId));
    return stores.filter(store => storeIds.has(store.id));
  }, [activeList, stores]);
  
  const handleUpdateMembers = useCallback((listId: string, updatedMembers: Record<string, ListMemberRole>) => {
    onUpdateListMembers(listId, updatedMembers);
  }, [onUpdateListMembers]);

  if (!activeList) {
    return (
        <div className="text-center py-16 mt-4">
          <p className="text-ink-muted">No hay ninguna lista seleccionada.</p>
          <p className="mt-2 text-sm">Crea una nueva lista para empezar.</p>
        </div>
    );
  }

  return (
    <div>
        <div className="sticky top-16 bg-white dark:bg-[#121317] py-2 -mx-4 px-4 z-10 border-b border-border">
          <div className="container mx-auto space-y-2">
            {/* Row 1: Title and actions */}
            <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                    <div className="relative z-20">
                       <select 
                          value={activeListId} 
                          onChange={(e) => onSelectList(e.target.value)}
                          className="text-lg font-bold bg-transparent appearance-none text-ink pr-2 focus:outline-none focus:ring-0 border-none -ml-2"
                       >
                          {lists.map(list => (
                            <option key={list.id} value={list.id} className="bg-surface font-bold text-lg">{list.name}</option>
                          ))}
                          <option value="__CREATE_NEW__" className="text-brand bg-surface font-semibold italic text-base">
                            + Crear nueva lista...
                          </option>
                       </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => setIsShareModalOpen(true)}
                        aria-label="Compartir lista"
                        data-tooltip="Compartir y Miembros"
                        className="tooltip-align-right flex items-center justify-center h-9 w-9 bg-surface rounded-full border border-border text-ink hover:text-brand hover:bg-border transition"
                    >
                        <UsersIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onStartShopping}
                        aria-label="Activar Modo Compra"
                        data-tooltip="Comprar"
                        className="tooltip-align-right flex items-center justify-center h-9 w-9 bg-surface rounded-full border border-border text-brand hover:bg-border transition"
                    >
                        <ShoppingCartIcon />
                    </button>
                </div>
            </div>

            {/* Row 2: Filters and Total */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl bg-surface border border-border p-1">
                    <button onClick={() => { setGroupBy('category'); setSelectedStoreFilter('all'); }} className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors ${groupBy === 'category' ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:bg-border'}`}>
                        Por Categoría
                    </button>
                    <button onClick={() => setGroupBy('store')} className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors ${groupBy === 'store' ? 'bg-brand text-brand-ink' : 'text-ink-muted hover:bg-border'}`}>
                        Por Tienda
                    </button>
                </div>

                {groupBy === 'store' && (
                    <div className="relative">
                        <select
                            value={selectedStoreFilter}
                            onChange={(e) => setSelectedStoreFilter(e.target.value)}
                            className="bg-surface border border-border rounded-xl text-sm font-semibold py-2 pl-3 pr-8 appearance-none focus:ring-brand focus:border-brand transition"
                        >
                            <option value="all">Todas las tiendas</option>
                            {storesInList.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
              </div>
               <div className="text-right bg-surface px-3 py-1.5 rounded-xl border border-border">
                    <span className="text-xs text-ink-muted">Total Estimado</span>
                    <p className="text-lg font-bold text-brand">{totalEstimated.toFixed(2)}€</p>
                </div>
            </div>
          </div>
        </div>
      
      {activeList.items.length === 0 ? (
         <div className="text-center py-16 mt-4">
          <p className="text-ink-muted">Tu lista de la compra está vacía.</p>
          <p className="mt-2 text-sm">Ve a la Despensa para añadir productos.</p>
        </div>
      ) : groupBy === 'category' ? (
        <div className="space-y-8 pt-4">
          {sortedCategoryIds.map(categoryId => {
            const category = categoryMap.get(categoryId);
            const itemsInCategory = groupedItemsByCategory.get(categoryId);
            if (!category || !itemsInCategory) return null;

            return (
              <section key={categoryId}>
                <h3 className="text-xl font-semibold text-ink mb-4 py-2 -mx-4 px-4 border-b border-border">{category.name}</h3>
                <div className="divide-y divide-border">
                  {itemsInCategory.map(item => {
                    const product = productMap.get(item.productId);
                    if (!product) return null;
                    return (
                      <ListItemComponent
                        key={item.id}
                        item={item}
                        product={product}
                        onUpdate={onUpdateItem}
                        onDeleteItem={onDeleteItem}
                        stores={stores}
                        priceRecords={priceRecords}
                        usersMap={usersMap}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6 pt-4">
          {Array.from(groupedItemsByStore.entries())
            .filter(([storeId]) => selectedStoreFilter === 'all' || storeId === selectedStoreFilter)
            .map(([storeId, items]) => {
              const store = storeMap.get(storeId);
              if (!store) return null;
              const subtotal = storeSubtotals.get(storeId) || 0;
              return (
                <StoreSection
                  key={storeId}
                  store={store}
                  items={items}
                  subtotal={subtotal}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                  productMap={productMap}
                  categoryMap={categoryMap}
                  stores={stores}
                  priceRecords={priceRecords}
                  usersMap={usersMap}
                />
              );
            })}
        </div>
      )}

      {isShareModalOpen && (
          <ShareListModal
              list={activeList}
              currentUser={currentUser}
              usersMap={usersMap}
              userEmailMap={userEmailMap}
              onClose={() => setIsShareModalOpen(false)}
              onUpdateMembers={handleUpdateMembers}
          />
      )}
    </div>
  );
};

export default ShoppingListView;
