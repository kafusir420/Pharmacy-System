import React, { useState } from 'react';
import Modal from './Modal';
import type { Batch } from '../types';

interface StockAdjustmentModalProps {
    medicineName: string;
    batch: Batch;
    onClose: () => void;
    onAdjust: (quantityChange: number) => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ medicineName, batch, onClose, onAdjust }) => {
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) {
            alert("Please enter a quantity greater than zero.");
            return;
        }
        if (adjustmentType === 'remove' && quantity > batch.quantity) {
            alert(`Cannot remove more than the current stock of ${batch.quantity}.`);
            return;
        }
        
        const quantityChange = adjustmentType === 'add' ? quantity : -quantity;
        onAdjust(quantityChange);
    };

    return (
        <Modal title="Adjust Stock" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-6 text-gray-700 dark:text-gray-300">
                <div>
                    <h4 className="text-lg font-semibold dark:text-gray-200">{medicineName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Batch: <span className="font-medium text-gray-800 dark:text-gray-200">{batch.batchNumber}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current Quantity: <span className="font-medium text-gray-800 dark:text-gray-200">{batch.quantity}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="adjustmentType"
                            value="add"
                            checked={adjustmentType === 'add'}
                            onChange={() => setAdjustmentType('add')}
                            className="form-radio h-4 w-4 text-brand-primary focus:ring-brand-accent"
                        />
                        <span className="ml-2">Add Stock</span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="adjustmentType"
                            value="remove"
                            checked={adjustmentType === 'remove'}
                            onChange={() => setAdjustmentType('remove')}
                            className="form-radio h-4 w-4 text-brand-primary focus:ring-brand-accent"
                        />
                        <span className="ml-2">Remove Stock</span>
                    </label>
                </div>

                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium">Quantity to {adjustmentType}</label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">Confirm Adjustment</button>
                </div>
            </form>
        </Modal>
    );
};

export default StockAdjustmentModal;
