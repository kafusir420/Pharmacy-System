import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PharmacyProvider } from './hooks/usePharmacy';
import type { User, View, Toast as ToastType } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Purchases from './components/Purchases';
import Suppliers from './components/Suppliers';
import Reports from './components/Reports';
import Login from './components/Login';
import Toast from './components/Toast';
import Settings from './components/Settings';
import { usePharmacy } from './hooks/usePharmacy';
import { AuthProvider, useAuth } from './hooks/useAuth';

type Theme = 'light' | 'dark';
export const ToastContext = React.createContext<{ showToast: (message: string) => void; }>({ showToast: () => {} });
export const ThemeContext = React.createContext<{ theme: Theme; toggleTheme: () => void; }>({ theme: 'light', toggleTheme: () => {} });

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const { currentUser, logout, isLoading: isAuthLoading } = useAuth();
    const [toast, setToast] = useState<ToastType>({ message: '', visible: false });
    const [theme, setTheme] = useState<Theme>(localStorage.getItem('pmsTheme') as Theme || 'light');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { settings, isLoading: isPharmacyLoading } = usePharmacy();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        localStorage.setItem('pmsTheme', theme);
    }, [theme]);

    const showToast = useCallback((message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => {
            setToast({ message: '', visible: false });
        }, 3000);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, []);

    const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
    const isLoading = isAuthLoading || isPharmacyLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading Pharmacy Data...</h2>
                    <p className="text-gray-500 dark:text-gray-400">Please wait a moment.</p>
                </div>
            </div>
        );
    }


    if (!currentUser) {
        return <Login pharmacyName={settings.name} />;
    }

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard setView={setView} />;
            case 'pos':
                return <POS />;
            case 'inventory':
                return <Inventory />;
            case 'purchases':
                return <Purchases />;
            case 'suppliers':
                return <Suppliers />;
            case 'reports':
                return <Reports />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard setView={setView}/>;
        }
    };

    return (
        <ThemeContext.Provider value={themeValue}>
            <ToastContext.Provider value={{ showToast }}>
                <div className="flex h-screen bg-gray-100 dark:bg-gray-800 font-sans">
                    <Sidebar 
                        currentView={view} 
                        setView={setView} 
                        user={currentUser}
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header 
                            user={currentUser} 
                            onLogout={logout} 
                            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        />
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 md:p-6">
                            {renderView()}
                        </main>
                    </div>
                    <Toast message={toast.message} visible={toast.visible} />
                </div>
            </ToastContext.Provider>
        </ThemeContext.Provider>
    );
};


const App: React.FC = () => (
    <AuthProvider>
        <PharmacyProvider>
            <AppContent />
        </PharmacyProvider>
    </AuthProvider>
);

export default App;