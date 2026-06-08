import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ======================= 类型 =======================
interface ThemeContextValue {
  theme: string;
  toggleTheme: () => void;
}

// ======================= 创建 Context =======================
const ThemeContext = createContext<ThemeContextValue | null>(null);

// ======================= Provider：包住整个应用 =======================
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("dashboard-theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("dashboard-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ======================= 自定义 Hook =======================
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme 必须在 ThemeProvider 里面使用");
  return context;
}
