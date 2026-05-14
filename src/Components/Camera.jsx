import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, BASE_URL } from "./api";
import "./camera.css";

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | starting | running | analyzing | done | error
  const [result, setResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [frameCount, setFrameCount] = useState(0);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const navigate = useNavigate();

  // Start camera
  const startCamera = async () => {
    try {
      setStatus("starting");
      setError("");
      setAnalysisError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Create a new session
      const sessionRes = await apiRequest("/api/Sessions", {
        method: "POST",
        body: JSON.stringify({ notes: "جلسة متابعة بالكاميرا" }),
      });

      // handle different response shapes
      const newSessionId = sessionRes?.data?.id ?? sessionRes?.id ?? null;
      setSessionId(newSessionId);

      // Start the session
      if (newSessionId) {
        await apiRequest(`/api/Sessions/${newSessionId}/start`, {
          method: "POST",
        });
      }

      setStatus("running");
      startSendingFrames();
    } catch {
      setError("تعذّر الوصول إلى الكاميرا. تأكد من منح الإذن.");
      setStatus("error");
    }
  };

  // Capture frame and return as Blob
  const captureFrameBlob = () =>
    new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return resolve(null);
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
    });

  // Send frames every 3 seconds to /api/Analysis/analyze
  const startSendingFrames = () => {
    intervalRef.current = setInterval(async () => {
      const blob = await captureFrameBlob();
      if (!blob) return;

      try {
        setStatus("analyzing");

        // Build FormData — backend expects field name "image"
        const formData = new FormData();
        formData.append("image", blob, "frame.jpg");

        const token = localStorage.getItem("token");
        const analyzeUrl = `${BASE_URL}/api/Analysis/analyze`;
        const res = await fetch(analyzeUrl, {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        const text = await res.text();
        let json = null;
        if (text) {
          try {
            json = JSON.parse(text);
          } catch {
            setAnalysisError(
              res.ok
                ? "رد غير متوقع من الخادم."
                : `خطأ ${res.status}: الرد ليس JSON`,
            );
            setFrameCount((c) => c + 1);
            setStatus("running");
            return;
          }
        }

        if (!res.ok) {
          const msg =
            json?.message ||
            json?.Message ||
            (typeof json === "string" ? json : null) ||
            `فشل التحليل (${res.status})`;
          setAnalysisError(String(msg));
          setFrameCount((c) => c + 1);
          setStatus("running");
          return;
        }

        console.log("Analysis response:", json);
        setAnalysisError("");

        // response shape: { success, prediction: { label, confidence } }
        if (json?.success && json?.prediction) {
          const { label, confidence } = json.prediction;

          const analysisResult = {
            label, // "Mild" | "Moderate" | "Severe" …
            score: confidence ?? 0, // نسبة الثقة
          };

          setResult(analysisResult);
          setAnalysisHistory((prev) => [
            ...prev.slice(-4),
            {
              time: new Date().toLocaleTimeString("ar-EG"),
              score: confidence ?? 0,
              label,
            },
          ]);
        } else {
          setAnalysisError("الخادم لم يُرجع نتيجة تحليل صالحة.");
        }

        setFrameCount((c) => c + 1);
        setStatus("running");
      } catch (err) {
        console.error("Analysis error:", err);
        setAnalysisError(
          err?.message ? `شبكة: ${err.message}` : "تعذّر الاتصال بالخادم.",
        );
        setStatus("running");
      }
    }, 3000);
  };

  // Stop session
  const stopSession = async () => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (sessionId) {
      try {
        await apiRequest("/api/Sessions/complete", {
          method: "POST",
          body: JSON.stringify({ sessionId, notes: "اكتملت الجلسة" }),
        });
      } catch (e) {
        console.error("Complete session error:", e);
      }
    }
    setStatus("done");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const getStatusText = () => {
    switch (status) {
      case "starting":
        return "جارٍ تشغيل الكاميرا...";
      case "running":
        return "الكاميرا تعمل — جارٍ التحليل";
      case "analyzing":
        return "جارٍ تحليل الإطار...";
      case "done":
        return "انتهت الجلسة بنجاح ✓";
      case "error":
        return error;
      default:
        return "اضغط لبدء الجلسة";
    }
  };

  // label → Arabic
  const labelAr = (label) => {
    const map = {
      Mild: "خفيف",
      Moderate: "متوسط",
      Severe: "شديد",
      Normal: "طبيعي",
    };
    return map[label] ?? label ?? "—";
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#4cd964";
    if (score >= 40) return "#ffcc00";
    return "#ff3b30";
  };

  return (
    <div className="camera-page" dir="rtl">
      {/* Header */}
      <div className="camera-header">
        <h1>جلسة المتابعة</h1>
        <p>سيتم تحليل حركة وجهك تلقائيًا خلال الجلسة</p>
      </div>

      <div className="camera-layout">
        {/* Camera Box */}
        <div className="camera-box">
          <div
            className={`video-wrapper ${status === "analyzing" ? "scanning" : ""}`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-feed"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {status === "idle" && (
              <div className="video-overlay">
                <div className="camera-icon">📷</div>
                <p>الكاميرا غير مفعّلة</p>
              </div>
            )}

            {status === "analyzing" && <div className="scan-line" />}

            {(status === "running" || status === "analyzing") && (
              <div className="frame-badge">إطار {frameCount}</div>
            )}
          </div>

          {/* Status bar */}
          <div className={`status-bar status-${status}`}>
            <span className="status-dot" />
            <span>{getStatusText()}</span>
          </div>

          {analysisError ? (
            <div
              className="analysis-error-banner"
              style={{
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#ffe8e6",
                color: "#c00",
                fontSize: 14,
                lineHeight: 1.4,
              }}
              role="alert"
            >
              {analysisError}
            </div>
          ) : null}

          {/* Controls */}
          <div className="camera-controls">
            {status === "idle" || status === "error" ? (
              <button className="btn-primary" onClick={startCamera}>
                🎥 بدء الجلسة
              </button>
            ) : status === "done" ? (
              <div className="done-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/tracking")}
                >
                  عرض التقدم →
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setStatus("idle");
                    setResult(null);
                    setFrameCount(0);
                    setAnalysisHistory([]);
                    setAnalysisError("");
                  }}
                >
                  جلسة جديدة
                </button>
              </div>
            ) : (
              <button className="btn-danger" onClick={stopSession}>
                ⏹ إنهاء الجلسة
              </button>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          {/* Live Result */}
          <div className="result-card">
            <h3>نتيجة التحليل الحالية</h3>
            {result ? (
              <div className="score-display">
                <div
                  className="score-circle"
                  style={{ "--score-color": getScoreColor(result.score) }}
                >
                  <span className="score-number">
                    {Math.round(result.score)}%
                  </span>
                  <span className="score-label">ثقة</span>
                </div>

                {/* Label badge */}
                <div
                  style={{
                    marginTop: 12,
                    padding: "6px 18px",
                    borderRadius: 20,
                    background: "#ede9ff",
                    color: "#6c47ff",
                    fontWeight: 700,
                    fontSize: 15,
                    display: "inline-block",
                  }}
                >
                  {labelAr(result.label)}
                </div>
              </div>
            ) : (
              <div className="no-result">
                <p>في انتظار أول تحليل...</p>
                <div className="pulse-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {/* History */}
          {analysisHistory.length > 0 && (
            <div className="result-card">
              <h3>سجل الجلسة</h3>
              <div className="history-list">
                {analysisHistory.map((item, i) => (
                  <div className="history-item" key={i}>
                    <span className="history-time">{item.time}</span>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6c47ff",
                        minWidth: 50,
                      }}
                    >
                      {labelAr(item.label)}
                    </div>
                    <div className="history-bar-wrap">
                      <div
                        className="history-bar"
                        style={{
                          width: `${item.score}%`,
                          backgroundColor: getScoreColor(item.score),
                        }}
                      />
                    </div>
                    <span className="history-score">
                      {Math.round(item.score)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="result-card tips-card">
            <h3>💡 نصائح للجلسة</h3>
            <ul>
              <li>تأكد من إضاءة جيدة على وجهك</li>
              <li>اجلس مقابل الكاميرا مباشرة</li>
              <li>حافظ على مسافة 30–50 سم من الشاشة</li>
              <li>اتبع تعليمات الطبيب خلال الجلسة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
