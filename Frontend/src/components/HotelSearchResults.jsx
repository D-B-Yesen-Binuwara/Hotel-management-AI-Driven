import HotelCard from "@/components/HotelCard";
import { useGetHotelsBySearchQuery } from "@/lib/api";
import { Skeleton } from "./ui/skeleton";
import { useSelector } from "react-redux";

function HotelListings() {
  const query = useSelector((state) => state.search.query);

  const {
    data: hotels,
    isLoading: isHotelsLoading,
    isError: isHotelsError,
    error: hotelsError,
  } = useGetHotelsBySearchQuery(query);

  const isLoading = isHotelsLoading;
  const isError = isHotelsError;
  const error = [hotelsError];

  if (isLoading) {
    return (
      <section className="px-8 py-8 lg:py-8">
        <Skeleton className="h-6 flex items-center flex-wrap gap-x-4" />
        <Skeleton className="h-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="px-8 py-8 lg:py-8">
        <p className="text-red-500">Error loading data </p>
      </section>
    );
  }

  return (
    <section className="px-8 py-8 lg:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
        {hotels.map((hotel) => {
          return <HotelCard key={hotel._id} hotel={hotel} />;
        })}
      </div>
    </section>
  );
}

export default HotelListings;
