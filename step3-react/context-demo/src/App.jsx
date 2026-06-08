import { useState, createContext, useContext } from "react";

// ======================= 第 1 步：创建 Context =======================
// createContext 像一个"全局快递包裹"，任何组件都能收
// 参数 "light" 是默认值（Provider 没包住的时候用）
const ThemeContext = createContext("light");

// ======================= 第 2 步：Provider —— "发送方" =======================
// ThemeProvider 把主题状态包起来，让子组件都能拿到
// 它本身是一个普通组件，只是用 ThemeContext.Provider 包裹了 children
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");  // 跟普通 useState 一模一样

  // 切换主题的函数
  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  // Provider 的 value 属性 = 你要分享出去的数据
  // 包在里面的所有组件都能通过 useContext 拿到这个 value
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ======================= 第 3 步：自定义 Hook —— "取快递" =======================
// 不用这个也行，但封装一下更干净
// 任何想拿主题数据的组件，调 useTheme() 就行
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme 必须在 ThemeProvider 里面使用");
  return context;  // 返回 { theme, toggleTheme }
}

// ======================= 最深层的子组件 =======================
// 它需要显示当前主题 + 能切换主题
// 但它的父组件们（Section、Card）都不需要主题数据
function DeepButton() {
  const { theme, toggleTheme } = useTheme();  // 直接拿，中间组件不用转发！

  return (
    <button
      className={`demo-button ${theme}`}
      onClick={toggleTheme}
    >
      当前是<strong>{theme === "light" ? "亮色" : "暗色"}</strong>，点我切换
    </button>
  );
}

// ======================= 中间层组件 =======================
// Card：包在 DeepButton 外面。它自己不需要主题数据，也不转发任何 prop
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// Section：包在 Card 外面。同样不需要主题数据，不转发任何 prop
function Section({ title, children }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ======================= 页面头部：也用 Context =======================
function Header() {
  const { theme, toggleTheme } = useTheme();  // Header 和 DeepButton 同级别，都能拿

  return (
    <header className={`header ${theme}`}>
      <div>
        <h1>useContext 演示</h1>
        <p>开关在最底层按钮，但主题影响的元素分布在各层</p>
      </div>
      <button className={`toggle-badge ${theme}`} onClick={toggleTheme}>
        {theme === "light" ? "☀ 亮色" : "🌙 暗色"}
      </button>
    </header>
  );
}

// ======================= 根组件 =======================
export default function App() {
  return (
    // 第 2 步（续）：用 ThemeProvider 包住整个应用
    // 里面的所有组件（不管多少层）都能拿到主题数据
    <ThemeProvider>
      {/* 根据主题切换整个容器的 class */}
      <ThemedApp />
    </ThemeProvider>
  );
}

// 单独抽出来，因为 useTheme 必须在 ThemeProvider 里面调
function ThemedApp() {
  const { theme } = useTheme();

  return (
    <div className={`app ${theme}`}>
      <Header />

      <Section title="组件层级示意">
        <Card title="Header（顶部）">
          <p className="hint">Header 自己用 useTheme 拿数据，不用任何人传</p>
        </Card>

        <Card title="Section（中间层）">
          <p className="hint">Section 自己不需要主题，也不帮子组件转发 props</p>

          <Card title="Card（中间层）">
            <p className="hint">Card 自己也不需要主题，也不转发</p>

            <Card title="DeepButton（最底层）">
              <p className="hint">最底层的按钮，直接 useTheme 拿到主题 + 切换函数</p>
              <DeepButton />
            </Card>
          </Card>
        </Card>
      </Section>

      {/* 对比说明 */}
      <Section title="对比：有没有 Context 的区别">
        <div className="compare">
          <div className="compare-bad">
            <h3>没有 Context（prop drilling）</h3>
            <code>
              App 存 theme → Header 收 theme<br />
              App 存 toggle → Section 收 toggle → Card 收 toggle → DeepButton 收 toggle
            </code>
            <p>Section 和 Card 明明不用 toggle，却被迫转发，又臭又长</p>
          </div>
          <div className="compare-good">
            <h3>有 Context（现在这样）</h3>
            <code>
              ThemeProvider 提供 theme + toggle<br />
              Header 调 useTheme() 直接拿<br />
              DeepButton 调 useTheme() 直接拿
            </code>
            <p>中间组件不需要的就不用管，干净利落</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
