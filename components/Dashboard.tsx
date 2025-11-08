import React from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import type { View } from '../types';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactElement; color: string; onClick?: () => void }> = ({ title, value, icon, color, onClick }) => (
    <div className={`p-6 rounded-lg shadow-md flex items-center ${color} ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`} onClick={onClick}>
        <div className="mr-4 text-white">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-white uppercase">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { medicines, sales } = usePharmacy();

    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const stockValue = medicines.reduce((sum, med) => sum + med.batches.reduce((batchSum, batch) => batchSum + (batch.quantity * batch.costPrice), 0), 0);
    const lowStockItems = medicines.filter(med => med.stock < 10).length;

    const expiringSoonItems = medicines.flatMap(med => med.batches)
        .filter(batch => {
            const expiry = new Date(batch.expiryDate);
            const today = new Date();
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 60;
        }).length;

    const expiredItems = medicines.flatMap(med => med.batches)
        .filter(batch => new Date(batch.expiryDate) < new Date()).length;

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Sales" value={`Rs. ${totalSales.toFixed(2)}`} icon={<MoneyIcon />} color="bg-blue-500" />
                <StatCard title="Stock Value" value={`Rs. ${stockValue.toFixed(2)}`} icon={<BoxIcon />} color="bg-green-500" />
                <StatCard title="Low Stock Items" value={`${lowStockItems}`} icon={<WarningIcon />} color="bg-yellow-500" onClick={() => setView('inventory')} />
                <StatCard title="Expiring Soon" value={`${expiringSoonItems}`} icon={<ClockIcon />} color="bg-orange-500" onClick={() => setView('reports')}/>
            </div>
            {expiredItems > 0 && (
                <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200">
                    <p className="font-bold">Alert!</p>
                    <p>You have {expiredItems} item(s) that have expired. Please review your inventory immediately.</p>
                </div>
            )}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Quick Actions</h3>
                     <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                        <button onClick={() => setView('pos')} className="px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors">New Sale</button>
                        <button onClick={() => setView('inventory')} className="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">Manage Inventory</button>
                        <button onClick={() => setView('reports')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">View Reports</button>
                     </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Recent Sales</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Sale ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.slice(-5).reverse().map(sale => (
                                    <tr key={sale.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sale.id.slice(-6)}</td>
                                        <td className="px-6 py-4">{sale.customerName}</td>
                                        <td className="px-6 py-4">Rs. {sale.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MoneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7v10l8 4m0-14L4 7" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default Dashboard;
