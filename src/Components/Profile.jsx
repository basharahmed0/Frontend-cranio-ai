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
        JSON.stringify({ ...storedUser, fullName: form.fullName })
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

// =================== FAQ PAGE ===================
const FAQPage = ({ onBack }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      question: "كيف أبدأ استخدام التطبيق؟",
      answer:
        "بعد تسجيل الدخول، سيتم توجيهك تلقائيًا إلى الشاشة الرئيسية. اضغط على \"Rate via Camera\" أو \"Rate via Chat\"، ثم اتبع التعليمات الظاهرة على الشاشة.",
    },
    {
      question: "ما هي شروط إجراء فحص صحيح؟",
      answer:
        "يجب أن تكون في مكان جيد الإضاءة، وأن تضع الهاتف بمستوى العين، مع إزالة أي عوائق على الوجه مثل النظارات الشمسية أو الكمامات لضمان دقة التحليل.",
    },
    {
      question: "هل النتائج تُعتبر تشخيصًا طبيًا نهائيًا؟",
      answer:
        "لا، التطبيق هو أداة فحص مبدئي للمساعدة والتنبيه فقط. يجب دائمًا استشارة طبيب مختص للحصول على تشخيص طبي دقيق.",
    },
    {
      question: "كيف يتم حماية بياناتي؟",
      answer:
        "نحن نأخذ الخصوصية بجدية؛ فجميع البيانات والتحليلات مشفرة، كما أن صورك الشخصية لا تتم مشاركتها أبدًا مع أي جهات خارجية.",
    },
  ];

  return (
    <div style={{ padding: "20px", direction: "rtl", fontFamily: "inherit" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "28px",
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
          الأسئلة الشائعة
        </h2>
      </div>

      {/* FAQ List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {faqData.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1.5px solid #f0f0f0",
              overflow: "hidden",
              transition: "all 0.3s ease",
              boxShadow: openIndex === index
                ? "0 4px 15px rgba(108, 71, 255, 0.1)"
                : "0 1px 3px rgba(0,0,0,0.04)",
              borderColor: openIndex === index ? "#e0d4ff" : "#f0f0f0",
            }}
          >
            {/* Question Button */}
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{
                width: "100%",
                padding: "16px 18px",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a1a2e",
                  textAlign: "right",
                  flex: 1,
                }}
              >
                {item.question}
              </span>
              <span
                style={{
                  fontSize: "20px",
                  color: "#6c47ff",
                  transition: "transform 0.3s ease",
                  transform: openIndex === index ? "rotate(-90deg)" : "rotate(0deg)",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ‹
              </span>
            </button>

            {/* Answer */}
            <div
              style={{
                maxHeight: openIndex === index ? "300px" : "0",
                overflow: "hidden",
                transition: "max-height 0.4s ease, padding 0.3s ease",
              }}
            >
              <div
                style={{
                  padding: "0 18px 18px 18px",
                }}
              >
                <div
                  style={{
                    height: "1px",
                    background: "linear-gradient(to left, transparent, #e8e8e8, transparent)",
                    marginBottom: "14px",
                  }}
                />
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.9",
                    color: "#666",
                    margin: 0,
                    textAlign: "right",
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Note */}
      <div
        style={{
          marginTop: "28px",
          padding: "16px",
          background: "linear-gradient(135deg, #f8f5ff, #f0ecff)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "#6c47ff", margin: 0, fontWeight: "500" }}>
          💬 لم تجد إجابة لسؤالك؟
        </p>
        <p style={{ fontSize: "12px", color: "#888", margin: "6px 0 0 0" }}>
          تواصل معنا من خلال صفحة "اتصل بنا"
        </p>
      </div>
    </div>
  );
};

// =================== CONTACT US PAGE ===================
const ContactUsPage = ({ onBack }) => {
  const contactMethods = [
    {
      icon: "📧",
      label: "البريد الإلكتروني",
      value: "support@facecheck.com",
      color: "#6c47ff",
    },
    {
      icon: "📱",
      label: "واتساب",
      value: "+966 55 123 4567",
      color: "#25D366",
    },
    {
      icon: "🌐",
      label: "الموقع الإلكتروني",
      value: "www.facecheck.com",
      color: "#1DA1F2",
    },
  ];

  const socialLinks = [
    { icon: "𝕏", label: "Twitter", color: "#000" },
    { icon: "📸", label: "Instagram", color: "#E1306C" },
    { icon: "📘", label: "Facebook", color: "#1877F2" },
  ];

  return (
    <div style={{ padding: "20px", direction: "rtl", fontFamily: "inherit" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "28px",
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
          اتصل بنا
        </h2>
      </div>

      {/* Hero Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #6c47ff, #9b59f5)",
          borderRadius: "16px",
          padding: "28px 20px",
          textAlign: "center",
          marginBottom: "24px",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>💬</div>
        <h3 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 8px 0" }}>
          نحن هنا لمساعدتك
        </h3>
        <p style={{ fontSize: "13px", margin: 0, opacity: 0.9, lineHeight: "1.7" }}>
          لا تتردد في التواصل معنا في أي وقت، فريق الدعم لدينا متاح على مدار الساعة
        </p>
      </div>

      {/* Contact Methods */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {contactMethods.map((method, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "16px 18px",
              border: "1.5px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#e0d4ff";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 71, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#f0f0f0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `${method.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                flexShrink: 0,
              }}
            >
              {method.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#999",
                  margin: "0 0 4px 0",
                  fontWeight: "500",
                }}
              >
                {method.label}
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#1a1a2e",
                  margin: 0,
                  fontWeight: "600",
                }}
              >
                {method.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Social Media */}
      <div style={{ marginBottom: "20px" }}>
        <h4
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#555",
            marginBottom: "14px",
            textAlign: "center",
          }}
        >
          تابعنا على وسائل التواصل
        </h4>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          {socialLinks.map((social, index) => (
            <div
              key={index}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "14px",
                background: `${social.color}10`,
                border: `1.5px solid ${social.color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 6px 15px ${social.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {social.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div
        style={{
          background: "#f9f9fb",
          borderRadius: "12px",
          padding: "18px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "#888", margin: 0, lineHeight: "1.8" }}>
          🕐 ساعات العمل: يومياً من{" "}
          <span style={{ fontWeight: "600", color: "#555" }}>9 صباحاً - 9 مساءً</span>
        </p>
      </div>
    </div>
  );
};

// =================== ABOUT APP PAGE ===================
const AboutAppPage = ({ onBack }) => {
  const features = [
    { icon: "🎯", title: "فحص دقيق", desc: "تحليل متقدم بتقنيات الذكاء الاصطناعي" },
    { icon: "🔒", title: "خصوصية تامة", desc: "بياناتك مشفرة ومحمية بالكامل" },
    { icon: "⚡", title: "نتائج فورية", desc: "احصل على تقييمك في ثوانٍ معدودة" },
    { icon: "📊", title: "متابعة مستمرة", desc: "تتبع تقدمك وتحسنك عبر الزمن" },
  ];

  return (
    <div style={{ padding: "20px", direction: "rtl", fontFamily: "inherit" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "28px",
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
          عن التطبيق
        </h2>
      </div>

      {/* App Logo & Name */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "22px",
            background: "linear-gradient(135deg, #6c47ff, #9b59f5)",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "38px",
            boxShadow: "0 8px 25px rgba(108, 71, 255, 0.3)",
          }}
        >
          🩺
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px 0" }}>
          FaceCheck
        </h3>
        <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
          الإصدار 1.0.0
        </p>
      </div>

      {/* Description */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "20px",
          border: "1.5px solid #f0f0f0",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            lineHeight: "2",
            color: "#555",
            margin: 0,
            textAlign: "center",
          }}
        >
          FaceCheck هو تطبيق ذكي يُقدم لك تقييمًا مبدئيًا لحالتك الصحية من خلال تحليل
          الوجه باستخدام تقنيات الذكاء الاصطناعي المتقدمة. نسعى لجعل الرعاية الصحية
          أكثر سهولة وإتاحةً للجميع.
        </p>
      </div>

      {/* Features */}
      <h4
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#555",
          marginBottom: "14px",
          textAlign: "center",
        }}
      >
        مميزات التطبيق
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "18px 14px",
              border: "1.5px solid #f0f0f0",
              textAlign: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#e0d4ff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 15px rgba(108, 71, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#f0f0f0";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>{feature.icon}</div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#1a1a2e",
                margin: "0 0 4px 0",
              }}
            >
              {feature.title}
            </p>
            <p style={{ fontSize: "11px", color: "#999", margin: 0, lineHeight: "1.6" }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: "#fff9e6",
          borderRadius: "12px",
          padding: "16px 18px",
          border: "1.5px solid #ffe8a0",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#b8860b",
            margin: 0,
            lineHeight: "1.8",
            textAlign: "center",
          }}
        >
          ⚠️ تنبيه: هذا التطبيق أداة فحص مبدئية فقط ولا يُغني عن استشارة الطبيب المختص
          للحصول على تشخيص طبي دقيق.
        </p>
      </div>

      {/* Footer */}
      <p
        style={{
          fontSize: "12px",
          color: "#bbb",
          textAlign: "center",
          margin: "20px 0 0 0",
        }}
      >
        © 2025 FaceCheck — جميع الحقوق محفوظة
      </p>
    </div>
  );
};

// =================== MAIN PROFILE ===================
const Profile = () => {
  const [activeMenu, setActiveMenu] = useState("");
  const [showPage, setShowPage] = useState(null); // null | "personalData" | "faq" | "contact" | "about"
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
    { id: 1, label: "البيانات الشخصية", page: "personalData" },
    { id: 2, label: "الاشعارات", page: null },
    { id: 3, label: "الخصوصية", page: null },
  ];

  const supportOptions = [
    { id: 1, label: "اتصل بنا", page: "contact" },
    { id: 2, label: "الأسئلة الشائعة", page: "faq" },
    { id: 3, label: "عن التطبيق", page: "about" },
  ];

  // ===== Sub Pages =====
  if (showPage === "personalData") {
    return (
      <div className="user-profile" dir="rtl">
        <div className="profile-container">
          <PersonalData onBack={() => setShowPage(null)} />
        </div>
      </div>
    );
  }

  if (showPage === "faq") {
    return (
      <div className="user-profile" dir="rtl">
        <div className="profile-container">
          <FAQPage onBack={() => setShowPage(null)} />
        </div>
      </div>
    );
  }

  if (showPage === "contact") {
    return (
      <div className="user-profile" dir="rtl">
        <div className="profile-container">
          <ContactUsPage onBack={() => setShowPage(null)} />
        </div>
      </div>
    );
  }

  if (showPage === "about") {
    return (
      <div className="user-profile" dir="rtl">
        <div className="profile-container">
          <AboutAppPage onBack={() => setShowPage(null)} />
        </div>
      </div>
    );
  }

  // ===== Main Profile Page =====
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
                    if (item.page) setShowPage(item.page);
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
                  onClick={() => {
                    setActiveMenu(`support-${item.id}`);
                    if (item.page) setShowPage(item.page);
                  }}
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