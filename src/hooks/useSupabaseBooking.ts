import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Seat, Booking, SeatStatus } from '@/types/booking';
import { toast } from 'sonner';

const SEAT_LAYOUT = [
  { row: 'A', count: 15 },
  { row: 'B', count: 16 },
  { row: 'C', count: 17 },
  { row: 'D', count: 18 },
  { row: 'E', count: 19 },
  { row: 'F', count: 20 },
  { row: 'G', count: 21 },
  { row: 'H', count: 15 },
];

export function useSupabaseBooking() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load seats and bookings from Supabase
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load seats
      const { data: seatsData, error: seatsError } = await supabase
        .from('seats')
        .select('*')
        .order('row_letter', { ascending: true })
        .order('seat_number', { ascending: true });

      if (seatsError) throw seatsError;

      // Convert database format to component format
      const formattedSeats: Seat[] = seatsData.map(seat => ({
        id: seat.seat_id,
        row: seat.row_letter,
        number: seat.seat_number,
        status: seat.status === 'confirmed' ? 'confirmed' as SeatStatus : 
                seat.status === 'held' ? 'held' as SeatStatus : 'available' as SeatStatus,
      }));

      setSeats(formattedSeats);

      // Load bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings((bookingsData || []) as Booking[]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load seat data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize data and set up realtime subscriptions
  useEffect(() => {
    loadData();

    // Set up realtime subscription for seats
    const seatsChannel = supabase
      .channel('seats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats'
        },
        (payload) => {
          console.log('Seat change received:', payload);
          if (payload.eventType === 'UPDATE') {
            const updatedSeat = payload.new as any;
            setSeats(prevSeats =>
              prevSeats.map(seat =>
                seat.id === updatedSeat.seat_id
                  ? {
                      ...seat,
                      status: updatedSeat.status === 'confirmed' ? 'confirmed' as SeatStatus :
                              updatedSeat.status === 'held' ? 'held' as SeatStatus : 'available' as SeatStatus
                    }
                  : seat
              )
            );
          }
        }
      )
      .subscribe();

    // Set up realtime subscription for bookings
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking change received:', payload);
          if (payload.eventType === 'INSERT') {
            setBookings(prev => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev =>
              prev.map(booking =>
                booking.id === payload.new.id ? (payload.new as Booking) : booking
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings(prev =>
              prev.filter(booking => booking.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(seatsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [loadData]);

  const clearSelectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startSelectionTimeout = useCallback(() => {
    clearSelectionTimeout();
    timeoutRef.current = setTimeout(() => {
      setSeats(prevSeats => 
        prevSeats.map(seat => 
          seat.status === 'selected' ? { ...seat, status: 'available' } : seat
        )
      );
      setSelectedSeats([]);
    }, 5 * 60 * 1000); // 5 minutes
  }, [clearSelectionTimeout]);

  const toggleSeat = useCallback((seatId: string) => {
    setSeats(prevSeats => {
      const seatIndex = prevSeats.findIndex(s => s.id === seatId);
      const seat = prevSeats[seatIndex];
      
      if (seat.status !== 'available' && seat.status !== 'selected') {
        return prevSeats; // Can't select held or confirmed seats
      }

      const newSeats = [...prevSeats];
      
      if (seat.status === 'available') {
        newSeats[seatIndex] = { ...seat, status: 'selected' };
        setSelectedSeats(prev => {
          const updated = [...prev, seatId];
          if (updated.length === 1) {
            startSelectionTimeout();
          }
          return updated;
        });
      } else {
        newSeats[seatIndex] = { ...seat, status: 'available' };
        setSelectedSeats(prev => {
          const updated = prev.filter(id => id !== seatId);
          if (updated.length === 0) {
            clearSelectionTimeout();
          }
          return updated;
        });
      }
      
      return newSeats;
    });
  }, [startSelectionTimeout, clearSelectionTimeout]);

  const bookSelectedSeats = useCallback(async (bookingData: { name: string; email: string; phone: string }) => {
    if (selectedSeats.length === 0) return null;

    clearSelectionTimeout();

    try {
      // Create bookings in database for each selected seat
      const bookingPromises = selectedSeats.map(async (seatId) => {
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            seat_id: seatId,
            user_name: bookingData.name,
            user_email: bookingData.email,
            user_phone: bookingData.phone,
            status: 'held',
            held_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      const newBookings = await Promise.all(bookingPromises);

      // Seat status will be synced via DB trigger; no direct seat update needed

      // Update local state immediately
      setSeats(prevSeats => 
        prevSeats.map(seat => 
          selectedSeats.includes(seat.id) 
            ? { ...seat, status: 'held' as SeatStatus }
            : seat
        )
      );

      // Clear selection
      setSelectedSeats([]);

      toast.success(`Booking created for ${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''}!`);
      
      return newBookings[0]?.id || null;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
      throw error;
    }
  }, [selectedSeats, clearSelectionTimeout]);

  const approveBooking = useCallback(async (bookingId: string) => {
    try {
      // Update booking status to confirmed
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Get the booking to update the corresponding seat
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('seat_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Seat status change is handled by DB trigger

      toast.success('Booking approved successfully!');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  }, []);

  const refuseBooking = useCallback(async (bookingId: string) => {
    try {
      // Get the booking to find the seat
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('seat_id')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the booking
      const { error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (deleteError) throw deleteError;

      // Seat release is handled by DB trigger

      toast.error('Booking refused and seat released');
    } catch (error) {
      console.error('Error refusing booking:', error);
      toast.error('Failed to refuse booking');
    }
  }, []);

  const getSeatLayout = () => SEAT_LAYOUT;

  return {
    seats,
    selectedSeats,
    bookings,
    isLoading,
    toggleSeat,
    bookSelectedSeats,
    approveBooking,
    refuseBooking,
    getSeatLayout,
  };
}