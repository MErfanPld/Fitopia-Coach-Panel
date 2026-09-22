import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { WelcomePage } from "./pages/WelcomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { PRsPage } from "./pages/PRsPage";
import { ProgressPage } from "./pages/ProgressPage";
import { TrainingPage } from "./pages/TrainingPage";
import { DietPage } from "./pages/DietPage";
import { FeedPage } from "./pages/FeedPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";

function Protected({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="flex min-h-dvh items-center justify-center bg-[#07070A]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!token) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="flex min-h-dvh items-center justify-center bg-[#07070A]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (token) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<PublicOnly><WelcomePage /></PublicOnly>} />
      <Route path="/app" element={<Protected><AppShell /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="prs" element={<PRsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="diet" element={<DietPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
