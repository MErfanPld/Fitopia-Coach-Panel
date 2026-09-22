export interface CoachProfile {
  id: number; gym: number; gym_name?: string; full_name: string;
  image?: string | null; specialty?: string; bio?: string; is_active?: boolean;
  sports?: { id: number; name: string }[];
}
export interface Student {
  id: number; full_name: string; phone?: string; gender?: string;
  birth_date?: string; photo?: string | null; notes?: string; is_active?: boolean;
}
export interface Exercise {
  id: number; name: string; muscle_group?: string; equipment?: string;
  instructions?: string; video_url?: string; is_public?: boolean;
}
export interface WorkoutSet {
  id?: number; exercise: number; exercise_name?: string; set_number?: number;
  reps?: number; weight_kg?: string | number; weight?: number; sets?: number;
  duration_seconds?: number; rpe?: number; notes?: string; order?: number;
}
export interface Workout {
  id: number; student: number; student_name?: string;
  performed_at?: string; date?: string; title?: string;
  duration_minutes?: number; notes?: string; feeling?: number;
  sets?: WorkoutSet[]; total_volume?: number | string; created_at?: string;
}
export interface PersonalRecord {
  id: number; student: number; student_name?: string; exercise: number;
  exercise_name?: string; value?: string | number; weight?: number;
  unit?: "kg" | "reps" | "seconds" | "m"; achieved_at?: string; date?: string; notes?: string; reps?: number;
}
export type PR = PersonalRecord;
export interface ProgressData {
  workout_volume?: { date: string; volume: number }[];
  personal_records?: PersonalRecord[];
  body_metrics?: { date: string; weight_kg?: number; body_fat_percent?: number }[];
  sessions_count?: number;
}
export interface TrainingPlan {
  id: number; student: number; student_name?: string; title?: string;
  year: number; month: number; status?: string; content?: string; notes?: string;
  exercises?: { day_of_week?: number; exercise_name: string; sets?: number; reps?: string; order?: number }[];
}
export interface DietPlan {
  id: number; student: number; student_name?: string; title?: string;
  year: number; month: number; daily_calories?: number; calories?: number; status?: string; content?: string; notes?: string;
  meals?: { meal_type: string; items: string; calories?: number; order?: number }[];
}
export interface FeedPost {
  id: number; caption?: string; text?: string; image?: string | null; student?: number;
  student_name?: string; post_type?: string; likes_count?: number;
  comments_count?: number; liked_by_me?: boolean; is_liked?: boolean;
  created_at?: string; author_name?: string;
}
export interface FeedComment { id: number; text: string; author_name?: string; created_at?: string; }
export type Comment = FeedComment;
export interface LeaderboardEntry { rank: number; student_id: number; student_name: string; value: number | string; metric?: string; }
export interface Analytics {
  total_students?: number; active_students?: number; workouts?: number; prs?: number; posts?: number;
  [key: string]: unknown;
}
export const MUSCLE_GROUPS = [
  { value: "chest", label: "سینه" }, { value: "back", label: "پشت" },
  { value: "shoulders", label: "شانه" }, { value: "arms", label: "بازو" },
  { value: "legs", label: "پا" }, { value: "core", label: "میان‌تنه" },
  { value: "full_body", label: "کل بدن" }, { value: "cardio", label: "کاردیو" },
  { value: "other", label: "سایر" },
];
export const GENDER_LABELS: Record<string, string> = { male: "آقا", female: "خانم" };
