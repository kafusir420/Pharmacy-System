import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import type { Sale, Medicine } from '../types';

type ReportType = 'sales' | 'stock' | 'expiry';

const Reports: React.FC = () => {
    const [activeReport, setActiveReport] = useState<ReportType>('sales');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Reports</h2>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton name="Sales Report" type="sales" activeReport={activeReport} setActiveReport={setActiveReport} />
                    <TabButton name="Stock Valuation" type="stock" activeReport={activeReport} setActiveReport={setActiveReport} />
                    <TabButton name="Expiry Report" type="expiry" activeReport={activeReport} setActiveReport={setActiveReport} />
                </nav>
            </div>
            <div className="mt-6">
                {activeReport === 'sales' && <SalesReport />}
                {activeReport === 'stock' && <StockValuationReport />}
                {activeReport === 'expiry' && <ExpiryReport />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{name: string, type: ReportType, activeReport: ReportType, setActiveReport: (type: ReportType) => void}> = ({name, type, activeReport, setActiveReport}) => (
    <button
        onClick={() => setActiveReport(type)}
        className={`${
            activeReport === type
                ? 'border-brand-primary text-brand-secondary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
        {name}
    </button>
);

const SalesReport: React.FC = () => {
    const { sales } = usePharmacy();
    return (
        <Table<Sale>
            headers={['ID', 'Date', 'Customer', 'Items', 'Total Amount']}
            data={sales}
            renderRow={(sale) => (
                <>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sale.id.slice(-6)}</td>
                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{sale.customerName}</td>
                    <td className="px-6 py-4">{sale.items.length}</td>
                    <td className="px-6 py-4 text-right">Rs. {sale.totalAmount.toFixed(2)}</td>
                </>
            )}
        />
    );
};

const StockValuationReport: React.FC = () => {
    const { medicines } = usePharmacy();
    const stockData = useMemo(() => medicines.map(med => ({
        ...med,
        valuation: med.batches.reduce((sum, b) => sum + b.quantity * b.costPrice, 0)
    })), [medicines]);
    
    const totalValuation = stockData.reduce((sum, med) => sum + med.valuation, 0);

    return (
        <>
        <Table<Medicine & { valuation: number }>
            headers={['Name', 'Manufacturer', 'Total Stock', 'Valuation (Cost Price)']}
            data={stockData}
            renderRow={(med) => (
                <>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{med.name}</td>
                    <td className="px-6 py-4">{med.manufacturer}</td>
                    <td className="px-6 py-4 text-right">{med.stock}</td>
                    <td className="px-6 py-4 text-right">Rs. {med.valuation.toFixed(2)}</td>
                </>
            )}
        />
        <div className="text-right mt-4 font-bold text-xl dark:text-gray-200">Total Stock Value: Rs. {totalValuation.toFixed(2)}</div>
        </>
    );
};

const ExpiryReport: React.FC = () => {
    const { medicines } = usePharmacy();
    const [filterType, setFilterType] = useState<'all' | 'expired' | 'next30' | 'next60'>('all');

    const getDaysToExpire = (expiryDate: string) => {
        const diff = new Date(expiryDate).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    const expiryData = useMemo(() => {
        const allBatches = medicines.flatMap(med => med.batches.map(batch => ({ ...batch, medName: med.name })));

        const filtered = allBatches.filter(batch => {
            const days = getDaysToExpire(batch.expiryDate);
            if (filterType === 'expired') return days <= 0;
            if (filterType === 'next30') return days > 0 && days <= 30;
            if (filterType === 'next60') return days > 0 && days <= 60;
            return true; // for 'all'
        });

        return filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [medicines, filterType]);
    
    const FilterButton: React.FC<{ type: typeof filterType; label: string }> = ({ type, label }) => {
        const isActive = filterType === type;
        return (
            <button
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                    isActive
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <>
            <div className="flex space-x-2 mb-4">
                <FilterButton type="all" label="All" />
                <FilterButton type="expired" label="Expired" />
                <FilterButton type="next30" label="Expiring in 30 Days" />
                <FilterButton type="next60" label="Expiring in 60 Days" />
            </div>
            <Table<{ medName: string } & any>
                headers={['Medicine', 'Batch No.', 'Expiry Date', 'Days to Expire', 'Quantity']}
                data={expiryData}
                renderRow={(item) => {
                    const days = getDaysToExpire(item.expiryDate);
                    const color = days <= 0 ? 'text-red-600 dark:text-red-400' : days <= 60 ? 'text-orange-600 dark:text-orange-400' : '';
                    return (
                    <>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.medName}</td>
                        <td className="px-6 py-4">{item.batchNumber}</td>
                        <td className={`px-6 py-4 font-semibold ${color}`}>{item.expiryDate}</td>
                        <td className={`px-6 py-4 font-semibold ${color}`}>{days > 0 ? days : 'EXPIRED'}</td>
                        <td className="px-6 py-4 text-right">{item.quantity}</td>
                    </>
                )}}
            />
        </>
    );
};

const Table = <T,>({ headers, data, renderRow }: { headers: string[], data: T[], renderRow: (item: T) => React.ReactNode}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                <tr>
                    {headers.map(h => <th key={h} scope="col" className={`px-6 py-3 ${h.includes('Amount') || h.includes('Stock') || h.includes('Valuation') || h.includes('Quantity') ? 'text-right': ''}`}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        {renderRow(item)}
                    </tr>
                ))}
            </tbody>
        </table>
         {data.length === 0 && <p className="text-center p-4 text-gray-500 dark:text-gray-400">No data available for this report.</p>}
    </div>
);


export default Reports;