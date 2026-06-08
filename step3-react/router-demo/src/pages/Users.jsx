import { Link } from "react-router-dom";

// ======================= 用户数据（假装从 API 拿的） =======================
const USERS = [
  { id: 1, name: "张三", role: "前端工程师", avatar: "👨‍💻" },
  { id: 2, name: "李四", role: "后端工程师", avatar: "👩‍💻" },
  { id: 3, name: "王五", role: "设计师", avatar: "🎨" },
];

// ======================= 用户列表页 =======================
export default function Users() {
  return (
    <div className="page">
      <h1>用户列表</h1>
      <p>点击任一用户，演示 URL 参数路由</p>

      <div className="user-grid">
        {USERS.map((user) => (
          <Link to={`/users/${user.id}`} key={user.id} className="user-card">
            <span className="user-avatar">{user.avatar}</span>
            <strong>{user.name}</strong>
            <span className="hint">{user.role}</span>
          </Link>
        ))}
      </div>

      <div className="concept-box">
        <h3>这页演示了什么</h3>
        <ul>
          <li>每个用户链接都指向 <code>/users/{`{id}`}</code> —— 一个带动态参数的路径</li>
          <li>用 <code>useParams</code> 在目标页面拿到这个 id</li>
        </ul>
      </div>
    </div>
  );
}
