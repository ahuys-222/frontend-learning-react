import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../types";

// ======================= 类型 =======================
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  register: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  getToken: () => string | undefined;
  isLoggedIn: boolean;
}

// ======================= 创建 Context =======================
const AuthContext = createContext<AuthContextValue | null>(null);
const API_BASE = "http://localhost:4000/api/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth-user");
      if (saved) setUser(JSON.parse(saved) as AuthUser);
    } catch {
      // 数据损坏，忽略
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth-user");
    }
  }, [user]);

  async function login(username: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "登录失败");
    setUser(data);
    return data;
  }

  async function register(username: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "注册失败");
    setUser(data);
    return data;
  }

  function logout() {
    setUser(null);
  }

  function getToken(): string | undefined {
    return user?.token;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth 必须在 AuthProvider 里面使用");
  return context;
}
