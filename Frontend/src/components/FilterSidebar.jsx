import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X, MapPin, DollarSign, Star, Filter } from 'lucide-react';

const FilterSidebar = ({ 
  locations, 
  selectedLocations, 
  setSelectedLocations,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  starRating,
  setStarRating,
  onClearFilters
}) => {
  const [locationSearch, setLocationSearch] = useState('');

  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(locationSearch.toLowerCase())
  ) || [];

  const handleLocationToggle = (locationId) => {
    if (selectedLocations.includes(locationId)) {
      setSelectedLocations(selectedLocations.filter(id => id !== locationId));
    } else {
      setSelectedLocations([...selectedLocations, locationId]);
    }
  };

  const removeLocation = (locationId) => {
    setSelectedLocations(selectedLocations.filter(id => id !== locationId));
  };

  return (
    <div className="w-80 space-y-6">
      {/* Sort Options */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <Filter className="w-5 h-5" />
            Sort By
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="rating-asc">Rating: Low to High</option>
          </Select>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <MapPin className="w-5 h-5" />
            Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Search */}
          <Input
            type="text"
            placeholder="Search locations..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
          
          {/* Selected Location Chips */}
          {selectedLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map(locationId => {
                const location = locations?.find(l => l._id === locationId);
                return location ? (
                  <Badge key={locationId} variant="secondary" className="flex items-center gap-1">
                    {location.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeLocation(locationId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
          
          {/* Location List */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredLocations.map(location => (
              <label key={location._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(location._id)}
                  onChange={() => handleLocationToggle(location._id)}
                  className="rounded"
                />
                <span className="text-sm text-gray-900 dark:text-white">{location.name}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <DollarSign className="w-5 h-5" />
            Price Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const newMin = Math.max(0, Math.min(Number(e.target.value), priceRange[1]));
                  setPriceRange([newMin, priceRange[1]]);
                }}
                className="text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const newMax = Math.max(priceRange[0], Math.min(1000, Number(e.target.value)));
                  setPriceRange([priceRange[0], newMax]);
                }}
                className="text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Star Rating Filter */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <Star className="w-5 h-5" />
            Star Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                <input
                  type="radio"
                  name="starRating"
                  value={rating}
                  checked={starRating === rating}
                  onChange={(e) => setStarRating(Number(e.target.value))}
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-900 dark:text-white">& up</span>
                </div>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
              <input
                type="radio"
                name="starRating"
                value=""
                checked={starRating === null}
                onChange={() => setStarRating(null)}
              />
              <span className="text-sm text-gray-900 dark:text-white">Any rating</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={onClearFilters}
        className="w-full border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800"
      >
        Clear All Filters
      </Button>
    </div>
  );
};

export default FilterSidebar;