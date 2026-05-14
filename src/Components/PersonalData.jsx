import React, { useState, useEffect } from "react";
import { apiRequest } from "./api";

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
          setForm({
            fullName: data.fullName || "",
            email: data.email || "",
          });
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

      // حدّث الـ localStorage
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
      {/* HEADER */}
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
            fontSize: "20px",
            color: "#6c47ff",
            padding: "4px",
          }}
        >
          ›
        </button>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>
          البيانات الشخصية
        </h2>
      </div>

      {/* FIELDS */}
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

        {/* MESSAGE */}
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

        {/* SAVE BUTTON */}
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

export default PersonalData;
