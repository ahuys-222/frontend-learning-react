import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 4) {
      setError("密码至少 4 位");
      return;
    }

    setSubmitting(true);
    try {
      await register(username, password);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>注册</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}
        <input
          className="auth-input"
          type="text"
          placeholder="用户名（2-20 个字符）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="auth-input"
          type="password"
          placeholder="密码（至少 4 位）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "注册中..." : "注册"}
        </button>
      </form>
      <p className="hint" style={{ textAlign: "center" }}>
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </div>
  );
}
