import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BarChart3, Users, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
    const { isDark, toggleTheme } = useTheme();

    const features = [
        {
            icon: Shield,
            title: "Facial Recognition",
            description: "Secure biometric authentication using advanced face recognition technology",
            image: "face_recognition_feature_1767905719176.png"
        },
        {
            icon: Zap,
            title: "Live Tracking",
            description: "Real-time attendance monitoring with instant notifications and updates",
            image: "live_tracking_feature_1767905740072.png"
        },
        {
            icon: BarChart3,
            title: "Analytics & Reports",
            description: "Comprehensive attendance analytics and exportable reports for insights",
            image: "reports_analytics_feature_1767905763674.png"
        }
    ];

    return (
        <div className="min-h-screen bg-background dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="/favicon.png" alt="MAHS Logo" className="w-8 h-8" />
                        <h1 className="text-2xl font-display font-bold text-primary">MAHS</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/signup"
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold transition-all hidden sm:block"
                        >
                            Get Started
                        </Link>
                        <Link
                            to="/login"
                            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-bold transition-all"
                        >
                            Login
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-primary" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6">
                                MAHS Attendance System
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                Modern biometric attendance management powered by facial recognition.
                                Streamline your attendance tracking with cutting-edge technology.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/signup"
                                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary/30"
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold text-lg transition-all"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <img
                                src={`/mahs_hero_image_1767905701335.png`}
                                alt="MAHS Attendance System"
                                className="rounded-2xl shadow-2xl w-full"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Everything you need for modern attendance management
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-background dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-all group"
                            >
                                <div className="mb-6 flex justify-center">
                                    <img
                                        src={`/${feature.image}`}
                                        alt={feature.title}
                                        className="w-48 h-48 object-contain"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {[
                            { value: "99.9%", label: "Recognition Accuracy" },
                            { value: "<1s", label: "Average Check-in Time" },
                            { value: "24/7", label: "System Availability" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="text-5xl font-display font-bold text-primary mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 text-lg">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-secondary">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-display font-bold text-white mb-6">
                            Ready to modernize your attendance?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join schools using MAHS for seamless attendance management
                        </p>
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                        >
                            Start Free Trial
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
                    <p>© 2026 MAHS Attendance System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
