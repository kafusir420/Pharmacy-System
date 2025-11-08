import React, { useState } from 'react';
import Modal from './Modal';
import { usePharmacy } from '../hooks/usePharmacy';
import type { PurchaseOrder } from '../types';

interface AddPurchaseOrderModalProps {
    onClose: () => void;
    onPurchaseOrderAdded: () => void;
}

type POItem = { medicineName: string; quantity: number; costPrice: number };

const AddPurchaseOrderModal: React.FC<AddPurchaseOrderModalProps> = ({ onClose, onPurchaseOrderAdded }) => {
    const { suppliers, addPurchaseOrder } = usePharmacy();
    const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
    const [items, setItems] = useState<POItem[]>([{ medicineName: '', quantity: 1, costPrice: 0 }]);

    const handleItemChange = (index: number, field: keyof POItem, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const addItemField = () => {
        setItems([...items, { medicineName: '', quantity: 1, costPrice: 0 }]);
    };
    
    const removeItemField = (index: number) => {
        if(items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!supplierId || items.some(i => !i.medicineName || i.quantity <= 0)) {
            alert("Please select a supplier and fill all item fields correctly.");
            return;
        }

        const newOrder: Omit<PurchaseOrder, 'id'> = {
            supplierId,
            orderDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            items,
            totalAmount: items.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0)
        };

        addPurchaseOrder(newOrder);
        onPurchaseOrderAdded();
    };

    return (
        <Modal title="Create New Purchase Order" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                <div>
                    <label className="block text-sm font-medium">Supplier</label>
                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                        <option value="" disabled>Select a supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <hr className="dark:border-gray-700"/>
                <h4 className="text-lg font-semibold">Items</h4>
                {items.map((item, index) => (
                    <div key={index} className="p-3 border dark:border-gray-700 rounded-md space-y-2 relative bg-gray-50 dark:bg-gray-900/50">
                         {items.length > 1 && (
                            <button type="button" onClick={() => removeItemField(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold">&times;</button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <label className="text-xs">Medicine Name</label>
                                <input type="text" value={item.medicineName} onChange={e => handleItemChange(index, 'medicineName', e.target.value)} required className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="text-xs">Quantity</label>
                                <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} required className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" min="1" />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs">Cost Price (Rs.) per item</label>
                             <input type="number" value={item.costPrice} onChange={e => handleItemChange(index, 'costPrice', parseFloat(e.target.value))} required className="w-full p-1 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" step="0.01" min="0"/>
                        </div>
                    </div>
                ))}
                 <button type="button" onClick={addItemField} className="text-sm text-brand-primary hover:underline">+ Add Another Item</button>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">Create Order</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddPurchaseOrderModal;