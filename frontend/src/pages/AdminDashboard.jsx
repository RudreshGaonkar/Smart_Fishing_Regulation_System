import React, { useState } from 'react';
import { Shield, AlertCircle, Users, Activity, Edit3, Check, X, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    // Priority Alerts (Mocking backend Priority Queue data)
    const [alerts] = useState([
        { id: 1, species: "Bluefin Tuna", priority: "Critical", count: 120, trend: "Declining", zone: "Zone A-1" },
        { id: 2, species: "Loggerhead Turtle", priority: "Critical", count: 45, trend: "Stable", zone: "Zone B-4" },
        { id: 3, species: "Minke Whale", priority: "High", count: 88, trend: "Rising", zone: "Zone C-2" },
    ]);

    // Zone Management State
    const [zones, setZones] = useState([
        { id: "A-1", status: "Active", stock: "82%", fishermen: 12, limit: 500 },
        { id: "B-4", status: "Restricted", stock: "15%", fishermen: 2, limit: 50 },
        { id: "C-2", status: "Active", stock: "65%", fishermen: 8, limit: 300 },
        { id: "D-9", status: "Safe", stock: "94%", fishermen: 0, limit: 1000 },
    ]);

    const [editingId, setEditingId] = useState(null);
    const [tempLimit, setTempLimit] = useState("");

    const handleEditLimit = (zone) => {
        setEditingId(zone.id);
        setTempLimit(zone.limit);
    };

    const handleSaveLimit = (id) => {
        setZones(zones.map(z => z.id === id ? { ...z, limit: Number(tempLimit) } : z));
        setEditingId(null);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
        >
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 tracking-tight">
                         Admin Control Center
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Regulation, Oversight & Priority Management</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button className="px-5 py-2.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-bold shadow-sm border border-cyan-100">Overview</button>
                    <button className="px-5 py-2.5 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-500 transition-colors">Logs</button>
                    <button className="px-5 py-2.5 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-500 flex items-center gap-2 transition-colors">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>
            </header>

            {/* Priority Alerts Grid (3-column) */}
            <section className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-rose-100 p-1.5 rounded-lg border border-rose-200">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Priority Species Alerts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alerts.map(alert => (
                        <div key={alert.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                            {/* Decorative Accent */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${
                                alert.priority === 'Critical' ? 'bg-rose-500' : 'bg-orange-400'
                            }`}></div>

                            <div className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase rounded-full border shadow-sm ${
                                alert.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                                {alert.priority}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{alert.species}</h3>
                            <p className="text-sm text-slate-500 mb-6 font-medium flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> {alert.zone}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pop. Count</span>
                                    <span className="text-2xl font-black text-cyan-700">{alert.count}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Trend</span>
                                    <span className={`text-sm font-bold rounded-full px-2 py-0.5 inline-block border ${
                                        alert.trend === 'Declining' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}>
                                        {alert.trend}
                                    </span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors shadow-sm">
                                View Species Profile
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Zone Management Table */}
            <section>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Activity className="text-cyan-600 w-6 h-6" /> Fishing Zone Management
                        </h2>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 font-bold shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Live
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-white text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="p-6">Zone ID</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6">Live Stock</th>
                                    <th className="p-6 flex items-center gap-1.5 align-middle">
                                        <Users className="w-4 h-4" /> Active Fishermen
                                    </th>
                                    <th className="p-6">Catch Limit (kg)</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {zones.map(zone => (
                                    <tr key={zone.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-6 font-black text-slate-800">{zone.id}</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                                                zone.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                zone.status === 'Restricted' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-cyan-50 text-cyan-700 border-cyan-200'
                                            }`}>
                                                {zone.status}
                                            </span>
                                        </td>
                                        <td className="p-6 min-w-[150px]">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-slate-700">{zone.stock}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        parseInt(zone.stock) > 70 ? 'bg-emerald-500' :
                                                        parseInt(zone.stock) > 30 ? 'bg-orange-400' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: zone.stock }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="p-6 font-bold text-slate-700">
                                            {zone.fishermen} <span className="text-slate-400 font-medium text-xs ml-1">vessels</span>
                                        </td>
                                        <td className="p-6">
                                            {editingId === zone.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number"
                                                        value={tempLimit}
                                                        onChange={(e) => setTempLimit(e.target.value)}
                                                        className="bg-white border border-cyan-300 rounded-lg px-3 py-1.5 w-24 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleSaveLimit(zone.id)} className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-100 shadow-sm transition-colors">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md hover:bg-rose-100 shadow-sm transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="font-mono font-bold text-slate-700">{zone.limit.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button 
                                                onClick={() => handleEditLimit(zone)}
                                                className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-cyan-600 transition-colors shadow-sm"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button className="text-xs text-cyan-600 hover:text-cyan-700 transition-colors uppercase tracking-widest font-bold">
                            Load Extension Map Details
                        </button>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default AdminDashboard;
