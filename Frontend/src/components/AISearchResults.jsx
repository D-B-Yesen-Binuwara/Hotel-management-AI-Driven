import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";
import { resetQuery } from "@/lib/features/searchSlice";
import HotelCard from "./HotelCard";

export default function AISearchResults() {
  const dispatch = useDispatch();
  const { query, aiResponse, aiHotels } = useSelector((state) => state.search);

  const handleClearSearch = () => {
    dispatch(resetQuery());
  };

  return (
    <section className="px-8 py-8 lg:py-8">
      {/* Search Header with Clear Button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl md:text-3xl font-bold">AI Search Results</h2>
          </div>
          <Button
            variant="outline"
            onClick={handleClearSearch}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Search
          </Button>
        </div>
        
        <div className="mb-6">
          <Badge variant="secondary" className="mb-3">
            Search Query: "{query}"
          </Badge>
          
          {/* AI Response */}
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary-900 mb-2">AI Recommendation</h3>
                  <p className="text-primary-800 leading-relaxed">{aiResponse}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hotels Results */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">
          Recommended Hotels ({aiHotels.length})
        </h3>
        
        {aiHotels.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hotels found for your search.</p>
            <Button onClick={handleClearSearch} className="mt-4">
              Browse All Hotels
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {aiHotels.map((hotel, index) => (
              <div key={hotel._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <HotelCard hotel={hotel} />
                {hotel.score && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Match: {Math.round(hotel.score * 100)}%
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Search CTA */}
      {aiHotels.length > 0 && (
        <div className="text-center pt-8 border-t">
          <p className="text-muted-foreground mb-4">
            Want to explore more options?
          </p>
          <Button onClick={handleClearSearch} variant="outline" size="lg">
            Show All Hotels
          </Button>
        </div>
      )}
    </section>
  );
}