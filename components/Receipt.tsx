import React, { useEffect } from 'react';
import type { Sale } from '../types';
import { usePharmacy } from '../hooks/usePharmacy';

interface ReceiptProps {
    sale: Sale;
    onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, onClose }) => {
    const { settings } = usePharmacy();
    
    useEffect(() => {
        const handlePrint = () => {
            window.print();
        };

        // Automatically trigger print dialog
        handlePrint();

        // Optional: you can add a listener for afterprint to close automatically
        const afterPrint = () => {
            // onClose();
        };

        window.addEventListener('afterprint', afterPrint);

        return () => {
            window.removeEventListener('afterprint', afterPrint);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="print-container bg-gray-100 dark:bg-gray-800 p-4">
             <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
                }
                `}
            </style>
            <div className="receipt-paper w-[300px] mx-auto bg-white p-4 font-mono text-xs text-black shadow-lg">
                <div className="text-center">
                    <h2 className="text-lg font-bold">{settings.name}</h2>
                    <p>{settings.address}</p>
                    <p>GSTIN: {settings.gstin}</p>
                    <p>---------------------------------</p>
                </div>
                <div className="my-2">
                    <p>Receipt No: {sale.id.slice(-8)}</p>
                    <p>Date: {new Date(sale.date).toLocaleString()}</p>
                    <p>Customer: {sale.customerName}</p>
                </div>
                <p>---------------------------------</p>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Item</th>
                            <th className="text-center">Qty</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map(item => (
                            <tr key={item.batchId}>
                                <td className="text-left" colSpan={4}>{item.name}</td>
                            </tr>
                        ))}
                         {sale.items.map(item => (
                            <tr key={`${item.batchId}-price`}>
                                <td className="text-left"></td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">{item.price.toFixed(2)}</td>
                                <td className="text-right">{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p>---------------------------------</p>
                <div className="text-right font-bold">
                    <p>Total: Rs. {sale.totalAmount.toFixed(2)}</p>
                </div>
                <p>---------------------------------</p>
                <div className="text-center mt-2">
                    <p>Thank you for your visit!</p>
                    <p>Get well soon.</p>
                </div>
            </div>
             <div className="text-center mt-4 no-print">
                <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Back to POS</button>
                <button onClick={() => window.print()} className="ml-2 px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-secondary">Print Again</button>
            </div>
        </div>
    );
};

export default Receipt;