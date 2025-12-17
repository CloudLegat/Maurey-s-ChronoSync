import React, { useState, useEffect } from 'react';
import { X, Search, Globe, MapPin } from 'lucide-react';
import { searchCities, CITIES_DATABASE } from '../data/cities';
import type { CityData } from '../data/cities';
import { City } from '../types';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (city: City) => void;
}

// Popular cities to show by default
const POPULAR_CITIES: CityData[] = [
  { name: "Moscow", timezone: "Europe/Moscow", country: "Russia" },
  { name: "St. Petersburg", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Novi Sad", timezone: "Europe/Belgrade", country: "Serbia" },
  { name: "London", timezone: "Europe/London", country: "United Kingdom" },
  { name: "New York", timezone: "America/New_York", country: "USA" },
  { name: "Tokyo", timezone: "Asia/Tokyo", country: "Japan" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "UAE" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "China" },
  { name: "Paris", timezone: "Europe/Paris", country: "France" },
  { name: "Sydney", timezone: "Australia/Sydney", country: "Australia" },
  { name: "Singapore", timezone: "Asia/Singapore", country: "Singapore" },
  { name: "Berlin", timezone: "Europe/Berlin", country: "Germany" },
];

export const AddCityModal: React.FC<AddCityModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityData[]>([]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const results = searchCities(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const addCityFromResult = (cityData: CityData) => {
    onAdd({
      id: crypto.randomUUID(),
      name: cityData.name,
      timezone: cityData.timezone,
      country: cityData.country
    });
    onClose();
    setQuery('');
    setSearchResults([]);
  };

  const citiesToShow = searchResults.length > 0 ? searchResults : POPULAR_CITIES;
  const headerText = searchResults.length > 0
    ? `Found ${searchResults.length} ${searchResults.length === 1 ? 'city' : 'cities'}`
    : 'Popular Cities';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 font-mono uppercase tracking-tighter">Add New City</h2>

          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities... (e.g. London, Tokyo)"
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-gray-50"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{headerText}</h3>
            {citiesToShow.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {citiesToShow.map((city) => (
                  <button
                    key={`${city.name}-${city.timezone}`}
                    onClick={() => addCityFromResult(city)}
                    className="flex items-start gap-3 p-4 border-2 border-gray-200 hover:border-black hover:bg-gray-50 text-left transition-all group"
                  >
                    <div className="bg-white p-2 border-2 border-gray-200 group-hover:border-black transition-all">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-bold truncate">{city.name}</div>
                      <div className="text-xs text-gray-500 font-mono truncate">{city.country}</div>
                      <div className="text-xs text-gray-400 font-mono truncate">{city.timezone}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 font-mono">
                No cities found. Try a different search term.
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 border-l-4 border-gray-300">
            <p className="text-xs text-gray-600 font-mono">
              <strong>Tip:</strong> Type at least 2 characters to search from {CITIES_DATABASE.length}+ cities worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
