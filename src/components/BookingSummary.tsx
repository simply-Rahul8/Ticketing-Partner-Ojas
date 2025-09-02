import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Users } from 'lucide-react';

interface BookingSummaryProps {
  selectedSeats: string[];
  onBookNow: () => void;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  selectedSeats,
  onBookNow,
}) => {
  if (selectedSeats.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Select Your Seats</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground text-sm">
            Choose your preferred seats from the seating chart above
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Selected Seats:</span>
            <span className="font-medium">{selectedSeats.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedSeats.map(seatId => (
              <span
                key={seatId}
                className="px-2 py-1 bg-seat-selected/20 text-seat-selected text-xs rounded border"
              >
                {seatId}
              </span>
            ))}
          </div>
        </div>

        <Button 
          onClick={onBookNow}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          size="lg"
        >
          <Ticket className="w-4 h-4 mr-2" />
          Book Now
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You'll be redirected to fill out your details
        </p>
      </CardContent>
    </Card>
  );
};