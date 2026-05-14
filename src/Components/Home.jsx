import React from "react";
import "./Home.css";
import { NavLink } from "react-router-dom";

import Footer from "./Footer";

const Home = () => {
  return (
    <>
      {/* <Nav /> */}

      <div className="home-Container">
        <div className="content">
          <h1>كيف تشعر اليوم؟</h1>
          <p>نظم مفهوم طائف تساهمات على الخمس</p>
        </div>
        <div className="track">
          <NavLink to="/camera">
            {" "}
            <img src="/image/buttons/cam.png" alt="" />
            <p>لمتابعه بالكاميرا</p>
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
            <p className="card-description">
              يساعدك على متابعة جلسات العلاج و تقييم حالتك بسهولة
            </p>
          </div>
          <div className="features">
            <div>
              <span className="check">✔</span> تقارير مفصلة
            </div>
            <div>
              <span className="check">✔</span> متابعة مستمرة
            </div>
            <div>
              <span className="check">✔</span> نتائج مضمونة
            </div>
            <div>
              <span className="check">✔</span> دعم متخصص
            </div>
          </div>
          {/* Stats */}
          <div className="stats">
            <div>
              <div className="stat-value">
                95<span className="percent">%</span>
              </div>
              <div className="stat-label">تحسن ملحوظ</div>
            </div>
            <div>
              500<span className="percent">+</span>
              <div className="stat-label">جلسة علاج</div>
            </div>
            <div>
              98<span className="percent">%</span>
              <div className="stat-label">رضا العملاء</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;
