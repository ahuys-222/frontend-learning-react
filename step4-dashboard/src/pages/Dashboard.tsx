import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import type { ExpenseItem, TodoItem } from "../types";

export default function Dashboard() {
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/expenses", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => setExpenses(data as ExpenseItem[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/api/todos", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => setTodos(data as TodoItem[]))
      .catch(() => {});
  }, []);

  const todoDone = todos.filter((t) => t.done).length;
  const todoLeft = todos.length - todoDone;
  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((s, e) => s + e.amount, 0);
  const allTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page dashboard">
      <h1>概览</h1>

      <div className="widget-grid">
        <Link to="/todo" className="widget widget-todo">
          <span className="widget-icon">✅</span>
          <div>
            <strong className="widget-title">待办事项</strong>
            <p className="widget-stat">
              {todoDone} / {todos.length} 已完成
              {todoLeft > 0 && (
                <span className="widget-alert"> · {todoLeft} 个待处理</span>
              )}
            </p>
          </div>
        </Link>

        <Link to="/weather" className="widget widget-weather">
          <span className="widget-icon">🌤</span>
          <div>
            <strong className="widget-title">天气查询</strong>
            <p className="widget-stat">查看实时天气</p>
          </div>
        </Link>

        <Link to="/expense" className="widget widget-expense">
          <span className="widget-icon">💰</span>
          <div>
            <strong className="widget-title">记账本</strong>
            <p className="widget-stat">
              总支出 ¥{allTotal.toFixed(2)}
              {todayTotal > 0 && ` · 今日 ¥${todayTotal.toFixed(2)}`}
            </p>
          </div>
        </Link>
      </div>

      <div className="tech-stack">
        <h3>这个项目用了哪些技术</h3>
        <div className="tech-grid">
          {[
            { name: "React Router", desc: "4 个独立页面，URL 跳转不刷新" },
            { name: "useContext", desc: "暗色/亮色主题全局切换" },
            { name: "useState", desc: "每个模块的数据状态管理" },
            { name: "useEffect", desc: "天气 API 调用、localStorage 持久化" },
            { name: "TypeScript", desc: "类型安全，编辑器智能提示" },
            { name: "JWT 认证", desc: "注册/登录，每人只看自己数据" },
            { name: "Express + SQLite", desc: "后端 API + 数据库持久化" },
            { name: "fetch API", desc: "天气模块实时请求外部数据" },
          ].map((tech) => (
            <div key={tech.name} className="tech-item">
              <code>{tech.name}</code>
              <span>{tech.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
