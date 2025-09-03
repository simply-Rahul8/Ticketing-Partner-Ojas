-- Enable realtime and sync logic, and widen RLS for public usage

-- 1) Update sync function to handle DELETE as well
CREATE OR REPLACE FUNCTION public.sync_seat_status()
RETURNS trigger
LANGUAGE plpgsql
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

-- 2) Create trigger on bookings to sync seat status on insert/update/delete
DROP TRIGGER IF EXISTS trg_sync_seat_status ON public.bookings;
CREATE TRIGGER trg_sync_seat_status
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_seat_status();

-- 3) RLS: allow public to update and delete bookings (anon role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Anyone can update bookings'
  ) THEN
    CREATE POLICY "Anyone can update bookings"
    ON public.bookings
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Anyone can delete bookings'
  ) THEN
    CREATE POLICY "Anyone can delete bookings"
    ON public.bookings
    FOR DELETE
    USING (true);
  END IF;
END $$;

-- 4) Ensure realtime gets full row data on updates
ALTER TABLE public.seats REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- 5) Add tables to realtime publication (no-op if already added)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.seats';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;