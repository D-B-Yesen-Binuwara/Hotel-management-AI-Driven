import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useGetCheckoutSessionStatusQuery } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Calendar, MapPin, User } from "lucide-react";
import { Link } from "react-router";

const CompletePage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { data, isLoading, isError, error } = useGetCheckoutSessionStatusQuery(sessionId, {
    skip: !sessionId,
  });

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Invalid session ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <Skeleton className="h-8 w-48 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">
              {error?.data?.message || "Failed to load booking details"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { booking, hotel, paymentStatus, customer_email } = data;
  const isPaymentSuccessful = paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isPaymentSuccessful ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {isPaymentSuccessful ? "Booking Confirmed!" : "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Badge variant={isPaymentSuccessful ? "default" : "destructive"}>
                {paymentStatus}
              </Badge>
            </div>

            {isPaymentSuccessful && (
              <>
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-lg">Booking Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Room {booking.roomNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">{hotel.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.location}</span>
                    </div>
                  </div>

                  {customer_email && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Confirmation email sent to: <span className="font-medium">{customer_email}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Thank you for your booking! You will receive a confirmation email shortly.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild>
                      <Link to="/hotels">Book Another Hotel</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Go Home</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {!isPaymentSuccessful && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Your payment could not be processed. Please try again.
                </p>
                <Button asChild>
                  <Link to={`/booking/payment?bookingId=${booking._id}`}>
                    Try Again
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompletePage;