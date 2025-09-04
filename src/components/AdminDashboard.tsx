import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Ticket,
  LogOut,
  Calendar,
  X
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { toast } from 'sonner';

interface AdminDashboardProps {
  bookings: Booking[];
  onApproveBooking: (bookingId: string) => void;
  onRefuseBooking: (bookingId: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bookings,
  onApproveBooking,
  onRefuseBooking,
  onLogout,
}) => {
  const pendingBookings = bookings.filter(b => b.status === 'held');
  const approvedBookings = bookings.filter(b => b.status === 'confirmed');

  const handleApprove = (bookingId: string) => {
    onApproveBooking(bookingId);
    toast.success('Booking approved successfully!');
  };

  const handleRefuse = (bookingId: string) => {
    onRefuseBooking(bookingId);
    toast.error('Booking refused and seats released');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage theatre bookings and approvals</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{approvedBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{bookings.length}</p>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {bookings.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Seats Booked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Approvals ({pendingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No pending bookings
              </p>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Seat {booking.seat_id}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Name:</strong> {booking.user_name || 'N/A'}</div>
                          <div><strong>Email:</strong> {booking.user_email || 'N/A'}</div>
                          <div><strong>Phone:</strong> {booking.user_phone || 'N/A'}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.created_at).toLocaleString()}
                        </div>
                      </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRefuse(booking.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Refuse
                      </Button>
                      <Button
                        onClick={() => handleApprove(booking.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Approved Bookings ({approvedBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No approved bookings yet
              </p>
            ) : (
              <div className="space-y-4">
                {approvedBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-green-50/10"
                  >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-600">
                            Seat {booking.seat_id}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div><strong>Name:</strong> {booking.user_name || 'N/A'}</div>
                          <div><strong>Email:</strong> {booking.user_email || 'N/A'}</div>
                          <div><strong>Phone:</strong> {booking.user_phone || 'N/A'}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.created_at).toLocaleString()}
                        </div>
                      </div>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};