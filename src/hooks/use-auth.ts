'use client'

import { useState, useEffect, useCallback } from 'react';
import { Utilisateur } from '@prisma/client';
import { useRouter } from 'next/navigation';

type StoredUser = Omit<Utilisateur, 'password'> & {
  initials?: string;
  name?: string;
};

const buildInitials = (fullName?: string) => {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .join('')
    .toUpperCase();
};

const normalizeUser = (user: StoredUser | null) => {
  if (!user) return null;
  const fullName = user.name || user.nom;

  return {
    ...user,
    name: fullName,
    initials: user.initials || buildInitials(fullName),
  } satisfies StoredUser;
};

export const useAuth = () => {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const persistUser = useCallback((nextUser: StoredUser | null) => {
    try {
      if (nextUser) {
        localStorage.setItem('sessionUser', JSON.stringify(nextUser));
      } else {
        localStorage.removeItem('sessionUser');
      }
    } catch (error) {
      console.error('Failed to persist session user', error);
    }
  }, []);

  const setUser = useCallback(
    (nextUser: StoredUser | null) => {
      const normalized = normalizeUser(nextUser);
      setUserState(normalized);
      persistUser(normalized);
    },
    [persistUser]
  );

  useEffect(() => {
    try {
      const sessionUser = localStorage.getItem('sessionUser');
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const login = useCallback(
    async (usernameOrEmail: string, pass: string) => {
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
        const normalized = normalizeUser(loggedInUser as StoredUser);
        setUser(normalized);
        return normalized;
      } catch (error) {
        console.error('Failed during login process', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    persistUser(null);
    setUserState(null);
    setLoading(false);
    router.push('/');
  }, [persistUser, router]);

  return { user, setUser, login, logout, loading };
};
