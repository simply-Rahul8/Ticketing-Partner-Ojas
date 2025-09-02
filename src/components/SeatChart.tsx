import React from 'react';
import { Seat } from '@/types/booking';
import { cn } from '@/lib/utils';

interface SeatChartProps {
  seats: Seat[];
  onSeatClick: (seatId: string) => void;
  seatLayout: { row: string; count: number }[];
}

const SeatButton: React.FC<{
  seat: Seat;
  onClick: () => void;
}> = ({ seat, onClick }) => {
  const getColorClass = () => {
    switch (seat.status) {
      case 'available':
        return 'bg-seat-available hover:bg-seat-available/80 text-seat-available-foreground border-seat-available';
      case 'selected':
        return 'bg-seat-selected text-seat-selected-foreground border-seat-selected shadow-lg transform scale-105';
      case 'progress':
        return 'bg-seat-progress text-seat-progress-foreground border-seat-progress cursor-not-allowed';
      case 'booked':
        return 'bg-seat-booked text-seat-booked-foreground border-seat-booked cursor-not-allowed';
      default:
        return 'bg-seat-available';
    }
  };

  const isDisabled = seat.status === 'progress' || seat.status === 'booked';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'w-8 h-8 rounded-md border-2 text-xs font-semibold transition-all duration-200 hover:scale-105',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
        getColorClass()
      )}
      aria-label={`Seat ${seat.id} - ${seat.status}`}
    >
      {seat.number}
    </button>
  );
};

export const SeatChart: React.FC<SeatChartProps> = ({
  seats,
  onSeatClick,
  seatLayout,
}) => {
  const getSeatsByRow = (row: string) => {
    return seats.filter(seat => seat.row === row);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stage */}
      <div className="relative mb-12">
        <div 
          className="h-4 rounded-full mb-2 bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ background: 'var(--gradient-theatre)' }}
        />
        <p className="text-center text-sm text-muted-foreground font-medium">STAGE</p>
      </div>

      {/* Seating Chart */}
      <div className="space-y-4">
        {seatLayout.map(({ row, count }) => {
          const rowSeats = getSeatsByRow(row);
          return (
            <div key={row} className="flex items-center justify-center gap-2">
              {/* Row Label */}
              <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-primary mr-4">
                {row}
              </div>

              {/* Seats */}
              <div className="flex gap-1">
                {rowSeats.map(seat => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    onClick={() => onSeatClick(seat.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-seat-available border border-seat-available" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-seat-selected border border-seat-selected" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-seat-progress border border-seat-progress" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-seat-booked border border-seat-booked" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};