import React from "react";
import "./Home.css";
import { NavLink } from "react-router-dom";
import Footer from "./Footer";
import { useLang } from "./LangContext";

const Home = () => {
  const { t } = useLang();
  const h = t.home;

  return (
    <>
      <div className="home-Container">
        <div className="content">
          <h1>{h.title}</h1>
          <p>{h.subtitle}</p>
        </div>
        <div className="track">
          <NavLink to="/camera">
            <img src="/image/buttons/cam.png" alt="" />
            <p>{h.cameraBtn}</p>
          </NavLink>
        </div>
      </div>

      <div className="lastbox">
        <div className="card">
          <div className="logs">
            <div className="card-header">
              <h2>cranio ai</h2>
              <div className="avatar">C</div>
            </div>
            <p className="card-description">{h.description}</p>
          </div>
          <div className="features">
            <div>
              <span className="check">✔</span> {h.features.reports}
            </div>
            <div>
              <span className="check">✔</span> {h.features.monitoring}
            </div>
            <div>
              <span className="check">✔</span> {h.features.results}
            </div>
            <div>
              <span className="check">✔</span> {h.features.support}
            </div>
          </div>
          <div className="stats">
            <div>
              <div className="stat-value">
                95<span className="percent">%</span>
              </div>
              <div className="stat-label">{h.stats.improvement}</div>
            </div>
            <div>
              500<span className="percent">+</span>
              <div className="stat-label">{h.stats.sessions}</div>
            </div>
            <div>
              98<span className="percent">%</span>
              <div className="stat-label">{h.stats.satisfaction}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
