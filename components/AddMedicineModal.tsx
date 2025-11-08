import React, { useState } from 'react';
import Modal from './Modal';
import { usePharmacy } from '../hooks/usePharmacy';
import type { Medicine, Warehouse, Batch } from '../types';

interface AddMedicineModalProps {
    onClose: () => void;
    onMedicineAdded: () => void;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ onClose, onMedicineAdded }) => {
    const { addMedicine } = usePharmacy();
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warehouse, setWarehouse] = useState<Warehouse>('Main Warehouse');
    const [batches, setBatches] = useState<Omit<Batch, 'id'>[]>([
        { batchNumber: '', expiryDate: '', quantity: 0, costPrice: 0, sellingPrice: 0 }
    ]);

    const handleBatchChange = (index: number, field: keyof Omit<Batch, 'id'>, value: string | number) => {
        const newBatches = [...batches];
        (newBatches[index] as any)[field] = value;
        setBatches(newBatches);
    };

    const addBatchField = () => {
        setBatches([...batches, { batchNumber: '', expiryDate: '', quantity: 0, costPrice: 0, sellingPrice: 0 }]);
    };
    
    const removeBatchField = (index: number) => {
        if(batches.length > 1) {
            const newBatches = batches.filter((_, i) => i !== index);
            setBatches(newBatches);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !manufacturer || batches.some(b => !b.batchNumber || !b.expiryDate || b.quantity <= 0 || b.sellingPrice <=0)) {
            alert("Please fill all required fields, and ensure batch quantities and prices are valid.");
            return;
        }

        const newMedicine: Omit<Medicine, 'id' | 'stock'> = {
            name,
            manufacturer,
            warehouse,
            batches: batches.map(b => ({ ...b, id: `b-${Date.now()}-${Math.random()}` }))
        };

        addMedicine(newMedicine);
        onMedicineAdded();
    };

    return (
        <Modal title="Add New Medicine" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Medicine Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Manufacturer</label>
                        <input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Warehouse</label>
                         <select value={warehouse} onChange={e => setWarehouse(e.target.value as Warehouse)} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                            <option value="Main Warehouse">Main Warehouse</option>
                            <option value="Store Front">Store Front</option>
                         </select>
                    </div>
                </div>

                <hr className="dark:border-gray-700"/>
                <h4 className="text-lg font-semibold">Batches</h4>
                {batches.map((batch, index) => (
                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md space-y-2 relative bg-gray-50 dark:bg-gray-900/50">
                         {batches.length > 1 && (
                            <button type="button" onClick={() => removeBatchField(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold">&times;</button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs">Batch Number</label>
                                <input type="text" value={batch.batchNumber} onChange={e => handleBatchChange(index, 'batchNumber', e.target.value)} required className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="text-xs">Expiry Date</label>
                                <input type="date" value={batch.expiryDate} onChange={e => handleBatchChange(index, 'expiryDate', e.target.value)} required className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="text-xs">Quantity</label>
                                <input type="number" value={batch.quantity} onChange={e => handleBatchChange(index, 'quantity', parseInt(e.target.value))} required className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" min="1" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             <div>
                                <label className="text-xs">Cost Price (Rs.)</label>
                                <input type="number" value={batch.costPrice} onChange={e => handleBatchChange(index, 'costPrice', parseFloat(e.target.value))} required className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" step="0.01" min="0"/>
                            </div>
                             <div>
                                <label className="text-xs">Selling Price (Rs.)</label>
                                <input type="number" value={batch.sellingPrice} onChange={e => handleBatchChange(index, 'sellingPrice', parseFloat(e.target.value))} required className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" step="0.01" min="0"/>
                            </div>
                        </div>
                    </div>
                ))}
                 <button type="button" onClick={addBatchField} className="text-sm text-brand-primary hover:underline">+ Add Another Batch</button>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">Add Medicine</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddMedicineModal;