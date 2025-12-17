import React, { useState } from 'react';
import { X, Search, Loader2, Globe, MapPin } from 'lucide-react';
import { searchCityTimezone } from '../services/geminiService';
import { City, SearchResult } from '../types';

interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (city: City) => void;
}

// Updated list prioritizing Russian cities as main request, plus Novi Sad and key global hubs
const COMMON_CITIES: SearchResult[] = [
  { name: "Moscow", timezone: "Europe/Moscow", country: "Russia" },
  { name: "St. Petersburg", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Novi Sad", timezone: "Europe/Belgrade", country: "Serbia" },
  { name: "Novosibirsk", timezone: "Asia/Novosibirsk", country: "Russia" },
  { name: "Yekaterinburg", timezone: "Asia/Yekaterinburg", country: "Russia" },
  { name: "Kazan", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Nizhny Novgorod", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Chelyabinsk", timezone: "Asia/Yekaterinburg", country: "Russia" },
  { name: "Samara", timezone: "Europe/Samara", country: "Russia" },
  { name: "Omsk", timezone: "Asia/Omsk", country: "Russia" },
  { name: "Rostov-on-Don", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Ufa", timezone: "Asia/Yekaterinburg", country: "Russia" },
  { name: "Krasnoyarsk", timezone: "Asia/Krasnoyarsk", country: "Russia" },
  { name: "Voronezh", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Perm", timezone: "Asia/Yekaterinburg", country: "Russia" },
  { name: "Volgograd", timezone: "Europe/Volgograd", country: "Russia" },
  { name: "Krasnodar", timezone: "Europe/Moscow", country: "Russia" },
  { name: "Tyumen", timezone: "Asia/Yekaterinburg", country: "Russia" },
  { name: "Saratov", timezone: "Europe/Saratov", country: "Russia" },
  { name: "Tolyatti", timezone: "Europe/Samara", country: "Russia" },
  { name: "Vladivostok", timezone: "Asia/Vladivostok", country: "Russia" },
  { name: "Kaliningrad", timezone: "Europe/Kaliningrad", country: "Russia" },
  { name: "Irkutsk", timezone: "Asia/Irkutsk", country: "Russia" },
  { name: "London", timezone: "Europe/London", country: "UK" },
  { name: "New York", timezone: "America/New_York", country: "USA" },
  { name: "Dubai", timezone: "Asia/Dubai", country: "UAE" },
  { name: "Beijing", timezone: "Asia/Shanghai", country: "China" },
];

export const AddCityModal: React.FC<AddCityModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await searchCityTimezone(query);
      if (data) {
        setResult(data);
      } else {
        setError('City not found. Please try again.');
      }
    } catch (err) {
      setError('Failed to fetch city data.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      addCityFromResult(result);
    }
  };

  const addCityFromResult = (cityData: SearchResult) => {
    onAdd({
      id: crypto.randomUUID(),
      name: cityData.name,
      timezone: cityData.timezone,
      country: cityData.country
    });
    onClose();
    setQuery('');
    setResult(null);
  };

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
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Khabarovsk, Tomsk..."
              className="flex-1 border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-gray-50"
              autoFocus
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-black text-white p-3 px-4 font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-100 border-l-4 border-red-600 text-red-700 font-mono text-sm mb-4">
              {error}
            </div>
          )}

          {result ? (
            <div className="border-4 border-black p-4 bg-gray-50 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-white p-3 border-2 border-black rounded-full">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{result.name}</h3>
                  <p className="text-gray-600 font-mono text-sm">{result.country}</p>
                  <p className="text-gray-500 font-mono text-xs mt-1">{result.timezone}</p>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="w-full bg-red-600 text-white font-bold py-3 uppercase tracking-widest hover:bg-red-700 border-2 border-transparent hover:border-black transition-all"
              >
                Confirm & Add
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Popular Cities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COMMON_CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => addCityFromResult(city)}
                    className="flex items-center gap-2 p-3 border-2 border-gray-200 hover:border-black hover:bg-gray-50 text-left transition-all group"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-black" />
                    <span className="font-mono text-sm font-bold">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};