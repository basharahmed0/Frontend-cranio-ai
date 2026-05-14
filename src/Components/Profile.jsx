import React, { useState, useEffect, useRef } from "react";
import "./profile.css";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./api";

// =================== PERSONAL DATA PAGE ===================
const PersonalData = ({ onBack }) => {
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiRequest("/api/Profile");
        const data = res?.data;
        if (data) {
          setForm({ fullName: data.fullName || "", email: data.email || "" });
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setMessage({ text: "الاسم لا يمكن أن يكون فارغاً", type: "error" });
      return;
    }
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest("/api/Profile", {
        method: "PUT",
        body: JSON.stringify({ fullName: form.fullName }),
      });
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, fullName: form.fullName }),
      );
      setMessage({ text: "تم حفظ البيانات بنجاح ✓", type: "success" });
    } catch (err) {
      setMessage({ text: "فشل الحفظ: " + err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e8e8e8",
    borderRadius: "9px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    direction: "rtl",
    background: "#fff",
  };
  const disabledInputStyle = {
    ...inputStyle,
    background: "#f5f5f5",
    color: "#aaa",
    cursor: "not-allowed",
  };
  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "6px",
    display: "block",
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
        جاري التحميل...
      </div>
    );

  return (
    <div style={{ padding: "20px", direction: "rtl", fontFamily: "inherit" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#6c47ff",
            padding: "4px",
            lineHeight: 1,
          }}
        >
          ›
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>
          البيانات الشخصية
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={labelStyle}>الاسم الكامل</label>
          <input
            style={inputStyle}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="أدخل اسمك الكامل"
          />
        </div>

        <div>
          <label style={labelStyle}>البريد الإلكتروني</label>
          <input style={disabledInputStyle} value={form.email} disabled />
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
            لا يمكن تغيير البريد الإلكتروني
          </p>
        </div>

        <div>
          <label style={labelStyle}>كلمة المرور</label>
          <input
            style={disabledInputStyle}
            value="••••••••"
            disabled
            type="password"
          />
          <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
            تغيير كلمة المرور — قريباً
          </p>
        </div>

        {message.text && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              background: message.type === "success" ? "#e8f5e9" : "#fdecea",
              color: message.type === "success" ? "#2e7d32" : "#c0392b",
            }}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "12px",
            borderRadius: "10px",
            background: saving
              ? "#ccc"
              : "linear-gradient(135deg, #6c47ff, #9b59f5)",
            color: "#fff",
            border: "none",
            fontSize: "14px",
            fontWeight: "700",
            fontFamily: "inherit",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
};

// =================== MAIN PROFILE ===================
const Profile = () => {
  const [activeMenu, setActiveMenu] = useState("");
  const [showPersonalData, setShowPersonalData] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [stats, setStats] = useState([
    { value: "—", label: "تقييمك" },
    { value: "—", label: "جلسات مكتملة" },
    { value: "—", label: "معدل التحسن" },
    { value: "—", label: "تمرينة مكتملة" },
  ]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) setProfileImage(savedImage);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.fullName || storedUser.email) {
      setUser({
        name: storedUser.fullName || storedUser.email || "المستخدم",
        email: storedUser.email || "",
      });
    }

    const fetchProfile = async () => {
      try {
        const [profileRes, progressRes] = await Promise.all([
          apiRequest("/api/Profile"),
          apiRequest("/api/Progress/dashboard"),
        ]);

        const profile = profileRes?.data;
        const dashboard = progressRes?.data;

        if (profile) {
          setUser({
            name: profile.fullName || profile.email || "المستخدم",
            email: profile.email || "",
          });
          if (profile.profileImageUrl) setProfileImage(profile.profileImageUrl);
        }

        if (dashboard) {
          setStats([
            { value: "4.8", label: "تقييمك" },
            { value: dashboard.completedSessions || 0, label: "جلسات مكتملة" },
            {
              value: `${dashboard.currentImprovement || 0}%`,
              label: "معدل التحسن",
            },
            {
              value: dashboard.sessionDetails?.length || 0,
              label: "تمرينة مكتملة",
            },
          ]);
        }
      } catch (err) {
        console.error("Profile error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة صالحة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }

    setImageLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      setProfileImage(base64);
      localStorage.setItem("profileImage", base64);
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage");
    navigate("/signin");
  };

  const accountSettings = [
    { id: 1, label: "البيانات الشخصية" },
    { id: 2, label: "الاشعارات" },
    { id: 3, label: "الخصوصية" },
  ];

  const supportOptions = [
    { id: 1, label: "اتصل بنا" },
    { id: 2, label: "الأسئلة الشائعة" },
    { id: 3, label: "عن التطبيق" },
  ];

  // صفحة البيانات الشخصية
  if (showPersonalData) {
    return (
      <div className="user-profile" dir="rtl">
        <div className="profile-container">
          <PersonalData onBack={() => setShowPersonalData(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile" dir="rtl">
      <div className="profile-container">
        {/* PROFILE SECTION */}
        <div className="profile-section">
          <div className="profile-avatar">
            <div
              className="avatar-circle"
              onClick={handleImageClick}
              style={{
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {imageLoading ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0f0f0",
                    fontSize: 24,
                  }}
                >
                  ⏳
                </div>
              ) : profileImage ? (
                <img
                  src={profileImage}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <img src="./image/loading/Container.png" alt="avatar" />
              )}

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  fontSize: 22,
                  color: "#fff",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                📷
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            {!loading && (
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <p style={{ fontWeight: 600, margin: 0, fontSize: "15px" }}>
                  {user.name}
                </p>
                <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
                  {user.email}
                </p>
              </div>
            )}
            <p
              style={{
                fontSize: "11px",
                color: "#aaa",
                marginTop: "4px",
                textAlign: "center",
              }}
            >
              اضغط لتغيير الصورة
            </p>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-box">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SETTINGS SECTION */}
        <div className="settings-section">
          <div className="settings-group">
            <h3 className="settings-title">إعدادات الحساب</h3>
            <div className="menu-list">
              {accountSettings.map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${activeMenu === `account-${item.id}` ? "active" : ""}`}
                  onClick={() => {
                    setActiveMenu(`account-${item.id}`);
                    if (item.id === 1) setShowPersonalData(true);
                  }}
                >
                  <span className="menu-icon">›</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-group">
            <h3 className="settings-title">الدعم والمساعدة</h3>
            <div className="menu-list">
              {supportOptions.map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${activeMenu === `support-${item.id}` ? "active" : ""}`}
                  onClick={() => setActiveMenu(`support-${item.id}`)}
                >
                  <span className="menu-icon">›</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            تسجيل الخروج <img src="./image/loading/svg.png" alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
