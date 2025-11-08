import React, { useState, useMemo, useContext } from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import type { Warehouse, Batch } from '../types';
import AddMedicineModal from './AddMedicineModal';
import { ToastContext } from '../App';
import StockAdjustmentModal from './StockAdjustmentModal';


const Inventory: React.FC = () => {
    const { medicines, adjustStock } = usePharmacy();
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState<Warehouse | 'All'>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [adjustmentTarget, setAdjustmentTarget] = useState<{ medicineId: string; medicineName: string; batch: Batch } | null>(null);
    const { showToast } = useContext(ToastContext);


    const filteredMedicines = useMemo(() => {
        return medicines
            .filter(med => warehouseFilter === 'All' || med.warehouse === warehouseFilter)
            .filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [medicines, searchTerm, warehouseFilter]);

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Medicine ID,Name,Manufacturer,Warehouse,Total Stock,Batch Number,Batch Quantity,Expiry Date,Cost Price,Selling Price\n";

        filteredMedicines.forEach(med => {
            med.batches.forEach(batch => {
                const row = [
                    med.id,
                    `"${med.name}"`,
                    `"${med.manufacturer}"`,
                    med.warehouse,
                    med.stock,
                    batch.batchNumber,
                    batch.quantity,
                    batch.expiryDate,
                    batch.costPrice,
                    batch.sellingPrice
                ].join(",");
                csvContent += row + "\r\n";
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getExpiryStatusColor = (expiryDate: string): string => {
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'text-red-600 dark:text-red-400 font-bold';
        if (diffDays <= 60) return 'text-orange-600 dark:text-orange-400 font-semibold';
        return 'text-gray-700 dark:text-gray-300';
    };

    const handleMedicineAdded = () => {
        setIsAddModalOpen(false);
        showToast("Medicine added successfully!");
    };

    const handleAdjustStock = (quantityChange: number) => {
        if (adjustmentTarget) {
            adjustStock(adjustmentTarget.medicineId, adjustmentTarget.batch.id, quantityChange);
            showToast(`Stock for batch ${adjustmentTarget.batch.batchNumber} adjusted successfully.`);
            setAdjustmentTarget(null);
        }
    };


    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Inventory Management</h2>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                        >
                            New Medicine
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Export to CSV
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-brand-accent focus:border-brand-accent"
                    />
                    <select
                        value={warehouseFilter}
                        onChange={(e) => setWarehouseFilter(e.target.value as Warehouse | 'All')}
                        className="w-full sm:w-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-brand-accent focus:border-brand-accent"
                    >
                        <option value="All">All Warehouses</option>
                        <option value="Main Warehouse">Main Warehouse</option>
                        <option value="Store Front">Store Front</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Medicine Name</th>
                                <th scope="col" className="px-6 py-3">Batch No.</th>
                                <th scope="col" className="px-6 py-3">Expiry Date</th>
                                <th scope="col" className="px-6 py-3 text-right">Quantity</th>
                                <th scope="col" className="px-6 py-3 text-right">Sell Price</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                                <th scope="col" className="px-6 py-3">Warehouse</th>
                                <th scope="col" className="px-6 py-3 text-right">Total Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map(med =>
                                med.batches.map((batch, index) => (
                                    <tr key={batch.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        {index === 0 ? (
                                            <td rowSpan={med.batches.length} className="px-6 py-4 font-medium text-gray-900 dark:text-white align-top">
                                                {med.name}
                                                <p className="font-normal text-gray-500 dark:text-gray-400 text-xs">{med.manufacturer}</p>
                                            </td>
                                        ) : null}
                                        <td className="px-6 py-4">{batch.batchNumber}</td>
                                        <td className={`px-6 py-4 ${getExpiryStatusColor(batch.expiryDate)}`}>{batch.expiryDate}</td>
                                        <td className="px-6 py-4 text-right">{batch.quantity}</td>
                                        <td className="px-6 py-4 text-right">Rs. {batch.sellingPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setAdjustmentTarget({ medicineId: med.id, medicineName: med.name, batch: batch })}
                                                className="font-medium text-brand-primary dark:text-brand-accent hover:underline"
                                            >
                                                Adjust
                                            </button>
                                        </td>
                                        {index === 0 ? (
                                            <td rowSpan={med.batches.length} className="px-6 py-4 align-top">{med.warehouse}</td>
                                        ) : null}
                                         {index === 0 ? (
                                            <td rowSpan={med.batches.length} className={`px-6 py-4 text-right font-bold align-top ${med.stock < 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{med.stock}</td>
                                        ) : null}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isAddModalOpen && <AddMedicineModal onClose={() => setIsAddModalOpen(false)} onMedicineAdded={handleMedicineAdded} />}
            {adjustmentTarget && (
                <StockAdjustmentModal 
                    medicineName={adjustmentTarget.medicineName}
                    batch={adjustmentTarget.batch}
                    onClose={() => setAdjustmentTarget(null)}
                    onAdjust={handleAdjustStock}
                />
            )}
        </>
    );
};

export default Inventory;
