import { useState, useCallback, useEffect } from 'react';
import { Seat, Booking, SeatStatus } from '@/types/booking';

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

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/1oQC1-y6m_8ttIwS6AhMEW9eNkSB-kBkw68cnicHgmgY/viewform';

export function useBooking() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Initialize seats
  useEffect(() => {
    const initialSeats: Seat[] = [];
    SEAT_LAYOUT.forEach(({ row, count }) => {
      for (let i = 1; i <= count; i++) {
        initialSeats.push({
          id: `${row}${i}`,
          row,
          number: i,
          status: 'available',
        });
      }
    });
    setSeats(initialSeats);

    // Load bookings from localStorage
    const savedBookings = localStorage.getItem('theatre-bookings');
    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings);
      setBookings(parsedBookings);
      
      // Update seat statuses based on bookings
      initialSeats.forEach(seat => {
        const booking = parsedBookings.find((b: Booking) => 
          b.seats.includes(seat.id)
        );
        if (booking) {
          seat.status = booking.status === 'approved' ? 'booked' : 'progress';
        }
      });
      setSeats([...initialSeats]);
    }
  }, []);

  const toggleSeat = useCallback((seatId: string) => {
    setSeats(prevSeats => {
      const seatIndex = prevSeats.findIndex(s => s.id === seatId);
      const seat = prevSeats[seatIndex];
      
      if (seat.status !== 'available' && seat.status !== 'selected') {
        return prevSeats; // Can't select booked or in-progress seats
      }

      const newSeats = [...prevSeats];
      
      if (seat.status === 'available') {
        newSeats[seatIndex] = { ...seat, status: 'selected' };
        setSelectedSeats(prev => [...prev, seatId]);
      } else {
        newSeats[seatIndex] = { ...seat, status: 'available' };
        setSelectedSeats(prev => prev.filter(id => id !== seatId));
      }
      
      return newSeats;
    });
  }, []);

  const bookSelectedSeats = useCallback(() => {
    if (selectedSeats.length === 0) return null;

    const bookingId = `booking-${Date.now()}`;
    const newBooking: Booking = {
      id: bookingId,
      seats: [...selectedSeats],
      status: 'progress',
      timestamp: Date.now(),
    };

    // Update seat statuses to 'progress'
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        selectedSeats.includes(seat.id) 
          ? { ...seat, status: 'progress' as SeatStatus }
          : seat
      )
    );

    // Add booking
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('theatre-bookings', JSON.stringify(updatedBookings));

    // Clear selection
    setSelectedSeats([]);

    // Create Google Form URL with seat information
    const seatList = selectedSeats.join(', ');
    const formUrl = `${GOOGLE_FORM_URL}?usp=pp_url&entry.123456789=${encodeURIComponent(seatList)}`;
    
    // Open Google Form in new tab
    window.open(formUrl, '_blank');

    return bookingId;
  }, [selectedSeats, bookings]);

  const approveBooking = useCallback((bookingId: string) => {
    setBookings(prevBookings => {
      const updatedBookings = prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'approved' as const }
          : booking
      );
      
      localStorage.setItem('theatre-bookings', JSON.stringify(updatedBookings));
      
      // Update seat statuses
      const approvedBooking = updatedBookings.find(b => b.id === bookingId);
      if (approvedBooking) {
        setSeats(prevSeats => 
          prevSeats.map(seat => 
            approvedBooking.seats.includes(seat.id)
              ? { ...seat, status: 'booked' as SeatStatus }
              : seat
          )
        );
      }
      
      return updatedBookings;
    });
  }, []);

  const getSeatLayout = () => SEAT_LAYOUT;

  return {
    seats,
    selectedSeats,
    bookings,
    toggleSeat,
    bookSelectedSeats,
    approveBooking,
    getSeatLayout,
  };
}