import React, { useState } from "react";
import styles from "./Signup.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import BASE_URL from "./api";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقين");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.log("Response not JSON:", text);
        }
      }

      if (response.ok) {
        navigate("/signin", {
          state: { message: "تم إنشاء الحساب بنجاح! سجل دخولك الآن 🎉" },
        });
      } else {
        if (data?.errors) {
          setError(Object.values(data.errors).flat().join(" - "));
        } else {
          setError(
            data?.message ||
              data?.title ||
              `خطأ ${response.status}: فشل إنشاء الحساب`,
          );
        }
      }
    } catch (error) {
      setError("مشكلة في الشبكة: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const text = await res.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          console.log("Response not JSON:", text);
        }
      }

      if (res.ok) {
        const token = data?.data?.token;
        if (token) localStorage.setItem("token", token);
        if (data?.data?.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }
        navigate("/");
      } else {
        setError(data?.message || "فشل تسجيل الدخول بجوجل");
      }
    } catch (err) {
      setError("مشكلة في الشبكة: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError("Facebook SDK not loaded");
      return;
    }

    setLoading(true);
    window.FB.login(
      async function (response) {
        if (response.authResponse) {
          try {
            const res = await fetch(`${BASE_URL}/api/Auth/facebook-login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: response.authResponse.accessToken,
              }),
            });

            const text = await res.text();
            let data = null;
            if (text) {
              try {
                data = JSON.parse(text);
              } catch {
                console.log("Response not JSON:", text);
              }
            }

            if (res.ok) {
              const token = data?.data?.token;
              if (token) localStorage.setItem("token", token);
              if (data?.data?.user) {
                localStorage.setItem("user", JSON.stringify(data.data.user));
              }
              navigate("/");
            } else {
              setError(data?.message || "فشل تسجيل الدخول بفيسبوك");
            }
          } catch (err) {
            setError("مشكلة في الشبكة: " + err.message);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      },
      { scope: "public_profile,email" },
    );
  };

  return (
    <div className={styles.signuppage}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/image/logo/Logo.png" alt="Cranio ai" />
          <h4>Cranio ai</h4>
          <p>يساعدك علي متابعة جلسات العلاج وتقييم حالتك بسهوله</p>
        </div>

        <div className={styles.data}>
          <form onSubmit={handleSubmit}>
            <label>الأسم بالكامل</label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <label>البريد الألكتروني</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>تأكيد كلمة المرور</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <p
                style={{
                  color: "#c0392b",
                  fontSize: "13px",
                  margin: "8px 0",
                  padding: "8px 12px",
                  background: "#fdecea",
                  borderRadius: "6px",
                  textAlign: "right",
                }}
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "جاري..." : "إنشاء حساب جديد"}
            </button>
          </form>
        </div>

        <div className={styles.icons}>
          <img
            src="/image/buttons/facebook.png"
            alt="facebook"
            onClick={handleFacebookLogin}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          />
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("فشل تسجيل الدخول بجوجل")}
          />
        </div>

        <p className={styles.account}>
          لديك حساب بالفعل؟ <NavLink to="/signin">تسجيل الدخول</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
