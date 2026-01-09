import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Bell, Calendar, ChevronRight, AlertTriangle, Zap } from 'lucide-react';

const AutomatedReminders = ({ enrollments = [] }) => {
    const [nextEvent, setNextEvent] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [urgency, setUrgency] = useState('normal'); // normal, upcoming, urgent

    useEffect(() => {
        if (!enrollments.length) return;

        const timer = setInterval(() => {
            const now = new Date();

            // Find next upcoming event
            const upcoming = enrollments
                .map(e => ({ ...e.event, startDate: new Date(`${e.event.date}T${e.event.time}`) }))
                .filter(e => e.startDate > now)
                .sort((a, b) => a.startDate - b.startDate)[0];

            setNextEvent(upcoming);

            if (upcoming) {
                const diff = upcoming.startDate - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

                // Determine Urgency
                if (diff < 1000 * 60 * 10) { // < 10 mins
                    setUrgency('urgent');
                } else if (diff < 1000 * 60 * 60) { // < 1 hour
                    setUrgency('upcoming');
                } else {
                    setUrgency('normal');
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [enrollments]);

    if (!nextEvent) return null;

    const gradients = {
        urgent: 'from-red-500 via-rose-500 to-pink-600',
        upcoming: 'from-amber-400 via-orange-500 to-red-500',
        normal: 'from-blue-500 via-indigo-500 to-violet-600'
    };

    const containerVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const pulseVariants = {
        pulse: {
            scale: [1, 1.02, 1],
            boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0)",
                "0 0 0 10px rgba(239, 68, 68, 0)",
                "0 0 0 0 rgba(239, 68, 68, 0)"
            ],
            transition: {
                duration: 2,
                repeat: Infinity
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full mb-8 relative z-10"
            >
                {/* Background Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${gradients[urgency]} rounded-2xl blur opacity-30 transition-all duration-1000`} />

                <motion.div
                    animate={urgency === 'urgent' ? "pulse" : ""}
                    variants={urgency === 'urgent' ? pulseVariants : {}}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden`}
                >
                    {/* Abstract Decorative Shapes */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-tr from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">

                        {/* Info Section */}
                        <div className="flex items-center gap-5">
                            <div className={`
                                p-4 rounded-2xl bg-gradient-to-br ${gradients[urgency]} text-white shadow-lg
                                ${urgency === 'urgent' ? 'animate-bounce' : ''}
                            `}>
                                {urgency === 'urgent' ? <Zap className="w-8 h-8" /> :
                                    urgency === 'upcoming' ? <Bell className="w-8 h-8" /> :
                                        <Calendar className="w-8 h-8" />}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                                        ${urgency === 'urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
                                            urgency === 'upcoming' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' :
                                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'}
                                    `}>
                                        {urgency === 'urgent' ? 'Starting Soon' :
                                            urgency === 'upcoming' ? 'Up Next' : 'Upcoming'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {nextEvent.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {new Date(`2000-01-01T${nextEvent.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-600">
                                        CODE: {nextEvent.join_code}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timer Section */}
                        <div className="flex flex-col items-end">
                            <p className="text-xs uppercase font-bold text-gray-400 mb-1 tracking-widest">Time Remaining</p>
                            <div className="flex items-baseline gap-1 font-mono">
                                {timeLeft.split(':').map((unit, i) => (
                                    <React.Fragment key={i}>
                                        <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 min-w-[3.5rem] text-center shadow-inner">
                                            <span className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-b ${gradients[urgency]}`}>
                                                {unit}
                                            </span>
                                        </div>
                                        {i < 2 && <span className="text-2xl font-bold text-gray-300 dark:text-gray-600 animate-pulse">:</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Progress Bar (Only for < 1 hour) */}
                    {urgency !== 'normal' && (
                        <div className="mt-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: (typeof nextEvent.startDate === 'object' ? (nextEvent.startDate - new Date()) / 1000 : 60), ease: "linear" }} // Approximate progress visual
                                className={`h-full bg-gradient-to-r ${gradients[urgency]}`}
                            />
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AutomatedReminders;
