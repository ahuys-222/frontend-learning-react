import { Link, useNavigate } from "react-router-dom";

// ======================= 404 页面 =======================
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page not-found">
      <h1 className="code-404">404</h1>
      <p>你要找的页面不存在</p>
      <p className="hint">检查一下地址栏的 URL 有没有写错</p>

      <div className="actions">
        <button className="btn-demo" onClick={() => navigate("/")}>
          回首页
        </button>
        <button className="btn-demo btn-secondary" onClick={() => navigate(-1)}>
          返回上一页
        </button>
      </div>

      <div className="concept-box">
        <h3>这页演示了什么</h3>
        <ul>
          <li>用 <code>&lt;Route path="*"&gt;</code> 捕获所有未匹配的路径</li>
          <li>放在 Routes 的最后一个，上面都不匹配才走这里</li>
        </ul>
      </div>
    </div>
  );
}
