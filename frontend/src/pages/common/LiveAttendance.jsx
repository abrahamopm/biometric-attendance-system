import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, UserCheck, XCircle, AlertCircle, ArrowLeft, Loader, CameraOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const LiveAttendance = () => {
    const webcamRef = useRef(null);
    const [scanStatus, setScanStatus] = useState('loading'); // loading, scanning, matched, failed, error, processing
    const [matchedUser, setMatchedUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [eventInfo, setEventInfo] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId, eventName } = location.state || {}; // Expect event info passed
    const { success, error: showError } = useNotification();
    const { user } = useAuth();

    useEffect(() => {
        if (!eventId) {
            showError("No event selected.");
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1000);
            setScanStatus('error');
            setErrorMessage("No event selected. Redirecting to dashboard...");
            return;
        }

        // Fetch event details to validate
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${eventId}/`);
                setEventInfo(response.data);
                setScanStatus('scanning');
            } catch (error) {
                setScanStatus('error');
                setErrorMessage("Failed to load event details.");
            }
        };

        if (user) {
            fetchEventDetails();
        }
    }, [eventId, user, navigate, showError]);

    const captureAndVerify = useCallback(async () => {
        if (!eventId || scanStatus !== 'scanning' || isProcessing) return;

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            console.warn("Could not capture screenshot from webcam");
            return;
        }

        setIsProcessing(true);
        setScanStatus('processing');

        try {
            // Removing data:image/jpeg;base64, prefix
            const base64Data = imageSrc.split(',')[1];

            const response = await api.post('/attendance/mark_live/', {
                event_id: eventId,
                image: base64Data
            });

            setIsProcessing(false);

            if (response.data.status === 'marked') {
                setScanStatus('matched');
                setMatchedUser({
                    name: response.data.student,
                    time: response.data.time,
                    confidence: response.data.confidence
                });
                success(`Attendance marked successfully at ${response.data.time}!`);
                setTimeout(() => {
                    navigate('/student/dashboard');
                }, 3000);
            } else if (response.data.status === 'already_marked') {
                setScanStatus('matched');
                setMatchedUser({
                    name: response.data.student,
                    time: response.data.time
                });
                showError(`Attendance already marked at ${response.data.time}`);
                setTimeout(() => {
                    navigate('/student/dashboard');
                }, 3000);
            } else if (response.data.status === 'failed') {
                // Face not recognized - keep scanning but don't spam notifications
                setScanStatus('scanning');
            }
        } catch (error) {
            setIsProcessing(false);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'An error occurred';

            // Handle specific error cases
            if (errorMsg.includes('not enrolled')) {
                setScanStatus('error');
                setErrorMessage("Please enroll your face first.");
            } else if (errorMsg.includes('not started') || errorMsg.includes('ended') || errorMsg.includes('grace period')) {
                setScanStatus('error');
                setErrorMessage(errorMsg);
            } else if (errorMsg.includes('not recognized') || errorMsg.includes('Face not recognized')) {
                // Keep scanning - don't show error for recognition failures
                // This is normal during scanning
                setScanStatus('scanning');
                console.log("Face not recognized, continuing scan...");
            } else {
                // Other errors - show but keep scanning
                console.error("Attendance marking error:", errorMsg);
                setScanStatus('scanning');
            }
        }
    }, [eventId, scanStatus, isProcessing, navigate, success, showError]);

    useEffect(() => {
        if (scanStatus === 'scanning' && eventInfo) {
            const interval = setInterval(() => {
                captureAndVerify();
            }, 3000); // Check every 3 seconds
            return () => clearInterval(interval);
        }
    }, [scanStatus, eventInfo, captureAndVerify]);

    const handleCameraError = useCallback((error) => {
        console.error("Camera error:", error);
        setCameraError("Camera access denied or unavailable. Please check your camera permissions.");
        setScanStatus('error');
        setErrorMessage("Camera is not available. Please grant camera permissions and refresh.");
    }, []);

    const handleUserMedia = useCallback(() => {
        // Camera successfully accessed
        setCameraError(null);
        setCameraReady(true);
    }, []);

    // Loading state
    if (scanStatus === 'loading') {
        return (
            <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center relative py-8 bg-background">
                <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-400">Loading attendance page...</p>
            </div>
        );
    }

    // Error state
    if (scanStatus === 'error' && errorMessage) {
        return (
            <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center relative py-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface/50 backdrop-blur-md border border-red-500/50 rounded-2xl p-8 max-w-md text-center"
                >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-white">Error</h2>
                    <p className="text-gray-400 mb-6">{errorMessage}</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center relative py-8 bg-background">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-display font-bold mb-2 text-white">Live Attendance Check</h1>
                <p className="text-gray-400">{eventName || eventInfo?.name || 'Unknown Event'}</p>
            </div>

            <div className="relative w-[400px] h-[400px] rounded-[3rem] overflow-hidden border-8 border-gray-800 shadow-2xl bg-black">
                {cameraError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 p-6 text-center z-10 relative">
                        <CameraOff className="w-16 h-16 text-red-500 mb-4" />
                        <p className="text-red-500 font-bold mb-2">Camera Error</p>
                        <p className="text-gray-400 text-sm">{cameraError}</p>
                    </div>
                ) : (
                    <>
                        <Webcam
                            ref={webcamRef}
                            className="w-full h-full object-cover filter brightness-110 contrast-110 bg-black absolute inset-0"
                            videoConstraints={{ facingMode: "user" }}
                            onUserMedia={handleUserMedia}
                            onUserMediaError={handleCameraError}
                            screenshotFormat="image/jpeg"
                        />
                        {/* Initializing Overlay */}
                        {(!cameraReady && scanStatus === 'scanning') && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
                                <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-gray-400">Initializing camera...</p>
                            </div>
                        )}
                    </>
                )}

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corners */}
                    <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary/50 rounded-tl-2xl" />
                    <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary/50 rounded-tr-2xl" />
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary/50 rounded-bl-2xl" />
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary/50 rounded-br-2xl" />

                    {/* Scanning Line */}
                    {scanStatus === 'scanning' && (
                        <motion.div
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-[10%] w-[80%] h-0.5 bg-primary shadow-[0_0_15px_rgba(59,130,246,1)]"
                        />
                    )}

                    {/* Processing Overlay */}
                    <AnimatePresence>
                        {scanStatus === 'processing' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                            >
                                <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-white font-bold">Processing Face Recognition...</p>
                                <p className="text-gray-400 text-sm mt-2">Please wait</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Status Feedback */}
                    <AnimatePresence>
                        {scanStatus === 'matched' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-success/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                            >
                                <div className="bg-success text-white p-4 rounded-full mb-4 shadow-lg shadow-success/30">
                                    <UserCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">Identified</h3>
                                <p className="text-lg font-mono text-white/90">{matchedUser?.name}</p>
                                <p className="text-sm text-white/70">{matchedUser?.time}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <div className="bg-surface px-6 py-3 rounded-xl border border-white/10 flex items-center gap-3">
                    {scanStatus === 'processing' ? (
                        <>
                            <Loader className="w-4 h-4 text-primary animate-spin" />
                            <span className="text-sm font-mono text-gray-400">PROCESSING...</span>
                        </>
                    ) : (
                        <>
                            <div className={`w-2 h-2 rounded-full ${scanStatus === 'scanning' ? 'bg-primary animate-pulse' : scanStatus === 'matched' ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <span className="text-sm font-mono text-gray-400">
                                {scanStatus === 'scanning' ? 'SCANNING...' : scanStatus === 'matched' ? 'SUCCESS' : 'READY'}
                            </span>
                        </>
                    )}
                </div>
                {scanStatus === 'matched' && matchedUser?.confidence && (
                    <p className="text-xs text-gray-500">Confidence: {(matchedUser.confidence * 100).toFixed(1)}%</p>
                )}
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="text-gray-400 hover:text-white text-sm flex items-center gap-2 mt-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default LiveAttendance;
