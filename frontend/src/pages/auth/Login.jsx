import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const [twoFA, setTwoFA] = useState({ required: false, challengeId: null, method: 'totp', code: '' });
    const [submitting, setSubmitting] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const { login, verify2FA } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const username = formData.username.trim();
        const password = formData.password;
        if (!username || !password) {
            setError('Username and password are required');
            setSubmitting(false);
            return;
        }
        const result = await login(username, password);
        if (result.success) {
            if (result.role === 'host') {
                navigate('/host/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } else if (result.twoFARequired) {
            setTwoFA({ required: true, challengeId: result.challengeId, method: result.method || 'totp', code: '' });
        } else {
            setError(result.message);
        }
        setSubmitting(false);
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError(null);
        setVerifying(true);
        const code = (twoFA.code || '').trim();
        if (!code) {
            setError('Enter the 6-digit code');
            setVerifying(false);
            return;
        }
        const res = await verify2FA(twoFA.challengeId, code);
        if (res.success) {
            if (res.role === 'host') {
                navigate('/host/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } else {
            setError(res.message);
        }
        setVerifying(false);
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
                className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-xl z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">Sign in to access your BioAttend portal</p>
                </div>

                {!twoFA.required && (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800 text-sm mb-6 shadow-sm"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 ml-1">Username</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="username"
                                    type="text"
                                    placeholder="username"
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-10 py-3 text-tertiary placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-10 py-3 text-tertiary placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(115,92,221,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                )}

                {twoFA.required && (
                    <form className="space-y-6" onSubmit={handleVerify2FA}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800 text-sm mb-6 shadow-sm"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-600 ml-1">Two-Factor Code</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="123456"
                                    value={twoFA.code}
                                    onChange={(e) => setTwoFA({ ...twoFA, code: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-10 py-3 text-tertiary placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm tracking-widest"
                                />
                            </div>
                            <p className="text-xs text-gray-500 ml-1">Enter the 6-digit code from your authenticator app.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={verifying}
                            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(115,92,221,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span>{verifying ? 'Verifying...' : 'Verify & Sign In'}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                )}

                {!twoFA.required && (
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?
                        <Link to="/signup" className="text-primary hover:text-tertiary font-medium ml-1 transition-colors">
                            Sign Up
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
