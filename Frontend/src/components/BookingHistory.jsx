import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { useGetUserBookingsQuery } from "@/lib/api";
import { Calendar, MapPin, User, Filter, Clock } from "lucide-react";

const BookingHistory = () => {
  const { data: bookings, isLoading, isError } = useGetUserBookingsQuery();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredBookings = bookings?.filter(booking => 
    statusFilter === "ALL" || booking.paymentStatus === statusFilter
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Failed to load booking history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking History ({filteredBookings.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-32"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {statusFilter === "ALL" ? "No bookings yet" : `No ${statusFilter.toLowerCase()} bookings`}
            </p>
            <p className="text-sm text-muted-foreground">
              Start exploring hotels to make your first booking!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  {/* Hotel Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={booking.hotelId?.image}
                      alt={booking.hotelId?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Booking Details */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{booking.hotelId?.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{booking.hotelId?.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.paymentStatus === "PAID" ? "default" : "secondary"}>
                          {booking.paymentStatus}
                        </Badge>
                        <div className="text-lg font-bold mt-1">
                          ${booking.totalAmount || (booking.hotelId?.price * Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Check-in</div>
                          <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Check-out</div>
                          <div>{new Date(booking.checkOut).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Room</div>
                          <div>{booking.roomNumber}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        {booking.paymentStatus === "PENDING" && (
                          <Button size="sm" variant="outline">
                            Complete Payment
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingHistory;