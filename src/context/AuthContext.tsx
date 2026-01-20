'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    signOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    isPro: boolean;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isPro: false,
    loading: true,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                setIsPro(false);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        const subsRef = collection(db, 'users', user.uid, 'subscriptions');
        const qSubs = query(subsRef, where('status', '==', 'active'), where('plan', '==', 'pro_plan'));

        const unsubscribeSubs = onSnapshot(qSubs, (snapshot: any) => {
            setIsPro(!snapshot.empty);
            setLoading(false);
        }, (error: any) => {
            console.error("Error in AuthContext subscription listener:", error);
            setLoading(false);
        });

        return () => unsubscribeSubs();
    }, [user]);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isPro, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
