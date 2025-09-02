import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSupabaseAdmin() {
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check admin credentials in database
      const { data: adminUsers, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username);

      if (error) {
        console.error('Database error:', error);
        toast.error('Login failed');
        return false;
      }

      // For now, use simple comparison (in production, use proper password hashing)
      const admin = adminUsers?.find(user => 
        user.username === username && user.password_hash === password
      );

      if (admin) {
        toast.success('Welcome, Administrator!');
        return true;
      } else {
        toast.error('Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    isLoading,
  };
}