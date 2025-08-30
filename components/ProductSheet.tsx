
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category, ProductFormData, Store, PriceRecord, PriceQuality } from '../types';
import { ProductUnit } from '../types';
import { XIcon, EditIcon, TrashIcon, colorClassMap, StarIcon, qualityToStars, starsToQuality, starColorMapQuality, StarRatingDisplay, HealthScoreInput } from '../constants';

interface ProductSheetProps {
  product: Product | null;
  categories: Category[];
  stores: Store[];
  priceRecords: PriceRecord[];
  onClose: () => void;
  onSaveProduct: (productData: ProductFormData) => void;
  onSavePrice: (priceData: Omit<PriceRecord, 'id' | 'productId'>) => void;
  onUpdatePrice: (updatedRecord: PriceRecord) => void;
  onDeletePrice: (priceRecordId: string) => void;
  onAddCategory: (categoryName: string) => Promise<Category>;
}

// --- Star Rating Components ---
const StarRatingInput: React.FC<{
    quality: PriceQuality;
    setQuality: (quality: PriceQuality) => void;
}> = ({ quality, setQuality }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const currentRating = qualityToStars[quality];

    const starColor = (index: number) => {
        const rating = hoverRating || currentRating;
        if (index < rating) {
            const qualityForRating = starsToQuality[rating - 1];
            return qualityForRating ? starColorMapQuality[qualityForRating] : 'text-border';
        }
        return 'text-border';
    };

    return (
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(3)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        onClick={() => setQuality(starsToQuality[i])}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        className="p-1 rounded-full transition-transform duration-100 hover:scale-110"
                        aria-label={`${ratingValue} estrella${ratingValue > 1 ? 's' : ''}`}
                    >
                        <StarIcon className={`h-8 w-8 transition-colors ${starColor(i)}`} />
                    </button>
                );
            })}
        </div>
    );
};


const ProductSheet: React.FC<ProductSheetProps> = ({ product, categories, stores, priceRecords, onClose, onSaveProduct, onSavePrice, onUpdatePrice, onDeletePrice, onAddCategory }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    categoryId: '',
    unit: ProductUnit.UNITS,
    size: '',
    healthScore: 3,
  });

  const [priceFormData, setPriceFormData] = useState({
      storeId: '',
      price: '',
      quality: 'Normal' as PriceQuality,
      notes: '',
  });

  const [isAddingPrice, setIsAddingPrice] = useState(false);
  const [editingPriceRecord, setEditingPriceRecord] = useState<PriceRecord | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand || '',
        categoryId: product.categoryId,
        unit: product.unit,
        size: product.size || '',
        healthScore: product.healthScore || 3,
      });
    } else {
      // Reset form for new product
       setFormData({ name: '', brand: '', categoryId: '', unit: ProductUnit.UNITS, size: '', healthScore: 3 });
    }
     // Reset price form state when product changes
    setIsAddingPrice(false);
    setEditingPriceRecord(null);
    setPriceFormData({ storeId: '', price: '', quality: 'Normal', notes: '' });
  }, [product]);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setPriceFormData(prev => ({...prev, [name]: value }));
  };

  const nonNutritionalCategories = ['cat-higiene', 'cat-mascotas', 'cat-bebe'];
  const showHealthScore = formData.categoryId && !nonNutritionalCategories.includes(formData.categoryId);

  const handleProductSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name || !formData.categoryId) {
      alert('El nombre y la categoría son obligatorios.');
      return;
    }
    
    const finalFormData: ProductFormData = { ...formData };
    if (nonNutritionalCategories.includes(finalFormData.categoryId)) {
        finalFormData.healthScore = undefined;
    }

    onSaveProduct(finalFormData);

    if(product) { // Only close if we are editing an existing product.
        onClose();
    }
  };
  
  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceFormData.storeId || !priceFormData.price) {
        alert('La tienda y el precio son obligatorios.');
        return;
    }

    const priceNumber = parseFloat(priceFormData.price.replace(',', '.'));

    if (isNaN(priceNumber)) {
        alert('El precio introducido no es un número válido.');
        return;
    }

    if (editingPriceRecord) {
        onUpdatePrice({
            ...editingPriceRecord,
            storeId: priceFormData.storeId,
            price: priceNumber,
            quality: priceFormData.quality,
            notes: priceFormData.notes || undefined,
            date: new Date().toISOString().split('T')[0],
        });
    } else {
        onSavePrice({
            storeId: priceFormData.storeId,
            price: priceNumber,
            quality: priceFormData.quality,
            notes: priceFormData.notes || undefined,
            date: new Date().toISOString().split('T')[0],
        });
    }
    
    // Reset form and hide it
    setPriceFormData({ storeId: '', price: '', quality: 'Normal', notes: '' });
    setIsAddingPrice(false);
    setEditingPriceRecord(null);
  };

  const handleEditPrice = (priceRecord: PriceRecord) => {
    setEditingPriceRecord(priceRecord);
    setPriceFormData({
        storeId: priceRecord.storeId,
        price: String(priceRecord.price),
        quality: priceRecord.quality,
        notes: priceRecord.notes || '',
    });
    setIsAddingPrice(true);
  };
  
  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === '--new--') {
        const newCategoryName = prompt('Nombre de la nueva categoría:');
        if (newCategoryName && newCategoryName.trim() !== '') {
            try {
                const newCategory = await onAddCategory(newCategoryName.trim());
                setFormData(prev => ({ ...prev, categoryId: newCategory.id }));
            } catch (error) {
                console.error("Failed to add category", error);
                alert("No se pudo añadir la categoría.");
            }
        }
    } else {
        setFormData(prev => ({ ...prev, categoryId: value }));
    }
  };

  const storeMap = new Map(stores.map(s => [s.id, s]));
  
  const storesWithPrice = useMemo(() => new Set(priceRecords.map(pr => pr.storeId)), [priceRecords]);

  const availableStoresForNewPrice = useMemo(() => {
    // When editing, show all stores so the user can change the store of an existing record.
    if (editingPriceRecord) {
        return stores;
    }
    // When adding a new price, only show stores that don't have a price record yet.
    return stores.filter(s => !storesWithPrice.has(s.id));
  }, [stores, storesWithPrice, editingPriceRecord]);
  
  useEffect(() => {
      if (isAddingPrice && !editingPriceRecord) {
          if (availableStoresForNewPrice.length > 0 && !priceFormData.storeId) {
              setPriceFormData(prev => ({ ...prev, storeId: availableStoresForNewPrice[0].id }));
          }
      }
  }, [isAddingPrice, editingPriceRecord, availableStoresForNewPrice, priceFormData.storeId]);

  const canAddMorePrices = stores.length > storesWithPrice.size;

  const inputStyles = "block w-full px-3 py-2 bg-bg border border-border rounded-xl placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand sm:text-sm";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-20 flex justify-center items-end" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-lg rounded-t-2xl border-t border-l border-r border-border relative animate-slide-up max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
        
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-ink">{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <XIcon />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
            <form onSubmit={handleProductSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink-muted">Nombre del Producto</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleProductChange} required className={`mt-1 ${inputStyles}`} />
            </div>
            <div>
                <label htmlFor="brand" className="block text-sm font-medium text-ink-muted">Marca (Opcional)</label>
                <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleProductChange} className={`mt-1 ${inputStyles}`} />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-ink-muted">Unidad</label>
                    <select name="unit" id="unit" value={formData.unit} onChange={handleProductChange} required className={`mt-1 ${inputStyles}`}>
                    {Object.values(ProductUnit).map(unit => (
                        <option key={unit} value={unit} className="bg-surface text-ink">{unit}</option>
                    ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="size" className="block text-sm font-medium text-ink-muted">Tamaño (ej. 400g, 1L)</label>
                    <input type="text" name="size" id="size" value={formData.size} onChange={handleProductChange} className={`mt-1 ${inputStyles}`} />
                </div>
            </div>
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-ink-muted">Categoría</label>
                <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleCategoryChange} required className={`mt-1 ${inputStyles}`}>
                    <option value="" disabled>Selecciona una categoría</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-surface text-ink">{cat.name}</option>
                    ))}
                    <option value="--new--" className="font-bold text-brand bg-surface">
                        + Nueva categoría...
                    </option>
                </select>
            </div>
            {showHealthScore && (
                <div>
                    <label className="block text-sm font-medium text-ink-muted">Puntuación Nutricional</label>
                    <div className="mt-2">
                        <HealthScoreInput
                            score={formData.healthScore}
                            setScore={(newScore) => setFormData(prev => ({ ...prev, healthScore: newScore }))}
                        />
                    </div>
                </div>
            )}
            {!product && ( // Only show save button for new products, edit is implicit
                 <div className="pt-4 flex justify-end">
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-brand-ink bg-brand hover:opacity-90">
                        Crear Producto
                    </button>
                 </div>
            )}
            </form>

            {product && (
                <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold text-ink mb-4">Precios por Tienda</h3>
                    {priceRecords.length > 0 && (
                        <ul className="space-y-2 mb-4">
                            {priceRecords.map(pr => {
                                const store = storeMap.get(pr.storeId);
                                const colorClasses = store ? (colorClassMap[store.color] || null) : null;
                                return (
                                <li key={pr.id} className="flex justify-between items-center p-2 bg-bg rounded-xl border border-border">
                                    <div>
                                        <span className={`font-semibold px-2 py-1 rounded-md text-sm ${colorClasses ? `${colorClasses.pillBg} ${colorClasses.iconText}` : 'bg-pill text-brand-ink'}`}>
                                          {store?.name}
                                        </span>
                                        <p className="text-xs text-ink-muted mt-1 pl-1">{pr.notes || `Actualizado: ${new Date(pr.date).toLocaleDateString()}`}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StarRatingDisplay quality={pr.quality} />
                                        <span className="font-bold text-ink">{pr.price.toFixed(2)}€</span>
                                        <button onClick={() => handleEditPrice(pr)} className="flex items-center justify-center p-1 text-ink-muted hover:text-brand transition-colors rounded-full hover:bg-surface" aria-label="Editar precio">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => onDeletePrice(pr.id)} className="flex items-center justify-center p-1 text-ink-muted hover:text-danger transition-colors rounded-full hover:bg-surface" aria-label="Eliminar precio">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            )})}
                        </ul>
                    )}

                    {!isAddingPrice && canAddMorePrices && (
                        <button onClick={() => setIsAddingPrice(true)} className="w-full text-sm font-semibold text-brand bg-pill hover:opacity-80 rounded-xl py-2 transition-colors">
                            + Añadir Precio
                        </button>
                    )}
                    
                    {!isAddingPrice && !canAddMorePrices && stores.length > 0 && (
                         <div className="text-center text-sm text-ink-muted py-2 bg-bg border border-dashed border-border rounded-xl">
                            <p>Ya has añadido precios para todas tus tiendas.</p>
                        </div>
                    )}


                    {isAddingPrice && (
                        <form onSubmit={handlePriceSubmit} className="space-y-4 p-4 bg-bg rounded-2xl mt-2 border border-border">
                            <h4 className="font-semibold text-sm">{editingPriceRecord ? 'Editar Registro de Precio' : 'Nuevo Registro de Precio'}</h4>
                             <select name="storeId" value={priceFormData.storeId} onChange={handlePriceChange} required className={inputStyles}>
                                <option value="" disabled>Selecciona tienda</option>
                                {availableStoresForNewPrice.map(s => <option key={s.id} value={s.id} className="bg-surface text-ink">{s.name}</option>)}
                            </select>
                            <input type="text" inputMode="decimal" name="price" value={priceFormData.price} onChange={handlePriceChange} placeholder="Precio" required className={inputStyles} />
                            <div>
                                <label className="block text-sm font-medium text-ink-muted mb-1">Relación Calidad/Precio</label>
                                <StarRatingInput
                                    quality={priceFormData.quality}
                                    setQuality={(newQuality) => setPriceFormData(prev => ({ ...prev, quality: newQuality }))}
                                />
                            </div>
                            <textarea name="notes" value={priceFormData.notes} onChange={handlePriceChange} placeholder="Notas (ej. 'Oferta 3x2')" rows={2} className={inputStyles}></textarea>
                            <div className="flex justify-end gap-2">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setIsAddingPrice(false);
                                    setEditingPriceRecord(null);
                                    setPriceFormData({ storeId: '', price: '', quality: 'Normal', notes: '' });
                                  }} 
                                  className="text-sm font-medium text-ink py-1 px-3 rounded-xl hover:bg-border">
                                    Cancelar
                                </button>
                                <button type="submit" className="text-sm font-medium text-brand-ink bg-brand hover:opacity-90 py-1 px-3 rounded-xl">Guardar</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
        
        <div className="flex-shrink-0 p-4 bg-bg border-t border-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-surface py-2 px-4 border border-border rounded-xl text-sm font-medium text-ink hover:bg-border">
                Cerrar
            </button>
            <button type="button" onClick={handleProductSubmit} className="inline-flex justify-center py-2 px-4 border border-transparent rounded-xl text-sm font-medium text-brand-ink bg-brand hover:opacity-90">
                Guardar Cambios
            </button>
        </div>

      </div>
    </div>
  );
};

export default ProductSheet;
