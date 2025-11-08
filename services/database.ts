import type { Medicine, Sale, Supplier, PurchaseOrder, PharmacySettings, User } from '../types';

const DB_NAME = 'PharmacyDB';
const DB_VERSION = 1;

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(true);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', request.error);
            reject('Error opening database');
        };

        request.onsuccess = (event) => {
            db = request.result;
            resolve(true);
        };

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            if (!dbInstance.objectStoreNames.contains('medicines')) {
                dbInstance.createObjectStore('medicines', { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains('sales')) {
                dbInstance.createObjectStore('sales', { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains('suppliers')) {
                dbInstance.createObjectStore('suppliers', { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains('purchaseOrders')) {
                dbInstance.createObjectStore('purchaseOrders', { keyPath: 'id' });
            }
             if (!dbInstance.objectStoreNames.contains('settings')) {
                dbInstance.createObjectStore('settings', { keyPath: 'name' });
            }
            if (!dbInstance.objectStoreNames.contains('users')) {
                const userStore = dbInstance.createObjectStore('users', { keyPath: 'id' });
                userStore.createIndex('username', 'username', { unique: true });
            }
        };
    });
};

const getStore = (storeName: string, mode: IDBTransactionMode) => {
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
};

const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            console.error(`Error fetching from ${storeName}:`, request.error);
            reject(`Error fetching from ${storeName}`);
        };
    });
};

const add = <T>(storeName: string, item: T): Promise<IDBValidKey> => {
     return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.add(item);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            console.error(`Error adding to ${storeName}:`, request.error);
            reject(`Error adding to ${storeName}`);
        };
    });
};

const update = <T>(storeName: string, item: T): Promise<IDBValidKey> => {
     return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.put(item);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            console.error(`Error updating in ${storeName}:`, request.error);
            reject(`Error updating in ${storeName}`);
        };
    });
};

const updateMultiple = <T>(storeName: string, items: T[]): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        items.forEach(item => store.put(item));
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => {
            console.error(`Error updating multiple in ${storeName}:`, transaction.error);
            reject(`Error updating multiple in ${storeName}`);
        };
    });
}

const getSettings = (): Promise<PharmacySettings | null> => {
    return new Promise((resolve, reject) => {
        const store = getStore('settings', 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result[0] || null);
        };
        request.onerror = () => {
            console.error('Error fetching settings:', request.error);
            reject('Error fetching settings');
        };
    });
};

const updateSettingsDB = (settings: PharmacySettings): Promise<IDBValidKey> => {
    return update('settings', settings);
};

const getUserByUsername = (username: string): Promise<User | undefined> => {
    return new Promise((resolve, reject) => {
        const store = getStore('users', 'readonly');
        const index = store.index('username');
        const request = index.get(username);
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            console.error(`Error fetching user by username:`, request.error);
            reject(`Error fetching user by username`);
        };
    });
};


export const dbService = {
    getMedicines: () => getAll<Medicine>('medicines'),
    addMedicine: (medicine: Medicine) => add('medicines', medicine),
    updateMedicine: (medicine: Medicine) => update('medicines', medicine),
    updateMedicines: (medicines: Medicine[]) => updateMultiple('medicines', medicines),

    getSales: () => getAll<Sale>('sales'),
    addSale: (sale: Sale) => add('sales', sale),

    getSuppliers: () => getAll<Supplier>('suppliers'),
    addSupplier: (supplier: Supplier) => add('suppliers', supplier),

    getPurchaseOrders: () => getAll<PurchaseOrder>('purchaseOrders'),
    addPurchaseOrder: (po: PurchaseOrder) => add('purchaseOrders', po),
    updatePurchaseOrder: (po: PurchaseOrder) => update('purchaseOrders', po),

    getSettings: getSettings,
    updateSettings: updateSettingsDB,

    addUser: (user: User) => add('users', user),
    getUserByUsername: getUserByUsername
};