import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from "react";
import { useAuth } from "../context/AuthContext";
import type { TodoItem } from "../types";

const API = "http://localhost:4000/api/todos";

export default function Todo() {
  const { getToken } = useAuth();

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("获取待办失败");
      const data = (await res.json()) as TodoItem[];
      setTodos(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo() {
    if (!text.trim()) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error("添加失败");
      setText("");
      await fetchTodos();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleTodo(todo: TodoItem) {
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ done: !todo.done }),
      });
      if (!res.ok) throw new Error("更新失败");
      await fetchTodos();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function deleteTodo(id: number) {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("删除失败");
      await fetchTodos();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const leftCount = todos.filter((t) => !t.done).length;

  return (
    <div className="page">
      <h1>待办事项</h1>
      <p className="hint">数据存后端，换浏览器登录也能看到同一份</p>

      <div className="todo-form">
        <input
          className="todo-input"
          type="text"
          placeholder="写点什么要做的事..."
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && addTodo()}
        />
        <button className="btn-primary" onClick={addTodo}>
          添加
        </button>
      </div>

      {loading && <p className="empty-hint">加载中...</p>}
      {error && (
        <p className="empty-hint" style={{ color: "var(--danger)" }}>
          错误：{error}
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="todo-count">
            {todos.length === 0
              ? "还没有待办"
              : leftCount === 0
              ? "全部完成！"
              : `还剩 ${leftCount} 项未完成`}
          </p>

          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.done ? "done" : ""}`}>
                <button
                  className={`check-btn ${todo.done ? "checked" : ""}`}
                  onClick={() => toggleTodo(todo)}
                >
                  {todo.done ? "✔" : ""}
                </button>
                <span className="todo-text">{todo.text}</span>
                <button className="del-btn" onClick={() => deleteTodo(todo.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
