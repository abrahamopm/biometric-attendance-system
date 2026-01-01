import { useState } from 'react';
import { Shield, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function PrivacySettingsCard() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteData = () => {
    toast.success('Face data deletion requested. Processing within 24 hours.');
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          <h3 className="text-xl text-slate-900 dark:text-white">Privacy & Data</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <p className="text-slate-900 dark:text-white">Data Protection</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your facial biometric data is encrypted and stored securely. We comply with GDPR and
              industry privacy standards. Data is only used for attendance verification.
            </p>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl">
            <p className="text-xs text-indigo-900 dark:text-indigo-300 mb-2">Your Rights:</p>
            <ul className="text-xs text-indigo-800 dark:text-indigo-400 space-y-1">
              <li>• Access your stored face data</li>
              <li>• Request data deletion at any time</li>
              <li>• Opt-out of biometric attendance</li>
              <li>• Export your attendance records</li>
            </ul>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Face Data
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Deleting your face data will prevent automatic attendance marking. You can re-enroll at
            any time.
          </p>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl text-slate-900 dark:text-white">Confirm Data Deletion</h3>
            </div>

            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Are you sure you want to delete your facial biometric data? This action cannot be
              undone.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-900 dark:text-amber-300 mb-2">Important:</p>
              <ul className="text-xs text-amber-800 dark:text-amber-400 space-y-1">
                <li>• Your attendance history will be preserved</li>
                <li>• You will need to re-enroll for future events</li>
                <li>• Deletion will be completed within 24 hours</li>
                <li>• You will receive a confirmation email</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteData}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
              >
                Delete Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}