import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { coachApi, loginCoach } from "../api/client";
import type { CoachProfile } from "../types";

interface AuthState {
  token: string | null;
  profile: CoachProfile | null;
  gymId: number | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function extractTokens(data: Record<string, unknown>) {
  const access = (data.access as string) || (data.access_token as string) || ((data.tokens as Record<string, string>)?.access);
  const refresh = (data.refresh as string) || (data.refresh_token as string) || ((data.tokens as Record<string, string>)?.refresh);
  return { access, refresh };
}

function normalizeProfile(me: unknown): CoachProfile {
  const m = me as Record<string, unknown>;
  return (m?.id ? m : m?.profile || m?.data || m) as CoachProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("coach_access"));
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const gymId = useMemo(() => {
    if (profile?.gym) return Number(profile.gym);
    const stored = localStorage.getItem("coach_gym_id");
    return stored ? Number(stored) : null;
  }, [profile]);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem("coach_access")) { setProfile(null); return; }
    const me = await coachApi.me();
    const p = normalizeProfile(me);
    setProfile(p);
    if (p?.gym) localStorage.setItem("coach_gym_id", String(p.gym));
  }, []);

  useEffect(() => {
    const boot = async () => {
      try { if (token) await refreshProfile(); }
      catch {
        localStorage.removeItem("coach_access");
        localStorage.removeItem("coach_refresh");
        localStorage.removeItem("coach_gym_id");
        setToken(null); setProfile(null);
      } finally { setLoading(false); }
    };
    void boot();
  }, [token, refreshProfile]);

  useEffect(() => {
    const onExpired = () => { setToken(null); setProfile(null); };
    window.addEventListener("coach:auth-expired", onExpired);
    return () => window.removeEventListener("coach:auth-expired", onExpired);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginCoach(username.trim(), password);
    const { access, refresh } = extractTokens(data as Record<string, unknown>);
    if (!access) throw new Error("توکن دریافت نشد");
    localStorage.setItem("coach_access", access);
    if (refresh) localStorage.setItem("coach_refresh", refresh);
    setToken(access);
    const me = await coachApi.me();
    const p = normalizeProfile(me);
    setProfile(p);
    if (p?.gym) localStorage.setItem("coach_gym_id", String(p.gym));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("coach_access");
    localStorage.removeItem("coach_refresh");
    localStorage.removeItem("coach_gym_id");
    setToken(null); setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ token, profile, gymId, loading, login, logout, refreshProfile }),
    [token, profile, gymId, loading, login, logout, refreshProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
