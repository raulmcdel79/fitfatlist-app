export enum ProductUnit {
  KILOGRAMS = "kg",
  LITERS = "l",
  UNITS = "u",
}

export enum ListItemStatus {
  PENDING = "pending",
  PICKED = "picked",
  SKIPPED = "skipped",
}

export enum TicketStatus {
  UPLOADING = "uploading",
  PARSING = "parsing",
  REVIEW = "review",
  APPLIED = "applied",
}

export enum VoiceCommandAction {
  ADD = "ADD",
  REMOVE = "REMOVE",
  UPDATE_QUANTITY = "UPDATE_QUANTITY",
  CLEAR_LIST = "CLEAR_LIST",
  CREATE_PRODUCT = "CREATE_PRODUCT",
  UPDATE_PRICE = "UPDATE_PRICE",
}


export type PriceQuality = 'Buena' | 'Normal' | 'Mala';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type ListMemberRole = 'owner' | 'admin' | 'editor' | 'viewer';


export interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

export interface Store {
  id: string;
  name: string;
  icon?: string;
  aisleOrder: string[]; // Array of category IDs
  color: string;
}

export interface PriceRecord {
  id:string;
  productId: string;
  storeId: string;
  price: number;
  date: string;
  quality: PriceQuality;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  unit: ProductUnit;
  brand?: string;
  size?: string;
  aliases?: string[];
  healthScore?: number; // 1 (unhealthy) to 5 (healthy)
}

export interface ListItem {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  status: ListItemStatus;
  priceSnapshot?: number;
  pickedBy?: string; // User ID of who picked the item
  pickedAt?: string; // ISO string timestamp
}

export interface List {
  id: string;
  name: string;
  items: ListItem[];
  ownerId: string;
  members: Record<string, ListMemberRole>; // Maps userId to their role
}

export interface Ticket {
  id: string;
  storeId: string;
  status: TicketStatus;
  lines: TicketLine[];
  createdAt: string;
}

export interface TicketLine {
  id: string;
  rawText: string;
  productName?: string;
  brandGuess?: string;
  sizeGuess?: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  candidateProductIds: string[];
  suggestedCategoryName?: string;
  matchedProductId?: string;
  healthScoreGuess?: number; // 1 to 5
  quality: PriceQuality;
}

export type View = 'dashboard' | 'catalog' | 'list' | 'stores' | 'storeDetail';

export type ProductFormData = Omit<Product, 'id' | 'aliases'>;

export type ProductMap = Map<string, Product>;
export type StoreMap = Map<string, Store>;
export type CategoryMap = Map<string, Category>;
export type UserMap = Map<string, User>;