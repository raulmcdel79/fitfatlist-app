import React from 'react';
import { TicketLineItem } from './OcrView';

// Ejemplo de uso: lista de líneas de ticket
const exampleLines = [
  {
    id: '1',
    productName: 'Leche',
    brandGuess: 'Pascual',
    sizeGuess: '1L',
    suggestedCategoryName: 'Lácteos',
    totalPrice: 1.25,
    qty: 1,
    unitPrice: 1.25
  },
  {
    id: '2',
    productName: 'Pan',
    brandGuess: 'Bimbo',
    sizeGuess: '500g',
    suggestedCategoryName: 'Panadería',
    totalPrice: 1.10,
    qty: 1,
    unitPrice: 1.10
  }
];

const categories = [
  { id: 'cat1', name: 'Lácteos' },
  { id: 'cat2', name: 'Panadería' },
  { id: 'cat3', name: 'Bebidas' }
];

export default function TicketDemo() {
  // Simular handlers
  const handleDelete = (id) => alert('Eliminar línea: ' + id);
  const handleUpdateProductName = (id, name) => alert(`Producto actualizado: ${id} → ${name}`);
  const handleUpdateBrand = (id, brand) => alert(`Marca actualizada: ${id} → ${brand}`);
  const handleUpdateSize = (id, size) => alert(`Tamaño actualizado: ${id} → ${size}`);
  const handleUpdateCategory = (id, cat) => alert(`Categoría actualizada: ${id} → ${cat}`);
  const handleAddCategory = async (name) => {
    alert('Nueva categoría: ' + name);
    return { id: 'new', name };
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="font-bold text-lg mb-2">Demo TicketLineItem</h2>
      {exampleLines.map(line => (
        <React.Fragment key={line.id}>
          <TicketLineItem
            line={line}
            onDelete={handleDelete}
            onUpdateLineProductName={handleUpdateProductName}
            onUpdateLineBrand={handleUpdateBrand}
            onUpdateLineSize={handleUpdateSize}
            categories={categories}
            onUpdateLineCategory={handleUpdateCategory}
            onAddCategory={handleAddCategory}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
