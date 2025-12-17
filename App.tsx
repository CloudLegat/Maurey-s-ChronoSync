import React, { useState, useEffect } from 'react';
import { Plus, Clock, Menu } from 'lucide-react';
import { AddCityModal } from './components/AddCityModal';
import { Timeline } from './components/Timeline';
import { City } from './types';

// Initial dummy data to populate the view similar to the sketch if empty
const INITIAL_CITIES: City[] = [
  { id: '1', name: 'Novi Sad', timezone: 'Europe/Belgrade', country: 'Serbia' },
  { id: '2', name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
  { id: '3', name: 'Beijing', timezone: 'Asia/Shanghai', country: 'China' },
];

function App() {
  const [cities, setCities] = useState<City[]>(() => {
    const saved = localStorage.getItem('cities');
    return saved ? JSON.parse(saved) : INITIAL_CITIES;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cities', JSON.stringify(cities));
  }, [cities]);

  const addCity = (city: City) => {
    setCities(prev => [...prev, city]);
  };

  const removeCity = (id: string) => {
    setCities(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-black overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex-shrink-0 h-20 border-b-4 border-black flex items-center justify-between px-6 bg-white z-50">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white p-2">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase hidden md:block">
            Chrono<span className="text-red-600">Sync</span>
          </h1>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 bg-white border-4 border-black px-6 py-2 hover:bg-black hover:text-white transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          <span className="font-bold text-lg uppercase tracking-wide">Add City</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <Timeline cities={cities} onRemoveCity={removeCity} />
      </main>

      {/* Footer / Legend */}
      <footer className="flex-shrink-0 h-12 bg-gray-100 border-t-2 border-black flex items-center px-6 text-xs font-mono text-gray-500 justify-between">
        <div className="flex gap-4">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-white border border-gray-400 block"></span> Same Day
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-slate-100 border border-gray-200 block"></span> Different Day
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-4 bg-red-600 block"></span> Cursor
          </span>
        </div>
        <div className="hidden md:block">
           DRAG CURSOR TO COMPARE TIME
        </div>
      </footer>

      {/* Modals */}
      <AddCityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addCity} 
      />

    </div>
  );
}

export default App;