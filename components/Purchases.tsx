import React, { useContext, useState } from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import { ToastContext } from '../App';
import AddPurchaseOrderModal from './AddPurchaseOrderModal';

const Purchases: React.FC = () => {
    const { purchaseOrders, suppliers, completePurchaseOrder } = usePharmacy();
    const { showToast } = useContext(ToastContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const getSupplierName = (supplierId: string) => {
        return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
    };

    const handleCompleteOrder = (orderId: string) => {
        if (window.confirm("Are you sure you want to mark this order as completed? This will add items to your inventory.")) {
            completePurchaseOrder(orderId);
            showToast("Purchase Order completed and stock updated!");
        }
    };
    
    const handlePurchaseOrderAdded = () => {
        setIsModalOpen(false);
        showToast("New purchase order created!");
    };

    const getStatusCell = (order: typeof purchaseOrders[0]) => {
        const status = order.status;
        let colorClasses = '';
        switch (status) {
            case 'Completed': colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'; break;
            case 'Pending': colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'; break;
            case 'Cancelled': colorClasses = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'; break;
            default: colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'; break;
        }

        return (
            <td className="px-6 py-4">
                 <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses}`}>
                        {status}
                    </span>
                    {status === 'Pending' && (
                         <button onClick={() => handleCompleteOrder(order.id)} className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                             Mark as Completed
                         </button>
                    )}
                 </div>
            </td>
        );
    };

    return (
       <>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Purchase Orders</h2>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                >
                    New Purchase Order
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Order ID</th>
                            <th scope="col" className="px-6 py-3">Supplier</th>
                            <th scope="col" className="px-6 py-3">Order Date</th>
                            <th scope="col" className="px-6 py-3">Delivery Date</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.map(order => (
                            <tr key={order.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.id}</td>
                                <td className="px-6 py-4">{getSupplierName(order.supplierId)}</td>
                                <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                                {getStatusCell(order)}
                                <td className="px-6 py-4 text-right">Rs. {order.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {isModalOpen && <AddPurchaseOrderModal onClose={() => setIsModalOpen(false)} onPurchaseOrderAdded={handlePurchaseOrderAdded} />}
        </>
    );
};

export default Purchases;