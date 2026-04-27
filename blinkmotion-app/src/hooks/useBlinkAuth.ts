import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export function useBlinkAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const formatEmail = (identifier: string) => {
    if (identifier.includes('@')) return identifier;
    return `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@blinkmotion.com`;
  };

  const login = async (identifier: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const email = formatEmail(identifier);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao conectar');
      setLoading(false);
      throw err;
    }
  };

  const register = async (identifier: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const email = formatEmail(identifier);
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao registrar');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, error, login, register, logout, isAuthenticated: !!user };
}
