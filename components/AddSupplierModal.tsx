import React, { useState, useContext } from 'react';
import Modal from './Modal';
import { usePharmacy } from '../hooks/usePharmacy';
import type { Supplier } from '../types';
import { ToastContext } from '../App';

interface AddSupplierModalProps {
    onClose: () => void;
    onSupplierAdded: () => void;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ onClose, onSupplierAdded }) => {
    const { addSupplier } = usePharmacy();
    const { showToast } = useContext(ToastContext);
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
        name: '',
        contactPerson: '',
        phone: '',
        email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name || !formData.contactPerson) {
            alert("Please fill at least Name and Contact Person.");
            return;
        }
        addSupplier(formData);
        showToast("Supplier added successfully!");
        onSupplierAdded();
    };

    const inputClass = "mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";

    return (
        <Modal title="Add New Supplier" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700 dark:text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Supplier Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Contact Person</label>
                        <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">Add Supplier</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddSupplierModal;