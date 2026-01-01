import { useEffect, useState } from 'react';
import { Plus, BookOpen, Users, Code, Trash2, Edit, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
}

const colors = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-fuchsia-600',
];

export function SubjectsView() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.listSubjects();
        setSubjects(data || []);
      } catch (err: any) {
        toast.error((err && err.message) || 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        await api.createSubject({ name: newSubject.name, code: newSubject.code, description: newSubject.description });
        toast.success('Subject created');
        setShowCreateModal(false);
        setNewSubject({ name: '', code: '', description: '' });
        const data = await api.listSubjects();
        setSubjects(data || []);
      } catch (err: any) {
        toast.error((err && err.message) || 'Failed to create subject');
      }
    })();
  };

  const handleDeleteSubject = (id: string, name: string) => {
    (async () => {
      try {
        await api.deleteSubject(id);
        toast.success(`${name} deleted`);
        setSubjects(subjects.filter(s => String(s.id) !== id));
      } catch (err: any) {
        toast.error((err && err.message) || 'Delete failed');
      }
    })();
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl text-slate-900 dark:text-white mb-2">Subjects</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your courses and enrollment</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Subject
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search subjects by name or code..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>

      {/* Subject Cards Grid */}
      {loading ? (
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading subjects...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSubjects.map((subject, idx) => (
            <div
              key={subject.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover-lift shadow-lg"
            >
              {/* Color Header */}
              <div className={`h-2 bg-gradient-to-r ${colors[idx % colors.length]}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-3 bg-gradient-to-br ${colors[idx % colors.length]} rounded-xl`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl text-slate-900 dark:text-white">{subject.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Code className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{subject.code}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                      {subject.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Created {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button className="p-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(String(subject.id), subject.name)}
                    className="p-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-3xl text-slate-900 dark:text-white mb-6">Create New Subject</h2>
            <form onSubmit={handleCreateSubject} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  placeholder="Advanced Web Development"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Subject Code</label>
                <input
                  type="text"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  placeholder="CS401"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Brief description of the subject"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
