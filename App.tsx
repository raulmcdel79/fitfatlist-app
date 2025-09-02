

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
// Fix: Switched to Firebase v9 compat library to use v8 namespaced API syntax
import firebase from 'firebase/compat/app';
import { auth } from './services/firebase';
import { initialProducts, initialStores, initialCategories, initialLists, initialPriceRecords, users } from './services/mockData';
import type { Product, Store, Category, List, ListItem, ProductFormData, View, Ticket, TicketLine, PriceRecord, User, ListMemberRole, UserMap, PriceQuality } from './types';
import { ListItemStatus, TicketStatus, ProductUnit, VoiceCommandAction } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CatalogView from './components/CatalogView';
import ShoppingListView from './components/ShoppingListView';
import StoresView from './components/StoresView';
import StoreDetailView from './components/StoreDetailView';
import ProductSheet from './components/ProductSheet';
import OcrView from './components/OcrView';
import { PlusIcon, XIcon, colorClassMap, WarningIcon } from './constants';
import { SECTION_IDS } from './components/constants';
import ShoppingModeView from './components/ShoppingModeView';
// Gemini client removed on frontend to comply with Google policies
import AddStoreModal from './components/AddStoreModal';
import VoiceCommandModal from './components/VoiceCommandModal';
import DashboardView from './components/DashboardView';
import HelpModal from './components/HelpModal';
import AuthView from './components/AuthView';
import './components/MobileFixes.css';

// Gemini client removed on frontend (policy compliance). AI features disabled.

// --- ID Generation Helper ---
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// --- Theme Management Hook ---
type Theme = 'light' | 'dark';

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

  const setHtmlTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }, []);

  useEffect(() => {
    setHtmlTheme(theme);
  }, [theme, setHtmlTheme]);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return { theme, setTheme: toggleTheme };
}


// --- New Modal: List Selection ---
const ListSelectionModal: React.FC<{
  lists: List[];
  onClose: () => void;
  onSelect: (listId: string) => void;
}> = ({ lists, onClose, onSelect }) => {
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
          <h2 className="text-lg font-bold text-ink">Seleccionar Lista</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-2">
            {lists.map(list => (
              <li key={list.id}>
                <button
                  onClick={() => onSelect(list.id)}
                   className="w-full text-left p-3 bg-bg rounded-xl border border-border hover:border-brand transition-all"
                >
                  <p className="font-semibold text-ink">{list.name}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


// --- New Modal: Create List ---
const CreateListModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border w-full max-w-sm m-4 animate-fade-in-up shadow-card" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-ink">Crear Nueva Lista</h2>
        </div>
        <div className="p-4">
          <label htmlFor="listName" className="block text-sm font-medium text-ink-muted mb-1">Nombre de la lista</label>
          <input
            id="listName"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-bg border border-border rounded-xl placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm"
            required
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 p-4 bg-bg rounded-b-2xl border-t border-border">
          <button type="button" onClick={onClose} className="bg-surface py-2 px-4 border border-border rounded-xl text-sm font-medium text-ink hover:bg-border">
            Cancelar
          </button>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-brand-ink bg-brand hover:opacity-90">
            Crear
          </button>
        </div>
      </form>
    </div>
  );
};


// --- Store Selection Modal Component ---
const StoreSelectionModal: React.FC<{
  product: Product;
  prices: { storeId: string; price: number; date: string; storeColor: string }[];
  storeMap: Map<string, Store>;
  onClose: () => void;
  onSelect: (productId: string, storeId: string, price: number) => void;
}> = ({ product, prices, storeMap, onClose, onSelect }) => {
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-20 flex justify-center items-center" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-sm m-4 animate-fade-in-up shadow-card" onClick={e => e.stopPropagation()}>
         <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
        `}</style>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold text-ink">Elegir tienda para <span className="text-brand">{product.name}</span></h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-2">
            {sortedPrices.map(({ storeId, price, date, storeColor }) => {
              const store = storeMap.get(storeId);
              const colorClasses = colorClassMap[storeColor] || colorClassMap.teal;
              return (
              <li key={storeId}>
                <button
                  onClick={() => onSelect(product.id, storeId, price)}
                   className="w-full text-left p-3 flex justify-between items-center bg-bg rounded-xl border border-border hover:border-brand transition-all"
                >
                  <div>
                    <p className={`font-semibold ${colorClasses.iconText}`}>{store?.name || 'Tienda desconocida'}</p>
                    <p className="text-xs text-ink-muted">Actualizado: {new Date(date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-bold text-lg text-brand">{price.toFixed(2)}€</p>
                </button>
              </li>
            )})}
          </ul>
        </div>
        <div className="flex justify-end p-4 bg-bg rounded-b-2xl border-t border-border">
            <button type="button" onClick={onClose} className="bg-surface py-2 px-4 border border-border rounded-xl text-sm font-medium text-ink hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
              Cancelar
            </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ product, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex justify-center items-center" onClick={onCancel} aria-modal="true" role="dialog">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-sm m-4 animate-fade-in-up shadow-card" onClick={e => e.stopPropagation()}>
         <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
        `}</style>
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger/10">
            <WarningIcon className="h-6 w-6 text-danger" />
          </div>
          <h3 className="text-lg font-semibold text-ink mt-4">Eliminar Producto</h3>
          <p className="text-sm text-ink-muted mt-2">
            ¿Estás seguro de que quieres eliminar permanentemente <strong className="text-ink font-semibold">{product.name}</strong>? Se borrarán sus precios y se quitará de todas las listas.
          </p>
        </div>
        <div className="flex justify-center gap-3 p-4 bg-bg rounded-b-2xl border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-surface py-2 px-4 border border-border rounded-xl text-sm font-medium text-ink hover:bg-border"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-danger hover:opacity-90"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  // Fix: Use firebase.User type from v8 SDK
  const [authUser, setAuthUser] = useState<firebase.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Fix: Use v8 namespaced onAuthStateChanged method
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const currentUser = useMemo<User | null>(() => {
    if (!authUser) return null;
    return {
      id: authUser.uid,
      name: authUser.displayName || authUser.email?.split('@')[0] || 'Usuario',
      email: authUser.email || '',
      avatarUrl: authUser.photoURL || undefined,
    };
  }, [authUser]);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [priceRecords, setPriceRecords] = useState<PriceRecord[]>(initialPriceRecords);
  
  // Multiple Lists State
  const [lists, setLists] = useState<List[]>(initialLists);
  const [activeListId, setActiveListId] = useState<string>(initialLists[0].id);
  const activeList = useMemo(() => lists.find(l => l.id === activeListId) || lists[0], [lists, activeListId]);

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // OCR State
  const [isOcrViewOpen, setIsOcrViewOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Shopping Mode State
  const [isShoppingMode, setIsShoppingMode] = useState(false);

  // Store Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Store Detail View State
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Store Selection Modal State
  const [isStoreSelectionModalOpen, setIsStoreSelectionModalOpen] = useState(false);
  const [selectionModalData, setSelectionModalData] = useState<{ product: Product, prices: { storeId: string; price: number; date: string; storeColor: string }[] } | null>(null);
  
  // List Selection Modal State
  const [isListSelectionModalOpen, setIsListSelectionModalOpen] = useState(false);
  const [listSelectionData, setListSelectionData] = useState<{ productId: string, storeId?: string, quantity: number } | null>(null);

  // Create List Modal State
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Voice Command State
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<{status: 'idle' | 'listening' | 'processing' | 'success' | 'error', message: string, transcript?: string}>({status: 'idle', message: ''});
  const recognitionRef = useRef<any | null>(null);
  
  // Help Modal State
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Budget State
  const [weeklyBudget, setWeeklyBudget] = useState(100);

  // Theme State
  const { theme, setTheme } = useTheme();

  const categoryNamesForPrompt = useMemo(() => categories.map(c => c.name).join(', '), [categories]);
  const storeNamesForPrompt = useMemo(() => stores.map(s => s.name).join(', '), [stores]);

  // Define the expected JSON schema for the AI response
  const ticketResponseSchema = {
    type: 'object',
    properties: {
        storeNameGuess: {
            type: 'string',
            description: `The name of the store from the receipt. It MUST EXACTLY MATCH one of these: ${storeNamesForPrompt}. If not found, leave empty.`,
        },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    rawDescription: {
                        type: 'string',
                        description: "Full, unmodified description of the item from the receipt.",
                    },
                    productName: {
                        type: 'string',
                        description: "The core name of the product, cleaned of brands, weights, and quantities. E.g., for 'PATATA 5 KG', this is 'PATATA'. For 'PATATAS MONALISA', this is 'PATATAS MONALISA'. Normalized to uppercase.",
                    },
                    brandGuess: {
                        type: 'string',
                        description: "The brand of the item, if identifiable in rawDescription. Otherwise, leave empty.",
                    },
                    sizeGuess: {
                        type: 'string',
                        description: "The size or weight of the item if present in the rawDescription (e.g., '5 KG', '400G', '1L', '6 pack'). Otherwise, leave empty.",
                    },
                    quantity: {
                        type: 'number',
                        description: "Quantity of the item purchased. If not specified, assume 1.",
                    },
                    unitPrice: {
                        type: 'number',
                        description: "Price per single unit of the item. Calculate if necessary (totalPrice / quantity).",
                    },
                    totalPrice: {
                        type: 'number',
                        description: "Total price for the line item (quantity * unit price).",
                    },
                    categoryGuess: {
                        type: 'string',
                        description: `Suggested category for the item from this list: ${categoryNamesForPrompt}.`,
                    },
                    healthScoreGuess: {
                        type: 'number',
                        description: "A health score from 1 to 5. 1 is ultra-processed, 3 is a good processed food, 5 is fresh, raw food.",
                    }
                },
                required: ["rawDescription", "productName", "quantity", "unitPrice", "totalPrice", "categoryGuess"],
            },
        }
    },
    required: ["items"],
  };
  
    const voiceCommandSchema = {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          description: `The action to perform. Must be one of: '${Object.values(VoiceCommandAction).join("', '")}'.`,
        },
        productName: {
          type: 'string',
          description: "The normalized name of the product (e.g., 'leche', 'tomate frito'). Can be empty for CLEAR_LIST.",
        },
        storeName: {
            type: 'string',
            description: `The normalized name of the store from this list: ${storeNamesForPrompt}. E.g., 'mercadona'. Can be empty if not specified.`,
        },
        quantity: {
          type: 'number',
          description: "The quantity of the product. Defaults to 1 if not specified.",
        },
        categoryName: {
          type: 'string',
          description: `The category name for the new product when action is CREATE_PRODUCT, guessed from this list: ${categoryNamesForPrompt}. Can be empty.`
        },
        brand: {
            type: 'string',
            description: "The brand of the product, only for CREATE_PRODUCT action.",
        },
        price: {
            type: 'number',
            description: "The price of the product, for CREATE_PRODUCT or UPDATE_PRICE actions.",
        },
    unit: {
      type: 'string',
            description: `The unit of the product ('kg', 'l', 'u'), only for CREATE_PRODUCT action. Inferred from context (e.g., 'gramos' implies 'kg').`,
        },
    size: {
      type: 'string',
            description: `The size or weight of the product (e.g., '400g', '1L', '6 pack'), only for CREATE_PRODUCT action.`,
        },
      },
      required: ["action"],
    };


  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const storeMap = useMemo(() => new Map(stores.map(s => [s.id, s])), [stores]);
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const categoryNameMap = useMemo(() => new Map(categories.map(c => [c.name.toLowerCase(), c.id])), [categories]);
  const usersMap: UserMap = useMemo(() => new Map(users.map(u => [u.id, u])), []);
  const userEmailMap: Map<string, User> = useMemo(() => new Map(users.map(u => [u.email.toLowerCase(), u])), []);


  const bestPricesMap = useMemo(() => {
    const map = new Map<string, { price: number; storeId: string; date: string }>();
    priceRecords.forEach(record => {
        const existing = map.get(record.productId);
        if (!existing || record.price < existing.price) {
            map.set(record.productId, { price: record.price, storeId: record.storeId, date: record.date });
        }
    });
    return map;
  }, [priceRecords]);

  const handleOpenProductSheet = useCallback((product: Product | null) => {
    setEditingProduct(product);
    setIsProductSheetOpen(true);
  }, []);

  const handleCloseProductSheet = useCallback(() => {
    setIsProductSheetOpen(false);
    setEditingProduct(null);
  }, []);

  const handleSaveProduct = useCallback((productData: ProductFormData) => {
    if (editingProduct) {
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === editingProduct.id ? { ...p, ...productData, aliases: p.aliases || [] } : p
        )
      );
    } else {
      const newProduct: Product = {
        id: generateId('prod'),
        ...productData,
        aliases: [],
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
    }
    // We don't close the sheet here anymore, so user can add prices
  }, [editingProduct]);
  
  const confirmDeleteProduct = useCallback(() => {
    if (!productToDelete) return;
    
    const productId = productToDelete.id;
    setProducts(prev => prev.filter(p => p.id !== productId));
    setPriceRecords(prev => prev.filter(pr => pr.productId !== productId));
    setLists(prevLists => prevLists.map(list => ({
      ...list,
      items: list.items.filter(item => item.productId !== productId),
    })));

    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
  }, [productToDelete]);

  const handleDeleteProduct = useCallback((productId: string) => {
    const product = productMap.get(productId);
    if (product) {
      setProductToDelete(product);
      setIsDeleteConfirmOpen(true);
    }
  }, [productMap]);

  const handleSavePriceRecord = useCallback((priceData: Omit<PriceRecord, 'id' | 'productId'>) => {
    if (!editingProduct) return;

    const newRecord: PriceRecord = {
        id: generateId('pr'),
        productId: editingProduct.id,
        date: new Date().toISOString().split('T')[0],
        ...priceData,
    };
    setPriceRecords(prev => [...prev, newRecord]);
  }, [editingProduct]);

  const handleUpdatePriceRecord = useCallback((updatedRecord: PriceRecord) => {
    setPriceRecords(prev => prev.map(pr => pr.id === updatedRecord.id ? updatedRecord : pr));
  }, []);

  const handleDeletePriceRecord = useCallback((priceRecordId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro de precio?')) {
        setPriceRecords(prev => prev.filter(pr => pr.id !== priceRecordId));
    }
  }, []);

  const handleUpdateListItem = useCallback((updatedItem: ListItem) => {
    if (!currentUser) return;
    setLists(prevLists => prevLists.map(list => {
      if (list.id !== activeListId) return list;

      const newItems = list.items.map(item => {
        if (item.id === updatedItem.id) {
          // Logic for tracking who picked an item
          const isBeingPicked = updatedItem.status === ListItemStatus.PICKED && item.status !== ListItemStatus.PICKED;
          const isBeingUnpicked = updatedItem.status !== ListItemStatus.PICKED && item.status === ListItemStatus.PICKED;

          if (isBeingPicked) {
            return {
              ...updatedItem,
              pickedBy: currentUser.id,
              pickedAt: new Date().toISOString()
            };
          }
          if (isBeingUnpicked) {
            const { pickedBy, pickedAt, ...restOfItem } = updatedItem;
            return { ...restOfItem, status: ListItemStatus.PENDING }; // Ensure it goes back to pending
          }
          return updatedItem;
        }
        return item;
      });

      return { ...list, items: newItems };
    }));
  }, [activeListId, currentUser]);


  const handleDeleteItemFromList = useCallback((itemId: string) => {
    setLists(prevLists => prevLists.map(list => {
      if (list.id === activeListId) {
        return { ...list, items: list.items.filter(item => item.id !== itemId) };
      }
      return list;
    }));
  }, [activeListId]);

  const executeAddItem = useCallback((productId: string, storeId: string, price: number, listId: string, quantityToAdd: number = 1) => {
    setLists(prevLists => prevLists.map(list => {
      if (list.id === listId) {
        const existingItem = list.items.find(item => item.productId === productId && item.storeId === storeId);
        if (existingItem) {
            const updatedItems = list.items.map(item =>
                item.id === existingItem.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
            );
            return { ...list, items: updatedItems };
        } else {
            const newItem: ListItem = {
                id: generateId('item'),
                productId,
                storeId,
                quantity: quantityToAdd,
                status: ListItemStatus.PENDING,
                priceSnapshot: price,
            };
            return { ...list, items: [...list.items, newItem] };
        }
      }
      return list;
    }));
  }, []);

  const processAndExecuteAdd = useCallback((productId: string, listId: string, storeId?: string, quantity: number = 1) => {
    // Case 1: Store is already specified
    if (storeId) {
        const priceInfo = priceRecords.find(pr => pr.productId === productId && pr.storeId === storeId);
        if (!priceInfo) {
            alert("Este producto no tiene un precio asignado en la tienda seleccionada y no puede ser añadido.");
            return;
        }
        executeAddItem(productId, storeId, priceInfo.price, listId, quantity);
        return;
    }

    // Case 2: Store is NOT specified -> check all available prices
    const availablePrices = priceRecords.filter(p => p.productId === productId);

    if (availablePrices.length === 0) {
        alert("Este producto no tiene precios registrados y no puede ser añadido.");
        return;
    }

    if (availablePrices.length === 1) {
        const { storeId: singleStoreId, price } = availablePrices[0];
        executeAddItem(productId, singleStoreId, price, listId, quantity);
        return;
    }
    
    // Multiple options: open store selection modal
    const product = productMap.get(productId);
    if (product) {
        const priceData = availablePrices.map(p => {
            const store = storeMap.get(p.storeId);
            return {
                storeId: p.storeId,
                price: p.price,
                date: p.date,
                storeColor: store?.color || 'teal'
            };
        });
        setSelectionModalData({ product, prices: priceData });
        setIsStoreSelectionModalOpen(true);
    }
  }, [priceRecords, productMap, executeAddItem, storeMap]);

  const handleAddItemToList = useCallback((productId: string, storeId: string, quantity: number) => {
    const listId = activeListId; // Use the currently active list
    const priceInfo = priceRecords.find(pr => pr.productId === productId && pr.storeId === storeId);
    if (!priceInfo) {
        alert("Error: No se encontró el precio para este producto y tienda.");
        return;
    }
    executeAddItem(productId, storeId, priceInfo.price, listId, quantity);
  }, [activeListId, priceRecords, executeAddItem]);

  const handleListSelectionForAdd = (listId: string) => {
    if (listSelectionData) {
        const { productId, storeId, quantity } = listSelectionData;
        processAndExecuteAdd(productId, listId, storeId, quantity);
    }
    setIsListSelectionModalOpen(false);
    setListSelectionData(null);
  };
  
  const handleStoreSelection = (productId: string, storeId: string, price: number) => {
    const listId = listSelectionData ? activeListId : (lists[0]?.id || '');
    const quantity = listSelectionData?.quantity || 1;
    if(listId) {
      executeAddItem(productId, storeId, price, listId, quantity);
    }
    setIsStoreSelectionModalOpen(false);
    setSelectionModalData(null);
    setListSelectionData(null); // Also clear this in case it was open
  };

  const handleRemoveItemFromList = useCallback((productId: string, storeId?: string) => {
    setLists(prevLists => prevLists.map(list => {
      if (list.id === activeListId) {
        const itemToDecrement = storeId 
            ? list.items.find(item => item.productId === productId && item.storeId === storeId)
            : list.items.find(item => item.productId === productId);

        if (!itemToDecrement) return list;

        if (itemToDecrement.quantity > 1) {
            return {
                ...list,
                items: list.items.map(item => item.id === itemToDecrement.id ? { ...item, quantity: item.quantity - 1 } : item)
            };
        } else {
            return {
                ...list,
                items: list.items.filter(item => item.id !== itemToDecrement.id)
            };
        }
      }
      return list;
    }));
  }, [activeListId]);
  
  const handleSetProductQuantity = useCallback((productId: string, newQuantity: number, storeId: string) => {
    const safeNewQuantity = Math.max(0, newQuantity);
    
    // This function is now mainly for StoreDetailView, which guarantees a storeId
    setLists(prevLists => prevLists.map(list => {
        if (list.id !== activeListId) return list;
        
        const existingItem = list.items.find(item => item.productId === productId && item.storeId === storeId);

        if (safeNewQuantity === 0) {
            // Remove the item if quantity is zero
            return { ...list, items: list.items.filter(item => item.id !== existingItem?.id) };
        }

        if (existingItem) {
            // Update quantity of existing item
            return { ...list, items: list.items.map(item => item.id === existingItem.id ? { ...item, quantity: safeNewQuantity } : item) };
        } else {
            // Add new item if it doesn't exist
            const priceInfo = priceRecords.find(pr => pr.productId === productId && pr.storeId === storeId);
            if (!priceInfo) return list; // Can't add without price
            
            const newItem: ListItem = {
                id: generateId('item'),
                productId,
                storeId,
                quantity: safeNewQuantity,
                status: ListItemStatus.PENDING,
                priceSnapshot: priceInfo.price,
            };
            return { ...list, items: [...list.items, newItem] };
        }
    }));
  }, [activeListId, priceRecords]);


  // --- List Management Handlers ---
  const handleSelectList = (listId: string) => {
      if (listId === '__CREATE_NEW__') {
          setIsCreateListModalOpen(true);
      } else {
          setActiveListId(listId);
      }
  };

  const handleCreateList = (name: string) => {
      if (!currentUser) return;
      const newList: List = {
          id: generateId('list'),
          name,
          items: [],
          ownerId: currentUser.id,
          members: { [currentUser.id]: 'owner' },
      };
      setLists(prev => [...prev, newList]);
      setActiveListId(newList.id);
      setIsCreateListModalOpen(false);
  };
  
    // --- List Sharing Handlers ---
    const handleUpdateListMembers = useCallback((listId: string, updatedMembers: Record<string, ListMemberRole>) => {
      setLists(prev => prev.map(list => list.id === listId ? { ...list, members: updatedMembers } : list));
    }, []);



  // --- OCR Handlers ---
  const handleOpenOcr = () => setIsOcrViewOpen(true);
  
  const handleCloseOcr = () => {
    setIsOcrViewOpen(false);
    setActiveTicket(null);
  };

  const handleTicketUpload = useCallback(async (imageBase64: string) => {
    // Set a temporary ticket state for loading UI
    setActiveTicket({
        id: 'temp-ticket',
        storeId: '',
        status: TicketStatus.UPLOADING,
        lines: [],
        createdAt: new Date().toISOString(),
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    setActiveTicket(prev => prev ? { ...prev, status: TicketStatus.PARSING } : null);

  try {
        // AI disabled: return a stub ticket with the image captured but no parsed lines
        const ticketId = generateId('ticket');
        const finalTicket: Ticket = {
          id: ticketId,
          storeId: stores[0]?.id || '',
          status: TicketStatus.REVIEW,
          lines: [],
          createdAt: new Date().toISOString(),
        };
        setActiveTicket(finalTicket);
        /*
        // Previous AI parsing logic removed for policy compliance
        if (Array.isArray(parsedData.items)) {
          const ticketId = generateId('ticket');
          const ticketLines: TicketLine[] = parsedData.items.map((item: any, index: number) => {
          // Validar que la sugerencia de la IA sea una sección/categoría válida
          const targetCategoryId = categoryNameMap.get(suggestedCategoryName.toLowerCase());
          if (!targetCategoryId || !SECTION_IDS.includes(targetCategoryId)) return undefined;

          const candidateProducts = products.filter(p => p.categoryId === targetCategoryId);
          if (candidateProducts.length === 0) return undefined;

          const descClean = description.toUpperCase();
          const descTokens = descClean.split(' ').filter(t => t.length > 1);

          let bestMatch: { id: string; score: number } | null = null;

          candidateProducts.forEach(product => {
            const productNameUpper = product.name.toUpperCase();
            const productTokens = productNameUpper.split(' ');
                        let score = 0;

                        if (product.aliases?.some(alias => descClean.includes(alias.toUpperCase()))) {
                            score += 100;
                        }

                        if (descClean.includes(productNameUpper)) {
                            score += 60;
                        } else if (productNameUpper.includes(descClean)) {
                            score += 50;
                        }

                        const productTokenSet = new Set(productTokens);
                        const matchedTokens = descTokens.filter(token => productTokenSet.has(token));
                        
                        score += matchedTokens.length * 5;

                        if (descTokens.length > 0 && matchedTokens.length === descTokens.length) {
                            score += 30;
                        }
                        
                        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
                            bestMatch = { id: product.id, score };
                        }
                    });

                    if (bestMatch && bestMatch.score >= 40) {
                         return bestMatch.id;
                    }
                   
                    return undefined;
                };

                const matchedProductId = findBestProductMatch(item.productName, item.categoryGuess);

                return {
                    id: `line${index}_${ticketId}`,
                    rawText: item.rawDescription || 'N/A',
                    productName: item.productName,
                    brandGuess: item.brandGuess,
                    sizeGuess: item.sizeGuess,
                    qty: item.quantity || 1,
                    totalPrice: item.totalPrice || 0,
                    unitPrice: item.unitPrice || ((item.totalPrice && item.quantity) ? item.totalPrice / item.quantity : 0),
                    candidateProductIds: [],
                    suggestedCategoryName: item.categoryGuess,
                    matchedProductId: matchedProductId,
                    healthScoreGuess: item.healthScoreGuess || 3,
                    quality: 'Normal',
                };
            });
             
       const finalTicket: Ticket = { id: ticketId, storeId: guessedStoreId, status: TicketStatus.REVIEW, lines: ticketLines, createdAt: new Date().toISOString() };
       setActiveTicket(finalTicket);

     } else { throw new Error("AI response was not in the expected format."); }
     */
  } catch (error) {
    console.error("Error processing ticket:", error);
        alert("Hubo un error al procesar el ticket. Por favor, inténtalo de nuevo.");
        handleCloseOcr();
    }
  }, [products, categoryNameMap, stores]);

  const handleDeleteTicketLine = useCallback((lineId: string) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.filter(l => l.id !== lineId)
        };
    });
  }, []);
  
  const handleUpdateTicketLineCategory = useCallback((lineId: string, newCategoryName: string) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.map(l => 
                l.id === lineId 
                ? { ...l, suggestedCategoryName: newCategoryName } 
                : l
            )
        };
    });
  }, []);

  const handleUpdateTicketLineProductName = useCallback((lineId: string, newName: string) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.map(l => 
                l.id === lineId 
                ? { ...l, productName: newName } 
                : l
            )
        };
    });
  }, []);

  const handleUpdateTicketLineBrand = useCallback((lineId: string, newBrand: string) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.map(l => 
                l.id === lineId 
                ? { ...l, brandGuess: newBrand } 
                : l
            )
        };
    });
  }, []);

  const handleUpdateTicketLineSize = useCallback((lineId: string, newSize: string) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.map(l => 
                l.id === lineId 
                ? { ...l, sizeGuess: newSize } 
                : l
            )
        };
    });
  }, []);

  const handleUpdateTicketLineQuality = useCallback((lineId: string, newQuality: PriceQuality) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.map(l => 
                l.id === lineId 
                ? { ...l, quality: newQuality } 
                : l
            )
        };
    });
  }, []);
  
  const handleUpdateTicketLineHealthScore = useCallback((lineId: string, newScore: number) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return {
            ...prev,
            lines: prev.lines.map(l => 
                l.id === lineId 
                ? { ...l, healthScoreGuess: newScore } 
                : l
            )
        };
    });
  }, []);

  const handleUpdateTicketStore = useCallback((newStoreId: string) => {
    setActiveTicket(prev => {
        if (!prev) return null;
        return { ...prev, storeId: newStoreId };
    });
  }, []);


  const handleApplyTicket = useCallback(() => {
    if (!activeTicket) return;

    const newPriceRecords: PriceRecord[] = [];
    const newProducts: Product[] = [];
    const productUpdates = new Map<string, string[]>(); // Map<productId, newAliases[]>

    activeTicket.lines.forEach(line => {
        let productId = line.matchedProductId;
        
        // If product is not matched, create a new one
        if (!productId) {
            const categoryId = line.suggestedCategoryName 
                ? categoryNameMap.get(line.suggestedCategoryName.toLowerCase()) 
                : categories.find(c => c.name === 'Despensa / Enlatados')?.id || categories[0]?.id;
            
            if(!categoryId){
                alert(`La categoría "${line.suggestedCategoryName}" para el producto "${line.rawText}" no es válida. Por favor, revisa la categoría antes de aplicar.`);
                // We could throw an error here to stop the process
                return; 
            }

            const newProduct: Product = {
                id: `prod_${Date.now()}_${line.id}`,
                name: line.productName || line.rawText,
                brand: line.brandGuess || '',
                size: line.sizeGuess || '',
                categoryId: categoryId,
                unit: ProductUnit.UNITS,
                aliases: [line.rawText],
                healthScore: line.healthScoreGuess,
            };
            newProducts.push(newProduct);
            productId = newProduct.id;
        } else {
            // If product is matched, prepare alias update
            if (!productUpdates.has(productId)) {
                productUpdates.set(productId, []);
            }
            productUpdates.get(productId)!.push(line.rawText);
        }
        
        // Create price record for both existing and new products
        const newRecord: PriceRecord = {
            id: `pr_${Date.now()}_${line.id}`,
            productId: productId,
            storeId: activeTicket.storeId,
            price: line.unitPrice,
            date: new Date().toISOString().split('T')[0],
            quality: line.quality,
        };
        newPriceRecords.push(newRecord);
    });
    
    // Batch update state
    if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
    }
    if (newPriceRecords.length > 0) {
        setPriceRecords(prev => [...prev, ...newPriceRecords]);
    }
    
    // Apply product alias updates
    if (productUpdates.size > 0) {
        setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (productUpdates.has(p.id)) {
                    const newAliases = productUpdates.get(p.id)!;
                    const existingAliases = p.aliases || [];
                    const combined = [...new Set([...existingAliases, ...newAliases])]; // Keep unique
                    return { ...p, aliases: combined };
                }
                return p;
            });
        });
    }

    setActiveTicket(prev => prev ? { ...prev, status: TicketStatus.APPLIED } : null);
    setTimeout(() => {
        handleCloseOcr();
    }, 1000);
  }, [activeTicket, categories, categoryNameMap]);
  
  const handleAddCategory = useCallback(async (categoryName: string): Promise<Category> => {
    const newCategory: Category = {
        id: generateId('cat'),
        name: categoryName,
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  // --- Voice Command Handlers ---
  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const findProductByName = useCallback((name: string) => {
      if (!name) return undefined;
      const normalizedName = normalize(name);
      return products.find(p => normalize(p.name).includes(normalizedName) || p.aliases?.some(a => normalize(a).includes(normalizedName)));
  }, [products]);

  const findStoreByName = useCallback((name: string) => {
      if (!name) return undefined;
      const normalizedName = normalize(name);
      return stores.find(s => normalize(s.name).includes(normalizedName));
  }, [stores]);
  
  const executeVoiceCommand = useCallback((command: any) => {
    let successMessage = "";
    switch (command.action) {
        case VoiceCommandAction.ADD: {
            const product = findProductByName(command.productName);
            if (!product) {
                throw new Error(`No encontré el producto "${command.productName}".`);
            }
            const quantity = command.quantity || 1;
            const targetListId = activeListId;

            if (command.storeName) {
                const store = findStoreByName(command.storeName);
                if (!store) {
                    throw new Error(`No encontré la tienda "${command.storeName}".`);
                }
                const priceRecord = priceRecords.find(pr => pr.productId === product.id && pr.storeId === store.id);
                if (!priceRecord) {
                    throw new Error(`No tengo precio para ${product.name} en ${store.name}.`);
                }
                executeAddItem(product.id, store.id, priceRecord.price, targetListId, quantity);
                successMessage = `${quantity} ${product.name} añadido(s) para ${store.name}.`;
            } else {
                const bestPriceInfo = bestPricesMap.get(product.id);
                if (!bestPriceInfo) {
                    throw new Error(`No tengo precios registrados para "${product.name}".`);
                }
                const store = storeMap.get(bestPriceInfo.storeId);
                executeAddItem(product.id, bestPriceInfo.storeId, bestPriceInfo.price, targetListId, quantity);
                successMessage = `${quantity} ${product.name} añadido(s) (mejor precio en ${store?.name || 'tienda desconocida'}).`;
            }
            break;
        }
        case VoiceCommandAction.REMOVE: {
            const product = findProductByName(command.productName);
            if (!product) throw new Error(`No encontré el producto "${command.productName}".`);
            const store = command.storeName ? findStoreByName(command.storeName) : null;
            
            setLists(prevLists => prevLists.map(list => {
                if (list.id === activeListId) {
                    return {
                        ...list,
                        items: list.items.filter(item => {
                            if (item.productId === product.id) {
                                return store ? item.storeId !== store.id : false;
                            }
                            return true;
                        })
                    };
                }
                return list;
            }));
            successMessage = `${product.name} eliminado de la lista` + (store ? ` de ${store.name}.` : '.');
            break;
        }
        case VoiceCommandAction.UPDATE_QUANTITY: {
            const product = findProductByName(command.productName);
            if (!product) throw new Error(`No encontré el producto "${command.productName}".`);
            const store = command.storeName ? findStoreByName(command.storeName) : null;
            if (!command.quantity || command.quantity <= 0) throw new Error("Cantidad no válida.");

            setLists(prevLists => prevLists.map(list => {
                if (list.id === activeListId) {
                    return {
                        ...list,
                        items: list.items.map(item => {
                            if (item.productId === product.id && (!store || item.storeId === store.id)) {
                                return { ...item, quantity: command.quantity };
                            }
                            return item;
                        })
                    };
                }
                return list;
            }));
            successMessage = `Cantidad de ${product.name} actualizada a ${command.quantity}.`;
            break;
        }
        case VoiceCommandAction.CLEAR_LIST: {
            setLists(prevLists => prevLists.map(list => {
                if (list.id === activeListId) {
                    return { ...list, items: [] };
                }
                return list;
            }));
            successMessage = "La lista de la compra se ha vaciado.";
            break;
        }
        case VoiceCommandAction.CREATE_PRODUCT: {
            if (!command.productName) throw new Error("Necesito el nombre del producto para crearlo.");
            if (!command.storeName) throw new Error("Necesito saber en qué tienda estás para guardar el precio.");
            if (command.price === undefined) throw new Error("Por favor, dime el precio del producto.");

            const existingProduct = findProductByName(command.productName);
            if (existingProduct) throw new Error(`El producto "${command.productName}" ya existe.`);
            
            const store = findStoreByName(command.storeName);
            if (!store) throw new Error(`No encontré la tienda "${command.storeName}".`);

            const newProductName = command.productName.charAt(0).toUpperCase() + command.productName.slice(1);

            let categoryId = command.categoryName ? categoryNameMap.get(normalize(command.categoryName)) : undefined;
            if (!categoryId) {
                categoryId = categories.find(c => c.name === 'Despensa / Enlatados')?.id || categories[0]?.id;
                if (!categoryId) throw new Error("No hay categorías disponibles para asignar el producto.");
            }

            const newProduct: Product = {
                id: generateId('prod'),
                name: newProductName,
                brand: command.brand || '',
                size: command.size || '',
                categoryId: categoryId,
                unit: command.unit || ProductUnit.UNITS,
                aliases: [],
            };
            setProducts(prev => [...prev, newProduct]);
            
            const newRecord: PriceRecord = {
                id: generateId('pr'),
                productId: newProduct.id,
                storeId: store.id,
                price: command.price,
                date: new Date().toISOString().split('T')[0],
                quality: 'Normal',
            };
            setPriceRecords(prev => [...prev, newRecord]);

            successMessage = `Producto "${newProductName}" creado y precio de ${command.price.toFixed(2)}€ guardado para ${store.name}.`;
            break;
        }
        case VoiceCommandAction.UPDATE_PRICE: {
            if (!command.productName || !command.storeName || command.price === undefined) {
                throw new Error("Faltan datos. Necesito el producto, la tienda y el nuevo precio.");
            }
            const product = findProductByName(command.productName);
            if (!product) throw new Error(`No encontré el producto "${command.productName}".`);

            const store = findStoreByName(command.storeName);
            if (!store) throw new Error(`No encontré la tienda "${command.storeName}".`);

            const relevantRecords = priceRecords.filter(pr => pr.productId === product.id && pr.storeId === store.id);
            if (relevantRecords.length === 0) {
                throw new Error(`No tengo un precio para ${product.name} en ${store.name} para actualizar.`);
            }

            // Find the most recent record to update
            const latestRecord = relevantRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            
            const updatedRecord: PriceRecord = {
                ...latestRecord,
                price: command.price,
                date: new Date().toISOString().split('T')[0], // Update date to today
            };
            
            setPriceRecords(prev => prev.map(pr => pr.id === latestRecord.id ? updatedRecord : pr));

            successMessage = `Precio de ${product.name} en ${store.name} actualizado a ${command.price.toFixed(2)}€.`;
            break;
        }
        default:
          throw new Error("No he entendido ese comando.");
    }
    setVoiceFeedback(prev => ({ ...prev, status: 'success', message: successMessage }));

  }, [findProductByName, findStoreByName, priceRecords, executeAddItem, bestPricesMap, storeMap, products, categories, categoryNameMap, activeListId]);

  const processTranscript = useCallback(async (transcript: string) => {
    try {
        const prompt = `Analiza un comando de voz para una app de lista de la compra. Comando: "${transcript}".
        Las acciones son: ADD, REMOVE, UPDATE_QUANTITY, CLEAR_LIST, CREATE_PRODUCT, UPDATE_PRICE.

        1. Si el comando es para CREAR un producto nuevo (ej. "crear producto", "nuevo artículo"), la acción es CREATE_PRODUCT.
           Extrae OBLIGATORIAMENTE los siguientes campos:
           - productName: nombre del artículo (ej. "tomate frito").
           - storeName: el nombre de la tienda, que debe ser uno de: ${storeNamesForPrompt}.
           - price: el precio del producto como un número. **IMPORTANTE: Extrae solo el valor numérico, ignorando palabras como "euros" o "céntimos". Por ejemplo, de "cuesta 1.85 euros", el precio es 1.85. De "uno con ochenta y cinco", el precio es 1.85.**
           
           Extrae también estos campos opcionales si están presentes:
           - brand: la marca del producto.
           - size: el tamaño o peso (ej. "400g", "1L", "pack de 6").
           - unit: la unidad ('kg', 'l', 'u'), inferida de palabras como 'gramos', 'kilos', 'litros'. Si no se especifica, no lo incluyas.
           - categoryName: la categoría del producto, que debe ser una de: ${categoryNamesForPrompt}.
        
        2. Si el comando es para ACTUALIZAR un precio (ej. "actualiza el precio", "cambia el precio"), la acción es UPDATE_PRICE.
           Extrae OBLIGATORIAMENTE:
           - productName: nombre del producto existente.
           - storeName: la tienda donde se actualiza el precio.
           - price: el nuevo precio numérico.
           
           Ejemplo: "Actualiza el precio de Pechuga de Pollo en Mercadona a 6.75"
           Resultado JSON: { "action": "UPDATE_PRICE", "productName": "pechuga de pollo", "storeName": "mercadona", "price": 6.75 }

        3. Para otros comandos como AÑADIR, la acción es ADD. Extrae:
           - productName: nombre del producto existente.
           - quantity: número de artículos.
           - storeName (opcional).

        Normaliza todos los nombres a minúsculas y sin acentos. Devuelve solo el JSON que se ajuste al esquema proporcionado.`;

        // AI disabled: simple stub that tries to detect 'limpiar' -> CLEAR_LIST, otherwise error
        const low = (transcript || '').toLowerCase();
        if (low.includes('limpiar')) {
          executeVoiceCommand({ action: 'CLEAR_LIST' } as any);
        } else {
          throw new Error('Procesamiento de voz deshabilitado temporalmente');
        }

    } catch (error: any) {
        console.error("Error processing voice command:", error);
        const errorMessage = error.message || "No te he entendido. ¿Puedes repetirlo?";
        setVoiceFeedback(prev => ({ ...prev, status: 'error', message: errorMessage }));
    }
}, [executeVoiceCommand]);


  const handleStartVoiceCommand = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Tu navegador no soporta el reconocimiento de voz.");
        return;
    }

    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback({ status: 'listening', message: 'Escuchando...' });
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceFeedback({ status: 'processing', message: 'Procesando...', transcript });
        processTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setVoiceFeedback({ status: 'error', message: 'No he podido oírte. Inténtalo de nuevo.' });
    };

    recognition.onend = () => {
        setIsListening(false);
        if (voiceFeedback.status === 'listening') { // Closed without speaking
             setVoiceFeedback({ status: 'idle', message: '' });
        }
    };

    recognition.start();
  }, [processTranscript, voiceFeedback.status]);


  // --- End Voice Command Handlers ---

  const handleStartShopping = () => setIsShoppingMode(true);

  const handleRequestExitShoppingMode = useCallback(() => {
    // Per user request, exiting shopping mode no longer removes picked items.
    // It just exits the mode.
    setIsShoppingMode(false);
  }, []);

  // --- Store Handlers ---
  const handleSaveStore = useCallback((data: { id?: string; name: string; color: string }) => {
    if (data.id) { // Editing existing store
        setStores(prev => prev.map(s => s.id === data.id ? { ...s, name: data.name, color: data.color } : s));
    } else { // Adding new store
        const newStore: Store = {
            id: generateId('store'),
            name: data.name,
            color: data.color,
            aisleOrder: [],
        };
        setStores(prev => [...prev, newStore]);
    }
    setIsStoreModalOpen(false);
    setEditingStore(null);
  }, []);

  const handleOpenStoreModal = useCallback((store: Store | null) => {
    setEditingStore(store);
    setIsStoreModalOpen(true);
  }, []);

  const handleSelectStore = (storeId: string) => {
    setSelectedStoreId(storeId);
    setActiveView('storeDetail');
  };

  const handleViewChange = (view: View) => {
    if (view !== 'storeDetail') {
        setSelectedStoreId(null);
    }
    setActiveView(view);
  };
  
  const handleSignOut = () => {
    // Fix: Use v8 namespaced signOut method
    auth.signOut().catch(error => console.error("Error signing out: ", error));
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-12 h-12 border-4 border-border border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView
                    activeList={activeList}
                    productMap={productMap}
                    onNavigate={setActiveView}
                    onStartShopping={handleStartShopping}
                    onScanTicket={handleOpenOcr}
                    weeklyBudget={weeklyBudget}
                    setWeeklyBudget={setWeeklyBudget}
                />;
      case 'catalog':
        return <CatalogView 
                  products={products}
                  categories={categories}
                  categoryMap={categoryMap}
                  priceRecords={priceRecords}
                  onAddItem={handleAddItemToList}
                  onEditProduct={p => handleOpenProductSheet(p)}
                  onDeleteProduct={handleDeleteProduct} 
                  storeMap={storeMap}
                />;
      case 'list':
        return <ShoppingListView 
                  lists={lists}
                  activeListId={activeListId}
                  onSelectList={handleSelectList}
                  onUpdateItem={handleUpdateListItem}
                  onDeleteItem={handleDeleteItemFromList}
                  productMap={productMap}
                  storeMap={storeMap}
                  categoryMap={categoryMap}
                  categories={categories}
                  stores={stores}
                  priceRecords={priceRecords}
                  onStartShopping={handleStartShopping}
                  currentUser={currentUser}
                  users={users}
                  usersMap={usersMap}
                  userEmailMap={userEmailMap}
                  onUpdateListMembers={handleUpdateListMembers}
                />;
      case 'stores':
        return <StoresView stores={stores} onSelectStore={handleSelectStore} onEditStore={handleOpenStoreModal} />;
      case 'storeDetail':
        const store = selectedStoreId ? storeMap.get(selectedStoreId) : null;
        if (!store) {
            return <StoresView stores={stores} onSelectStore={handleSelectStore} onEditStore={handleOpenStoreModal} />;
        }
        return <StoreDetailView
                  store={store}
                  allProducts={products}
                  priceRecords={priceRecords}
                  categoryMap={categoryMap}
                  onAddItem={(productId, quantity) => handleAddItemToList(productId, store.id, quantity)}
                  onEditProduct={p => handleOpenProductSheet(p)}
                  onDeleteProduct={handleDeleteProduct}
                  onBack={() => handleViewChange('stores')}
                />;
      default:
        return <CatalogView 
                  products={products}
                  categories={categories}
                  categoryMap={categoryMap}
                  priceRecords={priceRecords}
                  onAddItem={handleAddItemToList}
                  onEditProduct={p => handleOpenProductSheet(p)}
                  onDeleteProduct={handleDeleteProduct} 
                  storeMap={storeMap}
                />;
    }
  };

  if (isShoppingMode) {
    return (
        <ShoppingModeView
            list={activeList}
            onUpdateItem={handleUpdateListItem}
            productMap={productMap}
            storeMap={storeMap}
            categoryMap={categoryMap}
            onExit={handleRequestExitShoppingMode}
            usersMap={usersMap}
        />
    );
  }
  
  let primaryAction: { onClick: () => void; icon: React.ReactNode; label: string } | undefined = undefined;

  if (activeView === 'catalog') {
    primaryAction = {
        onClick: () => handleOpenProductSheet(null),
        icon: <PlusIcon />,
        label: 'Añadir nuevo producto',
    };
  } else if (activeView === 'stores') {
      primaryAction = {
          onClick: () => handleOpenStoreModal(null),
          icon: <PlusIcon />,
          label: 'Añadir nueva tienda',
      };
  }

  return (
  <div className="min-h-screen flex flex-col">
      <Header 
        onScanTicket={handleOpenOcr} 
        onStartVoiceCommand={handleStartVoiceCommand} 
        isListening={isListening}
        primaryAction={primaryAction}
        theme={theme}
        setTheme={setTheme}
        onSignOut={handleSignOut}
      />
      <main className="flex-grow pt-16 pb-20">
        <div className="container mx-auto px-4 py-4">
          {renderView()}
        </div>
      </main>

      {isDeleteConfirmOpen && productToDelete && (
        <DeleteConfirmationModal
            product={productToDelete}
            onConfirm={confirmDeleteProduct}
            onCancel={() => {
                setIsDeleteConfirmOpen(false);
                setProductToDelete(null);
            }}
        />
      )}

      {isProductSheetOpen && (
        <ProductSheet 
          product={editingProduct} 
          categories={categories}
          stores={stores}
          priceRecords={editingProduct ? priceRecords.filter(p => p.productId === editingProduct.id) : []}
          onClose={handleCloseProductSheet} 
          onSaveProduct={handleSaveProduct} 
          onSavePrice={handleSavePriceRecord}
          onUpdatePrice={handleUpdatePriceRecord}
          onDeletePrice={handleDeletePriceRecord}
          onAddCategory={handleAddCategory}
        />
      )}

      <OcrView
        onUpload={() => {}}
        onClose={() => {}}
      />
      
      {isStoreModalOpen && (
        <AddStoreModal 
            storeToEdit={editingStore}
            onClose={() => { setIsStoreModalOpen(false); setEditingStore(null); }}
            onSave={handleSaveStore}
        />
      )}

      {isStoreSelectionModalOpen && selectionModalData && (
        <StoreSelectionModal
            product={selectionModalData.product}
            prices={selectionModalData.prices}
            storeMap={storeMap}
            onClose={() => {
                setIsStoreSelectionModalOpen(false);
                setSelectionModalData(null);
            }}
            onSelect={handleStoreSelection}
        />
      )}
      
       {isListSelectionModalOpen && (
        <ListSelectionModal
            lists={lists}
            onClose={() => {
                setIsListSelectionModalOpen(false);
                setListSelectionData(null);
            }}
            onSelect={handleListSelectionForAdd}
        />
      )}

      {isCreateListModalOpen && (
        <CreateListModal
            onClose={() => setIsCreateListModalOpen(false)}
            onCreate={handleCreateList}
        />
      )}

      {voiceFeedback.status !== 'idle' && (
        <VoiceCommandModal 
            status={voiceFeedback.status}
            message={voiceFeedback.message}
            transcript={voiceFeedback.transcript}
            onClose={() => setVoiceFeedback({ status: 'idle', message: '' })}
        />
      )}
      
      {isHelpModalOpen && (
          <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}

      <BottomNav activeView={activeView} setActiveView={handleViewChange} onOpenHelp={() => setIsHelpModalOpen(true)} />
    </div>
  );
};

export default App;