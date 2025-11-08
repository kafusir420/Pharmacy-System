import React, { useState } from 'react';
import type { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-brand-accent focus:border-brand-accent";
const buttonClasses = "w-full py-3 px-4 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-opacity-50 transition-colors disabled:bg-gray-400";

const LoginForm: React.FC<{ setView: (isLogin: boolean) => void }> = ({ setView }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleLogin}>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label htmlFor="password"  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <button type="submit" disabled={isLoading} className={buttonClasses}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button type="button" onClick={() => setView(false)} className="font-medium text-brand-primary hover:underline">Sign up</button>
            </p>
        </form>
    );
};

const SignupForm: React.FC<{ setView: (isLogin: boolean) => void }> = ({ setView }) => {
    const { signup } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('Pharmacist');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signup(username, password, role);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <form className="space-y-6" onSubmit={handleSignup}>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                 <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className={inputClasses}>
                    <option value="Admin">Admin</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Sales Associate">Sales Associate</option>
                </select>
            </div>
            <div>
                <button type="submit" disabled={isLoading} className={buttonClasses}>
                     {isLoading ? 'Creating account...' : 'Sign Up'}
                </button>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button type="button" onClick={() => setView(true)} className="font-medium text-brand-primary hover:underline">Sign in</button>
            </p>
        </form>
    );
};


const Login: React.FC<{ pharmacyName: string; }> = ({ pharmacyName }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-4">
                        <svg className="w-12 h-12 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h1 className="ml-3 text-3xl font-bold text-gray-800 dark:text-gray-200">{pharmacyName}</h1>
                    </div>
                     <p className="text-gray-600 dark:text-gray-400">
                        {isLoginView ? 'Please sign in to your account' : 'Create a new account'}
                    </p>
                </div>
                {isLoginView ? (
                    <LoginForm setView={setIsLoginView} />
                ) : (
                    <SignupForm setView={setIsLoginView} />
                )}
            </div>
        </div>
    );
};

export default Login;
