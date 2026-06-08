import { useState, useEffect } from "react";

// ======================= 分类预设 =======================
// 每笔记账必须选一个分类，每个分类有自己的图标和颜色标识
const CATEGORIES = [
  { key: "餐饮", icon: "🍽", color: "#f97316" },
  { key: "交通", icon: "🚗", color: "#3b82f6" },
  { key: "购物", icon: "🛍", color: "#ec4899" },
  { key: "娱乐", icon: "🎮", color: "#8b5cf6" },
  { key: "其他", icon: "💰", color: "#6b7280" },
];

// ======================= App =======================
export default function App() {
  // --- state ---
  const [expenses, setExpenses] = useState(() => {
    // 初始化：从 localStorage 读取之前存的记录
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];  // 有就解析，没有就用空数组
  });

  const [amount, setAmount] = useState("");    // 金额输入
  const [category, setCategory] = useState("餐饮"); // 当前选的分类
  const [note, setNote] = useState("");        // 备注
  const [date, setDate] = useState(today());   // 日期，默认今天
  const [filter, setFilter] = useState("全部"); // 当前筛选（"全部" 或某个分类名）

  // --- useEffect：每次 expenses 变化 → 自动存 localStorage ---
  // 跟天气查询里的 useEffect 作用一样，只是这次不是调 API，是写本地存储
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);  // 依赖 expenses：expenses 一变就执行

  // --- 添加支出 ---
  function handleAdd() {
    // 校验：金额不能为空、不能为 0、不能是负数
    const num = Number(amount);
    if (!amount || num <= 0) return;

    const newExpense = {
      id: Date.now(),          // 用时间戳做唯一 ID
      amount: num,             // 金额（数字）
      category,                // 分类名
      note: note.trim() || "无备注", // 备注，空的话给默认
      date,                    // 日期 "2026-06-04"
    };

    // 不可变更新：跟井字棋一样，不直接 push，而是展开旧数组
    setExpenses([newExpense, ...expenses]);

    // 清空表单
    setAmount("");
    setNote("");
  }

  // --- 删除支出 ---
  function handleDelete(id) {
    // filter 返回一个新数组，排除掉被删的那条
    setExpenses(expenses.filter((e) => e.id !== id));
  }

  // --- 筛选后的数据（派生值，跟 xIsNext 一样不用存 state） ---
  const filteredExpenses = filter === "全部"
    ? expenses
    : expenses.filter((e) => e.category === filter);

  // --- 按分类汇总（派生值） ---
  // reduce 你 step2 学过，这里用来按分类累加金额
  const categoryStats = CATEGORIES.map((cat) => {
    const total = expenses
      .filter((e) => e.category === cat.key)
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...cat, total };
  }).filter((s) => s.total > 0);  // 只显示有记录的类别

  // --- 总收入/总支出 ---
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="app">
      <header className="header">
        <h1>记账本</h1>
        <p className="subtitle">记录每一笔，清楚每一分</p>
      </header>

      {/* ===== 添加表单 ===== */}
      <div className="card form-card">
        <div className="form-row">
          {/* 金额输入 */}
          <input
            className="input-amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          {/* 分类选择 */}
          <select
            className="select-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.icon} {c.key}
              </option>
            ))}
          </select>

          {/* 日期输入 */}
          <input
            className="input-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-row form-row-bottom">
          {/* 备注输入 */}
          <input
            className="input-note"
            type="text"
            placeholder="备注（选填）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="btn-add" onClick={handleAdd}>
            + 记一笔
          </button>
        </div>
      </div>

      {/* ===== 统计卡片 ===== */}
      {expenses.length > 0 && (
        <div className="stats-row">
          <div className="stat-card stat-total">
            <span className="stat-label">总支出</span>
            <span className="stat-value">¥{grandTotal.toFixed(2)}</span>
          </div>
          {categoryStats.map((s) => (
            <div
              key={s.key}
              className="stat-card"
              style={{ borderColor: s.color + "40" }}
            >
              <span className="stat-label">
                {s.icon} {s.key}
              </span>
              <span className="stat-value" style={{ color: s.color }}>
                ¥{s.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ===== 筛选 + 列表 ===== */}
      <div className="card list-card">
        <div className="list-header">
          <h2>支出记录</h2>
          {/* 分类筛选标签 */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "全部" ? "active" : ""}`}
              onClick={() => setFilter("全部")}
            >
              全部
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`filter-tab ${filter === c.key ? "active" : ""}`}
                onClick={() => setFilter(c.key)}
                style={filter === c.key ? { background: c.color, borderColor: c.color } : {}}
              >
                {c.icon} {c.key}
              </button>
            ))}
          </div>
        </div>

        {/* 空列表 */}
        {filteredExpenses.length === 0 && (
          <p className="empty-text">
            {expenses.length === 0 ? "还没有记录，记下第一笔吧" : "该分类下没有记录"}
          </p>
        )}

        {/* 支出列表 */}
        <ul className="expense-list">
          {filteredExpenses.map((e) => {
            const cat = CATEGORIES.find((c) => c.key === e.category);
            return (
              <li key={e.id} className="expense-item">
                <span className="expense-icon">{cat.icon}</span>
                <div className="expense-info">
                  <span className="expense-note">{e.note}</span>
                  <span className="expense-meta">
                    {e.category} · {e.date}
                  </span>
                </div>
                <span className="expense-amount" style={{ color: cat.color }}>
                  -¥{e.amount.toFixed(2)}
                </span>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(e.id)}
                  title="删除"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ======================= 工具函数 =======================
function today() {
  // 返回今天日期字符串 "YYYY-MM-DD"，供 input[type=date] 使用
  return new Date().toISOString().slice(0, 10);
}
