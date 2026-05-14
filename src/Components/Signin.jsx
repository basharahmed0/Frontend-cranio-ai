import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Signin.css";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // رسالة النجاح من صفحة الـ Signup
  const successMessage = location.state?.message;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://crainoai.runasp.net/api/Auth/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credentialResponse.credential }),
        },
      );

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://crainoai.runasp.net/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

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
        const token = data?.data?.token;
        if (token) localStorage.setItem("token", token);
        if (data?.data?.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        } else {
          localStorage.setItem("user", JSON.stringify({ email }));
        }
        navigate("/");
      } else {
        let errorMessage = "فشل تسجيل الدخول";
        if (data?.message) errorMessage = data.message;
        else if (data?.errors)
          errorMessage = Object.values(data.errors).flat().join(" - ");
        else if (data?.title) errorMessage = data.title;
        setError(`${errorMessage} (${response.status})`);
      }
    } catch (err) {
      setError("مشكلة في الشبكة: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-Container">
        <div className="Logo">
          <img src="/image/logo/Logo.png" alt="Cranio ai" />
          <h4>Cranio ai</h4>
          <p>يساعدك علي متابعة جلسات العلاج وتقييم حالتك بسهوله</p>
        </div>

        <div className="Data">
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">البريد الألكتروني</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">كلمة المرور</label>
            <div className="showpassword">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                src={
                  showPassword
                    ? "/image/buttons/hide.png"
                    : "/image/buttons/show.png"
                }
                alt="toggle password"
                className="eyeIcon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            {/* رسالة النجاح من الـ Signup */}
            {successMessage && (
              <p
                style={{
                  color: "#2e7d32",
                  fontSize: "13px",
                  margin: "8px 0",
                  padding: "8px 12px",
                  background: "#e8f5e9",
                  borderRadius: "6px",
                  textAlign: "right",
                }}
              >
                {successMessage}
              </p>
            )}

            {/* رسالة الخطأ */}
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

            <a href="#" className="forgot">
              هل نسيت كلمة المرور؟
            </a>

            <button type="submit" disabled={loading}>
              {loading ? "جاري الدخول..." : "تسجيل دخول"}
            </button>
          </form>
        </div>

        <div className="icons">
          <img src="/image/buttons/twiter.png" alt="twitter" />
          <img src="/image/buttons/facebook.png" alt="facebook" />
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("فشل تسجيل الدخول بجوجل")}
          />
        </div>

        <p className="account-signin">
          ليس لديك حساب بالفعل؟ <NavLink to="/signup">انشاء حساب</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signin;
