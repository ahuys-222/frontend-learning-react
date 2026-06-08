import { useState, useEffect, useRef } from "react";

export default function App() {
  // --- state 定义 ---
  const [city, setCity] = useState("");          // 输入框的内容
  const [weather, setWeather] = useState(null);  // API 返回的天气数据（null = 还没搜过）
  const [loading, setLoading] = useState(false); // 是否正在请求中
  const [error, setError] = useState(null);      // 错误信息（null = 没错误）
  const inputRef = useRef(null);                 // 拿到输入框的真实 DOM，用于自动聚焦

  // --- useEffect：页面打开时自动聚焦输入框 ---
  useEffect(() => {
    inputRef.current.focus();  // 只在首次渲染后执行一次
  }, []);  // 空依赖数组 = 只执行一次

  // --- 搜索天气 ---
  async function fetchWeather(query) {
    if (!query.trim()) return;  // 空字符串或空格 → 不管

    setLoading(true);           // 开始加载：显示 loading
    setError(null);             // 清除上次的错误
    setWeather(null);           // 清除上次的结果（不删的话旧数据会闪一下）

    try {
      // wttr.in 是免费天气 API，不需要注册和 key
      // format=j1 表示返回 JSON 格式
      const url = `https://wttr.in/${encodeURIComponent(query)}?format=j1`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("城市找不到，请检查名称");
      }

      const data = await res.json();
      setWeather(data);         // 把完整的 JSON 存起来
    } catch (err) {
      // 网络断了、城市不存在、API 挂了 —— 全走这里
      setError(err.message || "请求失败，请稍后重试");
    } finally {
      setLoading(false);        // 不管成功失败，都要关 loading
    }
  }

  // --- 表单提交 ---
  function handleSubmit(e) {
    e.preventDefault();         // 阻止页面刷新（表单默认行为）
    fetchWeather(city);         // 用输入框里的城市名搜索
  }

  // --- 从 JSON 中提取需要的数据 ---
  const current = weather?.current_condition?.[0];
  const area = weather?.nearest_area?.[0];

  return (
    <div className="app">
      {/* ===== 搜索栏 ===== */}
      <form className="search-bar" onSubmit={handleSubmit}>
        {/* ref={inputRef}：让 useRef 拿到这个 input 的真实 DOM 节点 */}
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="输入城市名，如 Beijing、东京、London..."
          value={city}
          onChange={(e) => setCity(e.target.value)}  // 受控组件：值由 state 控制
        />
        <button className="search-btn" type="submit" disabled={loading}>
          {loading ? "搜索中..." : "搜索"}
        </button>
      </form>

      {/* ===== 三种显示状态 ===== */}

      {/* 状态 1：加载中 */}
      {loading && (
        <div className="card">
          <div className="spinner" />
          <p className="loading-text">正在查询 {city} 的天气...</p>
        </div>
      )}

      {/* 状态 2：出错了 */}
      {error && !loading && (
        <div className="card card-error">
          <p className="error-icon">!</p>
          <p className="error-text">{error}</p>
        </div>
      )}

      {/* 状态 3：有数据，显示天气卡片 */}
      {current && !loading && (
        <div className="card weather-card">
          {/* 城市名 + 天气描述 */}
          <div className="weather-header">
            <h2 className="city-name">
              {city}
            </h2>
            <p className="country">
              {area?.country?.[0]?.value}
            </p>
            <p className="weather-desc">
              {current.weatherDesc?.[0]?.value}
            </p>
          </div>

          {/* 大温度数字 */}
          <div className="temp-main">
            <span className="temp-value">{current.temp_C}</span>
            <span className="temp-unit">°C</span>
          </div>

          {/* 详细信息网格：体感温度 / 湿度 / 风速 / 能见度 */}
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">体感温度</span>
              <span className="detail-value">{current.FeelsLikeC}°C</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">湿度</span>
              <span className="detail-value">{current.humidity}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">风速</span>
              <span className="detail-value">{current.windspeedKmph} km/h</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">能见度</span>
              <span className="detail-value">{current.visibility} km</span>
            </div>
          </div>
        </div>
      )}

      {/* 状态 4：什么都没搜过 —— 显示初始引导 */}
      {!loading && !error && !current && (
        <div className="card card-hint">
          <p className="hint-icon">🌤</p>
          <p className="hint-text">输入城市名，查看实时天气</p>
        </div>
      )}
    </div>
  );
}
