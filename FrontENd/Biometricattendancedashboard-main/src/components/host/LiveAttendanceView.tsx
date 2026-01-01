import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, UserCheck, UserX, Clock, AlertCircle, Download } from 'lucide-react';

interface DetectedFace {
  id: string;
  name: string;
  status: 'match' | 'unknown';
  timestamp: string;
  position: { x: number; y: number; width: number; height: number };
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentId: string;
  status: 'present' | 'late' | 'absent';
  checkInTime: string | null;
  minutesLate: number;
}

const mockAttendance: AttendanceRecord[] = [
  { id: '1', studentName: 'Emma Rodriguez', studentId: 'STU001', status: 'present', checkInTime: '09:02', minutesLate: 2 },
  { id: '2', studentName: 'James Chen', studentId: 'STU002', status: 'present', checkInTime: '09:05', minutesLate: 5 },
  { id: '3', studentName: 'Sarah Williams', studentId: 'STU003', status: 'late', checkInTime: '09:18', minutesLate: 18 },
  { id: '4', studentName: 'Michael Brown', studentId: 'STU004', status: 'present', checkInTime: '09:01', minutesLate: 1 },
  { id: '5', studentName: 'Lisa Anderson', studentId: 'STU005', status: 'absent', checkInTime: null, minutesLate: 0 },
  { id: '6', studentName: 'David Taylor', studentId: 'STU006', status: 'late', checkInTime: '09:20', minutesLate: 20 },
];

export function LiveAttendanceView() {
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (cameraActive) {
      startCamera();
      simulateFaceDetection();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const simulateFaceDetection = () => {
    const interval = setInterval(() => {
      const mockFaces: DetectedFace[] = [
        {
          id: '1',
          name: 'Emma Rodriguez',
          status: 'match',
          timestamp: new Date().toISOString(),
          position: { x: 180, y: 120, width: 160, height: 200 },
        },
        {
          id: '2',
          name: 'James Chen',
          status: 'match',
          timestamp: new Date().toISOString(),
          position: { x: 480, y: 150, width: 155, height: 195 },
        },
        {
          id: '3',
          name: 'Unknown Person',
          status: 'unknown',
          timestamp: new Date().toISOString(),
          position: { x: 780, y: 140, width: 150, height: 190 },
        },
      ];
      setDetectedFaces(mockFaces);
    }, 3000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (cameraActive && canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawBoundingBoxes = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        detectedFaces.forEach(face => {
          const isMatch = face.status === 'match';
          
          // Draw bounding box
          ctx.strokeStyle = isMatch ? '#10b981' : '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(face.position.x, face.position.y, face.position.width, face.position.height);
          
          // Draw label background
          const labelY = face.position.y - 8;
          const labelText = isMatch ? `✓ ${face.name}` : '✗ Unknown Face';
          ctx.font = '14px Inter, system-ui, sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          
          ctx.fillStyle = isMatch ? '#10b981' : '#ef4444';
          ctx.fillRect(face.position.x, labelY - 24, textWidth + 16, 28);
          
          // Draw label text
          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, face.position.x + 8, labelY - 6);
        });

        requestAnimationFrame(drawBoundingBoxes);
      };

      drawBoundingBoxes();
    }
  }, [detectedFaces, cameraActive]);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles = {
      present: { bg: 'bg-green-100', text: 'text-green-700', icon: UserCheck },
      late: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      absent: { bg: 'bg-red-100', text: 'text-red-700', icon: UserX },
    };

    const style = styles[status];
    const Icon = style.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${style.bg} ${style.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-slate-900 text-3xl mb-2">Live Attendance</h1>
        <p className="text-slate-600">Real-time face recognition attendance monitoring</p>
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
            <span className="text-sm text-slate-600">Late (&gt;15 min)</span>
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
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                cameraActive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {cameraActive ? (
                <>
                  <VideoOff className="w-4 h-4" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Start Camera
                </>
              )}
            </button>
          </div>

          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full"
            />
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
                  <p className="text-sm text-blue-900 mb-1">Face detection active</p>
                  <p className="text-xs text-blue-700">
                    {detectedFaces.length} face(s) detected • Late threshold: 15 minutes
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-xl">Attendance Records</h2>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-slate-900">{record.studentName}</p>
                    <p className="text-xs text-slate-500">{record.studentId}</p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
                {record.checkInTime && (
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>Check-in: {record.checkInTime}</span>
                    {record.minutesLate > 0 && (
                      <span className="text-yellow-700">
                        {record.minutesLate} min late
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}