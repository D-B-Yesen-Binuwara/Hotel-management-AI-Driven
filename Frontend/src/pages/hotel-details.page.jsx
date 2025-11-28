import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddReviewMutation, useGetHotelByIdQuery, useCreateBookingMutation } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { Building2, Coffee, MapPin, PlusCircle, Star, Tv, Wifi } from "lucide-react";
import { useParams } from "react-router";
import BookingDialog from "@/components/BookingDialog";

const HotelDetailsPage = () => {
  const { _id } = useParams();
  const { data: hotel, isLoading, isError, error } = useGetHotelByIdQuery(_id);
  const [addReview, { isLoading: isAddReviewLoading }] = useAddReviewMutation();
  const [createBooking, { isLoading: isCreateBookingLoading }] = useCreateBookingMutation();

  const { user } = useUser();

  const handleAddReview = async () => {
    try {
      await addReview({
        hotelId: _id,
        comment: "This is a test review",
        rating: 5,
      }).unwrap();
    } catch (error) {}
  };

  const handleBook = async (bookingData) => {
    await createBooking(bookingData).unwrap();
  };

  if (isLoading) {
    return (
      <main className="px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative w-full h-[400px]">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-9 w-48" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-5 w-5 mr-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-24 w-full" />
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-7 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Error Loading Hotel Details
        </h2>
        <p className="text-muted-foreground">
          {error?.data?.message ||
            "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <main className="px-4">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative w-full h-[400px]">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="absolute object-cover rounded-lg"
            />
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary">Rooftop View</Badge>
            <Badge variant="secondary">French Cuisine</Badge>
            <Badge variant="secondary">City Center</Badge>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-5 w-5 text-muted-foreground mr-1" />
                <p className="text-muted-foreground">{hotel.location}</p>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Star className="h-4 w-4" />
              <span className="sr-only">Add to favorites</span>
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-5 w-5 fill-primary text-primary" />
            <span className="font-bold">{hotel?.rating ?? "No rating"}</span>
            <span className="text-muted-foreground">
              ({hotel?.reviews.length === 0 ? "No" : hotel?.reviews.length}{" "}
              reviews)
            </span>
          </div>
          <p className="text-muted-foreground">{hotel.description}</p>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  <span>Free Wi-Fi</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  <span>Restaurant</span>
                </div>
                <div className="flex items-center">
                  <Tv className="h-5 w-5 mr-2" />
                  <span>Flat-screen TV</span>
                </div>
                <div className="flex items-center">
                  <Coffee className="h-5 w-5 mr-2" />
                  <span>Coffee maker</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">${hotel.price}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
            <Button
              disabled={isAddReviewLoading}
              className={`${isAddReviewLoading ? "opacity-50" : ""}`}
              onClick={handleAddReview}
            >
              <PlusCircle className="w-4 h-4" /> Add Review
            </Button>
            <BookingDialog
              hotelName={hotel.name}
              hotelId={_id}
              onSubmit={handleBook}
              isLoading={isCreateBookingLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HotelDetailsPage;
