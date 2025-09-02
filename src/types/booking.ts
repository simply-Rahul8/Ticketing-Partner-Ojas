export type SeatStatus = 'available' | 'selected' | 'progress' | 'booked';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  bookedBy?: string;
}

export interface Booking {
  id: string;
  seats: string[];
  status: 'progress' | 'approved';
  timestamp: number;
  formData?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface AdminCredentials {
  username: string;
  password: string;
}