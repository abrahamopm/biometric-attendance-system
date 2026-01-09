import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, RefreshCw, AlertCircle, ArrowLeft, Trash2, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';

const FaceEnroll = () => {
    const webcamRef = useRef(null);
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();
    const { refreshUserProfile, user } = useAuth();

    const [status, setStatus] = useState('idle'); // idle, captured, processing, success, error
    const [capturedImage, setCapturedImage] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const handleUserMedia = useCallback(() => {
        setCameraError(null);
    }, []);

    const handleCameraError = useCallback((error) => {
        console.error("Camera error:", error);
        setCameraError("Unable to access camera. Please check permissions.");
    }, []);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
            setStatus('captured');
        } else {
            showError("Failed to capture image. Please try again.");
        }
    }, [webcamRef, showError]);

    const retake = () => {
        setCapturedImage(null);
        setStatus('idle');
    };

    const handleEnroll = async () => {
        if (!capturedImage) return;

        try {
            setStatus('processing');
            // Remove data:image/jpeg;base64, prefix
            const base64Data = capturedImage.split(',')[1];

            await api.post('/users/enroll_face/', {
                image: base64Data
            });

            setStatus('success');
            success('Face enrolled successfully!');
            await refreshUserProfile();

            // Delay redirect to let user see success state
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 2000);

        } catch (error) {
            console.error('Enrollment error:', error);
            setStatus('error');
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to enroll face.';
            showError(errorMessage);
            // Allow retrying
            setTimeout(() => {
                if (status !== 'success') setStatus('captured');
            }, 2000);
        }
    };

    const handleDelete = async () => {
        try {
            setStatus('processing');
            await api.post('/users/reset_face/');
            success('Face data deleted successfully.');
            setCapturedImage(null);
            setStatus('idle');
            await refreshUserProfile();
        } catch (error) {
            console.error(error);
            setStatus('error');
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete face data.';
            showError(errorMessage);
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <div className="min-h-full p-6 flex flex-col items-center justify-center">
            <div className="max-w-4xl w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-display font-bold text-gray-900">Face Enrollment</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Register your face to enable contactless attendance. Ensure you are in a well-lit area and face the camera directly.
                    </p>
                </div>

                {/* Main Camera/Preview Area */}
                <div className="relative max-w-xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-white/20">

                    {/* Camera Feed or Captured Image */}
                    {capturedImage ? (
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                    ) : (
                        !cameraError ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover transform scale-x-[-1]"
                                videoConstraints={{ facingMode: "user" }}
                                onUserMedia={handleUserMedia}
                                onUserMediaError={handleCameraError}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
                                <Camera className="w-12 h-12 text-red-500 mb-4" />
                                <p className="text-lg font-medium">{cameraError}</p>
                            </div>
                        )
                    )}

                    {/* Overlays */}
                    {!capturedImage && !cameraError && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Face Guide Overlay */}
                            <div className="absolute inset-0 border-[3rem] border-black/40 rounded-[45%] translate-y-4 scale-90 opacity-50" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-white/30 rounded-[50%] opacity-70" />

                            {/* Scanning Animation */}
                            <motion.div
                                animate={{ top: ["10%", "90%", "10%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-[10%] w-[80%] h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                            />
                        </div>
                    )}

                    {/* Processing Overlay */}
                    <AnimatePresence>
                        {status === 'processing' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                            >
                                <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
                                <p className="text-white font-medium text-lg">Processing...</p>
                            </motion.div>
                        )}
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-green-500/20 backdrop-blur-md flex flex-col items-center justify-center z-10"
                            >
                                <div className="bg-green-500 text-white p-4 rounded-full mb-4 shadow-lg shadow-green-500/30">
                                    <Check className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-bold text-white shadow-black/20 drop-shadow-md">Verified!</h3>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-4">
                    {status === 'idle' && !cameraError && (
                        <>
                            <button
                                onClick={() => navigate('/student/dashboard')}
                                className="px-6 py-3 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={capture}
                                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center gap-2 transform hover:scale-[1.02] transition-all"
                            >
                                <Camera className="w-5 h-5" />
                                Capture Face
                            </button>
                        </>
                    )}

                    {capturedImage && status !== 'processing' && status !== 'success' && (
                        <>
                            <button
                                onClick={retake}
                                className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retake
                            </button>
                            <button
                                onClick={handleEnroll}
                                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center gap-2 transform hover:scale-[1.02] transition-all"
                            >
                                <Check className="w-5 h-5" />
                                Save Face Data
                            </button>
                        </>
                    )}

                    {cameraError && (
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                    )}
                </div>

                {/* Existing Enrollment Info / Delete Option */}
                {user?.hasFaceEnrolled && (
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Existing Face Data
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Face Data"
                message="Are you sure you want to permanently delete your face data? This action cannot be undone and you will need to re-enroll to mark attendance."
                confirmText="Yes, Delete"
                isDestructive={true}
            />
        </div>
    );
};

export default FaceEnroll;
