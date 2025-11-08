import React, { useState, useMemo, useContext } from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import type { CartItem, Medicine } from '../types';
import Receipt from './Receipt';
import { ToastContext } from '../App';
import { useAuth } from '../hooks/useAuth';


const POS: React.FC = () => {
    const { medicines, addSale } = usePharmacy();
    const { showToast } = useContext(ToastContext);
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('Walk-in Customer');
    const [lastSale, setLastSale] = useState<any>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    const filteredMedicines = useMemo(() => {
        if (!searchTerm) return [];
        return medicines.filter(med =>
            med.name.toLowerCase().includes(searchTerm.toLowerCase()) && med.stock > 0
        );
    }, [searchTerm, medicines]);

    const addToCart = (medicine: Medicine, batchId: string, quantity: number) => {
        const batch = medicine.batches.find(b => b.id === batchId);
        if (!batch || quantity <= 0 || quantity > batch.quantity) {
            alert("Invalid quantity or batch not available.");
            return;
        }

        const existingCartItemIndex = cart.findIndex(item => item.batchId === batchId);

        if (existingCartItemIndex > -1) {
            const updatedCart = [...cart];
            const newQuantity = updatedCart[existingCartItemIndex].quantity + quantity;
            if (newQuantity > batch.quantity) {
                 alert(`Cannot add more. Only ${batch.quantity - updatedCart[existingCartItemIndex].quantity} left in this batch.`);
                 return;
            }
            updatedCart[existingCartItemIndex].quantity = newQuantity;
            updatedCart[existingCartItemIndex].total = updatedCart[existingCartItemIndex].quantity * updatedCart[existingCartItemIndex].price;
            setCart(updatedCart);
        } else {
            const newCartItem: CartItem = {
                medicineId: medicine.id,
                batchId: batch.id,
                name: medicine.name,
                batchNumber: batch.batchNumber,
                expiryDate: batch.expiryDate,
                quantity: quantity,
                price: batch.sellingPrice,
                total: quantity * batch.sellingPrice,
            };
            setCart([...cart, newCartItem]);
        }
        showToast(`${medicine.name} added to cart.`);
    };

    const removeFromCart = (batchId: string) => {
        setCart(cart.filter(item => item.batchId !== batchId));
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert("Cart is empty.");
            return;
        }
        if (!currentUser) {
            showToast('Error: No authenticated user found.');
            return;
        }
        
        const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
        const saleData = {
            id: `sale-${Date.now()}`,
            date: new Date().toISOString(),
            items: cart,
            totalAmount,
            customerName,
            pharmacist: currentUser.role
        };
        addSale(cart, customerName, currentUser.role);
        setLastSale(saleData);
        setShowReceipt(true);
        setCart([]);
        setSearchTerm('');
        showToast('Sale completed successfully!');
    };

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);

    if (showReceipt && lastSale) {
        return <Receipt sale={lastSale} onClose={() => setShowReceipt(false)} />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left side: Search and Results */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Point of Sale</h2>
                <input
                    type="text"
                    placeholder="Search for medicine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-brand-accent focus:border-brand-accent"
                />
                <div className="flex-grow overflow-y-auto">
                    {filteredMedicines.map(med => (
                        <MedicineCard key={med.id} medicine={med} onAddToCart={addToCart} />
                    ))}
                    {searchTerm && filteredMedicines.length === 0 && <p className="text-gray-500 dark:text-gray-400">No results found.</p>}
                </div>
            </div>

            {/* Right side: Cart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Current Sale</h3>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
                <div className="flex-grow overflow-y-auto -mx-6 px-6">
                    {cart.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center mt-8">Cart is empty</p>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cart.map(item => (
                                <li key={item.batchId} className="py-3 flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Batch: {item.batchNumber}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.quantity} x Rs. {item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">Rs. {item.total.toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.batchId)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold text-gray-800 dark:text-gray-200">
                        <span>Total</span>
                        <span>Rs. {cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full mt-4 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Complete Sale
                    </button>
                </div>
            </div>
        </div>
    );
};


const MedicineCard: React.FC<{ medicine: Medicine, onAddToCart: (medicine: Medicine, batchId: string, quantity: number) => void }> = ({ medicine, onAddToCart }) => {
    const [selectedBatch, setSelectedBatch] = useState(medicine.batches.find(b => b.quantity > 0)?.id || '');
    const [quantity, setQuantity] = useState(1);
    
    const handleAddClick = () => {
        if (selectedBatch) {
            onAddToCart(medicine, selectedBatch, quantity);
            setQuantity(1);
        }
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex-grow">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">{medicine.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{medicine.manufacturer}</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">In Stock: {medicine.stock}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="w-full sm:w-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                        {medicine.batches.filter(b => b.quantity > 0).map(batch => (
                            <option key={batch.id} value={batch.id}>
                                Batch {batch.batchNumber} (Exp: {batch.expiryDate}, Qty: {batch.quantity}) - Rs. {batch.sellingPrice}
                            </option>
                        ))}
                    </select>
                    <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full sm:w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    <button onClick={handleAddClick} className="px-4 py-2 bg-brand-accent text-white rounded-lg text-sm hover:opacity-90">Add</button>
                </div>
            </div>
        </div>
    );
};

export default POS;