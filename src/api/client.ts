import axios, { type InternalAxiosRequestConfig } from "axios";

const API_ROOT = import.meta.env.VITE_API_ROOT || "https://fitopiaapi.pythonanywhere.com/api";

export const api = axios.create({
  baseURL: API_ROOT,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("coach_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("coach_refresh");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_ROOT}/token/refresh/`, { refresh });
          localStorage.setItem("coach_access", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("coach_access");
          localStorage.removeItem("coach_refresh");
          window.dispatchEvent(new Event("coach:auth-expired"));
        }
      } else {
        window.dispatchEvent(new Event("coach:auth-expired"));
      }
    }
    const d = error.response?.data;
    const msg =
      d?.detail || d?.message ||
      (typeof d === "string" ? d : null) ||
      (d && typeof d === "object"
        ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        : null) ||
      error.message || "خطای ارتباط با سرور";
    return Promise.reject(new Error(typeof msg === "string" ? msg : JSON.stringify(msg)));
  },
);

type Body = Record<string, unknown> | FormData;
const fd = (body: Body) =>
  body instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" as const } } : {};

export const coachApi = {
  me: (gymId?: number) =>
    api.get("/coach-panel/me/", { params: gymId ? { gym_id: gymId } : undefined }).then((r) => r.data),
  updateMe: (body: Body, gymId?: number) =>
    api.patch("/coach-panel/me/", body, { params: gymId ? { gym_id: gymId } : undefined, ...fd(body) }).then((r) => r.data),
  students: (gymId: number, active?: boolean) =>
    api.get(`/coach-panel/gyms/${gymId}/students/`, { params: active ? { active: 1 } : undefined }).then((r) => r.data),
  student: (gymId: number, pk: number) =>
    api.get(`/coach-panel/gyms/${gymId}/students/${pk}/`).then((r) => r.data),
  createStudent: (gymId: number, body: Body) =>
    api.post(`/coach-panel/gyms/${gymId}/students/`, body, fd(body)).then((r) => r.data),
  updateStudent: (gymId: number, pk: number, body: Body) =>
    api.patch(`/coach-panel/gyms/${gymId}/students/${pk}/`, body, fd(body)).then((r) => r.data),
  deleteStudent: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/students/${pk}/`),
  exercises: (gymId: number, params?: { muscle_group?: string; q?: string }) =>
    api.get(`/coach-panel/gyms/${gymId}/exercises/`, { params }).then((r) => r.data),
  createExercise: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/exercises/`, body).then((r) => r.data),
  updateExercise: (gymId: number, pk: number, body: Record<string, unknown>) =>
    api.patch(`/coach-panel/gyms/${gymId}/exercises/${pk}/`, body).then((r) => r.data),
  deleteExercise: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/exercises/${pk}/`),
  workouts: (gymId: number, params?: { student_id?: number; from?: string; to?: string }) =>
    api.get(`/coach-panel/gyms/${gymId}/workouts/`, { params }).then((r) => r.data),
  createWorkout: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/workouts/`, body).then((r) => r.data),
  updateWorkout: (gymId: number, pk: number, body: Record<string, unknown>) =>
    api.patch(`/coach-panel/gyms/${gymId}/workouts/${pk}/`, body).then((r) => r.data),
  deleteWorkout: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/workouts/${pk}/`),
  prs: (gymId: number, params?: { student_id?: number; exercise_id?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/prs/`, { params }).then((r) => r.data),
  createPr: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/prs/`, body).then((r) => r.data),
  deletePr: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/prs/${pk}/`),
  progressPhotos: (gymId: number, studentId?: number) =>
    api.get(`/coach-panel/gyms/${gymId}/progress-photos/`, { params: studentId ? { student_id: studentId } : undefined }).then((r) => r.data),
  createProgressPhoto: (gymId: number, form: FormData) =>
    api.post(`/coach-panel/gyms/${gymId}/progress-photos/`, form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteProgressPhoto: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/progress-photos/${pk}/`),
  progress: (gymId: number, studentId: number, days = 90) =>
    api.get(`/coach-panel/gyms/${gymId}/progress/`, { params: { student_id: studentId, days } }).then((r) => r.data),
  training: (gymId: number, params?: { student_id?: number; year?: number; month?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/training/`, { params }).then((r) => r.data),
  createTraining: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/training/`, body).then((r) => r.data),
  updateTraining: (gymId: number, pk: number, body: Record<string, unknown>) =>
    api.patch(`/coach-panel/gyms/${gymId}/training/${pk}/`, body).then((r) => r.data),
  deleteTraining: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/training/${pk}/`),
  diet: (gymId: number, params?: { student_id?: number; year?: number; month?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/diet/`, { params }).then((r) => r.data),
  createDiet: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/diet/`, body).then((r) => r.data),
  updateDiet: (gymId: number, pk: number, body: Record<string, unknown>) =>
    api.patch(`/coach-panel/gyms/${gymId}/diet/${pk}/`, body).then((r) => r.data),
  deleteDiet: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/diet/${pk}/`),
  supplements: (gymId: number, params?: { student_id?: number; year?: number; month?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/supplements/`, { params }).then((r) => r.data),
  createSupplement: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/supplements/`, body).then((r) => r.data),
  deleteSupplement: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/supplements/${pk}/`),
  stats: (gymId: number, params?: { student_id?: number; year?: number; month?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/stats/`, { params }).then((r) => r.data),
  createStat: (gymId: number, body: Record<string, unknown>) =>
    api.post(`/coach-panel/gyms/${gymId}/stats/`, body).then((r) => r.data),
  leaderboard: (gymId: number, params?: { metric?: string; exercise_id?: number; limit?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/leaderboard/`, { params }).then((r) => r.data),
  feed: (gymId: number) =>
    api.get(`/coach-panel/gyms/${gymId}/feed/`).then((r) => r.data),
  createPost: (gymId: number, form: FormData) =>
    api.post(`/coach-panel/gyms/${gymId}/feed/`, form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deletePost: (gymId: number, pk: number) =>
    api.delete(`/coach-panel/gyms/${gymId}/feed/${pk}/`),
  likePost: (gymId: number, postId: number) =>
    api.post(`/coach-panel/gyms/${gymId}/feed/${postId}/like/`).then((r) => r.data),
  comments: (gymId: number, postId: number) =>
    api.get(`/coach-panel/gyms/${gymId}/feed/${postId}/comments/`).then((r) => r.data),
  addComment: (gymId: number, postId: number, text: string) =>
    api.post(`/coach-panel/gyms/${gymId}/feed/${postId}/comments/`, { text }).then((r) => r.data),
  analytics: (gymId: number, params?: { year?: number; month?: number }) =>
    api.get(`/coach-panel/gyms/${gymId}/analytics/`, { params }).then((r) => r.data),
};

export async function loginCoach(username: string, password: string) {
  try {
    const { data } = await axios.post(`${API_ROOT}/accounts/login/`, { username, password, phone: username });
    return data;
  } catch {
    const { data } = await axios.post(`${API_ROOT}/token/`, { username, password });
    return data;
  }
}
