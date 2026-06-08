import { useParams, useNavigate, Link } from "react-router-dom";

// ======================= 用户数据（跟 Users.jsx 共享，实际项目会抽出来） =======================
const USERS = [
  { id: 1, name: "张三", role: "前端工程师", avatar: "👨‍💻", city: "北京", desc: "3 年前端经验，擅长 React 和 Vue" },
  { id: 2, name: "李四", role: "后端工程师", avatar: "👩‍💻", city: "上海", desc: "5 年后端经验，主攻 Go 和微服务" },
  { id: 3, name: "王五", role: "设计师", avatar: "🎨", city: "深圳", desc: "UI/UX 设计背景，也懂前端" },
];

// ======================= 用户详情页 =======================
export default function UserDetail() {
  // useParams：从 URL 里取出参数
  // 比如 /users/2 → { id: "2" }
  const { id } = useParams();
  const navigate = useNavigate();

  // 根据 id 找到对应用户（id 从 URL 拿到的，是字符串，要转数字）
  const user = USERS.find((u) => u.id === Number(id));

  // 如果 id 不存在（比如 /users/999），显示没找到
  if (!user) {
    return (
      <div className="page">
        <h1>用户不存在</h1>
        <p className="hint">URL 里的 id={id}，但数据库里没有这个人</p>
        <button className="btn-demo" onClick={() => navigate("/users")}>
          返回用户列表
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      {/* 面包屑：首页 → 用户列表 → 当前用户 */}
      <div className="breadcrumb">
        <Link to="/">首页</Link> / <Link to="/users">用户列表</Link> / {user.name}
      </div>

      <div className="user-detail-card">
        <span className="user-avatar large">{user.avatar}</span>
        <h1>{user.name}</h1>
        <p className="role-badge">{user.role}</p>
        <p className="hint">📍 {user.city}</p>
        <p>{user.desc}</p>
      </div>

      <div className="concept-box">
        <h3>这页演示了什么</h3>
        <ul>
          <li><code>useParams()</code> 从 URL 提取 <code>:id</code> → 拿到的值是字符串</li>
          <li>根据 id 查找数据——这就是列表→详情的基础模式</li>
          <li>id 无效时显示"用户不存在"，不报错崩溃</li>
        </ul>
      </div>
    </div>
  );
}
