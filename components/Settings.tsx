import React, { useState, useContext } from 'react';
import { usePharmacy } from '../hooks/usePharmacy';
import type { PharmacySettings } from '../types';
import { ToastContext } from '../App';

const Settings: React.FC = () => {
    const { settings, updateSettings } = usePharmacy();
    const { showToast } = useContext(ToastContext);
    const [formData, setFormData] = useState<PharmacySettings>(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        showToast("Settings updated successfully!");
    };

    const inputClass = "mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm focus:ring-brand-accent focus:border-brand-accent";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Pharmacy Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pharmacy Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <textarea name="address" id="address" value={formData.address} onChange={handleChange} rows={3} className={inputClass}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GSTIN</label>
                        <input type="text" name="gstin" id="gstin" value={formData.gstin} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;