'use client'

import { useState, useEffect, useCallback } from 'react';
import { Utilisateur } from '@prisma/client';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const sessionUser = localStorage.getItem('sessionUser');
            if (sessionUser) {
                setUser(JSON.parse(sessionUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (usernameOrEmail: string, pass: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernameOrEmail, password: pass }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            const loggedInUser: Omit<Utilisateur, 'password'> = data;
            
            const userWithInitials = {
                ...loggedInUser,
                initials: loggedInUser.nom
                    .split(' ')
                    .map((part: string) => part.trim().charAt(0))
                    .filter(Boolean)
                    .join('')
                    .toUpperCase()
            }
            
            setUser(userWithInitials);
            localStorage.setItem('sessionUser', JSON.stringify(userWithInitials));
            return userWithInitials;

        } catch (error) {
            console.error("Failed during login process", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('sessionUser');
        setUser(null);
        setLoading(false);
        router.push('/');
    }, [router]);
    
  return { user, setUser, login, logout, loading };
};
