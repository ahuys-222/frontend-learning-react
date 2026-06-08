import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Users from "./pages/Users.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

// ======================= App：布局 + 路由规则 =======================
export default function App() {
  return (
    <div className="app">
      {/* ===== 导航栏：始终显示，不随页面切换消失 ===== */}
      <nav className="navbar">
        <span className="nav-logo">Router Demo</span>

        {/* NavLink 跟 Link 一样能跳转，区别是它能知道自己"是不是当前页" */}
        {/* 通过 className 回调拿到 isActive，高亮当前页 */}
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          首页
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          关于
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          用户列表
        </NavLink>
      </nav>

      {/* ===== 页面区域：根据 URL 切换内容 ===== */}
      <main className="page-content">
        <Routes>
          {/* 每个 Route 定义一条规则：路径 → 显示的组件 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/users" element={<Users />} />

          {/* :id 是 URL 参数，匹配 /users/123、/users/abc 等 */}
          <Route path="/users/:id" element={<UserDetail />} />

          {/* * 是通配符：上面都不匹配时走这里（404） */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
