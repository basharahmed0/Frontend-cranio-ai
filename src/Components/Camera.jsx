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
  const [sessionWarning, setSessionWarning] = useState("");
  const [preflightError, setPreflightError] = useState("");
  const [frameCount, setFrameCount] = useState(0);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const navigate = useNavigate();

  const mapCameraError = (err) => {
    const name = err?.name;
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return "تم رفض إذن الكاميرا. افتح إعدادات المتصفح للموقع واسمح بالكاميرا، ثم أعد المحاولة.";
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "لم يُعثر على كاميرا. تأكد من توصيل الكاميرا وعدم تعطيلها.";
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return "الكاميرا مستخدمة من تطبيق أو تبويب آخر. أغلقه ثم أعد المحاولة.";
    }
    if (name === "OverconstrainedError" || name === "ConstraintNotSatisfiedError") {
      return "إعدادات الكاميرا غير مدعومة على هذا الجهاز. جرّب زر إعادة المحاولة.";
    }
    const detail = err?.message || name;
    return `تعذّر تشغيل الكاميرا${detail ? ` (${detail})` : ""}. استخدم http://localhost أو https، واسمح بالوصول عند الطلب.`;
  };

  const acquireCameraStream = async () => {
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) {
      throw new Error("NO_GET_USER_MEDIA");
    }
    const preferred = {
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };
    try {
      return await md.getUserMedia(preferred);
    } catch (first) {
      try {
        return await md.getUserMedia({ video: true });
      } catch {
        throw first;
      }
    }
  };

  useEffect(() => {
    if (!window.isSecureContext) {
      setPreflightError(
        "المتصفح يحتاج سياقًا آمناً للكاميرا. افتح التطبيق عبر http://localhost:5173 أو https — لا تستخدم عنوان IP على الشبكة مع http.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setPreflightError(
        "المتصفح لا يدعم الوصول للكاميرا من هذا العنوان. جرّب Chrome/Edge على localhost أو رابط https.",
      );
      return;
    }
    setPreflightError("");
  }, []);

  // Start camera: show the video feed first, then link a server session (optional).
  const startCamera = async () => {
    setStatus("starting");
    setError("");
    setAnalysisError("");
    setSessionWarning("");

    let stream = null;
    try {
      stream = await acquireCameraStream();
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }

      // Let the user see the camera immediately (do not block on Sessions API).
      setStatus("running");
      startSendingFrames();

      const token = localStorage.getItem("token");
      if (!token) {
        setSessionWarning(
          "لم تسجّل الدخول: سيتم التحليل فقط دون حفظ جلسة على الحساب.",
        );
        return;
      }

      try {
        const sessionRes = await apiRequest("/api/Sessions", {
          method: "POST",
          body: JSON.stringify({ notes: "جلسة متابعة بالكاميرا" }),
          skipAuthRedirect: true,
        });

        const newSessionId = sessionRes?.data?.id ?? sessionRes?.id ?? null;
        setSessionId(newSessionId);

        if (newSessionId) {
          await apiRequest(`/api/Sessions/${newSessionId}/start`, {
            method: "POST",
            skipAuthRedirect: true,
          });
        }
      } catch {
        setSessionWarning(
          "تعذّر ربط الجلسة بالخادم (تحقق من تسجيل الدخول). التحليل سيستمر.",
        );
      }
    } catch (err) {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (err?.message === "NO_GET_USER_MEDIA") {
        setError(
          "المتصفح لا يتيح استخدام الكاميرا من هذا العنوان. استخدم localhost أو https.",
        );
      } else {
        setError(mapCameraError(err));
      }
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

        // response: { success, prediction: { label, confidence }, predictions?: { eye, eyebrow, mouth } }
        if (json?.success && json?.prediction) {
          const { label, confidence } = json.prediction;

          const analysisResult = {
            label,
            score: confidence ?? 0,
            regions: json.predictions ?? null,
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
          skipAuthRedirect: true,
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
      "Moderate Severe": "شديد نسبياً",
      Moderate_Severe: "شديد نسبياً",
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

      {preflightError ? (
        <div
          className="preflight-banner"
          role="alert"
          style={{
            maxWidth: 1100,
            margin: "0 auto 20px",
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fff3cd",
            color: "#664d03",
            fontSize: 14,
            lineHeight: 1.5,
            border: "1px solid #ffc107",
          }}
        >
          {preflightError}
        </div>
      ) : null}

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
              <div className="video-overlay video-overlay--idle">
                <div className="camera-icon">📷</div>
                <p className="video-overlay__title">ابدأ الجلسة لتشغيل الكاميرا</p>
                <p className="video-overlay__hint">
                  اضغط الزر، ثم اختر «السماح» عندما يطلب المتصفح الوصول إلى الكاميرا.
                </p>
                <button
                  type="button"
                  className="btn-primary video-overlay__cta"
                  onClick={startCamera}
                >
                  🎥 بدء الجلسة
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="video-overlay video-overlay--error">
                <p className="video-overlay__errortext">{error}</p>
                <button
                  type="button"
                  className="btn-primary video-overlay__cta"
                  onClick={startCamera}
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {status === "starting" && (
              <div className="video-overlay">
                <p>جارٍ طلب إذن الكاميرا...</p>
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

          {sessionWarning ? (
            <div
              className="session-warning-banner"
              style={{
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#fff8e6",
                color: "#8a5a00",
                fontSize: 14,
                lineHeight: 1.4,
              }}
              role="status"
            >
              {sessionWarning}
            </div>
          ) : null}

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
                    setSessionWarning("");
                    setError("");
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
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#718096",
                    lineHeight: 1.4,
                  }}
                >
                  الدرجة المعروضة هي أشدّ نتيجة بين العين والحاجب والفم.
                </p>
                {result.regions ? (
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 13,
                      textAlign: "right",
                      lineHeight: 1.65,
                      color: "#4a5568",
                    }}
                  >
                    <div>
                      عين: {labelAr(result.regions.eye?.label)} —{" "}
                      {Math.round(result.regions.eye?.confidence ?? 0)}%
                    </div>
                    <div>
                      حاجب: {labelAr(result.regions.eyebrow?.label)} —{" "}
                      {Math.round(result.regions.eyebrow?.confidence ?? 0)}%
                    </div>
                    <div>
                      فم: {labelAr(result.regions.mouth?.label)} —{" "}
                      {Math.round(result.regions.mouth?.confidence ?? 0)}%
                    </div>
                  </div>
                ) : null}
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
