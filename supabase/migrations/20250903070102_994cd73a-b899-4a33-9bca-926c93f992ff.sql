-- Fix function search path security warning
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