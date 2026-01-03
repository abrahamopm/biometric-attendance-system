const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000/api';

type RequestOptions = RequestInit & { skipAuth?: boolean };

const ACCESS_KEY = 'access';
const REFRESH_KEY = 'refresh';

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function getAccessToken(): string | null {
  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) return null;

  // Guard against the string values "undefined"/"null" being stored
  const trimmed = token.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    clearTokens();
    return null;
  }
  return trimmed;
}

function getAuthHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path: string, opts: RequestOptions = {}) {
  const { skipAuth, ...rest } = opts;
  const headers: Record<string,string> = {
    ...(rest.headers as Record<string,string> || {}),
    ...(!skipAuth ? getAuthHeader() : {}),
  };

  const res = await fetch(API_BASE + path, { ...rest, headers });
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    // If response is not JSON, keep raw text for debugging
    data = { raw: text };
  }

  if (res.status === 401) {
    const msg = data?.detail || data?.message || text;
    const tokenError = typeof msg === 'string' && msg.toLowerCase().includes('token not valid');
    if (tokenError || data?.code === 'token_not_valid') {
      clearTokens();
    }
  }

  if (!res.ok) {
    throw data || { status: res.status, message: res.statusText };
  }

  return data;
}

export async function register(payload: { full_name: string; email: string; password: string; role: string }) {
  return request('/users/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function login(payload: { email: string; password: string }) {
  return request('/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function getCurrentUser() {
  return request('/users/me/');
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

export async function markAttendance(eventId: string | number, image: Blob) {
  const headers = getAuthHeader();
  const form = new FormData();
  form.append('image', image);
  const res = await fetch(API_BASE + `/events/${eventId}/mark_attendance/`, {
    method: 'POST',
    headers,
    body: form,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw data || { status: res.status, message: res.statusText };
  return data;
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
    body: JSON.stringify({ subject_id: subjectId }),
  });
}

export async function getDashboardMetrics() {
  return request('/metrics/dashboard/');
}

export async function getReportsMetrics(period: 'week' | 'month' | 'semester' = 'week') {
  return request(`/metrics/reports/?period=${period}`);
}

export default {
  register,
  login,
  getCurrentUser,
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
  getDashboardMetrics,
  getReportsMetrics,
};
