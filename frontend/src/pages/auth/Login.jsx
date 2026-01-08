import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await login(formData.username, formData.password);
        if (result.success) {
            if (result.role === 'host') {
                navigate('/host/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-surface/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to access your BioAttend portal</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Username</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                name="username"
                                type="text"
                                placeholder="username"
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {/* FORGOT PASSWORD DISABLED - Email service not configured */}
                        {/* <div className="flex justify-end">
                            <Link to="/forgot-password" class="text-xs text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div> */}
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                        <span>Sign In</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?
                    <Link to="/signup" className="text-white hover:text-primary font-medium ml-1 transition-colors">
                        Sign Up
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
