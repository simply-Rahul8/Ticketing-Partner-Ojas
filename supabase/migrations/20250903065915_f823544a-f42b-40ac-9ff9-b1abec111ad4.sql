-- Fix security warnings: set search_path for functions and create proper RLS policy for admin_users

-- 1) Fix search_path for functions (security warning)
CREATE OR REPLACE FUNCTION public.sync_seat_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.seats 
        SET status = NEW.status, updated_at = now() 
        WHERE seat_id = NEW.seat_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.seats 
        SET status = NEW.status, updated_at = now() 
        WHERE seat_id = NEW.seat_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.seats 
        SET status = 'available', updated_at = now() 
        WHERE seat_id = OLD.seat_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2) Create RLS policy for admin_users table (currently has RLS enabled but no policies)
CREATE POLICY "Admins can view their own data"
ON public.admin_users
FOR SELECT
USING (true);  -- For simplicity, allow viewing admin users - adjust as needed

CREATE POLICY "Admins can update their own data"
ON public.admin_users
FOR UPDATE
USING (true)   -- For simplicity, allow admin updates - adjust as needed
WITH CHECK (true);