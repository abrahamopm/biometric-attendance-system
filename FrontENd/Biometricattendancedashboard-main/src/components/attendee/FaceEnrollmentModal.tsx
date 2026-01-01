import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';

interface FaceEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaceEnrollmentModal({ isOpen, onClose }: FaceEnrollmentModalProps) {
  const [step, setStep] = useState(1);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'success'>('idle');
  const [captures, setCaptures] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (step === 2 && cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCaptureStatus('capturing');
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setCaptures([...captures, imageData]);
      
      setTimeout(() => {
        setCaptureStatus('success');
        setTimeout(() => {
          setCaptureStatus('idle');
          if (captures.length >= 2) {
            setStep(3);
          }
        }, 1000);
      }, 500);
    }
  };

  const handleComplete = () => {
    (async () => {
      try {
        if (captures.length === 0) {
          toast.error('No captures to upload');
          return;
        }

        // Find subject id from localStorage or ask user
        let subjectId = localStorage.getItem('subject_id');
        if (!subjectId) {
          subjectId = window.prompt('Enter subject id to enroll into (numeric id):');
        }
        if (!subjectId) {
          toast.error('Subject id required to enroll');
          return;
        }

        // Convert first capture dataURL to blob and upload
        const dataUrl = captures[0];
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'capture.jpg', { type: blob.type });
        const form = new FormData();
        form.append('image', file);
        form.append('subject_id', String(subjectId));

        await api.enrollFace(form);
        toast.success('Face enrollment uploaded successfully!');
        onClose();
      } catch (err: any) {
        const msg = (err && err.detail) || (err && err.message) || 'Upload failed';
        toast.error(String(msg));
      } finally {
        // Reset state
        setStep(1);
        setCaptures([]);
        setCameraActive(false);
      }
    })();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
    setStep(1);
    setCaptures([]);
    setCameraActive(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl mb-2">Face Enrollment</h2>
          <p className="text-sm text-white/80">Complete these steps to enroll your face data</p>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all ${
                  i <= step ? 'bg-white' : 'bg-white/30'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Guidelines */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl text-slate-900 dark:text-white mb-2">Before We Start</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Please follow these guidelines for best results
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 space-y-4">
                {[
                  'Position your face in the center of the frame',
                  'Ensure good lighting from the front',
                  'Remove glasses and face coverings if possible',
                  'Look directly at the camera',
                  'Maintain a neutral expression',
                  'We\'ll capture 3 photos from different angles'
                ].map((guideline, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300">{guideline}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep(2);
                  setCameraActive(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Capture */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-2xl text-slate-900 dark:text-white mb-2">Capture Your Face</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Photo {captures.length + 1} of 3
                </p>
              </div>

              <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Face Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-64 h-80 border-4 border-indigo-400 rounded-full opacity-40"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-400 rounded-tl-3xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-400 rounded-tr-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-400 rounded-bl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-400 rounded-br-3xl"></div>
                  </div>
                </div>

                {/* Capture Flash */}
                {captureStatus === 'capturing' && (
                  <div className="absolute inset-0 bg-white animate-pulse"></div>
                )}

                {/* Success Indicator */}
                {captureStatus === 'success' && (
                  <div className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center">
                    <CheckCircle className="w-20 h-20 text-white" />
                  </div>
                )}
              </div>

              {/* Captured Photos Preview */}
              {captures.length > 0 && (
                <div className="flex gap-3 justify-center">
                  {captures.map((capture, idx) => (
                    <div key={idx} className="relative">
                      <img src={capture} alt={`Capture ${idx + 1}`} className="w-20 h-20 rounded-lg object-cover border-2 border-emerald-500" />
                      <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-emerald-500 bg-white rounded-full" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setCameraActive(false);
                  }}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={captureStatus !== 'idle'}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {captures.length >= 2 ? 'Capture Final Photo' : `Capture Photo ${captures.length + 1}`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl text-slate-900 dark:text-white mb-2">Review Your Photos</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Make sure all photos are clear and well-lit
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {captures.map((capture, idx) => (
                  <div key={idx} className="relative group">
                    <img src={capture} alt={`Capture ${idx + 1}`} className="w-full aspect-square rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm">Photo {idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-300">
                    <p>Your facial data will be encrypted and stored securely. You can delete this data at any time from your privacy settings.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(2);
                    setCaptures([]);
                    setCameraActive(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retake
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Complete Enrollment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
