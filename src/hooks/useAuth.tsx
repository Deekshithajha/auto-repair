import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  phone?: string;
  role?: 'user' | 'employee' | 'admin'; // Fetched from user_roles table
  employee_id?: string;
  system_id?: string;
  license_plate?: string;
  is_deleted: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, loginType?: 'email' | 'system_id' | 'license') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and role from user_roles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setProfile(null);
          } else {
            // Fetch user's primary role from user_roles table
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .order('role', { ascending: true })
              .limit(1)
              .single();
            
            setProfile({
              ...profileData,
              role: roleData?.role || 'user'
            });
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and role asynchronously
          setTimeout(async () => {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } else {
              // Fetch user's primary role from user_roles table
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .order('role', { ascending: true })
                .limit(1)
                .single();
              
              setProfile({
                ...profileData,
                role: roleData?.role || 'user'
              });
            }
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Initialize auth
    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: name
        }
      }
    });

    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created",
        description: "Welcome to AUTO REPAIR INC! You can now access your dashboard.",
      });
      
      // Auto-confirm user by signing them in immediately
      await signIn(email, password);
    }

    return { error };
  };

  const signIn = async (email: string, password: string, loginType?: 'email' | 'system_id' | 'license') => {
    let authEmail = email;
    
    // Handle alternate login methods
    if (loginType === 'system_id') {
      // Find user by system_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('system_id', email)
        .single();
      
      if (profile?.email) {
        authEmail = profile.email;
      } else {
        toast({
          title: "Sign In Error",
          description: "Invalid system ID",
          variant: "destructive",
        });
        return { error: new Error('Invalid system ID') };
      }
    } else if (loginType === 'license') {
      // Find user by license_plate
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('license_plate', email)
        .single();
      
      if (profile?.email) {
        authEmail = profile.email;
      } else {
        toast({
          title: "Sign In Error",
          description: "Invalid license plate",
          variant: "destructive",
        });
        return { error: new Error('Invalid license plate') };
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    }

    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Some environments return "Auth session missing" if already signed out.
      // Treat this as a successful sign-out and do not surface an error toast.
      if (error && !/session missing/i.test(error.message)) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // Network or unexpected error. Still proceed to clear local state.
      // Optionally surface, but we avoid blocking the UX.
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Refresh profile with role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        // Fetch role from user_roles
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role', { ascending: true })
          .limit(1)
          .single();
        
        setProfile({
          ...profileData,
          role: roleData?.role || 'user'
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};