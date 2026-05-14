import { useState, useEffect } from "react";
import { apiRequest } from "./api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .admin-root {
    font-family: 'Cairo', sans-serif;
    display: flex;
    height: 100vh;
    background: #f4f6fb;
    direction: rtl;
    overflow: hidden;
  }

  /* SIDEBAR */
  .sidebar {
    width: 220px;
    background: linear-gradient(160deg, #6c47ff 0%, #9b59f5 100%);
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    flex-shrink: 0;
    box-shadow: 4px 0 20px rgba(108,71,255,0.15);
  }
  .sidebar-logo {
    padding: 0 20px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.15);
  }
  .sidebar-logo h2 { color: #fff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .sidebar-logo p { color: rgba(255,255,255,0.65); font-size: 11px; margin-top: 2px; }
  .sidebar-nav {
    flex: 1; padding: 16px 12px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px; cursor: pointer;
    color: rgba(255,255,255,0.75); font-size: 13.5px; font-weight: 500;
    transition: all 0.18s; border: none; background: transparent;
    width: 100%; text-align: right;
  }
  .nav-item:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .nav-item.active { background: rgba(255,255,255,0.22); color: #fff; font-weight: 700; }
  .nav-icon { font-size: 17px; width: 22px; text-align: center; }
  .sidebar-user {
    padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; gap: 10px;
  }
  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700; font-size: 14px;
  }
  .user-info p { color: #fff; font-size: 13px; font-weight: 600; }
  .user-info span { color: rgba(255,255,255,0.6); font-size: 11px; }

  /* MAIN */
  .main-content { flex: 1; overflow-y: auto; padding: 28px 32px; }
  .page-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 28px;
  }
  .page-header h1 { font-size: 24px; font-weight: 800; color: #1a1a2e; }
  .page-header p { color: #888; font-size: 13px; margin-top: 2px; }
  .header-actions { display: flex; align-items: center; gap: 12px; }
  .notif-btn {
    width: 38px; height: 38px; border-radius: 50%; border: none;
    background: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: relative;
  }
  .notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #ff4757; border: 2px solid #fff;
  }
  .admin-avatar-btn {
    width: 38px; height: 38px; border-radius: 50%; border: none;
    background: linear-gradient(135deg, #6c47ff, #9b59f5);
    color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
  }

  /* STAT CARDS */
  .stats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 28px;
  }
  .stat-card {
    background: #fff; border-radius: 14px; padding: 18px 20px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .stat-info { flex: 1; }
  .stat-label { font-size: 12px; color: #999; margin-bottom: 6px; font-weight: 500; }
  .stat-value { font-size: 26px; font-weight: 800; color: #1a1a2e; line-height: 1; }
  .stat-change {
    font-size: 11px; font-weight: 600; padding: 3px 7px;
    border-radius: 20px; margin-top: 6px; display: inline-block;
  }
  .stat-change.up { background: #e8f5e9; color: #2e7d32; }
  .stat-icon {
    width: 46px; height: 46px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }

  /* TWO COL */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  /* CARD */
  .dashboard-card {
    background: #fff; border-radius: 14px; padding: 20px 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .card-header h3 { font-size: 15px; font-weight: 700; color: #1a1a2e; }

  /* LOADING / ERROR */
  .loading-spinner {
    display: flex; justify-content: center; align-items: center;
    padding: 40px; color: #6c47ff; font-size: 14px; gap: 10px;
  }
  .spin {
    width: 22px; height: 22px; border: 3px solid #ede9ff;
    border-top-color: #6c47ff; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .error-msg {
    padding: 14px 18px; border-radius: 10px;
    background: #fff0f0; color: #ff4757;
    font-size: 13px; font-weight: 600; margin-bottom: 16px;
  }
  .empty-msg {
    text-align: center; color: #aaa;
    font-size: 13px; padding: 30px 0;
  }

  /* ACTIVITY LIST */
  .activity-list { display: flex; flex-direction: column; gap: 12px; }
  .activity-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 10px; background: #fafafa;
  }
  .activity-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; flex-shrink: 0;
  }
  .activity-text { flex: 1; }
  .activity-title { font-size: 13px; font-weight: 600; color: #1a1a2e; }
  .activity-time { font-size: 11px; color: #aaa; margin-top: 1px; }
  .activity-badge {
    font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px;
  }
  .badge-session { background: #e8eaff; color: #6c47ff; }
  .badge-exercise { background: #e8f5e9; color: #2e7d32; }
  .badge-completed { background: #dcfce7; color: #16a34a; }

  /* USERS TABLE */
  .users-table { width: 100%; border-collapse: collapse; }
  .users-table th {
    text-align: right; padding: 10px 14px;
    font-size: 12px; font-weight: 600; color: #999;
    border-bottom: 1px solid #f0f0f0;
  }
  .users-table td {
    padding: 12px 14px; font-size: 13px; color: #1a1a2e;
    border-bottom: 1px solid #f7f7f7;
  }
  .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .status-active { background: #e8f5e9; color: #2e7d32; }
  .status-inactive { background: #f5f5f5; color: #999; }

  /* EXERCISES GRID */
  .exercises-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .exercise-card {
    background: #fafafa; border-radius: 12px;
    padding: 16px; border: 1px solid #f0f0f0;
  }
  .exercise-tag {
    display: inline-block; font-size: 11px; font-weight: 600;
    padding: 2px 8px; border-radius: 20px;
    background: #ede9ff; color: #6c47ff; margin-bottom: 8px;
  }
  .exercise-name { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
  .exercise-meta { display: flex; gap: 12px; font-size: 11.5px; color: #888; }

  /* SESSIONS LIST */
  .sessions-list { display: flex; flex-direction: column; gap: 12px; }
  .session-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: 12px;
    background: #fafafa; border: 1px solid #f0f0f0;
  }
  .session-info { flex: 1; }
  .session-name { font-size: 14px; font-weight: 700; color: #1a1a2e; }
  .session-date { font-size: 11px; color: #aaa; margin-top: 3px; }
  .session-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .session-completed { background: #dcfce7; color: #16a34a; }
  .session-pending { background: #ede9ff; color: #6c47ff; }
  .session-cancelled { background: #f5f5f5; color: #999; }

  /* CONTENT / ANALYTICS */
  .content-grid-videos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .video-card { border-radius: 12px; overflow: hidden; background: #fafafa; border: 1px solid #f0f0f0; }
  .video-thumb {
    height: 110px; background: linear-gradient(135deg, #c084fc, #f472b6);
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }
  .video-info { padding: 10px 12px; }
  .video-name { font-size: 13px; font-weight: 700; color: #1a1a2e; }
  .video-duration { font-size: 11px; color: #999; margin-top: 2px; }
  .video-actions { display: flex; gap: 6px; margin-top: 8px; }

  /* SETTINGS */
  .settings-form { display: flex; flex-direction: column; gap: 18px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 13px; font-weight: 600; color: #555; }
  .form-input {
    padding: 10px 14px; border-radius: 9px; border: 1.5px solid #e8e8e8;
    font-size: 13px; font-family: 'Cairo', sans-serif; outline: none; transition: border 0.18s;
  }
  .form-input:focus { border-color: #6c47ff; }
  .form-textarea {
    padding: 10px 14px; border-radius: 9px; border: 1.5px solid #e8e8e8;
    font-size: 13px; font-family: 'Cairo', sans-serif; outline: none;
    resize: vertical; min-height: 80px;
  }
  .toggle-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid #f0f0f0;
  }
  .toggle-label { font-size: 13.5px; font-weight: 600; color: #1a1a2e; }
  .toggle-desc { font-size: 11.5px; color: #aaa; margin-top: 2px; }
  .toggle {
    width: 44px; height: 24px; border-radius: 12px; border: none;
    cursor: pointer; position: relative; transition: background 0.2s;
  }
  .toggle.on { background: #6c47ff; }
  .toggle.off { background: #ddd; }
  .toggle::after {
    content: ''; position: absolute; width: 18px; height: 18px;
    border-radius: 50%; background: #fff; top: 3px; transition: right 0.2s, left 0.2s;
  }
  .toggle.on::after { right: 3px; }
  .toggle.off::after { right: 23px; }
  .save-btn {
    padding: 12px 28px; border-radius: 10px;
    background: linear-gradient(135deg, #6c47ff, #9b59f5);
    color: #fff; border: none; font-size: 14px; font-weight: 700;
    font-family: 'Cairo', sans-serif; cursor: pointer; margin-top: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .add-btn {
    padding: 9px 18px; border-radius: 9px; background: #6c47ff;
    color: #fff; border: none; font-size: 13px; font-weight: 700;
    font-family: 'Cairo', sans-serif; cursor: pointer;
  }
  .search-input {
    padding: 9px 14px; border-radius: 9px; border: 1.5px solid #e8e8e8;
    font-size: 13px; font-family: 'Cairo', sans-serif; outline: none; width: 240px;
  }
  .live-badge {
    background: #fff0f0; color: #ff4757; font-size: 11px; font-weight: 600;
    padding: 3px 8px; border-radius: 20px; display: flex; align-items: center; gap: 4px;
  }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff4757; animation: blink 1s infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* RESPONSIVE */
  @media (max-width: 1024px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .two-col { grid-template-columns: 1fr; }
    .content-grid-videos { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .admin-root { flex-direction: column; height: auto; overflow: auto; }
    .sidebar { width: 100%; padding: 12px 0; flex-direction: row; flex-wrap: wrap; align-items: center; }
    .sidebar-logo { padding: 0 16px; border-bottom: none; border-left: 1px solid rgba(255,255,255,0.15); }
    .sidebar-logo p { display: none; }
    .sidebar-nav { flex-direction: row; flex-wrap: wrap; padding: 8px; gap: 4px; flex: 1; }
    .nav-item { padding: 8px 10px; font-size: 12px; flex: 0 0 auto; }
    .sidebar-user { padding: 8px 16px; border-top: none; border-right: 1px solid rgba(255,255,255,0.15); }
    .user-info span { display: none; }
    .main-content { padding: 16px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .stat-value { font-size: 20px; }
    .two-col { grid-template-columns: 1fr; }
    .exercises-grid { grid-template-columns: 1fr; }
    .content-grid-videos { grid-template-columns: repeat(2, 1fr); }
    .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .page-header h1 { font-size: 18px; }
    .search-input { width: 100%; }
    .users-table { display: block; overflow-x: auto; white-space: nowrap; }
  }
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr; }
    .content-grid-videos { grid-template-columns: 1fr; }
    .nav-item span:not(.nav-icon) { display: none; }
    .nav-item { padding: 8px; }
  }
`;

const COLORS = [
  { bg: "#ede9ff", color: "#6c47ff" },
  { bg: "#fce7f3", color: "#db2777" },
  { bg: "#e0f2fe", color: "#0284c7" },
  { bg: "#dcfce7", color: "#16a34a" },
  { bg: "#fef3c7", color: "#d97706" },
];
const getColor = (i) => COLORS[i % COLORS.length];

// ─── helper: format date ───
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-EG", {
    year: "numeric", month: "short", day: "numeric",
  });
};

// ─── Spinner ───
const Spinner = () => (
  <div className="loading-spinner">
    <div className="spin" />
    جاري التحميل...
  </div>
);

export default function AdminDashboard() {
  const [page, setPage] = useState("overview");
  const [toggles, setToggles] = useState({ register: true, dark: false });

  // ── data state ──
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [profile, setProfile] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);

  // ── loading / error per section ──
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const setErr = (key, val) => setErrors((p) => ({ ...p, [key]: val }));

  // ── fetch helpers ──
  const fetchStats = async () => {
    setLoad("stats", true); setErr("stats", null);
    try {
      const res = await apiRequest("/api/Profile/stats");
      setStats(res.data || res);
    } catch {
      setErr("stats", "تعذّر تحميل الإحصائيات");
    } finally { setLoad("stats", false); }
  };

  const fetchProgress = async () => {
    setLoad("progress", true); setErr("progress", null);
    try {
      const res = await apiRequest("/api/Progress/dashboard");
      setProgress(res.data || res);
    } catch {
      setErr("progress", "تعذّر تحميل بيانات التقدم");
    } finally { setLoad("progress", false); }
  };

  const fetchProfile = async () => {
    setLoad("profile", true); setErr("profile", null);
    try {
      const res = await apiRequest("/api/Auth/profile");
      setProfile(res.data || res);
    } catch {
      setErr("profile", "تعذّر تحميل بيانات المستخدم");
    } finally { setLoad("profile", false); }
  };

  const fetchExercises = async () => {
    setLoad("exercises", true); setErr("exercises", null);
    try {
      const res = await apiRequest("/api/Exercises");
      setExercises(res.data || res || []);
    } catch {
      setErr("exercises", "تعذّر تحميل التمارين");
    } finally { setLoad("exercises", false); }
  };

  const fetchSessions = async () => {
    setLoad("sessions", true); setErr("sessions", null);
    try {
      const res = await apiRequest("/api/Sessions");
      setSessions(res.data || res || []);
    } catch {
      setErr("sessions", "تعذّر تحميل الجلسات");
    } finally { setLoad("sessions", false); }
  };

  // ── initial load ──
  useEffect(() => {
    fetchStats();
    fetchProgress();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (page === "exercises") fetchExercises();
    if (page === "users" || page === "overview") fetchSessions();
  }, [page]);

  // ── derived stat cards ──
  const statCards = [
    {
      label: "إجمالي الجلسات",
      value: stats?.totalSessions ?? progress?.completedSessions ?? "—",
      change: null,
      icon: "✅",
      bg: "#dcfce7",
    },
    {
      label: "أيام العلاج المتبقية",
      value: progress?.daysRemaining ?? "—",
      change: null,
      icon: "📅",
      bg: "#e0f2fe",
    },
    {
      label: "نسبة التحسن",
      value: progress?.currentImprovement != null
        ? `${progress.currentImprovement}%`
        : "—",
      change: null,
      icon: "📈",
      bg: "#ede9ff",
    },
    {
      label: "التمارين المكتملة",
      value: stats?.completedExercises ?? "—",
      change: null,
      icon: "🏋️",
      bg: "#fef3c7",
    },
  ];

  const navItems = [
    { id: "overview", label: "نظرة عامة", icon: "📊" },
    { id: "users", label: "بيانات المستخدم", icon: "👤" },
    { id: "exercises", label: "التمارين", icon: "🏋️" },
    { id: "sessions", label: "الجلسات", icon: "🗓️" },
    { id: "analytics", label: "التحليلات", icon: "📈" },
    { id: "settings", label: "الإعدادات", icon: "⚙️" },
  ];

  const pageTitle = {
    overview: "نظرة عامة",
    users: "بيانات المستخدم",
    exercises: "التمارين",
    sessions: "الجلسات",
    analytics: "التحليلات",
    settings: "الإعدادات",
  };

  const pageDesc = {
    overview: "مرحباً بك في لوحة التحكم",
    users: "بيانات ملف المستخدم الحالي",
    exercises: "عرض التمارين العلاجية المتاحة",
    sessions: "سجل الجلسات العلاجية",
    analytics: "تقارير وإحصائيات التطبيق",
    settings: "تخصيص إعدادات الموقع",
  };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h2>Cranio AI</h2>
            <p>لوحة تحكم الأدمن</p>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-user">
            <div className="user-avatar">
              {profile?.name?.[0] ?? profile?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="user-info">
              <p>{profile?.name ?? "Admin"}</p>
              <span>{profile?.email ?? ""}</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1>{pageTitle[page]}</h1>
              <p>{pageDesc[page]}</p>
            </div>
            <div className="header-actions">
              <button className="notif-btn">
                🔔<span className="notif-dot" />
              </button>
              <button className="admin-avatar-btn">
                {profile?.name?.[0] ?? "A"}
              </button>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {page === "overview" && (
            <>
              {/* Stat Cards */}
              {loading.stats || loading.progress ? (
                <Spinner />
              ) : (
                <div className="stats-grid">
                  {statCards.map((s, i) => (
                    <div className="stat-card" key={i}>
                      <div className="stat-info">
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                      </div>
                      <div className="stat-icon" style={{ background: s.bg }}>
                        {s.icon}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Improvement Curve + Sessions */}
              <div className="two-col">
                {/* Improvement Curve */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>📈 منحنى التحسن</h3>
                    <span className="live-badge">
                      <span className="live-dot" />مباشر
                    </span>
                  </div>
                  {loading.progress ? <Spinner /> : errors.progress ? (
                    <div className="error-msg">{errors.progress}</div>
                  ) : progress?.improvementCurve?.length ? (
                    <div className="activity-list">
                      {progress.improvementCurve.map((pt, i) => (
                        <div className="activity-item" key={i}>
                          <div
                            className="activity-avatar"
                            style={{ background: getColor(i).bg, color: getColor(i).color }}
                          >
                            {pt.sessionNumber}
                          </div>
                          <div className="activity-text">
                            <div className="activity-title">
                              جلسة {pt.sessionNumber}
                            </div>
                            <div className="activity-time">{fmtDate(pt.date)}</div>
                          </div>
                          <span className="activity-badge badge-session">
                            {pt.improvementPercentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-msg">لا توجد بيانات تحسن بعد</p>
                  )}
                </div>

                {/* Recent Sessions */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>🗓️ آخر الجلسات</h3>
                  </div>
                  {loading.sessions ? <Spinner /> : errors.sessions ? (
                    <div className="error-msg">{errors.sessions}</div>
                  ) : sessions.length ? (
                    <div className="activity-list">
                      {sessions.slice(0, 5).map((s, i) => (
                        <div className="activity-item" key={s.id ?? i}>
                          <div
                            className="activity-avatar"
                            style={{ background: getColor(i).bg, color: getColor(i).color }}
                          >
                            {i + 1}
                          </div>
                          <div className="activity-text">
                            <div className="activity-title">
                              {s.sessionName ?? s.name ?? `جلسة ${i + 1}`}
                            </div>
                            <div className="activity-time">
                              {fmtDate(s.completedAt ?? s.createdAt ?? s.date)}
                            </div>
                          </div>
                          <span
                            className={`activity-badge ${s.isCompleted || s.status === "Completed"
                              ? "badge-completed"
                              : "badge-session"}`}
                          >
                            {s.isCompleted || s.status === "Completed" ? "مكتملة" : "جارية"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-msg">لا توجد جلسات بعد</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── USERS (profile) ── */}
          {page === "users" && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>بيانات المستخدم الحالي</h3>
                <button className="add-btn" onClick={fetchProfile}>🔄 تحديث</button>
              </div>
              {loading.profile ? <Spinner /> : errors.profile ? (
                <div className="error-msg">{errors.profile}</div>
              ) : profile ? (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>البريد الإلكتروني</th>
                      <th>الهاتف</th>
                      <th>تاريخ الميلاد</th>
                      <th>الجنس</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700 }}>{profile.name ?? "—"}</td>
                      <td style={{ color: "#888" }}>{profile.email ?? "—"}</td>
                      <td>{profile.phone ?? "—"}</td>
                      <td style={{ color: "#aaa" }}>{fmtDate(profile.dateOfBirth)}</td>
                      <td>{profile.gender ?? "—"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="empty-msg">لا توجد بيانات</p>
              )}

              {/* Stats row */}
              {stats && (
                <>
                  <div style={{ height: 1, background: "#f0f0f0", margin: "20px 0" }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 14 }}>
                    إحصائيات المستخدم
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                    {[
                      { label: "إجمالي الجلسات", value: stats.totalSessions ?? "—", icon: "✅" },
                      { label: "التمارين المكتملة", value: stats.completedExercises ?? "—", icon: "🏋️" },
                      { label: "نقاط التحسن", value: stats.improvementScore != null ? `${stats.improvementScore}%` : "—", icon: "📈" },
                    ].map((s, i) => (
                      <div className="stat-card" key={i} style={{ padding: 14 }}>
                        <div className="stat-info">
                          <div className="stat-label">{s.label}</div>
                          <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
                        </div>
                        <div className="stat-icon" style={{ background: getColor(i).bg, width: 36, height: 36, fontSize: 16 }}>
                          {s.icon}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── EXERCISES ── */}
          {page === "exercises" && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>جميع التمارين</h3>
                <button className="add-btn" onClick={fetchExercises}>🔄 تحديث</button>
              </div>
              {loading.exercises ? <Spinner /> : errors.exercises ? (
                <div className="error-msg">{errors.exercises}</div>
              ) : exercises.length ? (
                <div className="exercises-grid">
                  {exercises.map((ex, i) => (
                    <div className="exercise-card" key={ex.id ?? i}>
                      <span className="exercise-tag">
                        {ex.categoryName ?? ex.category ?? "عام"}
                      </span>
                      <div className="exercise-name">{ex.name ?? ex.title ?? `تمرين ${i + 1}`}</div>
                      <div className="exercise-meta">
                        {ex.rating != null && <span>⭐ {ex.rating}</span>}
                        {ex.completedCount != null && <span>✅ {ex.completedCount.toLocaleString()}</span>}
                        {ex.durationMinutes != null && <span>⏱ {ex.durationMinutes} دقائق</span>}
                        {ex.duration != null && <span>⏱ {ex.duration} دقائق</span>}
                      </div>
                      {ex.description && (
                        <p style={{ fontSize: 12, color: "#888", marginTop: 8, lineHeight: 1.6 }}>
                          {ex.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-msg">لا توجد تمارين متاحة</p>
              )}
            </div>
          )}

          {/* ── SESSIONS ── */}
          {page === "sessions" && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>سجل الجلسات العلاجية</h3>
                <button className="add-btn" onClick={fetchSessions}>🔄 تحديث</button>
              </div>
              {loading.sessions ? <Spinner /> : errors.sessions ? (
                <div className="error-msg">{errors.sessions}</div>
              ) : sessions.length ? (
                <div className="sessions-list">
                  {sessions.map((s, i) => (
                    <div className="session-item" key={s.id ?? i}>
                      <div className="session-info">
                        <div className="session-name">
                          {s.sessionName ?? s.name ?? `جلسة ${i + 1}`}
                        </div>
                        <div className="session-date">
                          {fmtDate(s.completedAt ?? s.createdAt ?? s.date)}
                        </div>
                        {s.improvementPercentage != null && (
                          <div style={{ fontSize: 12, color: "#6c47ff", marginTop: 4 }}>
                            التحسن: {s.improvementPercentage}%
                          </div>
                        )}
                      </div>
                      <span className={`session-badge ${
                        s.isCompleted || s.status === "Completed"
                          ? "session-completed"
                          : s.status === "Cancelled"
                          ? "session-cancelled"
                          : "session-pending"
                      }`}>
                        {s.isCompleted || s.status === "Completed"
                          ? "مكتملة"
                          : s.status === "Cancelled"
                          ? "ملغية"
                          : "جارية"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-msg">لا توجد جلسات بعد</p>
              )}
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {page === "analytics" && (
            <div className="two-col">
              <div className="dashboard-card">
                <div className="card-header"><h3>📊 إحصائيات التقدم</h3></div>
                {loading.progress ? <Spinner /> : errors.progress ? (
                  <div className="error-msg">{errors.progress}</div>
                ) : progress ? (
                  <>
                    {[
                      { label: "الجلسات المكتملة", value: progress.completedSessions, max: 30, color: "#6c47ff" },
                      { label: "نسبة التحسن الحالية", value: progress.currentImprovement, max: 100, color: "#16a34a" },
                      { label: "الأيام المتبقية", value: 30 - (progress.daysRemaining ?? 0), max: 30, color: "#d97706" },
                    ].map((s, i) => (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600 }}>{s.label}</span>
                          <span style={{ color: s.color, fontWeight: 700 }}>{s.value ?? 0}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "#f0f0f0", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 4, background: s.color,
                            width: `${Math.min(100, ((s.value ?? 0) / s.max) * 100)}%`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </>
                ) : <p className="empty-msg">لا توجد بيانات</p>}
              </div>

              <div className="dashboard-card">
                <div className="card-header"><h3>📈 ملخص الإحصائيات</h3></div>
                {loading.stats ? <Spinner /> : errors.stats ? (
                  <div className="error-msg">{errors.stats}</div>
                ) : stats ? (
                  Object.entries(stats).map(([key, val], i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 0", borderBottom: "1px solid #f5f5f5",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{key}</span>
                      <div style={{ fontSize: 18, fontWeight: 800, color: getColor(i).color }}>
                        {typeof val === "number" ? val : String(val)}
                      </div>
                    </div>
                  ))
                ) : <p className="empty-msg">لا توجد بيانات</p>}
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {page === "settings" && (
            <div className="dashboard-card" style={{ maxWidth: 560 }}>
              <div className="card-header"><h3>إعدادات الموقع</h3></div>
              <div className="settings-form">
                <div className="form-group">
                  <label className="form-label">اسم الموقع</label>
                  <input className="form-input" defaultValue="Cranio AI" />
                </div>
                <div className="form-group">
                  <label className="form-label">وصف الموقع</label>
                  <textarea className="form-textarea" />
                </div>
                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني للدعم</label>
                  <input className="form-input" defaultValue="support@cranio.ai" />
                </div>
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">تفعيل التسجيل الجديد</div>
                    <div className="toggle-desc">السماح للمستخدمين الجدد بالتسجيل</div>
                  </div>
                  <button
                    className={`toggle ${toggles.register ? "on" : "off"}`}
                    onClick={() => setToggles((t) => ({ ...t, register: !t.register }))}
                  />
                </div>
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">الوضع الليلي</div>
                    <div className="toggle-desc">تفعيل الوضع الداكن للموقع</div>
                  </div>
                  <button
                    className={`toggle ${toggles.dark ? "on" : "off"}`}
                    onClick={() => setToggles((t) => ({ ...t, dark: !t.dark }))}
                  />
                </div>
                <button className="save-btn">💾 حفظ الإعدادات</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
