const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000/api';

function getAuthHeader() {
  const token = localStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string,string> = {
    ...(opts.headers as Record<string,string> || {}),
    ...getAuthHeader(),
  };

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || { status: res.status, message: res.statusText };
    return data;
  } catch (e) {
    throw e;
  }
}

export async function register(payload: { full_name: string; email: string; password: string; role: string }) {
  return request('/users/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  return request('/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function enrollFace(formData: FormData) {
  const headers = getAuthHeader();
  // Let browser set Content-Type for multipart/form-data
  const res = await fetch(API_BASE + '/enrollments/enroll/', {
    method: 'POST',
    headers,
    body: formData,
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || { status: res.status, message: res.statusText };
    return data;
  } catch (e) {
    throw e;
  }
}

export async function listSubjects() {
  return request('/subjects/');
}

export async function createSubject(payload: { name: string; code: string; description?: string }) {
  return request('/subjects/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteSubject(id: string | number) {
  return request(`/subjects/${id}/`, { method: 'DELETE' });
}

export async function listEvents() {
  return request('/events/');
}

export async function createEvent(payload: {
  subject: number;
  title: string;
  event_date: string;
  start_time: string;
  venue?: string;
  late_threshold?: number;
}) {
  return request('/events/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteEvent(id: string | number) {
  return request(`/events/${id}/`, { method: 'DELETE' });
}

export async function startSession(eventId: string | number) {
  return request(`/events/${eventId}/start_session/`, { method: 'POST' });
}

export async function listAttendance() {
  // router registers "attendances" basename
  try {
    return await request('/attendances/');
  } catch {
    // fallback if router was earlier variant
    return request('/attendance/');
  }
}

export async function enrollSubject(subjectId: string | number) {
  // Best-effort: create enrollment without face data (attendee inferred from token)
  return request('/enrollments/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: subjectId }),
  });
}

export default {
  register,
  login,
  enrollFace,
  listSubjects,
  createSubject,
  deleteSubject,
  listEvents,
  createEvent,
  deleteEvent,
  startSession,
  listAttendance,
  enrollSubject,
};
