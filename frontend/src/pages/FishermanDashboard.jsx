import React, { useState } from 'react';
import { MapPin, Info, Anchor, Navigation, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const FishermanDashboard = () => {
    const [effortHours, setEffortHours] = useState(5);
    const [netDepth, setNetDepth] = useState(10);
    const [isSimulating, setIsSimulating] = useState(false);
    const [suggestion, setSuggestion] = useState(null);

    const handleSimulate = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            setSuggestion({
                zone: "Sector 7-G",
                risk: "Low",
                path: ["Harbor Base", "Current Ridge", "Sector 7-G"],
                message: "High stock detected with safe migratory patterns. Optimal route suggested."
            });
        }, 1500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
        >
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simulation View</h1>
                    <p className="text-slate-500 font-medium">Navigation Control & Real-time Suggestions</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block leading-none">System Status</span>
                            <span className="text-emerald-700 font-bold text-sm">Ready to Cast</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">
                {/* 70% Map Area */}
                <div className="flex-[7] bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    {/* Placeholder for MapComponent */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://api.placeholder.com/1200/800')] bg-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    </div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="bg-white/80 p-8 rounded-2xl backdrop-blur-md border border-white shadow-xl text-center max-w-sm">
                            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100">
                                <Navigation className="w-8 h-8 text-cyan-600 mx-auto" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Interactive Ocean Map</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Google Maps API placeholder. Click to select zones or view live stock density metrics.
                            </p>
                        </div>
                    </div>

                    {/* Overlay elements */}
                    <div className="absolute bottom-6 left-6 flex gap-3">
                        <div className="bg-white/90 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 shadow-sm backdrop-blur-sm">
                            Lat: 24.55° N
                        </div>
                        <div className="bg-white/90 px-4 py-2 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 shadow-sm backdrop-blur-sm">
                            Lon: 81.78° W
                        </div>
                    </div>
                </div>

                {/* 30% Sidebar */}
                <aside className="flex-[3] flex flex-col gap-6 overflow-y-auto pr-1">
                    {/* Fishing Setup Form */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <MapPin className="text-cyan-600 w-5 h-5" /> Navigation Setup
                        </h3>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between">
                                    Effort Hours <span className="text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded text-xs">{effortHours} hrs</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="24" 
                                    value={effortHours}
                                    onChange={(e) => setEffortHours(e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between">
                                    Net Depth <span className="text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded text-xs">{netDepth}m</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="200" 
                                    value={netDepth}
                                    onChange={(e) => setNetDepth(e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                />
                            </div>

                            <button 
                                onClick={handleSimulate}
                                disabled={isSimulating}
                                className={`w-full py-3.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 ${
                                    isSimulating 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                                    : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-lg focus:ring-4 focus:ring-cyan-100'
                                }`}
                            >
                                {isSimulating ? 'Processing Simulation...' : 'Cast Nets (Simulate)'}
                            </button>
                        </div>
                    </div>

                    {/* Safe Zone Suggestion Alert */}
                    {suggestion && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                            {/* Decorative Accent */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-emerald-100 p-2 rounded-lg">
                                    <AlertTriangle className="text-emerald-700 w-5 h-5 shrink-0" />
                                </div>
                                <div>
                                    <h4 className="text-emerald-800 font-bold">Safe Zone Suggested</h4>
                                    <p className="text-xs text-emerald-600 font-medium">Risk-Optimized Graph Path</p>
                                </div>
                            </div>
                            
                            <div className="mb-5 p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                <p className="text-sm text-slate-600 font-medium">"{suggestion.message}"</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm bg-white px-4 py-2 border border-slate-100 rounded-lg shadow-sm">
                                    <span className="text-slate-500 font-medium">Target Zone</span>
                                    <span className="font-bold text-slate-900">{suggestion.zone}</span>
                                </div>
                                <div className="bg-white p-4 border border-slate-100 rounded-lg shadow-sm">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Generated Route</span>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {suggestion.path.map((step, i) => (
                                            <React.Fragment key={i}>
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-md text-xs border border-slate-200 shadow-sm">{step}</span>
                                                {i < suggestion.path.length - 1 && <span className="text-slate-400">→</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!suggestion && !isSimulating && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <Info className="text-slate-400 w-6 h-6" />
                            </div>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                Configure navigational parameters above and run the simulation to receive data-driven safe fishing zones.
                            </p>
                        </div>
                    )}
                </aside>
            </div>
        </motion.div>
    );
};

export default FishermanDashboard;
