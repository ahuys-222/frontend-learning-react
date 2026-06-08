// ======================= 后端 + 数据库 + 用户认证 =======================
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;
const JWT_SECRET = "my-jwt-secret-change-me";
const TOKEN_EXPIRY = "7d";

app.use(cors());
app.use(express.json());

// ======================= 初始化数据库 =======================
const db = new Database("data.db");

// 记账表
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category TEXT DEFAULT '其他',
    note TEXT DEFAULT '无备注',
    date TEXT NOT NULL
  )
`);

// 用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`);

// 待办表
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

// 迁移：给 expenses 加 user_id（如果还没有的话）
try {
  db.exec("ALTER TABLE expenses ADD COLUMN user_id INTEGER REFERENCES users(id)");
  console.log("已添加 user_id 列");
} catch (e) {
  // 列已存在，忽略
}

console.log("数据库已就绪（data.db）");

// ======================= 鉴权中间件 =======================
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "请先登录" });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;   // 把用户 ID 挂到 req 上，后面的路由直接用
    next();
  } catch (err) {
    return res.status(401).json({ error: "登录已过期，请重新登录" });
  }
}

// ======================= 认证路由 =======================

// --- POST /api/auth/register：注册 ---
app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "用户名和密码不能为空" });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: "用户名需要 2-20 个字符" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "密码至少 4 位" });
  }

  // 查重
  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (exists) {
    return res.status(409).json({ error: "用户名已被注册" });
  }

  // 哈希密码再存
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, hash);

  // 注册成功 → 直接返回 token（自动登录）
  const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.status(201).json({ token, userId: result.lastInsertRowid, username });
});

// --- POST /api/auth/login：登录 ---
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "用户名和密码不能为空" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) {
    return res.status(401).json({ error: "用户名或密码错误" });
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "用户名或密码错误" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({ token, userId: user.id, username: user.username });
});

// ======================= 记账路由（需要登录） =======================

// --- GET /api/expenses：查当前用户的全部记录 ---
app.get("/api/expenses", authMiddleware, (req, res) => {
  const expenses = db.prepare(
    "SELECT id, amount, category, note, date FROM expenses WHERE user_id = ? ORDER BY id DESC"
  ).all(req.userId);
  res.json(expenses);
});

// --- POST /api/expenses：新增 ---
app.post("/api/expenses", authMiddleware, (req, res) => {
  const { amount, category, note } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "金额不合法" });
  }

  const date = new Date().toISOString().slice(0, 10);

  const result = db.prepare(`
    INSERT INTO expenses (user_id, amount, category, note, date)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.userId, amount, category || "其他", note || "无备注", date);

  res.status(201).json({
    id: result.lastInsertRowid,
    amount: Number(amount),
    category: category || "其他",
    note: note || "无备注",
    date,
  });
});

// --- PUT /api/expenses/:id：修改（只能改自己的） ---
app.put("/api/expenses/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { amount, category, note } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "金额不合法" });
  }

  const result = db.prepare(
    "UPDATE expenses SET amount = ?, category = ?, note = ? WHERE id = ? AND user_id = ?"
  ).run(amount, category || "其他", note || "无备注", id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "记录不存在" });
  }

  res.json({ success: true });
});

// --- DELETE /api/expenses/:id：删除（只能删自己的） ---
app.delete("/api/expenses/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  const result = db.prepare(
    "DELETE FROM expenses WHERE id = ? AND user_id = ?"
  ).run(id, req.userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "记录不存在" });
  }

  res.json({ success: true });
});

// ======================= 待办路由（需要登录） =======================

// --- GET /api/todos：查当前用户的全部待办 ---
app.get("/api/todos", authMiddleware, (req, res) => {
  const todos = db.prepare(
    "SELECT id, text, done FROM todos WHERE user_id = ? ORDER BY id DESC"
  ).all(req.userId);
  res.json(todos.map((t) => ({ ...t, done: !!t.done })));
});

// --- POST /api/todos：新增 ---
app.post("/api/todos", authMiddleware, (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "内容不能为空" });
  }

  const result = db.prepare(
    "INSERT INTO todos (user_id, text) VALUES (?, ?)"
  ).run(req.userId, text.trim());

  const todo = db.prepare("SELECT id, text, done FROM todos WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ ...todo, done: !!todo.done });
});

// --- PUT /api/todos/:id：修改（切换完成状态 / 改文字） ---
app.put("/api/todos/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { text, done } = req.body;

  const todo = db.prepare("SELECT id FROM todos WHERE id = ? AND user_id = ?").get(id, req.userId);
  if (!todo) {
    return res.status(404).json({ error: "待办不存在" });
  }

  if (text !== undefined) {
    db.prepare("UPDATE todos SET text = ? WHERE id = ? AND user_id = ?").run(text.trim(), id, req.userId);
  }
  if (done !== undefined) {
    db.prepare("UPDATE todos SET done = ? WHERE id = ? AND user_id = ?").run(done ? 1 : 0, id, req.userId);
  }

  const updated = db.prepare("SELECT id, text, done FROM todos WHERE id = ?").get(id);
  res.json({ ...updated, done: !!updated.done });
});

// --- DELETE /api/todos/:id：删除 ---
app.delete("/api/todos/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  const result = db.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?").run(id, req.userId);
  if (result.changes === 0) {
    return res.status(404).json({ error: "待办不存在" });
  }

  res.json({ success: true });
});

// ======================= 启动 =======================
app.listen(PORT, () => {
  console.log(`后端服务已启动：http://localhost:${PORT}`);
});
