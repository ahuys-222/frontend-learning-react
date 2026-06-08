import { useState, useEffect, type ChangeEvent, type KeyboardEvent } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import type { ExpenseItem, Category } from "../types";

const API = "http://localhost:4000/api/expenses";

const CATEGORIES: Category[] = [
  { key: "餐饮", icon: "🍽", color: "#f97316" },
  { key: "交通", icon: "🚗", color: "#3b82f6" },
  { key: "购物", icon: "🛍", color: "#ec4899" },
  { key: "娱乐", icon: "🎮", color: "#8b5cf6" },
  { key: "其他", icon: "💰", color: "#6b7280" },
];

interface EditForm {
  amount: string;
  category: string;
  note: string;
}

export default function Expense() {
  const { theme } = useTheme();
  const { getToken } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("餐饮");
  const [note, setNote] = useState<string>("");
  const [filter, setFilter] = useState<string>("全部");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ amount: "", category: "餐饮", note: "" });

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("获取数据失败");
      const data = (await res.json()) as ExpenseItem[];
      setExpenses(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    const num = Number(amount);
    if (!amount || num <= 0) return;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          amount: num,
          category,
          note: note.trim() || "无备注",
        }),
      });

      if (!res.ok) throw new Error("添加失败");
      await fetchExpenses();
      setAmount("");
      setNote("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("删除失败");
      await fetchExpenses();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function startEdit(expense: ExpenseItem) {
    setEditingId(expense.id);
    setEditForm({
      amount: String(expense.amount),
      category: expense.category,
      note: expense.note,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ amount: "", category: "餐饮", note: "" });
  }

  async function handleUpdate() {
    const num = Number(editForm.amount);
    if (!editForm.amount || num <= 0) return;

    try {
      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          amount: num,
          category: editForm.category,
          note: editForm.note.trim() || "无备注",
        }),
      });
      if (!res.ok) throw new Error("修改失败");
      await fetchExpenses();
      cancelEdit();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const filtered =
    filter === "全部" ? expenses : expenses.filter((e) => e.category === filter);

  const categoryStats = CATEGORIES.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat.key)
      .reduce((s, e) => s + e.amount, 0);
    return { ...cat, total };
  }).filter((s) => s.total > 0);

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page">
      <h1>记账本</h1>
      <p className="hint">数据存后端（Express 服务器），刷新不丢、换浏览器也看到同一份</p>

      <div className="expense-form">
        <input
          className="expense-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAdd()}
        />
        <select
          className="expense-category"
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.icon} {c.key}
            </option>
          ))}
        </select>
        <input
          className="expense-note"
          type="text"
          placeholder="备注（选填）"
          value={note}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAdd()}
        />
        <button className="btn-primary" onClick={handleAdd}>
          + 记一笔
        </button>
      </div>

      {loading && <p className="empty-hint">加载中...</p>}
      {error && (
        <p className="empty-hint" style={{ color: "var(--danger)" }}>
          错误：{error}
        </p>
      )}

      {expenses.length > 0 && (
        <div className="expense-stats">
          <div className="stat-item stat-total">
            <span>总支出</span>
            <strong>¥{grandTotal.toFixed(2)}</strong>
          </div>
          {categoryStats.map((s) => (
            <div key={s.key} className="stat-item">
              <span>
                {s.icon} {s.key}
              </span>
              <strong style={{ color: s.color }}>¥{s.total.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}

      {expenses.length > 0 && (
        <>
          <div className="expense-filters">
            <button
              className={`filter-tag ${filter === "全部" ? "active" : ""}`}
              onClick={() => setFilter("全部")}
            >
              全部
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`filter-tag ${filter === c.key ? "active" : ""}`}
                onClick={() => setFilter(c.key)}
              >
                {c.icon} {c.key}
              </button>
            ))}
          </div>
          <ul className="expense-list">
            {filtered.length === 0 ? (
              <li className="expense-empty">该分类下没有记录</li>
            ) : (
              filtered.map((e) => {
                const cat = CATEGORIES.find((c) => c.key === e.category) || {
                  icon: "💰",
                  color: "#6b7280",
                };
                const isEditing = editingId === e.id;

                if (isEditing) {
                  return (
                    <li key={e.id} className="expense-item expense-item-editing">
                      <span className="expense-item-icon">{cat.icon}</span>
                      <input
                        className="edit-input edit-amount"
                        type="number"
                        value={editForm.amount}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                          setEditForm({ ...editForm, amount: ev.target.value })
                        }
                        onKeyDown={(ev: KeyboardEvent<HTMLInputElement>) =>
                          ev.key === "Enter" && handleUpdate()
                        }
                        autoFocus
                      />
                      <select
                        className="edit-select"
                        value={editForm.category}
                        onChange={(ev: ChangeEvent<HTMLSelectElement>) =>
                          setEditForm({ ...editForm, category: ev.target.value })
                        }
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.icon} {c.key}
                          </option>
                        ))}
                      </select>
                      <input
                        className="edit-input edit-note"
                        type="text"
                        value={editForm.note}
                        onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                          setEditForm({ ...editForm, note: ev.target.value })
                        }
                        onKeyDown={(ev: KeyboardEvent<HTMLInputElement>) =>
                          ev.key === "Enter" && handleUpdate()
                        }
                        placeholder="备注"
                      />
                      <button className="btn-save" onClick={handleUpdate}>
                        保存
                      </button>
                      <button className="del-btn" onClick={cancelEdit}>
                        ✕
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={e.id} className="expense-item">
                    <span className="expense-item-icon">{cat.icon}</span>
                    <div className="expense-item-info">
                      <span className="expense-item-note">{e.note}</span>
                      <span className="expense-item-meta">
                        {e.category} · {e.date}
                      </span>
                    </div>
                    <span className="expense-item-amount" style={{ color: cat.color }}>
                      -¥{e.amount.toFixed(2)}
                    </span>
                    <button className="edit-btn" onClick={() => startEdit(e)}>
                      ✎
                    </button>
                    <button className="del-btn" onClick={() => handleDelete(e.id)}>
                      ✕
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}

      {!loading && !error && expenses.length === 0 && (
        <p className="empty-hint">还没有记账记录，记下第一笔吧</p>
      )}
    </div>
  );
}
