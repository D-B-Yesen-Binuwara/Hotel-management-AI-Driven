import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserBookingsQuery } from "@/lib/api";
import { User } from "lucide-react";
import BookingHistory from "@/components/BookingHistory";

const MyAccountPage = () => {
  const { user, isLoaded } = useUser();
  const { data: bookings, isLoading: isBookingsLoading, isError } = useGetUserBookingsQuery();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-1" />
            <Skeleton className="h-64 col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="space-y-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{user?.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground">Member since</div>
                  <div className="text-sm font-medium">{new Date(user?.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm text-muted-foreground">Total bookings</div>
                  <div className="text-sm font-medium">{bookings?.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Booking History */}
          <BookingHistory />
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;