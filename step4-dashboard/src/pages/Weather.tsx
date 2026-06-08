import { useState, useEffect, useRef, type FormEvent } from "react";
import { useTheme } from "../context/ThemeContext";

// wttr.in API 返回结构复杂，用 any 即可（外部数据不可控）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WeatherData = any;

export default function Weather() {
  const { theme } = useTheme();

  const [city, setCity] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function fetchWeather(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const url = `https://wttr.in/${encodeURIComponent(query)}?format=j1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("城市找不到");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      setError((err as Error).message || "请求失败");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    fetchWeather(city);
  }

  const current = weather?.current_condition?.[0];

  return (
    <div className="page">
      <h1>天气查询</h1>

      <form className="weather-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="weather-input"
          type="text"
          placeholder="输入城市名，如 Beijing、东京、London..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "搜索中..." : "搜索"}
        </button>
      </form>

      {loading && <div className="weather-status">正在查询 {city} 的天气...</div>}

      {error && !loading && (
        <div className="weather-status error">{error}</div>
      )}

      {current && !loading && (
        <div className="weather-result">
          <div className="weather-main">
            <span className="weather-temp">{current.temp_C}</span>
            <span className="weather-unit">°C</span>
          </div>
          <p className="weather-desc">
            {city} · {current.weatherDesc?.[0]?.value}
          </p>
          <div className="weather-details">
            <span>体感 {current.FeelsLikeC}°C</span>
            <span>湿度 {current.humidity}%</span>
            <span>风速 {current.windspeedKmph} km/h</span>
            <span>能见度 {current.visibility} km</span>
          </div>
        </div>
      )}
    </div>
  );
}
