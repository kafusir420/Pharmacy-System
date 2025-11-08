import React from 'react';
import type { View, User } from '../types';
import { usePharmacy } from '../hooks/usePharmacy';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    user: User;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    view: View;
    label: string;
    icon: React.ReactElement;
    currentView: View;
    setView: (view: View) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    disabled?: boolean;
}> = ({ view, label, icon, currentView, setView, setIsSidebarOpen, disabled = false }) => (
    <li>
        <button
            onClick={() => {
                setView(view);
                setIsSidebarOpen(false);
            }}
            disabled={disabled}
            className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left
                ${disabled ? 'text-gray-400 cursor-not-allowed' : `text-white hover:bg-gray-700`}
                ${currentView === view ? 'bg-gray-700' : ''}`}
        >
            {icon}
            <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, isSidebarOpen, setIsSidebarOpen }) => {
    const { settings } = usePharmacy();
    const isAdmin = user.role === 'Admin';

    const iconClasses = "w-6 h-6 text-gray-200 transition duration-75";

    const navItems = [
        { view: 'dashboard' as View, label: 'Dashboard', icon: <DashboardIcon className={iconClasses} />, disabled: false },
        { view: 'pos' as View, label: 'POS', icon: <POSIcon className={iconClasses} />, disabled: false },
        { view: 'inventory' as View, label: 'Inventory', icon: <InventoryIcon className={iconClasses} />, disabled: false },
        { view: 'purchases' as View, label: 'Purchases', icon: <PurchasesIcon className={iconClasses} />, disabled: !isAdmin },
        { view: 'suppliers' as View, label: 'Suppliers', icon: <SuppliersIcon className={iconClasses} />, disabled: !isAdmin },
        { view: 'reports' as View, label: 'Reports', icon: <ReportsIcon className={iconClasses} />, disabled: !isAdmin },
        { view: 'settings' as View, label: 'Settings', icon: <SettingsIcon className={iconClasses} />, disabled: !isAdmin },
    ];

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-black transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Sidebar"
            >
                <div className="overflow-y-auto h-full py-4 px-3">
                    <div className="flex items-center pl-2.5 mb-5">
                        <svg className="w-8 h-8 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="self-center text-xl font-semibold whitespace-nowrap text-white">{settings.name}</span>
                    </div>
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <NavItem key={item.view} {...item} currentView={currentView} setView={setView} setIsSidebarOpen={setIsSidebarOpen} />
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    );
};

// SVG Icons
const DashboardIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1z"/></svg>;
const POSIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>;
const InventoryIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
const PurchasesIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 011.414-1.414L10 14.586l6.293-6.293a1 1 0 011.414 0zM10 2a1 1 0 011 1v10a1 1 0 11-2 0V3a1 1 0 011-1z"/></svg>;
const SuppliersIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-1.559 5.39a1.5 1.5 0 012.446 1.954l-1.928 4.82a1 1 0 01-1.838-.732l1.32-3.3-1.535-1.536a1.5 1.5 0 01.105-2.196zM17 6a3 3 0 11-6 0 3 3 0 016 0zm-1.559 5.39a1.5 1.5 0 012.446 1.954l-1.928 4.82a1 1 0 01-1.838-.732l1.32-3.3-1.535-1.536a1.5 1.5 0 01.105-2.196z"/></svg>;
const ReportsIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>;
const SettingsIcon: React.FC<{ className: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.21 5.15c-.5.38-1.02.7-1.59 1.02L4.64 6.47c-1.56-.38-2.58.64-2.2 2.2l.3 1.97c.32.57.64 1.09 1.02 1.59l-1.2 1.98c-.38 1.56.64 2.58 2.2 2.2l1.97-.3c.57-.32 1.09-.64 1.59-1.02l.3 1.97c.38 1.56 2.6 1.56 2.98 0l.3-1.97c.5-.38 1.02-.7 1.59-1.02l1.97.3c1.56.38 2.58-.64 2.2-2.2l-.3-1.97c-.32-.57-.64-1.09-1.02-1.59l1.2-1.98c.38-1.56-.64-2.58-2.2-2.2l-1.97.3c-.57.32-1.09.64-1.59 1.02l-1.98-1.2zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;


export default Sidebar;