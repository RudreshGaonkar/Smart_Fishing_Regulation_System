import React from 'react';

export const ZoneMap: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px] pb-6">
      <div className="px-1 shrink-0">
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight">Global Zone Map</h2>
        <p className="text-slate-500 font-medium mt-1">Geographic overview of all designated fishing regions.</p>
      </div>

      <div className="flex-1 w-full h-full clay-card p-4 relative overflow-hidden">
         <div className="clay-inset w-full h-full rounded-[1.25rem] bg-ocean-100/30 relative overflow-hidden p-8 flex items-center justify-center">
           
           {/* Mock Ocean Background */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, #0284c7 2px, transparent 2px)',
              backgroundSize: '50px 50px'
           }}></div>

           {/* Interactive Map Grid Nodes */}
           <div className="relative w-full max-w-2xl aspect-video">
              
              {/* Path / Graph Edge (BFS Safe Path visual representation) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" overflow="visible">
                 <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#eab308" strokeWidth="3" strokeDasharray="6 6" />
                 <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="#22c55e" strokeWidth="4" className="animate-pulse" />
              </svg>

              {/* Zone A - Closed */}
              <div className="absolute top-[20%] left-[20%] w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-full h-full clay-button bg-red-100 rounded-full flex items-center justify-center border-2 border-red-300">
                  <span className="font-bold text-red-700 text-sm">Zone A</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap shadow-md">
                  Closed
                </div>
              </div>

              {/* Zone B - Restricted */}
              <div className="absolute top-[50%] left-[50%] w-32 h-32 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-full h-full clay-button bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300">
                  <span className="font-bold text-amber-700 text-sm">Zone B</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap shadow-md">
                  Warning
                </div>
              </div>

              {/* Zone C - Open / BFS Target */}
              <div className="absolute top-[30%] left-[80%] w-28 h-28 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-full h-full clay-button bg-green-100 rounded-full flex items-center justify-center border-2 border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)]">
                  <span className="font-bold text-green-800 text-sm">Zone C</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase whitespace-nowrap shadow-md flex items-center gap-1">
                  <span>Safe</span> <span className="animate-bounce">↓</span>
                </div>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
};
