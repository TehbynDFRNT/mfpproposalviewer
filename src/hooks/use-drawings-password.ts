import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UseDrawingsPasswordResult {
  password: string;
  isVerifying: boolean;
  isAuthenticated: boolean;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  isLocked: boolean;
  setPassword: (password: string) => void;
  verifyPassword: () => Promise<void>;
  clearError: () => void;
}

export function useDrawingsPassword(onAuthenticated?: () => void): UseDrawingsPasswordResult {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;

  const verifyPassword = async () => {
    if (!password.trim() || isLocked) return;

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verify-cost-builder-password', {
        body: { password: password.trim() },
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        setError('Authentication service error. Please try again.');
        setAttempts(prev => prev + 1);
        return;
      }

      if (data?.authenticated) {
        setIsAuthenticated(true);
        setError(null);
        onAuthenticated?.();
      } else {
        setAttempts(prev => prev + 1);
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      setError('Network error. Please check your connection and try again.');
      setAttempts(prev => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    password,
    isVerifying,
    isAuthenticated,
    error,
    attempts,
    maxAttempts,
    isLocked,
    setPassword,
    verifyPassword,
    clearError,
  };
}