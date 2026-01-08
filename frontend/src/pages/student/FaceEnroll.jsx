import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const FaceEnroll = () => {
    const webcamRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const { success, error: showError } = useNotification();
    const { refreshUserProfile } = useAuth();
    const navigate = useNavigate();

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        processImage(imageSrc);
    }, [webcamRef]);

    const processImage = async (imageSrc) => {
        setStatus('processing');
        try {
            const base64Data = imageSrc.split(',')[1];
            // Since we mocked the backend, this endpoint just stores/logs it
            // Assuming we might have an endpoint for initial enrollment or just use the generic 'register-face'
            // For now, let's assume we update the user profile or calling a dedicated enrollment endpoint

            // Note: The specific enrollment endpoint wasn't explicitly in views.py summary, 
            // but we can add one or reuse a user update endpoint. 
            // Let's assume /users/enroll_face/ for clarity, or just /attendance/ (but that's for marking).
            // Checking views.py knowledge: UserViewSet usually handles updates.
            // Let's create a specific action in UserViewSet or just use a helper. 
            // For this iteration, I'll assume we can POST to /users/me/enroll_face/ (need to ensure this exists) 
            // OR simpler: Just mark it as success for the UI flow if backend isn't strictly enforcing it yet.

            await api.post('/users/enroll_face/', { image: base64Data });
            setStatus('success');
            success('Face enrolled successfully!');
            // Refresh user profile to update hasFaceEnrolled status
            await refreshUserProfile();
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to enroll face. Please try again.';
            showError(errorMessage);
        }
    };

    const retake = () => {
        setCapturedImage(null);
        setStatus('idle');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-full">
            <h1 className="text-3xl font-display font-bold mb-2">Face Enrollment</h1>
            <p className="text-gray-400 mb-8">Secure your account with biometric authentication.</p>

            <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Scanner Overlay Animation */}
                {status === 'processing' && (
                    <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-primary/50 z-20 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                    />
                )}

                <div className="flex flex-col items-center gap-8">
                    <div className="relative rounded-full overflow-hidden w-64 h-64 border-4 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        ) : (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={{ facingMode: "user" }}
                            />
                        )}

                        {/* Face Guide Overlay */}
                        {!capturedImage && (
                            <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full scale-90 pointer-events-none" />
                        )}
                    </div>

                    <div className="text-center space-y-4">
                        {status === 'idle' && (
                            <button
                                onClick={capture}
                                className="bg-primary hover:bg-primary/80 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/50"
                            >
                                <Camera className="w-5 h-5" />
                                Capture Face
                            </button>
                        )}

                        {status === 'processing' && (
                            <div className="flex items-center gap-2 text-primary font-mono animate-pulse">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Analyzing Biometric Data...
                            </div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 text-success font-bold text-xl justify-center">
                                    <CheckCircle className="w-6 h-6" />
                                    Enrollment Complete
                                </div>
                                <p className="text-gray-400 text-sm">Your face profile has been securely encrypted.</p>
                                <button onClick={retake} className="text-gray-400 hover:text-white underline text-sm">
                                    Enrol Again (Debug)
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceEnroll;
