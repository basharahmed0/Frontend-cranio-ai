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

const Tracking = () => {
  const [chartData, setChartData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({
    improvement: 0,
    daysRemaining: 0,
    completedSessions: 0,
    avgImprovement: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/api/Progress/dashboard");
        console.log("FULL RESPONSE:", res);
        console.log("DATA STRING:", JSON.stringify(res?.data, null, 2));

        const dashboard = res?.data;
        const sessionDetails = dashboard?.sessionDetails || [];
        const improvement = dashboard?.currentImprovement || 0;
        const daysRemaining = dashboard?.daysRemaining || 0;
        const completedSessions = dashboard?.completedSessions || 0;

        // improvementCurve is array of objects { sessionNumber, improvementPercentage, date }
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
            </ul>
          </div>
        </div>

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
                <Line type="monotone" dataKey="value" stroke="#6C63FF" />
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

        <div className="details-session">
          <h2>تفاصيل الجلسات</h2>
          {sessions.map((session, index) => (
            <div className="session-row" key={index}>
              <div className="change">{session.change}</div>
              <div className="bar-container">
                <div className="bar" style={{ width: `${session.value}%` }}>
                  {session.value}%
                </div>
              </div>
              <div className="session-name">{session.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
