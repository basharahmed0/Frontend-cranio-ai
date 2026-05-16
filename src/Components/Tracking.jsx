import React, { useState, useEffect } from "react";
import "./tracking.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { apiRequest } from "./api";

// label → Arabic + color
const labelInfo = (label) => {
  const map = {
    Normal: { ar: "طبيعي", color: "#4cd964" },
    Mild: { ar: "خفيف", color: "#6c47ff" },
    Moderate: { ar: "متوسط", color: "#ffcc00" },
    Moderate_Severe: { ar: "شديد نسبياً", color: "#ff8c00" },
    "Moderate Severe": { ar: "شديد نسبياً", color: "#ff8c00" },
    Severe: { ar: "شديد", color: "#ff3b30" },
  };
  return map[label] ?? { ar: label ?? "—", color: "#999" };
};

const Tracking = () => {
  const [chartData, setChartData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [summary, setSummary] = useState({
    improvement: 0,
    daysRemaining: 0,
    completedSessions: 0,
    avgImprovement: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── قراءة نتايج الكاميرا من localStorage ──
    try {
      const stored = JSON.parse(
        localStorage.getItem("analysisResults") || "[]",
      );
      setLocalResults(stored);
    } catch {
      setLocalResults([]);
    }

    // ── جلب بيانات الـ API ──
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/api/Progress/dashboard");

        const dashboard = res?.data;
        const sessionDetails = dashboard?.sessionDetails || [];
        const improvement = dashboard?.currentImprovement || 0;
        const daysRemaining = dashboard?.daysRemaining || 0;
        const completedSessions = dashboard?.completedSessions || 0;

        const formatted = (dashboard?.improvementCurve || []).map((item) => ({
          name: `جلسة ${item.sessionNumber}`,
          value: Math.round(item.improvementPercentage || 0),
        }));

        const sessionRows = sessionDetails.map((s, i) => {
          const prev = i > 0 ? sessionDetails[i - 1].improvementPercentage : 0;
          const curr = s.improvementPercentage || 0;
          const diff = Math.round(curr - prev);
          return {
            name: s.sessionName || `جلسة ${i + 1}`,
            value: Math.round(curr),
            change: diff >= 0 ? `+${diff}%` : `${diff}%`,
          };
        });

        const avg =
          sessionDetails.length > 0
            ? (
                sessionDetails.reduce(
                  (sum, s) => sum + (s.improvementPercentage || 0),
                  0,
                ) / sessionDetails.length
              ).toFixed(1)
            : 0;

        setChartData(formatted);
        setSessions(sessionRows);
        setSummary({
          improvement,
          daysRemaining,
          completedSessions,
          avgImprovement: avg,
        });
      } catch (err) {
        console.error("Tracking error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── حساب متوسط الـ confidence من نتايج الكاميرا ──
  const avgConfidence =
    localResults.length > 0
      ? (
          localResults.reduce((s, r) => s + (r.score || 0), 0) /
          localResults.length
        ).toFixed(1)
      : null;

  const lastLabel =
    localResults.length > 0
      ? localResults[localResults.length - 1].label
      : null;

  if (loading)
    return (
      <div className="fulltracking">
        <p style={{ padding: "2rem", textAlign: "center" }}>جاري التحميل...</p>
      </div>
    );

  return (
    <div className="fulltracking">
      <div className="tracking-container">
        <div className="progress-tracking">
          <h1>التقدم</h1>
          <p>تابع تحسنك عبر الجلسات العلاجية</p>
        </div>

        {/* ── إحصائيات ── */}
        <div className="statsics">
          <div className="stat">
            <ul>
              <li>
                {summary.improvement}% <span>التحسن الحالي</span>
              </li>
              <li>
                {summary.daysRemaining} <span>عدد ايام التمارين</span>
              </li>
              <li>
                {summary.completedSessions} <span>جلسات مكتملة</span>
              </li>
              {lastLabel && (
                <li>
                  <span
                    style={{
                      color: labelInfo(lastLabel).color,
                      fontWeight: 700,
                    }}
                  >
                    {labelInfo(lastLabel).ar}
                  </span>{" "}
                  <span>آخر تشخيص</span>
                </li>
              )}
              {avgConfidence && (
                <li>
                  {avgConfidence}% <span>متوسط ثقة التحليل</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── نتايج تحليل الكاميرا ── */}
        {localResults.length > 0 && (
          <div className="camera-results-section">
            <h2>نتايج تحليل الصور</h2>

            <div className="camera-summary">
              <div className="cam-stat">
                <span className="cam-val">{localResults.length}</span>
                <span className="cam-label">صورة تم تحليلها</span>
              </div>
              <div className="cam-stat">
                <span className="cam-val">{avgConfidence}%</span>
                <span className="cam-label">متوسط الثقة</span>
              </div>
              {lastLabel && (
                <div className="cam-stat">
                  <span
                    className="cam-val"
                    style={{ color: labelInfo(lastLabel).color }}
                  >
                    {labelInfo(lastLabel).ar}
                  </span>
                  <span className="cam-label">آخر تشخيص</span>
                </div>
              )}
            </div>

            <div className="frames-list">
              {localResults
                .slice(-10)
                .reverse()
                .map((r, i) => {
                  const info = labelInfo(r.label);
                  return (
                    <div className="frame-row" key={i}>
                      <span className="frame-time">{r.time}</span>
                      <span
                        className="frame-label"
                        style={{
                          background: info.color + "22",
                          color: info.color,
                        }}
                      >
                        {info.ar}
                      </span>
                      <div className="frame-bar-wrap">
                        <div
                          className="frame-bar"
                          style={{
                            width: `${r.score}%`,
                            background: info.color,
                          }}
                        />
                      </div>
                      <span className="frame-score">
                        {Math.round(r.score)}%
                      </span>
                    </div>
                  );
                })}
            </div>

            <button
              className="clear-btn"
              onClick={() => {
                localStorage.removeItem("analysisResults");
                setLocalResults([]);
              }}
            >
              🗑 مسح نتايج التحليل
            </button>
          </div>
        )}

        {/* ── منحنى التحسن ── */}
        <div className="graph">
          <div className="title">
            <h2>منحنى التحسن</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6C63FF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">لا توجد جلسات مكتملة حتى الآن</div>
          )}
          <div className="info">
            <p>
              بمعدل تحسن <span>{summary.avgImprovement}%</span> لكل جلسة، من
              المتوقع الوصول لـ <span>100%</span> خلال{" "}
              <span>{summary.daysRemaining} يوم</span>
            </p>
          </div>
        </div>

        {/* ── تفاصيل الجلسات ── */}
        <div className="details-session">
          <h2>تفاصيل الجلسات</h2>
          {sessions.length > 0 ? (
            sessions.map((session, index) => (
              <div className="session-row" key={index}>
                <div className="change">{session.change}</div>
                <div className="bar-container">
                  <div className="bar" style={{ width: `${session.value}%` }}>
                    {session.value}%
                  </div>
                </div>
                <div className="session-name">{session.name}</div>
              </div>
            ))
          ) : (
            <p style={{ color: "#aaa", textAlign: "center", padding: "1rem" }}>
              لا توجد جلسات مسجلة بعد
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
