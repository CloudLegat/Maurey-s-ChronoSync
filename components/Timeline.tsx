import React, { useRef, useEffect, useState, useMemo } from 'react';
import { City } from '../types';
import { Trash2 } from 'lucide-react';

interface TimelineProps {
  cities: City[];
  onRemoveCity: (id: string) => void;
}

const CELL_WIDTH = 100; // Width of each hour cell in pixels

export const Timeline: React.FC<TimelineProps> = ({ cities, onRemoveCity }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate a fixed grid of hours anchored to the current hour at mount time.
  const { hours } = useMemo(() => {
      const nowTs = Date.now();
      // Round down to the start of the current hour (e.g., 12:45 -> 12:00)
      const startOfCurrentHourTs = Math.floor(nowTs / (1000 * 60 * 60)) * (1000 * 60 * 60);
      
      // Generate 48 hours centered (24 hours before, 23 hours after)
      const h = Array.from({ length: 48 }, (_, i) => {
        return new Date(startOfCurrentHourTs + (i - 24) * (1000 * 60 * 60));
      });
      return { hours: h };
  }, []); 

  // Center the scroll view on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Index 24 is the current hour cell.
      // We generally want to center index 24, but offset by the sticky header width approx (256px)
      const gridCenter = (24 * CELL_WIDTH) + (CELL_WIDTH / 2);
      const centerPos = gridCenter - (container.clientWidth / 2) + 256; 
      
      container.scrollLeft = centerPos;
    }
  }, []);

  // Mouse Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
    document.body.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = 'default';
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    
    // Inverted Logic: Drag Left -> ScrollLeft Increases (pushed right)
    // Matches "move slider into red area"
    scrollContainerRef.current.scrollLeft = scrollLeftState + walk;
  };

  // Formatters
  const formatTime = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: false
      }).format(date);
    } catch (e) {
      return "--:--";
    }
  };
  
  const formatLiveTime = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: false
      }).format(date);
    } catch (e) {
      return "--:--";
    }
  };

  const formatDate = (date: Date, timezone: string) => {
    try {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: timezone
        }).format(date);
    } catch (e) {
        return "";
    }
  };

  const getDayPhase = (date: Date, timezone: string) => {
    try {
        const hour = parseInt(new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: timezone
        }).format(date));
        // Night is 21:00 (9PM) to 09:00 (9AM)
        if (hour >= 21 || hour < 9) return 'night';
        return 'day';
    } catch (e) {
        return 'day';
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative select-none">
      
      {/* The Red Frame Overlay (Centered in Viewport) */}
      <div 
        className="absolute left-1/2 top-0 bottom-0 z-30 pointer-events-none transform -translate-x-1/2"
        style={{ width: `${CELL_WIDTH}px` }}
      >
        <div className="h-full w-full border-x-4 border-t-4 border-b-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] bg-red-500/5"></div>
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 font-bold text-sm whitespace-nowrap shadow-lg">
          SELECTED TIME
        </div>
      </div>

      {/* Main Scroll Area */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="flex-1 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing hide-scrollbar relative"
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        <div className="flex flex-col min-w-max pb-8 pt-12 relative">
           
           {/* Header Row */}
           <div className="flex sticky left-0 z-20">
             <div className="sticky left-0 w-48 md:w-64 bg-white border-b-4 border-r-4 border-black z-40 flex items-center p-4">
                <span className="font-bold text-gray-400 font-mono text-sm tracking-wider">CITIES / LOCAL TIME</span>
             </div>
           </div>

           {cities.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0">
                <h1 className="text-6xl font-black uppercase text-center">Add a city<br/>to start</h1>
             </div>
           )}

           {cities.map((city) => (
             <div key={city.id} className="flex flex-row hover:bg-gray-50 transition-colors h-32 border-b-2 border-gray-100 relative group">
               
               {/* Sticky City Name Column with LIVE CLOCK */}
               <div className="sticky left-0 w-48 md:w-64 bg-white border-r-4 border-black z-20 flex-shrink-0 flex items-center justify-between p-4 shadow-[4px_0_0_rgba(0,0,0,0.1)]">
                 <div className="overflow-hidden w-full">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="font-black text-lg md:text-xl truncate leading-tight">{city.name}</h3>
                        <span className="text-xs text-gray-500 font-mono truncate">{city.country}</span>
                      </div>
                      <button 
                        onClick={() => onRemoveCity(city.id)}
                        className="text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove city"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   
                   {/* Live Digital Clock for this City */}
                   <div className="mt-3 font-mono">
                     <div className="text-3xl font-black tracking-tight text-gray-900">
                       {formatLiveTime(now, city.timezone)}
                     </div>
                     <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {formatDate(now, city.timezone)}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Time Strip */}
               <div className="flex items-center h-full">
                 {hours.map((date, index) => {
                   const timeStr = formatTime(date, city.timezone);
                   const dateStr = formatDate(date, city.timezone);
                   const phase = getDayPhase(date, city.timezone);
                   const isMidnight = timeStr === "00:00";
                   
                   return (
                     <div 
                       key={index} 
                       className={`
                         flex-shrink-0 flex flex-col items-center justify-center h-full border-r border-gray-200
                         ${phase === 'night' ? 'bg-slate-50 text-slate-400' : 'bg-white text-black'}
                         ${isMidnight ? 'border-r-4 border-black' : ''}
                       `}
                       style={{ width: `${CELL_WIDTH}px` }}
                     >
                       <span className={`font-mono text-xl md:text-2xl font-bold ${isMidnight ? 'text-black underline decoration-4 decoration-red-500' : ''}`}>
                         {timeStr}
                       </span>
                       {isMidnight && (
                         <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-red-600">
                           {dateStr}
                         </span>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};