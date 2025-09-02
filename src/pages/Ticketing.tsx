import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SeatChart } from '@/components/SeatChart';
import { BookingSummary } from '@/components/BookingSummary';
import { BookingForm } from '@/components/BookingForm';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useSupabaseBooking } from '@/hooks/useSupabaseBooking';
import { Shield, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function Ticketing() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const {
    seats,
    selectedSeats,
    bookings,
    isLoading,
    toggleSeat,
    bookSelectedSeats,
    approveBooking,
    refuseBooking,
    getSeatLayout,
  } = useSupabaseBooking();

  const handleBookNow = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingConfirm = async (bookingData: { name: string; email: string; phone: string }) => {
    await bookSelectedSeats(bookingData);
  };

  const handleAdminLogin = (loginSuccess: boolean) => {
    setIsAdmin(loginSuccess);
    if (loginSuccess) {
      setIsAdminView(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsAdminView(false);
  };

  if (isAdminView && !isAdmin) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  if (isAdminView && isAdmin) {
    return (
        <AdminDashboard
          bookings={bookings}
          onApproveBooking={approveBooking}
          onRefuseBooking={refuseBooking}
          onLogout={handleLogout}
        />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading seat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Theatre Booking</h1>
                <p className="text-xs text-muted-foreground">Select your seats</p>
              </div>
            </div>
            <Button
              onClick={() => setIsAdminView(true)}
              variant="outline"
              size="sm"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Seating Chart */}
          <div className="xl:col-span-3">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose Your Seats</h2>
                <p className="text-muted-foreground">
                  Click on available seats to select them
                </p>
              </div>
              
              <SeatChart
                seats={seats}
                onSeatClick={toggleSeat}
                seatLayout={getSeatLayout()}
              />
            </div>
          </div>

          {/* Booking Summary */}
          <div className="xl:col-span-1">
            <div className="sticky top-8">
              <BookingSummary
                selectedSeats={selectedSeats}
                onBookNow={handleBookNow}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        selectedSeats={selectedSeats}
        onConfirm={handleBookingConfirm}
      />
    </div>
  );
}