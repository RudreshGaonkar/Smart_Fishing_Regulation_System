import React from 'react';
import { Activity, Waves, Target, TrendingUp, Info, Download, Calendar } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ResearcherDashboard = () => {
    // Stat Cards Data
    const stats = [
        { title: "Total Harvest", value: "42.8 Tons", change: "+12.5%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
        { title: "Avg. Stock Depletion", value: "18.2%", change: "-2.3%", icon: Waves, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
        { title: "Conservation Target", value: "88%", change: "On Track", icon: Target, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
        { title: "Active Surveys", value: "24", change: "+4 this week", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    ];

    // Line Chart Data: Professional Light Theme (Soft blues, teals)
    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Global Fish Population Index',
                data: [65, 59, 80, 81, 56, 55, 40, 48, 52, 60, 70, 75],
                fill: true,
                borderColor: '#0284c7', // sky-600
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#0284c7',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                bodyFont: {
                    family: "'Inter', sans-serif",
                    weight: '500'
                },
                titleFont: {
                    family: "'Inter', sans-serif",
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
                grid: { color: '#f1f5f9', drawBorder: false }, // slate-100
                ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } }, // slate-500
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } }, // slate-500
                border: { display: false }
            },
        },
    };

    // Bar Chart Data: Professional Light Theme
    const barChartData = {
        labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F'],
        datasets: [
            {
                label: 'Risk Score (0-100)',
                data: [45, 82, 12, 35, 95, 28],
                backgroundColor: (context) => {
                    const value = context.dataset.data[context.dataIndex];
                    return value > 70 ? '#f43f5e' : value > 30 ? '#0ea5e9' : '#10b981'; // rose-500, sky-500, emerald-500
                },
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { family: "'Inter', sans-serif" } },
                border: { display: false }
            },
        },
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
        >
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900 tracking-tight">
                         Researcher Analytics
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Deep Dive into Ecological Metrics & Stock Predictions</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all font-bold transform hover:-translate-y-0.5">
                        Schedule Forecast
                    </button>
                </div>
            </header>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`${stat.bg} ${stat.border} border p-2.5 rounded-xl shadow-sm`}>
                                <stat.icon className={`${stat.color} w-6 h-6`} />
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border shadow-sm ${
                                i === 1 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {/* Line Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Fish Population Trend</h2>
                            <p className="text-sm text-slate-500 font-medium">Monthly ecological index monitoring</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg cursor-help">
                            <Info className="text-slate-400 w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[300px] flex items-center justify-center w-full">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Risk Levels per Zone</h2>
                            <p className="text-sm text-slate-500 font-medium">Current vulnerability assessment</p>
                        </div>
                        <div className="flex gap-3">
                             <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm border border-rose-600"></span>
                                <span className="text-xs font-bold text-slate-500">High</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm border border-sky-600"></span>
                                <span className="text-xs font-bold text-slate-500">Med</span>
                             </div>
                        </div>
                    </div>
                    <div className="h-[300px] flex items-center justify-center w-full">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>
            </div>

            {/* Insights Panel */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm relative overflow-hidden mt-6">
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                <div className="bg-white border border-emerald-100 p-3.5 rounded-xl shadow-sm">
                    <Activity className="text-emerald-600 w-7 h-7" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-emerald-800 mb-1">Key AI Insight</h3>
                    <p className="text-emerald-700 font-medium leading-relaxed">
                        Predicted population recovery of <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black border border-emerald-200">14%</span> in Sector C due to current restriction enforcement.
                        Consider extending safety buffer in adjacent zones next month.
                    </p>
                </div>
                <div>
                   <button className="whitespace-nowrap px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">
                       Apply Recommendation
                   </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ResearcherDashboard;
