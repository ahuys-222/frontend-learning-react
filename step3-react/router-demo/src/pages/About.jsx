import { useNavigate } from "react-router-dom";

// ======================= 关于页面 =======================
export default function About() {
  // useNavigate 返回一个函数，调用就能跳转
  // 跟 Link 的区别：Link 是用户点链接跳，navigate 是代码里主动跳
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1>关于</h1>
      <p>这个 Demo 教 React Router 三个核心概念</p>

      <div className="concept-box">
        <h3>Route：路径 → 组件的映射</h3>
        <code>&lt;Route path="/about" element={"{<About />}"} /&gt;</code>
        <p className="hint">用户在地址栏输入 /about → React Router 渲染 About 组件</p>
      </div>

      <div className="concept-box">
        <h3>Link / NavLink：不刷新的跳转</h3>
        <p className="hint">点击导航链接，URL 变了、内容换了，但浏览器没有真的刷新。这就是 SPA（单页应用）的核心体验。</p>
      </div>

      <div className="concept-box">
        <h3>useNavigate：代码里跳转</h3>
        <p className="hint">比如登录成功后跳到首页、提交表单后跳到列表页——不是在 JSX 里写 Link，而是用 JS 控制跳转。</p>
        <button className="btn-demo" onClick={() => navigate("/users")}>
          点我：跳到用户列表
        </button>
        <button className="btn-demo btn-secondary" onClick={() => navigate(-1)}>
          点我：返回上一页（navigate(-1)）
        </button>
      </div>
    </div>
  );
}
