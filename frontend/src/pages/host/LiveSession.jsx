import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Users, Video, StopCircle } from 'lucide-react';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const HostLiveSession = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const { success, error: showError, info: showInfo } = useNotification();

    // State
    const [isSessionActive, setIsSessionActive] = useState(true);
    const [attendees, setAttendees] = useState([]); // List of marked students in this session
    const [lastScanResult, setLastScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const eventId = location.state?.eventId;
    const eventName = location.state?.eventName || 'Live Session';

    // Cleanup on unmount (ensure session ends)
    useEffect(() => {
        return () => {
            if (isSessionActive) {
                // Ideally warn user or auto-end, but strict unmount might be navigating away
            }
        };
    }, [isSessionActive]);

    const handleEndSession = async () => {
        try {
            await api.post(`/events/${eventId}/end_session/`);
            setIsSessionActive(false);
            success("Session ended successfully");
            navigate('/host/dashboard');
        } catch (error) {
            console.error("Failed to end session", error);
            showError("Failed to end session properly");
        }
    };

    const captureAndRecognize = useCallback(async () => {
        if (!webcamRef.current || !isSessionActive || isScanning) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setIsScanning(true);
        try {
            const response = await api.post('/attendance/batch_recognize/', {
                event_id: eventId,
                image: imageSrc
            });

            const { matches_count, results } = response.data;

            if (matches_count > 0) {
                const newAttendees = results.filter(r => r.status === 'marked').map(r => r.student);
                if (newAttendees.length > 0) {
                    showInfo(`Marked: ${newAttendees.join(', ')}`);
                    setAttendees(prev => [...new Set([...prev, ...newAttendees])]);
                }
                setLastScanResult(`Scanned: ${matches_count} faces found.`);
            }
        } catch (error) {
            console.error("Recognition failed", error);
        } finally {
            setIsScanning(false);
        }
    }, [eventId, isSessionActive, isScanning, showInfo]);

    // Timer for auto-scan every 3 seconds
    useEffect(() => {
        let interval;
        if (isSessionActive) {
            interval = setInterval(captureAndRecognize, 3000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, captureAndRecognize]);

    if (!eventId) {
        return <div className="p-10 text-center">Invalid session parameters. <button onClick={() => navigate('/host/dashboard')}>Go Back</button></div>;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500 animate-pulse w-3 h-3 rounded-full" />
                    <div>
                        <h1 className="font-bold text-xl">{eventName}</h1>
                        <p className="text-gray-400 text-sm">Live Attendance Session</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-gray-300" />
                        <span className="font-mono">{attendees.length} Marked</span>
                    </div>
                    <button
                        onClick={handleEndSession}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                    >
                        <StopCircle className="w-5 h-5" />
                        End Session
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex relative">
                {/* Camera Feed */}
                <div className="flex-1 relaitve bg-black flex items-center justify-center">
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-contain"
                        videoConstraints={{
                            facingMode: "environment"
                        }}
                    />

                    {/* Overlay Scanning Animation */}
                    {isScanning && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-4 border-primary/50 rounded-lg animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Sidebar / Recent Activity */}
                <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 flex flex-col">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-400" />
                        Real-time Feed
                    </h2>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        <AnimatePresence>
                            {attendees.slice().reverse().map((name, i) => (
                                <motion.div
                                    key={`${name}-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gray-700 p-3 rounded-lg border-l-4 border-green-500"
                                >
                                    <p className="font-bold">{name}</p>
                                    <p className="text-xs text-gray-400">Marked Present</p>
                                </motion.div>
                            ))}
                            {attendees.length === 0 && (
                                <p className="text-gray-500 text-center italic mt-10">
                                    Waiting for students...
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostLiveSession;
