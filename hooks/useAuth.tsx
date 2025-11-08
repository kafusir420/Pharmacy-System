import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbService, initDB } from '../services/database';
import type { User, UserRole } from '../types';

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    signup: (username: string, password: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                await initDB(); // Ensure DB is initialized before checking session
                const storedUser = sessionStorage.getItem('pmsCurrentUser');
                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to parse user from session storage", error);
                sessionStorage.removeItem('pmsCurrentUser');
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const user = await dbService.getUserByUsername(username);
        if (user && user.password === password) { // NOTE: Plain text password check for simplicity.
            setCurrentUser(user);
            sessionStorage.setItem('pmsCurrentUser', JSON.stringify(user));
        } else {
            throw new Error('Invalid username or password');
        }
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        sessionStorage.removeItem('pmsCurrentUser');
    }, []);

    const signup = useCallback(async (username: string, password: string, role: UserRole) => {
        const existingUser = await dbService.getUserByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }
        const newUser: User = {
            id: `user-${Date.now()}`,
            username,
            password,
            role,
        };
        await dbService.addUser(newUser);
        // Automatically log in after signup
        setCurrentUser(newUser);
        sessionStorage.setItem('pmsCurrentUser', JSON.stringify(newUser));
    }, []);

    const value = { currentUser, isLoading, login, logout, signup };
    
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
