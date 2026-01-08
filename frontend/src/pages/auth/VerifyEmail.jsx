import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Missing verification token.');
            return;
        }

        const verify = async () => {
            try {
                setStatus('loading');
                await api.post('/auth/verify-email/', { token });
                setStatus('success');
                setMessage('Email verified successfully. You can now log in.');
            } catch (err) {
                setStatus('error');
                const apiMsg = err.response?.data?.message;
                setMessage(apiMsg || 'Verification failed. Please request a new link.');
            }
        };

        verify();
    }, [searchParams]);

    const icon = {
        idle: <Mail className="w-10 h-10 text-primary" />,
        loading: <Mail className="w-10 h-10 text-primary animate-pulse" />,
        success: <CheckCircle className="w-10 h-10 text-green-400" />,
        error: <XCircle className="w-10 h-10 text-red-400" />,
    }[status];

    const heading = {
        idle: 'Verifying your email',
        loading: 'Verifying your email',
        success: 'Email verified!',
        error: 'Verification issue',
    }[status];

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface/50 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl text-center max-w-md w-full"
            >
                <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {icon}
                </div>

                <h1 className="text-2xl font-bold font-display mb-2">{heading}</h1>
                <p className="text-gray-400 mb-8">
                    {message || 'Hang tight while we confirm your link…'}
                </p>

                <div className="space-y-4">
                    {status === 'success' && (
                        <Link to="/login" className="block w-full bg-white text-black font-bold py-3 rounded-xl transition-colors">
                            Go to Login
                        </Link>
                    )}
                    {status === 'error' && (
                        <Link to="/signup" className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                            Back to Signup
                        </Link>
                    )}
                    {(status === 'idle' || status === 'loading') && (
                        <div className="text-sm text-gray-500">This will only take a moment…</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
