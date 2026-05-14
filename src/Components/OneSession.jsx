import React, { useState } from "react";
import "./onesession.css";

const OneSession = () => {
  // 🔥 State
  const [videos, setVideos] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 Start Session
  const handleStartSession = async () => {
    try {
      setLoading(true);
      setIsStarted(true);

      // 🟡 Fake Data (YouTube Embed)
      const data = [
        {
          id: 1,
          title: "Facial Muscles(عضلات الوجه)",
          videoUrl: "https://www.youtube.com/embed/oJIk2PyukjY",
        },
        {
          id: 2,
          title: "Bell's Palsy (العصب السابع)",
          videoUrl: "https://www.youtube.com/embed/LCXxgHLaO7w",
        },
      ];

      // ⏳ simulate loading
      setTimeout(() => {
        setVideos(data);
        setLoading(false);
      }, 1000);

      // ✅ لما الباك يجهز:
      /*
      const res = await fetch("https://your-api.com/session");
      const data = await res.json();
      setVideos(data);
      setLoading(false);
      */
    } catch (error) {
      console.error("Error fetching videos:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="title-session">
        <h1 className="logosession">Cranio ai</h1>
        <p className="discription">تمارين الوجه المتخصصة</p>
      </div>

      {/* Main */}
      <div className="training-container">
        <div className="main-content">
          {/* Session Card */}
          <div className="session-card">
            <div className="sessions">
              <div className="text">
                <h1 className="element">جلسة اليوم</h1>
                <p className="elemnt-tow">2 تمارين - 15 دقيقة</p>
              </div>

              <img
                src="/image/buttons/pause.png"
                alt="pause"
                className="pause"
              />
            </div>

            {/* Start Button */}
            <button
              className="startsession"
              type="button"
              onClick={handleStartSession}
              disabled={loading}
            >
              <span className="btn-text">
                {loading ? "جاري التحميل..." : "بدء الجلسة"}
              </span>

              <img src="/image/buttons/Vector.png" alt="" />
            </button>
          </div>

          {/* 🔥 Loading */}
          {loading && (
            <div className="loading">
              <p>⏳ جاري تحميل التمارين...</p>
            </div>
          )}

          {/* 🔥 Videos */}
          {isStarted && !loading && (
            <div className="videos-container">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <div key={video.id} className="video-item">
                    <h3>{video.title}</h3>

                    {/* ✅ YouTube iframe */}
                    <iframe
                      width="350"
                      height="200"
                      src={video.videoUrl}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                  </div>
                ))
              ) : (
                <p>لا توجد فيديوهات حاليا</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OneSession;
