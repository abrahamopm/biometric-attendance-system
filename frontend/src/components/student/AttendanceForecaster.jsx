import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Activity } from 'lucide-react';

const AttendanceForecaster = ({ history = [] }) => {
    const stats = useMemo(() => {
        if (!history || history.length === 0) return null;

        const totalSessions = history.length;
        const presentSessions = history.filter(h => h.status === 'present' || h.status === 'late').length;
        const currentPercentage = (presentSessions / totalSessions) * 100;
        const THRESHOLD = 75;

        // Calculate safe skips
        let safeSkips = 0;
        if (currentPercentage > THRESHOLD) {
            safeSkips = Math.floor((presentSessions - (THRESHOLD / 100) * totalSessions) / (THRESHOLD / 100));
        }

        const impactOfNextMiss = ((presentSessions / (totalSessions + 1)) * 100).toFixed(1);

        return {
            average: currentPercentage.toFixed(1),
            safeSkips,
            impact: impactOfNextMiss,
            status: currentPercentage >= 85 ? 'excellent' : currentPercentage >= THRESHOLD ? 'good' : 'danger'
        };
    }, [history]);

    // Themes
    const themes = {
        excellent: {
            gradient: "from-emerald-400 via-teal-500 to-cyan-500",
            glow: "shadow-[0_0_30px_rgba(16,185,129,0.5)]",
            text: "text-emerald-400",
            border: "border-emerald-500/30",
            bg: "bg-emerald-950/40"
        },
        good: {
            gradient: "from-blue-400 via-indigo-500 to-violet-500",
            glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
            text: "text-blue-400",
            border: "border-blue-500/30",
            bg: "bg-blue-950/40"
        },
        danger: {
            gradient: "from-rose-400 via-red-500 to-orange-500",
            glow: "shadow-[0_0_30px_rgba(244,63,94,0.5)]",
            text: "text-rose-400",
            border: "border-rose-500/30",
            bg: "bg-rose-950/40"
        }
    };

    if (!stats) return null;
    const theme = themes[stats.status];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br ${theme.gradient} ${theme.glow}`}
        >
            {/* Inner Content Container */}
            <div className="relative h-full bg-gray-900 rounded-[22px] p-6 overflow-hidden">

                {/* Ambient Background Animation */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${theme.gradient} blur-[80px] rounded-full`}
                />

                {/* Header */}
                <div className="relative z-10 flex justify-between items-center mb-8">
                    <div>
                        <motion.div
                            initial={{ x: -20 }}
                            animate={{ x: 0 }}
                            className="flex items-center gap-2 mb-1"
                        >
                            <Zap className={`w-5 h-5 ${theme.text}`} fill="currentColor" />
                            <h2 className="text-lg font-bold text-white tracking-wider">FORECASTER_AI</h2>
                        </motion.div>
                        <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Predictive Analytics Active</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">

                    {/* The Gauge (Left) */}
                    <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Spinning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-dashed border-gray-600/50"
                            />

                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                {/* Track */}
                                <circle
                                    className="text-gray-800 stroke-current"
                                    strokeWidth="8"
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                />
                                {/* Progress */}
                                <motion.circle
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    cx="50" cy="50" r="40"
                                    fill="transparent"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: stats.average / 100 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    strokeDasharray="251.2"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="currentColor" className={stats.status === 'excellent' ? 'text-emerald-400' : stats.status === 'good' ? 'text-blue-400' : 'text-rose-400'} />
                                        <stop offset="100%" stopColor="currentColor" className={stats.status === 'excellent' ? 'text-teal-500' : stats.status === 'good' ? 'text-violet-500' : 'text-orange-500'} />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-2xl font-black text-white tracking-tighter"
                                >
                                    {stats.average}%
                                </motion.span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Status</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats (Right) */}
                    <div className="col-span-1 space-y-3">
                        {/* Safe Skips */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} backdrop-blur-md relative overflow-hidden group`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Safety Margin</p>
                            <div className="flex flex-col">
                                <span className={`text-4xl font-black ${theme.text} leading-none`}>
                                    {stats.safeSkips}
                                </span>
                                <span className="text-xs font-medium text-gray-300 mt-1">
                                    Safe Skips Left
                                </span>
                            </div>
                        </motion.div>

                        {/* Next Impact */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700 backdrop-blur-md"
                        >
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Next Miss Impact</p>
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-rose-500/20">
                                    <TrendingDown className="w-4 h-4 text-rose-400" />
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-white block leading-none">{stats.impact}%</span>
                                    <span className="text-[10px] text-gray-500">New Average</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex gap-3 items-start">
                        <Activity className={`w-5 h-5 ${theme.text} mt-0.5 shrink-0`} />
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                            {stats.status === 'excellent' ? "Performance Optimal. Keep streak alive for Maximum Honors." :
                                stats.status === 'good' ? "Stability Detected. You are within safe operating parameters." :
                                    "CRITICAL WARNING. Attendance levels failing. Immediate action required."}
                        </p>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default AttendanceForecaster;
