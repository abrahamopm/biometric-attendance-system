import { useState } from 'react';
import { Plus, BookOpen, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';

interface EnrollSubjectCardProps {
  enrolledSubjects: { id: number | string; code: string; name: string }[];
  onEnrolled?: (subject: { id: number; code: string; name: string }) => void;
}

export function EnrollSubjectCard({ enrolledSubjects, onEnrolled }: EnrollSubjectCardProps) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollmentCode, setEnrollmentCode] = useState('');

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        // For now, assume code is the subject code; lookup from list if present
        const match = enrolledSubjects.find((s) => s.code.toLowerCase() === enrollmentCode.toLowerCase());
        let subjectId: number | null = null;
        if (match) subjectId = Number(match.id);
        if (!subjectId) {
          // fallback: treat code as numeric id
          const maybeId = Number(enrollmentCode);
          if (!Number.isNaN(maybeId)) subjectId = maybeId;
        }
        if (!subjectId) {
          toast.error('Enter a subject code or id from your instructor');
          return;
        }

        const created = await api.enrollSubject(subjectId);
        if (created?.subject) {
          onEnrolled?.({ id: created.subject, code: enrollmentCode, name: created.subject_name || 'Subject' });
        }
        toast.success('Enrollment requested');
        setEnrollmentCode('');
        setShowEnrollModal(false);
      } catch (err: any) {
        const msg = (err && err.message) || 'Enrollment failed';
        toast.error(String(msg));
      }
    })();
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl text-slate-900 dark:text-white">My Subjects</h3>
          <button
            onClick={() => setShowEnrollModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Enroll
          </button>
        </div>

        <div className="space-y-3">
          {enrolledSubjects.map((subject) => (
            <div
              key={subject.code}
              className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover-lift"
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white">{subject.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{subject.code}</p>
              </div>
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          ))}
        </div>
      </div>

      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-2xl text-slate-900 dark:text-white mb-4">Enroll in Subject</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Enter the unique enrollment code provided by your instructor
            </p>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Enrollment Code</label>
                <input
                  type="text"
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center tracking-wider text-slate-900 dark:text-white"
                  placeholder="CS401-2026-SPRING"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}