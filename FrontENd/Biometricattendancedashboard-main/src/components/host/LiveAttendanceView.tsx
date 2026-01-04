import { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, UserCheck, UserX, Clock, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';

interface EventOption {
  id: number;
  title: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed';
  subject_name?: string;
}

interface AttendanceHit {
  id: string;
  student: string;
  status: 'Present' | 'Late' | 'Absent';
  confidence: number;
  time: string;
}

export function LiveAttendanceView() {
  const [cameraActive, setCameraActive] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [hits, setHits] = useState<AttendanceHit[]>([]);
  const [isSending, setIsSending] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listEvents();
        setEvents((data || []).filter((e: any) => e.status !== 'Completed'));
      } catch (err: any) {
        toast.error((err && err.message) || 'Failed to load events');
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (cameraActive) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 960, height: 540 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast.error('Unable to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureAndSend = async () => {
    if (!selectedEvent) {
      toast.error('Select an event first');
      return;
    }
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setIsSending(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsSending(false);
        toast.error('Failed to capture frame');
        return;
      }
      try {
        const res = await api.markAttendance(selectedEvent, blob);
        if (res?.success) {
          const record: AttendanceHit = {
            id: String(res.record_id || Date.now()),
            student: res.student,
            status: res.status,
            confidence: res.confidence,
            time: new Date().toLocaleTimeString(),
          };
          setHits((prev) => [record, ...prev].slice(0, 30));
          toast.success(`${res.student} ${res.status} (${res.confidence}% )`);
        } else {
          toast.info(res?.message || 'No match');
        }
      } catch (err: any) {
        const msg = (err && err.message) || 'Mark failed';
        toast.error(String(msg));
      } finally {
        setIsSending(false);
      }
    }, 'image/jpeg');
  };

  const presentCount = hits.filter((h) => h.status === 'Present').length;
  const lateCount = hits.filter((h) => h.status === 'Late').length;
  const absentCount = hits.filter((h) => h.status === 'Absent').length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-slate-900 text-3xl mb-1">Live Attendance</h1>
          <p className="text-slate-600">Select an ongoing event, start camera, and capture frames to mark attendance.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Select event</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.subject_name || 'Subject'}) - {e.status}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              cameraActive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {cameraActive ? <><VideoOff className="w-4 h-4" /> Stop Camera</> : <><Video className="w-4 h-4" /> Start Camera</>}
          </button>
          <button
            onClick={captureAndSend}
            disabled={!cameraActive || isSending || !selectedEvent}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Capture & Mark
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Present</span>
          </div>
          <p className="text-3xl text-slate-900">{presentCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-slate-600">Late</span>
          </div>
          <p className="text-3xl text-slate-900">{lateCount}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-slate-600">Absent</span>
          </div>
          <p className="text-3xl text-slate-900">{absentCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-xl">Camera Feed</h2>
          </div>

          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          {cameraActive && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 mb-1">Capture frames to mark attendance</p>
                  <p className="text-xs text-blue-700">Event must be Ongoing to record as Present/Late.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-xl">Latest Records</h2>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setHits([])}
            >
              <Download className="w-4 h-4" />
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {hits.length === 0 && (
              <div className="p-4 text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
                Capture a frame to see matches.
              </div>
            )}
            {hits.map((record) => (
              <div key={record.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-slate-900">{record.student}</p>
                    <p className="text-xs text-slate-500">{record.time}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      record.status === 'Present'
                        ? 'bg-green-100 text-green-700'
                        : record.status === 'Late'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>Confidence: {record.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}