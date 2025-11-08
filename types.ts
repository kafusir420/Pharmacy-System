export interface Batch {
    id: string;
    batchNumber: string;
    expiryDate: string; // YYYY-MM-DD
    quantity: number;
    costPrice: number;
    sellingPrice: number;
}

export interface Medicine {
    id: string;
    name: string;
    manufacturer: string;
    stock: number;
    warehouse: Warehouse;
    batches: Batch[];
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
}

export interface CartItem {
    medicineId: string;
    batchId: string;
    name: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Sale {
    id: string;
    date: string;
    items: CartItem[];
    totalAmount: number;
    customerName: string;
    pharmacist: UserRole;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    orderDate: string;
    deliveryDate?: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    items: { medicineName: string; quantity: number; costPrice: number }[];
    totalAmount: number;
}

export interface Toast {
    message: string;
    visible: boolean;
}

export interface PharmacySettings {
    name: string;
    address: string;
    phone: string;
    gstin: string;
}

export interface User {
    id: string;
    username: string;
    password: string; // NOTE: In a real-world application, this should be a securely stored hash.
    role: UserRole;
}

export type UserRole = 'Admin' | 'Pharmacist' | 'Sales Associate';
export type Warehouse = 'Main Warehouse' | 'Store Front';
export type View = 'dashboard' | 'pos' | 'inventory' | 'purchases' | 'suppliers' | 'reports' | 'settings';