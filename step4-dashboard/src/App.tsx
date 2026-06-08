import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Todo from "./pages/Todo";
import Weather from "./pages/Weather";
import Expense from "./pages/Expense";
import Login from "./pages/Login";
import Register from "./pages/Register";

const NAV_ITEMS = [
  { to: "/", label: "首页", icon: "🏠", end: true },
  { to: "/todo", label: "待办", icon: "✅" },
  { to: "/weather", label: "天气", icon: "🌤" },
  { to: "/expense", label: "记账", icon: "💰" },
];

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoggedIn, logout, loading } = useAuth();

  if (loading) return null;

  return (
    <div className={`app ${theme}`}>
      <nav className="navbar">
        <span className="nav-brand">个人工作台</span>
        {isLoggedIn && (
          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          {isLoggedIn && (
            <>
              <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                {user?.username}
              </span>
              <button className="theme-toggle" onClick={logout} title="退出登录">
                🚪
              </button>
            </>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "☀" : "🌙"}
          </button>
        </div>
      </nav>

      <main className="page-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><Todo /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
          <Route path="/expense" element={<ProtectedRoute><Expense /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
