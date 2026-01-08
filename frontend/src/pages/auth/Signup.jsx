import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const Signup = () => {
    const [role, setRole] = useState('student'); // 'student' or 'host'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState(null);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { success } = useNotification();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        // Map "Full Name" to "username" for simplicity in this demo, real app splits them
        const result = await signup({ ...formData, role });


        if (result.success) {
            // EMAIL VERIFICATION DISABLED - Redirect directly to login
            success("Account created successfully! Please login.");
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">Join the future of attendance tracking</p>
                </div>

                {/* Role Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-black/40 p-1 rounded-xl flex gap-2 border border-white/5">
                        <button
                            onClick={() => setRole('student')}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${role === 'student' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student
                        </button>
                        <button
                            onClick={() => setRole('host')}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${role === 'host' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Host
                        </button>
                    </div>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                    {error && <div className="md:col-span-2 text-red-500 text-sm text-center">{error}</div>}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Username</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                name="username"
                                type="text"
                                placeholder="Username"
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-gray-400 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-gray-400 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                name="password"
                                type="password"
                                placeholder="Min. 8 characters"
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2">
                            <span>Create Account</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?
                    <Link to="/login" className="text-white hover:text-primary font-medium ml-1 transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
