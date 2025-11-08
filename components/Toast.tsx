import React from 'react';
import type { Toast as ToastType } from '../types';

const Toast: React.FC<ToastType> = ({ message, visible }) => {
    if (!visible) return null;

    return (
        <div className="fixed bottom-5 right-5 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 py-3 px-6 rounded-lg shadow-lg animate-fade-in-out z-50">
            {message}
             <style>
                {`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 3s ease-in-out forwards;
                }
                `}
            </style>
        </div>
    );
};

export default Toast;