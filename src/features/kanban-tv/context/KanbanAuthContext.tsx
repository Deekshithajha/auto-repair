/**
 * Kanban TV Authentication Context
 * Separate auth system from main app
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { KanbanUser, KanbanUserRole } from '../types/kanban-tv.types';

interface KanbanAuthContextType {
  user: KanbanUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: KanbanUserRole | KanbanUserRole[]) => boolean;
}

const KanbanAuthContext = createContext<KanbanAuthContextType | undefined>(undefined);

const KANBAN_SESSION_KEY = 'kanban_tv_session';

interface KanbanAuthProviderProps {
  children: ReactNode;
}

export const KanbanAuthProvider: React.FC<KanbanAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<KanbanUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = localStorage.getItem(KANBAN_SESSION_KEY);
        if (storedSession) {
          const session = JSON.parse(storedSession);
          // Validate session is still valid
          const { data, error } = await supabase
            .from('kanban_users')
            .select('*')
            .eq('id', session.id)
            .eq('is_active', true)
            .single();

          if (!error && data) {
            setUser(data as KanbanUser);
          } else {
            localStorage.removeItem(KANBAN_SESSION_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading kanban session:', error);
        localStorage.removeItem(KANBAN_SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Query kanban_users table for credentials
      const { data, error } = await supabase
        .from('kanban_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { error: 'Invalid email or password' };
      }

      // In production, use proper bcrypt comparison via edge function
      // For now, storing plain text for demo (NOT SECURE - IMPLEMENT BCRYPT)
      if (data.password_hash !== password) {
        return { error: 'Invalid email or password' };
      }

      const kanbanUser = data as KanbanUser;
      setUser(kanbanUser);
      localStorage.setItem(KANBAN_SESSION_KEY, JSON.stringify(kanbanUser));

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error: error.message || 'Failed to sign in' };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(KANBAN_SESSION_KEY);
  };

  const hasRole = (roles: KanbanUserRole | KanbanUserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return (
    <KanbanAuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        hasRole,
      }}
    >
      {children}
    </KanbanAuthContext.Provider>
  );
};

export const useKanbanAuth = (): KanbanAuthContextType => {
  const context = useContext(KanbanAuthContext);
  if (!context) {
    throw new Error('useKanbanAuth must be used within KanbanAuthProvider');
  }
  return context;
};
