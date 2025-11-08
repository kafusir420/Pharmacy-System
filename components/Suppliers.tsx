import React, { useState } from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import AddSupplierModal from './AddSupplierModal';

const Suppliers: React.FC = () => {
    const { suppliers } = usePharmacy();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSupplierAdded = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Suppliers</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                    >
                        New Supplier
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Contact Person</th>
                                <th scope="col" className="px-6 py-3">Phone</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{supplier.name}</td>
                                    <td className="px-6 py-4">{supplier.contactPerson}</td>
                                    <td className="px-6 py-4">{supplier.phone}</td>
                                    <td className="px-6 py-4">{supplier.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <AddSupplierModal onClose={() => setIsModalOpen(false)} onSupplierAdded={handleSupplierAdded} />}
        </>
    );
};

export default Suppliers;