import React, { useState } from "react";
import styles from "./Signup.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import BASE_URL from "./api";
import { useLang } from "./LangContext";

const Signup = () => {
  const { t } = useLang();
  const s = t.signup;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError(s.passwordMismatch);
      setLoading(false); return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: formData.fullName, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword }),
      });
      const text = await response.text();
      let data = null;
      if (text) { try { data = JSON.parse(text); } catch {} }
      if (response.ok) {
        navigate("/signin", { state: { message: s.success } });
      } else {
        if (data?.errors) setError(Object.values(data.errors).flat().join(" - "));
        else setError(data?.message || data?.title || `${s.createFail} (${response.status})`);
      }
    } catch (error) {
      setError(s.networkError + error.message);
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const text = await res.text();
      let data = null;
      if (text) { try { data = JSON.parse(text); } catch {} }
      if (res.ok) {
        const token = data?.data?.token;
        if (token) localStorage.setItem("token", token);
        if (data?.data?.user) localStorage.setItem("user", JSON.stringify(data.data.user));
        navigate("/");
      } else { setError(data?.message || s.googleFail); }
    } catch (err) { setError(s.networkError + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.signuppage}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <img src="/image/logo/cranio_ai_b.png" alt="Cranio ai" />
          <h4>Cranio ai</h4>
          <p>{s.description}</p>
        </div>

        <div className={styles.data}>
          <form onSubmit={handleSubmit}>
            <label>{s.fullName}</label>
            <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} required />

            <label>{s.email}</label>
            <input type="email" id="email" value={formData.email} onChange={handleChange} required />

            <label>{s.password}</label>
            <input type="password" id="password" value={formData.password} onChange={handleChange} required />

            <label>{s.confirmPassword}</label>
            <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

            {error && (
              <p style={{ color: "#c0392b", fontSize: "13px", margin: "8px 0", padding: "8px 12px", background: "#fdecea", borderRadius: "6px", textAlign: "right" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>{loading ? s.loading : s.submit}</button>
          </form>
        </div>

        <div className={styles.icons}>
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError(s.googleFail)} />
        </div>

        <p className={styles.account}>
          {s.hasAccount} <NavLink to="/signin">{s.signin}</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
