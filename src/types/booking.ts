export type SeatStatus = 'available' | 'selected' | 'held' | 'confirmed';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
}

export interface Booking {
  id: string;
  seat_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  status: 'held' | 'confirmed';
  created_at: string;
  held_at: string | null;
  confirmed_at: string | null;
  google_form_response_id: string | null;
}

export interface AdminCredentials {
  username: string;
  password: string;
}