import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, TrendingUp, Calendar } from 'lucide-react';

const attendanceData = [
  { date: 'Jan 1', present: 38, late: 3, absent: 1 },
  { date: 'Jan 2', present: 40, late: 1, absent: 1 },
  { date: 'Jan 3', present: 35, late: 5, absent: 2 },
  { date: 'Jan 4', present: 39, late: 2, absent: 1 },
  { date: 'Jan 5', present: 37, late: 4, absent: 1 },
];

const subjectStats = [
  { subject: 'CS401', avgAttendance: 92, totalEvents: 12, enrolled: 42 },
  { subject: 'CS302', avgAttendance: 87, totalEvents: 10, enrolled: 35 },
  { subject: 'CS205', avgAttendance: 94, totalEvents: 15, enrolled: 48 },
];

export function ReportsView() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const handleDownload = (format: 'csv' | 'pdf') => {
    // Simulated download
    alert(`Downloading report as ${format.toUpperCase()}...`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900 text-3xl mb-2">Reports & Analytics</h1>
          <p className="text-slate-600">Attendance trends and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
          <button
            onClick={() => handleDownload('csv')}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Average Attendance</span>
          </div>
          <p className="text-3xl text-slate-900 mb-1">91.2%</p>
          <p className="text-xs text-green-600">+2.4% from last week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">Total Events</span>
          </div>
          <p className="text-3xl text-slate-900 mb-1">37</p>
          <p className="text-xs text-slate-600">Across all subjects</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">Reports Generated</span>
          </div>
          <p className="text-3xl text-slate-900 mb-1">24</p>
          <p className="text-xs text-slate-600">This month</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
        <h2 className="text-slate-900 text-xl mb-4">Attendance Trends</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4, 4, 0, 0]} />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h2 className="text-slate-900 text-xl mb-4">Subject Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm text-slate-600">Subject Code</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Enrolled Students</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Total Events</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Avg. Attendance</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {subjectStats.map((subject) => (
                <tr key={subject.subject} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4 text-slate-900">{subject.subject}</td>
                  <td className="py-4 px-4 text-slate-700">{subject.enrolled}</td>
                  <td className="py-4 px-4 text-slate-700">{subject.totalEvents}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      subject.avgAttendance >= 90
                        ? 'bg-green-100 text-green-700'
                        : subject.avgAttendance >= 75
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {subject.avgAttendance}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${subject.avgAttendance}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
