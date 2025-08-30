import type { Product, Store, Category, List, PriceRecord, User } from '../types';
import { ProductUnit, ListItemStatus } from '../types';

export const users: User[] = [
  { id: 'user-1', name: 'Álex García', email: 'alex.garcia@email.com' },
  { id: 'user-2', name: 'Jane Doe', email: 'jane.doe@email.com' },
  { id: 'user-3', name: 'John Smith', email: 'john.smith@email.com' },
];

export const initialCategories: Category[] = [
  { id: 'cat-fyv', name: 'Frutas y Verduras' },
  { id: 'cat-carnepescado', name: 'Carne y Pescado' },
  { id: 'cat-lacteos', name: 'Lácteos y Huevos' },
  { id: 'cat-pancereal', name: 'Pan, Cereales y Pasta' },
  { id: 'cat-despensa', name: 'Despensa / Enlatados' },
  { id: 'cat-congelados', name: 'Congelados' },
  { id: 'cat-bebidas', name: 'Bebidas' },
  { id: 'cat-snacks', name: 'Snacks y Dulces' },
  { id: 'cat-higiene', name: 'Higiene y Limpieza' },
  { id: 'cat-mascotas', name: 'Mascotas' },
  { id: 'cat-bebe', name: 'Bebé' },
];

export const initialStores: Store[] = [
  { id: 'store1', name: 'Mercadona', aisleOrder: ['cat-fyv', 'cat-pancereal', 'cat-carnepescado', 'cat-lacteos', 'cat-despensa', 'cat-snacks', 'cat-bebidas', 'cat-congelados', 'cat-higiene', 'cat-bebe'], color: 'green' },
  { id: 'store2', name: 'Lidl', aisleOrder: ['cat-pancereal', 'cat-fyv', 'cat-carnepescado', 'cat-lacteos', 'cat-congelados', 'cat-bebidas'], color: 'yellow' },
  { id: 'store3', name: 'Frutería Local', aisleOrder: ['cat-fyv'], color: 'green' },
  { id: 'store4', name: 'Carrefour', aisleOrder: ['cat-fyv', 'cat-pancereal', 'cat-carnepescado', 'cat-lacteos', 'cat-despensa', 'cat-bebidas', 'cat-congelados', 'cat-higiene'], color: 'blue' },
  { id: 'store5', name: 'Dia', aisleOrder: ['cat-fyv', 'cat-pancereal', 'cat-lacteos', 'cat-carnepescado', 'cat-bebidas'], color: 'red' },
  { id: 'store6', name: 'Alcampo', aisleOrder: ['cat-fyv', 'cat-carnepescado', 'cat-lacteos', 'cat-pancereal', 'cat-bebidas'], color: 'orange' },
  { id: 'store7', name: 'Consum', aisleOrder: ['cat-fyv', 'cat-pancereal', 'cat-carnepescado', 'cat-lacteos', 'cat-despensa', 'cat-bebidas', 'cat-congelados', 'cat-higiene'], color: 'orange' },
];

export const initialProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Leche Entera',
    brand: 'Hacendado',
    categoryId: 'cat-lacteos',
    unit: ProductUnit.LITERS,
    aliases: ['LECHE HACENDADO', 'LLET SENCERA'],
    healthScore: 4,
  },
  {
    id: 'prod2',
    name: 'Plátanos',
    brand: 'Canarias',
    categoryId: 'cat-fyv',
    unit: ProductUnit.KILOGRAMS,
    aliases: ['PLATANO CANARIAS'],
    healthScore: 5,
  },
  {
    id: 'prod3',
    name: 'Pechuga de Pollo',
    categoryId: 'cat-carnepescado',
    unit: ProductUnit.KILOGRAMS,
    healthScore: 5,
  },
  {
    id: 'prod4',
    name: 'Pan de Masa Madre',
    categoryId: 'cat-pancereal',
    unit: ProductUnit.UNITS,
    healthScore: 4,
  },
  {
    id: 'prod5',
    name: 'Huevos Camperos',
    brand: 'Pazo de Vilane',
    categoryId: 'cat-lacteos',
    unit: ProductUnit.UNITS,
    healthScore: 5,
  },
  {
    id: 'prod6',
    name: 'Tomates',
    categoryId: 'cat-fyv',
    unit: ProductUnit.KILOGRAMS,
    healthScore: 5,
  },
   {
    id: 'prod7',
    name: 'Aceite de Oliva',
    brand: 'Carbonell',
    categoryId: 'cat-despensa',
    unit: ProductUnit.LITERS,
    healthScore: 4,
  },
  {
    id: 'prod8',
    name: 'Agua con Gas',
    brand: 'Font Vella',
    categoryId: 'cat-bebidas',
    unit: ProductUnit.LITERS,
    healthScore: 5,
  },
];

export const initialPriceRecords: PriceRecord[] = [
    // Leche
    { id: 'pr1', productId: 'prod1', storeId: 'store1', price: 0.90, date: '2023-10-26', quality: 'Normal', notes: 'Marca Hacendado' },
    { id: 'pr2', productId: 'prod1', storeId: 'store2', price: 0.92, date: '2023-10-25', quality: 'Normal' },
    // Plátanos
    { id: 'pr3', productId: 'prod2', storeId: 'store3', price: 1.99, date: '2023-10-25', quality: 'Buena' },
    { id: 'pr4', productId: 'prod2', storeId: 'store1', price: 2.15, date: '2023-10-26', quality: 'Normal' },
    // Pollo
    { id: 'pr5', productId: 'prod3', storeId: 'store1', price: 6.50, date: '2023-10-26', quality: 'Buena', notes: 'En bandeja' },
    // Pan
    { id: 'pr6', productId: 'prod4', storeId: 'store2', price: 2.50, date: '2023-10-26', quality: 'Buena' },
    // Huevos
    { id: 'pr7', productId: 'prod5', storeId: 'store1', price: 2.10, date: '2023-10-24', quality: 'Normal' },
    // Tomates
    { id: 'pr8', productId: 'prod6', storeId: 'store3', price: 2.49, date: '2023-10-25', quality: 'Buena' },
    // Aceite
    { id: 'pr9', productId: 'prod7', storeId: 'store2', price: 8.75, date: '2023-10-22', quality: 'Normal', notes: 'Oferta' },
    { id: 'pr10', productId: 'prod7', storeId: 'store1', price: 9.10, date: '2023-10-26', quality: 'Normal' },
    // Agua
    { id: 'pr11', productId: 'prod8', storeId: 'store1', price: 0.60, date: '2023-10-26', quality: 'Normal' },
];


export const initialLists: List[] = [{
  id: 'list1',
  name: 'Compra Semanal',
  items: [],
  ownerId: 'user-1', // Note: This will be overwritten for new users on first list creation.
  members: {
      'user-1': 'owner',
  },
}];