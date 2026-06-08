import { Link } from "react-router-dom";

// ======================= 首页 =======================
export default function Home() {
  return (
    <div className="page">
      <h1>首页</h1>
      <p>欢迎来到 React Router 演示</p>

      <div className="feature-grid">
        <Link to="/about" className="feature-card">
          <span className="feature-icon">📖</span>
          <strong>关于页面</strong>
          <span className="feature-hint">普通静态页面路由</span>
        </Link>
        <Link to="/users" className="feature-card">
          <span className="feature-icon">👥</span>
          <strong>用户列表</strong>
          <span className="feature-hint">列表 + 详情 + URL 参数</span>
        </Link>
      </div>

      <div className="concept-box">
        <h3>这页演示了什么</h3>
        <ul>
          <li><code>&lt;Link&gt;</code> 替代 &lt;a&gt; —— 不刷新页面，只换内容</li>
          <li>导航栏始终在上面，不随页面切换消失</li>
          <li>URL 变了，但浏览器没有真的"跳转"</li>
        </ul>
      </div>
    </div>
  );
}
