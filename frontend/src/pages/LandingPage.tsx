import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Menu, 
    X, 
    CheckCircle, 
    Shield, 
    Zap, 
    BarChart3, 
    Users,
    ArrowRight,
    Star,
    Building2,
    GraduationCap,
    Briefcase,
    Check,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

    const features = [
        { icon: Shield, title: 'Secure Recognition', description: 'Advanced facial recognition with 99.9% accuracy and anti-spoofing protection.', color: 'blue' },
        { icon: Zap, title: 'Instant Check-in', description: 'Mark attendance in under 2 seconds with real-time verification.', color: 'yellow' },
        { icon: BarChart3, title: 'Smart Analytics', description: 'Comprehensive reports and insights with one-click CSV export.', color: 'green' },
        { icon: Users, title: 'Multi-Role Access', description: 'Separate dashboards for administrators and students with role-based permissions.', color: 'purple' }
    ];

    const stats = [
        { value: '99.9%', label: 'Accuracy Rate' },
        { value: '<2s', label: 'Check-in Time' },
        { value: '10K+', label: 'Daily Scans' },
        { value: '24/7', label: 'System Uptime' }
    ];

    const steps = [
        { step: '01', title: 'Create Account', description: 'Sign up as a student or host in seconds' },
        { step: '02', title: 'Enroll Face', description: 'Quick one-time facial data registration' },
        { step: '03', title: 'Start Scanning', description: 'Mark attendance with just a glance' }
    ];

    const useCases = [
        { icon: GraduationCap, title: 'Educational Institutions', description: 'Track student attendance across classes, exams, and events effortlessly.' },
        { icon: Building2, title: 'Corporate Offices', description: 'Streamline employee check-ins and generate accurate payroll reports.' },
        { icon: Briefcase, title: 'Events & Conferences', description: 'Manage attendee registration and track participation in real-time.' }
    ];

    const pricingPlans = [
        { name: 'Starter', price: 'Free', period: 'forever', description: 'Perfect for small teams', features: ['Up to 50 users', 'Basic face recognition', 'Email support', '7-day data retention'], highlighted: false },
        { name: 'Professional', price: '$29', period: '/month', description: 'For growing organizations', features: ['Up to 500 users', 'Advanced analytics', 'CSV export', 'Priority support', '1-year data retention'], highlighted: true },
        { name: 'Enterprise', price: 'Custom', period: '', description: 'For large organizations', features: ['Unlimited users', 'Custom integrations', 'Dedicated support', 'On-premise option', 'Unlimited retention'], highlighted: false }
    ];

    const faqs = [
        { q: 'How accurate is the facial recognition?', a: 'Our system achieves 99.9% accuracy using advanced AI algorithms with anti-spoofing measures to prevent photo-based fraud.' },
        { q: 'Is my biometric data secure?', a: 'Yes, all facial data is encrypted and stored securely. We comply with GDPR and other privacy regulations.' },
        { q: 'Can I export attendance reports?', a: 'Absolutely! You can export detailed CSV reports with one click from the Reports section.' },
        { q: 'What devices are supported?', a: 'BioAttend works on any device with a camera - laptops, tablets, and smartphones.' }
    ];

    const testimonials = [
        { name: 'Dr. Sarah Chen', role: 'University Dean', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', text: 'BioAttend transformed our attendance tracking. No more manual roll calls or proxy attendance issues.' },
        { name: 'Michael Roberts', role: 'HR Director', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', text: 'The reporting features save us hours every week. Highly recommend for any organization.' },
        { name: 'Emily Watson', role: 'School Principal', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', text: 'Parents love the transparency. They get notified instantly when their child checks in.' }
    ];

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900">BioAttend</span>
                        </Link>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">Features</a>
                            <a href="#use-cases" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">Use Cases</a>
                            <a href="#pricing" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">Pricing</a>
                            <a href="#contact" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">Contact</a>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <Link to="/login" className="px-5 py-2.5 text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Sign In</Link>
                            <Link to="/signup" className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-secondary transition-all shadow-lg shadow-primary/20">Get Started Free</Link>
                        </div>

                        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden pt-4 pb-6 border-t border-gray-100 mt-4">
                            <div className="flex flex-col gap-4">
                                <a href="#features" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                                <a href="#use-cases" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
                                <a href="#pricing" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                                <a href="#contact" className="text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                    <Link to="/login" className="text-center py-2.5 text-gray-700 font-medium">Sign In</Link>
                                    <Link to="/signup" className="text-center py-2.5 bg-primary text-white rounded-xl font-semibold">Get Started Free</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-28 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Attendance Made
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> Effortless</span>
                            </h1>
                            
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Transform your attendance tracking with AI-powered facial recognition. 
                                Fast, secure, and accurate — no more manual roll calls or buddy punching.
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mb-10">
                                <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
                                    Start Free Trial <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                                    Learn More
                                </a>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
                                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
                                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
                                      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
                                    ].map((img, i) => (
                                        <img key={i} src={img} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <p className="text-sm text-gray-500">4.9/5 from 200+ reviews</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
                            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-2 shadow-2xl">
                                <div className="bg-gray-900 rounded-2xl overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="bg-gray-700 rounded-lg px-4 py-1.5 text-xs text-gray-400 text-center">bioattend.app/dashboard</div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            {[{ label: 'Present', value: '1,234', color: 'green' }, { label: 'Late', value: '45', color: 'yellow' }, { label: 'Absent', value: '12', color: 'red' }].map((stat, i) => (
                                                <div key={i} className="bg-gray-800 rounded-xl p-3">
                                                    <p className="text-gray-400 text-xs">{stat.label}</p>
                                                    <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gray-800 rounded-xl p-4">
                                            <div className="flex items-end justify-between h-24 gap-2">
                                                {[65, 80, 45, 90, 70, 85, 60].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-primary/80 rounded-t" style={{ height: `${h}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                                                <div className="w-10 h-10 border-2 border-white/50 rounded-lg"></div>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Face Scan Active</p>
                                                <p className="text-green-400 text-sm flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>Ready to scan
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Verified</p>
                                        <p className="text-xs text-gray-500">John D. checked in</p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Today's Attendance</p>
                                <p className="text-2xl font-bold text-gray-900">98.5%</p>
                                <p className="text-xs text-green-600">↑ 2.3% from yesterday</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Purple Stripe Banner */}
            <section className="bg-primary py-6">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-white">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6" />
                            <span className="font-medium">Enterprise Security</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6" />
                            <span className="font-medium">Instant Recognition</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-6 h-6" />
                            <span className="font-medium">Real-time Analytics</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6" />
                            <span className="font-medium">Multi-role Access</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
                                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                                <p className="text-gray-600 font-medium">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">FEATURES</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need for modern attendance</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Powerful features designed to make attendance tracking seamless for organizations of any size.</p>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-gray-200 transition-all group">
                                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Side by Side Section 1 - Face Recognition */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <div className="relative bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl p-8">
                                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=450&fit=crop" alt="Biometric Face Scanning" className="rounded-2xl shadow-xl w-full object-cover" />
                                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Identity Verified</p>
                                            <p className="text-sm text-gray-500">In 1.2 seconds</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">BIOMETRIC SCANNING</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Secure Face Recognition Check-in</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">Simply look at the camera and you're checked in. Our AI-powered system recognizes faces instantly, eliminating the need for cards, PINs, or manual sign-ins.</p>
                            <ul className="space-y-4">
                                {['Anti-spoofing protection against photos & videos', 'Works in various lighting conditions', 'No physical contact required', 'Prevents buddy punching & proxy attendance'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Side by Side Section 2 - Dashboard Analytics */}
            <section className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
                            <p className="text-primary font-semibold mb-3">SMART DASHBOARD</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Complete Attendance Overview</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">Monitor attendance in real-time with our intuitive admin dashboard. View statistics, track patterns, and export detailed reports with a single click.</p>
                            <ul className="space-y-4">
                                {['Real-time attendance monitoring', 'Visual charts & attendance trends', 'One-click CSV report export', 'Role-based access for admins & students'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition-all">
                                Try It Free <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
                            <div className="relative bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl p-8">
                                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=450&fit=crop" alt="Analytics Dashboard on Screen" className="rounded-2xl shadow-xl w-full object-cover" />
                                <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-primary" />
                                        <span className="font-semibold text-gray-900">98.5%</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Today's Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">USE CASES</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for every organization</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">From schools to enterprises, BioAttend adapts to your unique needs.</p>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {useCases.map((useCase, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-background rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                    <useCase.icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-xl mb-3">{useCase.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">HOW IT WORKS</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get started in 3 simple steps</h2>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((item, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15 }} viewport={{ once: true }} className="relative">
                                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 relative z-10">
                                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                                        <span className="text-white font-bold text-xl">{item.step}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xl mb-3">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                                {index < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300 z-0"></div>}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">PRICING</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your organization. Start free, upgrade anytime.</p>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className={`rounded-2xl p-8 ${plan.highlighted ? 'bg-primary text-white ring-4 ring-primary/20 scale-105' : 'bg-background border border-gray-200'}`}>
                                <h3 className={`font-bold text-xl mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-purple-100' : 'text-gray-500'}`}>{plan.description}</p>
                                <div className="mb-6">
                                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                                    <span className={plan.highlighted ? 'text-purple-100' : 'text-gray-500'}>{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <Check className={`w-5 h-5 ${plan.highlighted ? 'text-purple-200' : 'text-green-500'}`} />
                                            <span className={plan.highlighted ? 'text-purple-50' : 'text-gray-600'}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup" className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.highlighted ? 'bg-white text-primary hover:bg-gray-100' : 'bg-white text-gray-900 hover:bg-gray-100'}`}>
                                    Get Started
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">TESTIMONIALS</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by organizations worldwide</h2>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white border border-gray-100 rounded-2xl p-8">
                                <div className="flex items-center gap-1 mb-4">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <p className="text-gray-500 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">FAQ</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
                        </motion.div>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <p className="text-primary font-semibold mb-3">CONTACT US</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in touch</h2>
                            <p className="text-gray-600 mb-8">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">support@bioattend.app</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">123 Tech Street, San Francisco, CA</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input type="text" placeholder="Your name" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input type="email" placeholder="your@email.com" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea rows={4} placeholder="Your message..." value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" />
                                    </div>
                                    <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-secondary transition-all">
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to modernize your attendance?</h2>
                            <p className="text-purple-100 mb-8 max-w-xl mx-auto">Join hundreds of organizations already using BioAttend. Start your free trial today.</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-gray-100 transition-all">
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-tertiary">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold">B</span>
                                </div>
                                <span className="font-bold text-xl text-white">BioAttend</span>
                            </div>
                            <p className="text-gray-400 text-sm">Modern biometric attendance tracking for the digital age.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">© 2026 BioAttend. All rights reserved.</p>
                        <div className="flex gap-6 text-gray-500 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
