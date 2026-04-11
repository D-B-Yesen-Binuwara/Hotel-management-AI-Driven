import React, { useState, useEffect } from "react";
import { useGetAllHotelsQuery, useGetAllLocationsQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, List, MapPin, Star, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import FilterSidebar from "@/components/FilterSidebar";
import LazyImage from "@/components/LazyImage";

const HotelsListingPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [starRating, setStarRating] = useState(null);
  const itemsPerPage = 15;
  
  const { data: hotels, isLoading: isHotelsLoading, isError: isHotelsError } = useGetAllHotelsQuery();
  const { data: locations, isLoading: isLocationsLoading, isError: isLocationsError } = useGetAllLocationsQuery();
  
  // Apply all filters
  let filteredHotels = hotels;
  
  // Location filter
  if (selectedLocations.length > 0) {
    const selectedLocationNames = locations?.filter(loc => 
      selectedLocations.includes(loc._id)
    ).map(loc => loc.name) || [];
    
    filteredHotels = filteredHotels?.filter(hotel => 
      selectedLocationNames.some(locName => 
        hotel.location.toLowerCase().includes(locName.toLowerCase())
      )
    );
  }
  
  // Search filter (hotel name only)
  if (searchQuery.trim()) {
    filteredHotels = filteredHotels?.filter(hotel => 
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Price range filter
  filteredHotels = filteredHotels?.filter(hotel => 
    hotel.price >= priceRange[0] && hotel.price <= priceRange[1]
  );
  
  // Star rating filter
  if (starRating !== null) {
    filteredHotels = filteredHotels?.filter(hotel => 
      (hotel.rating || 0) >= starRating
    );
  }
  
  // Apply sorting
  if (filteredHotels) {
    filteredHotels = [...filteredHotels].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "rating-asc":
          return (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });
  }
  
  // Pagination logic
  const totalPages = Math.ceil((filteredHotels?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHotels = filteredHotels?.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocations, searchQuery, sortBy, priceRange, starRating]);
  
  // Clear all filters
  const handleClearFilters = () => {
    setSelectedLocations([]);
    setPriceRange([0, 1000]);
    setStarRating(null);
    setSearchQuery("");
    setSortBy("name-asc");
  };
  
  const isLoading = isHotelsLoading || isLocationsLoading;
  const isError = isHotelsError || isLocationsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="mx-2 sm:mx-4 px-3 sm:px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load hotels</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const HotelCard = ({ hotel }) => (
    <div className="group relative rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-2">
      <Link to={`/hotels/${hotel._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <LazyImage
            src={hotel.image}
            alt={hotel.name}
            className="absolute inset-0 transition-transform group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm leading-snug text-gray-900 dark:text-white">{hotel.name}</h3>
          {hotel.rating && (
            <div className="flex items-center gap-1 ml-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{hotel.rating}</span>
            </div>
          )}
        </div>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="text-xs truncate">{hotel.location}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">${hotel.price}<span className="text-xs font-normal text-muted-foreground">/night</span></span>
          <div className="flex gap-1">
            <Button asChild size="sm" className="flex-1 text-xs h-7">
              <Link to={`/hotels/${hotel._id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1 text-xs h-7 bg-green-600 hover:bg-green-700">
              <Link to={`/hotels/${hotel._id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const HotelListItem = ({ hotel }) => (
    <div className="flex gap-4 border rounded-xl overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="relative w-48 h-36 flex-shrink-0 overflow-hidden">
        <LazyImage
          src={hotel.image}
          alt={hotel.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 py-3 pr-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm leading-snug text-gray-900 dark:text-white">{hotel.name}</h3>
            {hotel.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{hotel.rating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{hotel.location}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{hotel.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium">${hotel.price}<span className="text-xs font-normal text-muted-foreground">/night</span></span>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link to={`/hotels/${hotel._id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <Link to={`/hotels/${hotel._id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-2 sm:mx-4 px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              All Hotels
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredHotels?.length || 0} hotels available
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search hotel names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            locations={locations}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            starRating={starRating}
            setStarRating={setStarRating}
            onClearFilters={handleClearFilters}
          />
          
          {/* Hotels Content */}
          <div className="flex-1">

            {/* Hotels Display */}
        {!filteredHotels || filteredHotels.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hotels found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          <>
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 stagger-children"
                : "space-y-4 stagger-children"
            }>
              {paginatedHotels?.map((hotel) =>
                viewMode === "grid" ? (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ) : (
                  <HotelListItem key={hotel._id} hotel={hotel} />
                )
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsListingPage;