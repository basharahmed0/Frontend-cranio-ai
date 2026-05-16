import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, apiRequest } from "./api";
import "./camera.css";
import { useLang } from "./LangContext";

const Camera = () => {
  const { t } = useLang();
  const cam = t.camera;

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState("choose"); // choose | camera | preview
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [result, setResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");

  const navigate = useNavigate();

  // ========================
  // UPLOAD FROM DEVICE
  // ========================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setImageBlob(file);
    setMode("preview");
    setResult(null);
    setAnalysisError("");
    setStatus("idle");
  };

  // ========================
  // OPEN CAMERA
  // ========================
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setAnalysisError(cam.cameraError);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setMode("choose");
  };

  // ========================
  // TAKE SNAPSHOT
  // ========================
  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        setImageBlob(blob);
        setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
        closeCamera();
        setMode("preview");
        setResult(null);
        setAnalysisError("");
        setStatus("idle");
      },
      "image/jpeg",
      0.9,
    );
  };

  // ========================
  // SEND TO API
  // ========================
  const analyzeImage = async () => {
    if (!imageBlob) return;
    setStatus("analyzing");
    setAnalysisError("");
    try {
      const formData = new FormData();
      formData.append("image", imageBlob, "photo.jpg");

      const res = await fetch(`${BASE_URL}/api/Analysis/analyze`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "69420" },
        body: formData,
      });

      const text = await res.text();
      let json = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          /* ignore */
        }
      }

      if (!res.ok) {
        setAnalysisError(
          json?.message || `${cam.analysisFailed} (${res.status})`,
        );
        setStatus("error");
        return;
      }

      if (json?.success && json?.prediction) {
        const { label, confidence } = json.prediction;

        setResult({
          label,
          score: confidence ?? 0,
          regions: json.predictions ?? null,
        });

        // ── save to localStorage ──
        try {
          const newEntry = {
            time: new Date().toLocaleTimeString("ar-EG"),
            date: new Date().toISOString(),
            score: confidence ?? 0,
            label,
          };
          const existing = JSON.parse(
            localStorage.getItem("analysisResults") || "[]",
          );
          existing.push(newEntry);
          localStorage.setItem("analysisResults", JSON.stringify(existing));
        } catch {
          /* ignore */
        }

        // ── create & complete session ──
        try {
          const sessionRes = await apiRequest("/api/Sessions", {
            method: "POST",
            body: JSON.stringify({ notes: "جلسة تحليل صورة" }),
          });
          const newSessionId = sessionRes?.data?.id ?? sessionRes?.id ?? null;
          if (newSessionId) {
            await apiRequest(`/api/Sessions/${newSessionId}/start`, {
              method: "POST",
            });
            await apiRequest("/api/Sessions/complete", {
              method: "POST",
              body: JSON.stringify({
                sessionId: newSessionId,
                notes: `تحليل: ${label} - ${Math.round(confidence ?? 0)}%`,
              }),
            });
          }
        } catch {
          /* optional */
        }

        setStatus("done");
      } else {
        setAnalysisError(cam.invalidResponse);
        setStatus("error");
      }
    } catch (err) {
      setAnalysisError(`${cam.networkError} ${err.message}`);
      setStatus("error");
    }
  };

  const reset = () => {
    setMode("choose");
    setPreviewUrl(null);
    setImageBlob(null);
    setResult(null);
    setAnalysisError("");
    setStatus("idle");
  };

  const getLabelText = (label) => cam.labels?.[label] ?? label ?? "—";

  const getScoreColor = (score) => {
    if (score >= 70) return "#4cd964";
    if (score >= 40) return "#ffcc00";
    return "#ff3b30";
  };

  return (
    <div className="camera-page" dir={t.dir}>
      <div className="camera-header">
        <h1>{cam.title}</h1>
        <p>{cam.subtitle}</p>
      </div>

      <div className="camera-layout">
        {/* LEFT */}
        <div className="camera-box">
          {/* CHOOSE */}
          {mode === "choose" && (
            <div className="video-wrapper">
              <div className="video-overlay">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    alignItems: "center",
                    width: "100%",
                    padding: "0 24px",
                  }}
                >
                  <div className="camera-icon">🖼️</div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {cam.chooseMethod}
                  </p>
                  <button
                    className="btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {cam.uploadBtn}
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ width: "100%" }}
                    onClick={openCamera}
                  >
                    {cam.captureBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CAMERA LIVE */}
          {mode === "camera" && (
            <div className="video-wrapper scanning">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="video-feed"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div className="frame-badge">{cam.readyToCapture}</div>
            </div>
          )}

          {/* PREVIEW */}
          {mode === "preview" && (
            <div className="video-wrapper" style={{ background: "#1a1a2e" }}>
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <img
                src={previewUrl}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              {status === "analyzing" && <div className="scan-line" />}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Status bar */}
          <div
            className={`status-bar status-${status === "analyzing" ? "analyzing" : status === "done" ? "done" : status === "error" ? "error" : "idle"}`}
          >
            <span className="status-dot" />
            <span>
              {mode === "choose" && cam.statusChoose}
              {mode === "camera" && cam.statusCamera}
              {mode === "preview" && status === "idle" && cam.statusReady}
              {status === "analyzing" && cam.statusAnalyzing}
              {status === "done" && cam.statusDone}
              {status === "error" && cam.statusError}
            </span>
          </div>

          {analysisError && (
            <div
              style={{
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "#ffe8e6",
                color: "#c00",
                fontSize: 14,
              }}
            >
              {analysisError}
            </div>
          )}

          {/* Controls */}
          <div className="camera-controls">
            {mode === "choose" && (
              <button
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                {cam.uploadShort}
              </button>
            )}
            {mode === "camera" && (
              <div className="done-actions">
                <button className="btn-primary" onClick={takeSnapshot}>
                  {cam.snapshotBtn}
                </button>
                <button className="btn-secondary" onClick={closeCamera}>
                  {cam.cancelBtn}
                </button>
              </div>
            )}
            {mode === "preview" && status === "idle" && (
              <div className="done-actions">
                <button className="btn-primary" onClick={analyzeImage}>
                  {cam.analyzeBtn}
                </button>
                <button className="btn-secondary" onClick={reset}>
                  {cam.changePhoto}
                </button>
              </div>
            )}
            {status === "analyzing" && (
              <button className="btn-danger" disabled style={{ opacity: 0.6 }}>
                {cam.analyzingBtn}
              </button>
            )}
            {(status === "done" || status === "error") && (
              <div className="done-actions">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/tracking")}
                >
                  {cam.viewProgress}
                </button>
                <button className="btn-secondary" onClick={reset}>
                  {cam.newPhoto}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="results-panel">
          <div className="result-card">
            <h3>{cam.resultTitle}</h3>
            {result ? (
              <div className="score-display">
                <div
                  className="score-circle"
                  style={{ "--score-color": getScoreColor(result.score) }}
                >
                  <span className="score-number">
                    {Math.round(result.score)}%
                  </span>
                  <span className="score-label">{cam.confidence}</span>
                </div>
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
                  {getLabelText(result.label)}
                </div>
                {result.regions && (
                  <div
                    style={{
                      marginTop: 14,
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {["eye", "eyebrow", "mouth"].map((key) =>
                      result.regions[key] ? (
                        <div
                          key={key}
                          style={{
                            background: "#f7f7fb",
                            borderRadius: 8,
                            padding: "8px 12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 13,
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {cam.regions[key]}
                            </span>
                            <span style={{ color: "#6c47ff", fontWeight: 700 }}>
                              {getLabelText(result.regions[key].label)} —{" "}
                              {Math.round(result.regions[key].confidence ?? 0)}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              borderRadius: 3,
                              background: "#e0e0e0",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 3,
                                background: getScoreColor(
                                  result.regions[key].confidence ?? 0,
                                ),
                                width: `${result.regions[key].confidence ?? 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-result">
                <p>{cam.waitingResult}</p>
                <div className="pulse-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <div className="result-card tips-card">
            <h3>{cam.tipsTitle}</h3>
            <ul>
              {cam.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
