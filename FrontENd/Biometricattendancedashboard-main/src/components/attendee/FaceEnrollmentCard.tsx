import { useState } from 'react';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { FaceEnrollmentModal } from './FaceEnrollmentModal';

export function FaceEnrollmentCard() {
  const [showModal, setShowModal] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
        <h3 className="text-xl text-slate-900 dark:text-white mb-4">Face Enrollment</h3>

        {!isEnrolled ? (
          <>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-300">
                  <p className="mb-2">Enroll your face for automatic attendance:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Position your face in the center</li>
                    <li>• Ensure good lighting</li>
                    <li>• Remove glasses if possible</li>
                    <li>• Look directly at camera</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <Camera className="w-5 h-5" />
              Start Enrollment
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-emerald-900 dark:text-emerald-300">Face data enrolled</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">Ready for attendance</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Update Face Data
            </button>
          </div>
        )}
      </div>

      <FaceEnrollmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onEnrolled={() => setIsEnrolled(true)}
      />
    </>
  );
}