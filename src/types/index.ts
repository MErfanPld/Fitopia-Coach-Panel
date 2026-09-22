export interface CoachProfile {
  id: number; gym: number; gym_name?: string; full_name: string;
  image?: string | null; bio?: string; phone?: string; sports?: { id: number; name: string }[];
  is_active?: boolean;
}
export interface Student {
  id: number; full_name: string; phone?: string; gender?: string;
  image?: string | null; is_active?: boolean; notes?: string; birth_date?: string;
  height?: number; weight?: number; created_at?: string;
}
export interface Exercise {
  id: number; name: string; muscle_group?: string; description?: string; video_url?: string;
}
export interface WorkoutSet { exercise_id: number; exercise_name?: string; sets: number; reps: number; weight?: number; rpe?: number; notes?: string; }
export interface Workout {
  id: number; student: number; student_name?: string; date: string; notes?: string;
  sets?: WorkoutSet[]; created_at?: string;
}
export interface PR {
  id: number; student: number; student_name?: string; exercise: number; exercise_name?: string;
  weight: number; reps?: number; date: string; notes?: string;
}
export interface ProgressPhoto {
  id: number; student: number; student_name?: string; image: string; date: string; notes?: string;
}
export interface TrainingPlan {
  id: number; student: number; student_name?: string; year: number; month: number;
  title?: string; content?: string; notes?: string;
}
export interface DietPlan {
  id: number; student: number; student_name?: string; year: number; month: number;
  title?: string; content?: string; calories?: number; notes?: string;
}
export interface FeedPost {
  id: number; text?: string; image?: string | null; likes_count?: number; comments_count?: number;
  is_liked?: boolean; created_at?: string; author_name?: string;
}
export interface Comment { id: number; text: string; author_name?: string; created_at?: string; }
export interface LeaderboardEntry {
  rank: number; student_id: number; student_name: string; value: number; metric?: string;
}
export interface Analytics {
  total_students?: number; active_students?: number; workouts?: number; prs?: number; posts?: number;
  [key: string]: unknown;
}
export interface ProgressPoint { date: string; weight?: number; body_fat?: number; [key: string]: unknown; }
