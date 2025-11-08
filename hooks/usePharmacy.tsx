import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Medicine, Sale, Supplier, PurchaseOrder, CartItem, UserRole, Batch, PharmacySettings } from '../types';
import { dbService, initDB } from '../services/database';

const INITIAL_SETTINGS: PharmacySettings = {
    name: 'Gemini Pharmacy',
    address: '123 Health St, Wellness City',
    phone: '555-123-4567',
    gstin: 'ABCDE12345'
};

interface PharmacyContextType {
    medicines: Medicine[];
    sales: Sale[];
    suppliers: Supplier[];
    purchaseOrders: PurchaseOrder[];
    settings: PharmacySettings;
    isLoading: boolean;
    addSale: (cart: CartItem[], customerName: string, pharmacist: UserRole) => Promise<void>;
    addMedicine: (medicine: Omit<Medicine, 'id' | 'stock'>) => Promise<void>;
    updateMedicine: (updatedMedicine: Medicine) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
    addPurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => Promise<void>;
    completePurchaseOrder: (orderId: string) => Promise<void>;
    updateSettings: (newSettings: PharmacySettings) => Promise<void>;
    adjustStock: (medicineId: string, batchId: string, quantityChange: number) => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);


export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [settings, setSettings] = useState<PharmacySettings>(INITIAL_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                await initDB();
                const [
                    dbMedicines, 
                    dbSales, 
                    dbSuppliers, 
                    dbPurchaseOrders, 
                    dbSettings
                ] = await Promise.all([
                    dbService.getMedicines(),
                    dbService.getSales(),
                    dbService.getSuppliers(),
                    dbService.getPurchaseOrders(),
                    dbService.getSettings()
                ]);

                setMedicines(dbMedicines);
                setSales(dbSales);
                setSuppliers(dbSuppliers);
                setPurchaseOrders(dbPurchaseOrders);

                if (dbSettings) {
                    setSettings(dbSettings);
                } else {
                    await dbService.updateSettings(INITIAL_SETTINGS);
                }
            } catch (error) {
                console.error("Failed to load data from database", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const addSale = useCallback(async (cart: CartItem[], customerName: string, pharmacist: UserRole) => {
        const newSale: Sale = {
            id: `sale-${Date.now()}`,
            date: new Date().toISOString(),
            items: cart,
            totalAmount: cart.reduce((sum, item) => sum + item.total, 0),
            customerName,
            pharmacist,
        };
        
        await dbService.addSale(newSale);
        setSales(prev => [...prev, newSale]);

        // Update stock
        const medsToUpdate: Medicine[] = [];
        // FIX: Specify generic type for Map to ensure type safety after JSON.parse
        const medicineMap = new Map<string, Medicine>(medicines.map(m => [m.id, JSON.parse(JSON.stringify(m))]));
        
        cart.forEach(cartItem => {
            const med = medicineMap.get(cartItem.medicineId);
            if (med) {
                const batch = med.batches.find((b: { id: string; }) => b.id === cartItem.batchId);
                if (batch) {
                    batch.quantity -= cartItem.quantity;
                    med.stock = med.batches.reduce((sum: any, b: { quantity: any; }) => sum + b.quantity, 0);
                    if (!medsToUpdate.find(m => m.id === med.id)) {
                        medsToUpdate.push(med);
                    }
                }
            }
        });

        if (medsToUpdate.length > 0) {
            await dbService.updateMedicines(medsToUpdate);
            setMedicines(Array.from(medicineMap.values()));
        }

    }, [medicines]);

    const addMedicine = async (medicine: Omit<Medicine, 'id' | 'stock'>) => {
        const newMedicine: Medicine = {
            ...medicine,
            id: `med-${Date.now()}`,
            stock: medicine.batches.reduce((sum, b) => sum + b.quantity, 0),
        };
        await dbService.addMedicine(newMedicine);
        setMedicines(prev => [...prev, newMedicine]);
    };

    const updateMedicine = async (updatedMedicine: Medicine) => {
        await dbService.updateMedicine(updatedMedicine);
        setMedicines(prev => prev.map(med => med.id === updatedMedicine.id ? updatedMedicine : med));
    };
    
    const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
        const newSupplier: Supplier = {
            ...supplier,
            id: `sup-${Date.now()}`
        };
        await dbService.addSupplier(newSupplier);
        setSuppliers(prev => [...prev, newSupplier]);
    };
    
    const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id'>) => {
        const newOrder: PurchaseOrder = {
            ...order,
            id: `po-${Date.now()}`
        };
        await dbService.addPurchaseOrder(newOrder);
        setPurchaseOrders(prev => [newOrder, ...prev]);
    };
    
    const completePurchaseOrder = useCallback(async (orderId: string) => {
         const order = purchaseOrders.find(po => po.id === orderId);
        if (!order || order.status === 'Completed') return;

        const updatedOrder = { ...order, status: 'Completed' as const, deliveryDate: new Date().toISOString().split('T')[0] };
        await dbService.updatePurchaseOrder(updatedOrder);
        setPurchaseOrders(prev => prev.map(po => po.id === orderId ? updatedOrder : po));

        // FIX: Specify generic type for Map to ensure type safety after JSON.parse
        const updatedMedsMap = new Map<string, Medicine>(medicines.map(m => [m.name.toLowerCase(), JSON.parse(JSON.stringify(m))]));
        const newMedicines: Medicine[] = [];
        
        for (const item of order.items) {
             const newBatch: Batch = {
                id: `b-${Date.now()}-${Math.random()}`,
                batchNumber: `PO-${order.id.slice(-4)}`,
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                quantity: item.quantity,
                costPrice: item.costPrice,
                sellingPrice: item.costPrice * 1.25
            };

            let med = updatedMedsMap.get(item.medicineName.toLowerCase());
            if(med) {
                med.batches.push(newBatch);
                med.stock = med.batches.reduce((sum: number, b: Batch) => sum + b.quantity, 0);
            } else {
                 const newMedicine: Medicine = {
                    id: `med-${Date.now()}-${Math.random()}`,
                    name: item.medicineName,
                    manufacturer: suppliers.find(s => s.id === order.supplierId)?.name || 'Unknown',
                    warehouse: 'Main Warehouse',
                    stock: item.quantity,
                    batches: [newBatch]
                };
                updatedMedsMap.set(item.medicineName.toLowerCase(), newMedicine);
                newMedicines.push(newMedicine);
            }
        }
        
        const medsToUpdate = Array.from(updatedMedsMap.values()).filter(m => !newMedicines.some(nm => nm.id === m.id));

        for (const med of newMedicines) {
            await dbService.addMedicine(med);
        }
        if (medsToUpdate.length > 0) {
            await dbService.updateMedicines(medsToUpdate);
        }

        setMedicines(Array.from(updatedMedsMap.values()));

    }, [medicines, purchaseOrders, suppliers]);
    
    const adjustStock = useCallback(async (medicineId: string, batchId: string, quantityChange: number) => {
        const medToUpdate = medicines.find((m: Medicine) => m.id === medicineId);
        if (!medToUpdate) return;
        
        // FIX: Cast the deep-copied medicine object to the Medicine type for type safety
        const updatedMed = JSON.parse(JSON.stringify(medToUpdate)) as Medicine;
        const batch = updatedMed.batches.find((b: Batch) => b.id === batchId);
        if (batch) {
            batch.quantity += quantityChange;
            if (batch.quantity < 0) {
                batch.quantity = 0; // Prevent negative stock
            }
            updatedMed.stock = updatedMed.batches.reduce((sum: number, b: Batch) => sum + b.quantity, 0);
        }

        await dbService.updateMedicine(updatedMed);
        setMedicines(prevMeds => prevMeds.map(m => m.id === medicineId ? updatedMed : m));
    }, [medicines]);

    const updateSettings = async (newSettings: PharmacySettings) => {
        await dbService.updateSettings(newSettings);
        setSettings(newSettings);
    };


    const value = {
        medicines,
        sales,
        suppliers,
        purchaseOrders,
        settings,
        isLoading,
        addSale,
        addMedicine,
        updateMedicine,
        addSupplier,
        addPurchaseOrder,
        completePurchaseOrder,
        updateSettings,
        adjustStock,
    };

    return <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>;
};

export const usePharmacy = (): PharmacyContextType => {
    const context = useContext(PharmacyContext);
    if (context === undefined) {
        throw new Error('usePharmacy must be used within a PharmacyProvider');
    }
    return context;
};
