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
import { useLang } from "./LangContext";

const Tracking = () => {
  const { t } = useLang();
  const tr = t.tracking || {};
  const cam = t.camera || {};

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

  // ── دالة ترجمة الـ label ──
  const labelInfo = (label) => {
    const labelMap = cam.labels || {};
    const displayName = labelMap[label] || label || "—";
    const colorMap = {
      Normal: "#4cd964",
      Mild: "#6c47ff",
      Moderate: "#ffcc00",
      "Moderate Severe": "#ff8c00",
      Moderate_Severe: "#ff8c00",
      Severe: "#ff3b30",
    };
    return {
      name: displayName,
      color: colorMap[label] || "#999",
    };
  };

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
          name:
            t.lang === "ar"
              ? `جلسة ${item.sessionNumber}`
              : `Session ${item.sessionNumber}`,
          value: Math.round(item.improvementPercentage || 0),
        }));

        const sessionRows = sessionDetails.map((s, i) => {
          const prev = i > 0 ? sessionDetails[i - 1].improvementPercentage : 0;
          const curr = s.improvementPercentage || 0;
          const diff = Math.round(curr - prev);
          return {
            name:
              s.sessionName ||
              (t.lang === "ar" ? `جلسة ${i + 1}` : `Session ${i + 1}`),
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
  }, [t.lang]);

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
        <p style={{ padding: "2rem", textAlign: "center" }}>
          {t.lang === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );

  return (
    <div className="fulltracking">
      <div className="tracking-container">
        <div className="progress-tracking">
          <h1>{tr.title}</h1>
          <p>{tr.subtitle}</p>
        </div>

        {/* ── إحصائيات ── */}
        <div className="statsics">
          <div className="stat">
            <ul>
              <li>
                {summary.improvement}% <span>{tr.currentImprovement}</span>
              </li>
              <li>
                {summary.daysRemaining} <span>{tr.daysRemaining}</span>
              </li>
              <li>
                {summary.completedSessions} <span>{tr.completedSessions}</span>
              </li>
              {lastLabel && (
                <li>
                  <span
                    style={{
                      color: labelInfo(lastLabel).color,
                      fontWeight: 700,
                    }}
                  >
                    {labelInfo(lastLabel).name}
                  </span>{" "}
                  <span>{tr.lastDiagnosis}</span>
                </li>
              )}
              {avgConfidence && (
                <li>
                  {avgConfidence}% <span>{tr.avgConfidence}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── نتايج تحليل الكاميرا ── */}
        {localResults.length > 0 && (
          <div className="camera-results-section">
            <h2>{tr.cameraResults}</h2>

            <div className="camera-summary">
              <div className="cam-stat">
                <span className="cam-val">{localResults.length}</span>
                <span className="cam-label">{tr.framesAnalyzed}</span>
              </div>
              <div className="cam-stat">
                <span className="cam-val">{avgConfidence}%</span>
                <span className="cam-label">{tr.avgConfidence}</span>
              </div>
              {lastLabel && (
                <div className="cam-stat">
                  <span
                    className="cam-val"
                    style={{ color: labelInfo(lastLabel).color }}
                  >
                    {labelInfo(lastLabel).name}
                  </span>
                  <span className="cam-label">{tr.lastDiagnosis}</span>
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
                        {info.name}
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
              {tr.clearResults}
            </button>
          </div>
        )}

        {/* ── منحنى التحسن ── */}
        <div className="graph">
          <div className="title">
            <h2>{tr.curve}</h2>
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
            <div className="empty-state">{tr.noSessions}</div>
          )}
          <div className="info">
            <p>
              {tr.avgInfo
                .replace("{avg}", summary.avgImprovement)
                .replace("{days}", summary.daysRemaining)}
            </p>
          </div>
        </div>

        {/* ── تفاصيل الجلسات ── */}
        <div className="details-session">
          <h2>{tr.details}</h2>
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
              {tr.noSessions}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;