import React, { useRef, useEffect, useState, useMemo } from 'react';
import { City } from '../types';
import { Trash2 } from 'lucide-react';

interface TimelineProps {
  cities: City[];
  onRemoveCity: (id: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ cities, onRemoveCity }) => {
  const [now, setNow] = useState(new Date());
  
  // Cursor position as a percentage (0 to 1)
  const [cursorPosition, setCursorPosition] = useState(() => {
    const d = new Date();
    return (d.getHours() + d.getMinutes() / 60) / 24;
  });

  const [isDragging, setIsDragging] = useState(false);
  const gridAreaRef = useRef<HTMLDivElement>(null);

  // Update live time every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Base reference time: Start of today (00:00 local user time)
  const startOfDay = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 0..23 array for the grid
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // User's local timezone for reference date calculation
  const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Handle Dragging / Clicking
  const updateCursor = (clientX: number) => {
    if (!gridAreaRef.current) return;
    const rect = gridAreaRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    // Clamp between 0 and 1
    const newPos = Math.max(0, Math.min(1, x / rect.width));
    setCursorPosition(newPos);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateCursor(e.clientX);
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        updateCursor(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  // Formatters
  const formatCellTime = (hourOffset: number, timezone: string) => {
    try {
      const d = new Date(startOfDay.getTime() + hourOffset * 3600 * 1000);
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
        hour12: false
      }).format(d);
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

  // Helper to get a date string key for comparison (e.g. "2023-10-25")
  const getDateKey = (hourOffset: number, timezone: string) => {
    try {
        const d = new Date(startOfDay.getTime() + hourOffset * 3600 * 1000);
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            timeZone: timezone
        }).format(d);
    } catch (e) {
        return "error";
    }
  };

  // The User's "Today" date key. 
  // We use this to check if a city's time falls on the same day as the user or a different one.
  const userDateKey = getDateKey(0, userTimezone);

  return (
    <div className="flex flex-col h-full bg-white relative select-none">
      
      {/* Header Row (Grid Numbers 00:00 - 23:00) */}
      <div className="flex h-12 border-b-2 border-gray-200">
         {/* Spacer for City Column */}
         <div className="w-48 md:w-64 flex-shrink-0 bg-white border-r-4 border-black z-20 flex items-center px-4">
             <span className="font-bold text-gray-400 font-mono text-xs tracking-wider">CITIES / LOCAL</span>
         </div>
         {/* Numbers */}
         <div className="flex-1 flex items-end pb-2 px-0 relative">
            {hours.map(h => (
                <div key={h} className="flex-1 text-center font-mono text-[10px] sm:text-xs text-gray-400 border-l border-gray-100 last:border-r truncate">
                    {h.toString().padStart(2, '0')}:00
                </div>
            ))}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
        
        {/* 
           Red Frame Overlay 
        */}
        <div 
            className="absolute top-0 bottom-0 left-0 right-0 z-30 pointer-events-none flex"
        >
            {/* 1. Spacer for the sticky column (left side) */}
            <div className="w-48 md:w-64 flex-shrink-0"></div>

            {/* 2. Grid Area (right side) */}
            <div className="flex-1 relative h-full overflow-hidden" ref={gridAreaRef}>
                 {/* The Draggable Red Frame */}
                 <div 
                    className="absolute top-0 bottom-0 border-x-2 border-red-600 bg-red-500/10 box-border"
                    style={{ 
                        left: `${cursorPosition * 100}%`,
                        width: `${100/24}%`, // Exactly one hour wide
                        transform: `translateX(-50%)` 
                    }}
                 >
                    {/* Handle/Indicator at top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                        <div className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded-t">
                             {/* Show selected time in the handle */}
                             {(() => {
                                 const totalMinutes = cursorPosition * 24 * 60;
                                 const h = Math.floor(totalMinutes / 60) % 24;
                                 const m = Math.floor(totalMinutes % 60);
                                 return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                             })()}
                        </div>
                    </div>
                 </div>
            </div>
        </div>


        {/* Interaction Layer (The Rows) */}
        <div 
          className="relative min-h-full"
          onMouseDown={handleMouseDown}
        >
            {cities.map((city) => {
             return (
             <div key={city.id} className="flex flex-row h-24 border-b border-gray-100 relative group">
               
               {/* Sticky City Name Column - Shows LIVE TIME */}
               <div className="sticky left-0 w-48 md:w-64 bg-white border-r-4 border-black z-20 flex-shrink-0 flex items-center justify-between p-4 shadow-[4px_0_0_rgba(0,0,0,0.1)]">
                 <div className="overflow-hidden w-full">
                   <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <h3 className="font-black text-lg md:text-xl truncate leading-tight">{city.name}</h3>
                        <span className="text-xs text-gray-500 font-mono truncate">{city.country}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onRemoveCity(city.id)
                        }}
                        className="text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove city"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   
                   {/* Live Clock */}
                   <div className="mt-2 font-mono text-black">
                     <div className="text-2xl font-black tracking-tight">
                       {formatLiveTime(now, city.timezone)}
                     </div>
                     <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {formatDate(now, city.timezone)}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Time Strip Grid - Static 0-24 */}
               <div className="flex-1 flex h-full relative cursor-col-resize">
                 {/* The 24 Grid Cells */}
                 {hours.map((h) => {
                   const localHour = formatCellTime(h, city.timezone);
                   const cellDateKey = getDateKey(h, city.timezone);
                   
                   // Compare cell date to USER'S current date
                   const isDifferentDay = cellDateKey !== userDateKey;
                   
                   return (
                     <div 
                       key={h} 
                       className={`
                         flex-1 flex flex-col items-center justify-center border-r border-gray-100 last:border-r-0
                         ${isDifferentDay ? 'bg-slate-50' : 'bg-white'}
                         text-gray-600
                       `}
                     >
                       <span className="font-mono text-xs sm:text-sm font-bold">
                         {localHour}
                       </span>
                     </div>
                   );
                 })}
               </div>
             </div>
           );
           })}

           {cities.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0 pl-64">
                <h1 className="text-6xl font-black uppercase text-center">Add a city<br/>to start</h1>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};