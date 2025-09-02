
import React, { useRef, useState } from 'react';
import { XIcon } from '../constants';

interface OcrViewProps {
  onUpload: (imageBase64: string) => void;
  onClose: () => void;
}

const OcrView: React.FC<OcrViewProps> = ({ onUpload, onClose }) => {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    console.log('Botón escáner pulsado');
    if (fileInputRef.current) {
      console.log('Input file existe, disparando click');
      fileInputRef.current.click();
    } else {
      alert('Input file NO existe');
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setImage(base64);
        onUpload(base64);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ background: '#fff', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="w-full flex justify-end mb-2">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-border" aria-label="Cerrar escáner"><XIcon className="h-6 w-6" /></button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Escanear ticket o producto</h2>
      {!image ? (
        <>
          <button
            onClick={handleOpenFile}
            className="px-4 py-2 bg-brand text-white rounded shadow hover:bg-brand/80 transition mb-4"
          >
            Tomar foto o seleccionar imagen (debug)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <img src={image} alt="Ticket escaneado" className="max-w-xs max-h-80 rounded border" />
          <button
            onClick={handleRemoveImage}
            className="flex items-center gap-1 px-3 py-1 bg-danger text-white rounded hover:bg-danger/80 transition"
          >
            <XIcon className="h-4 w-4" /> Quitar imagen
          </button>
        </div>
      )}
    </div>
  );
};

export default OcrView;
export const TicketLineItem = ({
  line,
  onDelete,
  onUpdateLineProductName,
  onUpdateLineBrand,
  onUpdateLineSize,
  categories,
  onUpdateLineCategory,
  onAddCategory
}) => {
  const inputStyles = "bg-transparent border border-border rounded focus:bg-surface focus:ring-1 focus:ring-brand outline-none transition-all";
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "--new--") {
      const newCat = prompt("Nombre de la nueva categoría:");
      if (newCat && newCat.trim()) {
        onAddCategory(newCat.trim()).then(cat => {
          onUpdateLineCategory(line.id, cat.name);
        });
      }
    } else {
      onUpdateLineCategory(line.id, value);
    }
  };
  return (
    <div className="bg-bg rounded-xl border border-border px-1 py-1 overflow-x-auto">
      <div className="flex flex-nowrap items-center w-full gap-0.5 whitespace-nowrap">
        <input
          type="text"
          value={line.productName || ''}
          onChange={e => onUpdateLineProductName(line.id, e.target.value)}
          className="font-semibold text-xs bg-transparent rounded p-0.5 focus:bg-surface focus:ring-1 focus:ring-brand outline-none transition-all w-[120px] flex-shrink-0 truncate"
          aria-label="Nombre del producto"
        />
        <span className="font-bold text-ink text-xs w-[60px] text-right flex-shrink-0 truncate">{line.totalPrice?.toFixed(2) ?? ''}€</span>
        <input
          type="number"
          min={1}
          value={line.qty}
          onChange={e => onUpdateLineSize(line.id, e.target.value)}
          className="text-xs bg-transparent border border-border rounded px-0.5 w-[32px] text-center flex-shrink-0"
          aria-label="Cantidad"
        />
        <span className="text-xs text-ink-muted w-[60px] text-center flex-shrink-0 truncate">x {line.unitPrice?.toFixed(2) ?? ''}</span>
        <input
          id={`brand-${line.id}`}
          type="text"
          value={line.brandGuess || ''}
          onChange={e => onUpdateLineBrand(line.id, e.target.value)}
          className={inputStyles + ' text-xs px-0.5 w-[70px] flex-shrink-0 truncate'}
          placeholder="Marca"
        />
        <input
          id={`size-${line.id}`}
          type="text"
          value={line.sizeGuess || ''}
          onChange={e => onUpdateLineSize(line.id, e.target.value)}
          className={inputStyles + ' text-xs px-0.5 w-[70px] flex-shrink-0 truncate'}
          placeholder="Tamaño"
        />
        <select
          id={`category-${line.id}`}
          value={line.suggestedCategoryName || ''}
          onChange={handleCategoryChange}
          className={inputStyles + ' text-xs px-0.5 w-[90px] flex-shrink-0 truncate'}
        >
          <option value="" disabled>Categoría...</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name} className="bg-surface text-ink truncate">{cat.name}</option>
          ))}
          <option value="--new--" className="font-bold text-brand bg-surface">
            + Nueva categoría...
          </option>
        </select>
        <button 
          onClick={() => onDelete(line.id)}
          className="flex-shrink-0 p-0.5 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors ml-0.5"
          aria-label={`Eliminar línea: ${line.productName || line.rawText}`}
        >
          <XIcon className="h-4 w-4"/>
        </button>
      </div>
    </div>
  );
};
