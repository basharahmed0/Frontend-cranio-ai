import React, { useState } from "react";
import "./onesession.css";
import { useLang } from "./LangContext";

const OneSession = () => {
  const { t } = useLang();
  const s = t.session;

  const [videos, setVideos] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setIsStarted(true);
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
      setTimeout(() => {
        setVideos(data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="title-session">
        <h1 className="logosession">{s.logo}</h1>
        <p className="discription">{s.subtitle}</p>
      </div>

      <div className="training-container">
        <div className="main-content">
          <div className="session-card">
            <div className="sessions">
              <div className="text">
                <h1 className="element">{s.todaySession}</h1>
                <p className="elemnt-tow">{s.duration}</p>
              </div>
              <img
                src="/image/buttons/pause.png"
                alt="pause"
                className="pause"
              />
            </div>
            <button
              className="startsession"
              type="button"
              onClick={handleStartSession}
              disabled={loading}
            >
              <span className="btn-text">{loading ? s.loading : s.start}</span>
              <img src="/image/buttons/Vector.png" alt="" />
            </button>
          </div>

          {loading && (
            <div className="loading">
              <p>{s.loadingVideos}</p>
            </div>
          )}

          {isStarted && !loading && (
            <div className="videos-container">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <div key={video.id} className="video-item">
                    <h3>{video.title}</h3>
                    <iframe
                      width="350"
                      height="200"
                      src={video.videoUrl}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ))
              ) : (
                <p>{s.noVideos}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OneSession;
