import React, { useState, useEffect } from "react";
import "./traning.css";
import { NavLink } from "react-router-dom";
import BASE_URL from "./api";
import { apiRequest } from "./api";
const Traning = () => {
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);

  const [exercises, setExercises] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [stats, setStats] = useState({
    completedExercises: 0,
    consistency: 0,
    points: 0,
    goalProgress: 0,
    daysCompleted: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔥 Parallel requests
        const [exercisesData, statsData, weekData] = await Promise.all([
          apiRequest("/api/Exercises/today"), //改了: was "/Exercises/today"
          apiRequest("/api/Progress/dashboard"), //改了: was "/Progress/dashboard"
          apiRequest("/api/Schedule/weekly"), //改了: was "/Schedule/weekly"
        ]);

        // =========================
        // 1. EXERCISES
        // =========================
        const categories = exercisesData?.data?.categories || [];

        const allExercises = categories.flatMap((cat) => cat.exercises || []);

        const formattedExercises = allExercises.map((ex) => ({
          id: ex.id,
          title: ex.name,
          duration: `${ex.durationInMinutes} دقيقة`,
          meta: `${ex.sets} مجموعات - ${ex.repetitions} تكرار`,
          video: ex.videoUrl,
          completed: ex.isCompleted,
        }));

        setExercises(formattedExercises);

        // =========================
        // 2. STATS
        // =========================
        const dashboard = statsData?.data;

        setStats({
          completedExercises: dashboard?.completedSessions || 0,
          consistency: dashboard?.currentImprovement || 0,
          points: dashboard?.sessionDetails?.length || 0,
          goalProgress: Math.min(
            100,
            Math.round(((dashboard?.completedSessions || 0) / 7) * 100),
          ),
          daysCompleted: dashboard?.completedSessions || 0,
        });

        // =========================
        // 3. WEEK
        // =========================
        const days = weekData?.data?.days || [];

        const formattedWeek = days.map((day) => ({
          name: day.dayName,
          completed: day.isCompleted,
          isToday: day.isToday,
          type: day.isCompleted
            ? "completed"
            : day.isToday
              ? "today"
              : "pending",
        }));

        setWeekDays(formattedWeek);
      } catch (error) {
        console.error("🔥 Error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleStartExercises = () => {
    alert("ابدأ التمارين! 🚀");
  };

  return (
    <div className="exercise-dashboard" dir="rtl">
      <div className="traning-container">
        {/* TITLE */}
        <div className="page-title">
          <h1>تماريني</h1>
          <p>إليك تمارينك اليومية للحصول على أفضل النتائج</p>
        </div>

        <div className="content-grid">
          {/* RIGHT */}
          <div className="right-content">
            <div className="content-header">
              <h2>تمارين اليوم</h2>
            </div>

            {/* DOTS */}
            <div className="carousel-dots">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`dot ${
                    activeCarouselDot === index ? "active" : ""
                  }`}
                  onClick={() => setActiveCarouselDot(index)}
                />
              ))}
            </div>

            {/* EXERCISES */}
            {loading ? (
              <p>جاري التحميل...</p>
            ) : exercises.length === 0 ? (
              <p>لا يوجد تمارين اليوم</p>
            ) : (
              exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`exercise-item ${
                    exercise.completed ? "done" : ""
                  }`}
                  onClick={() => {
                    if (exercise.video) {
                      window.open(exercise.video);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="exercise-badge">{exercise.duration}</div>

                  <div className="exercise-info">
                    <div className="exercise-title">{exercise.title}</div>

                    <div className="exercise-meta">{exercise.meta}</div>
                  </div>
                </div>
              ))
            )}

            <NavLink to="/session">
              <button className="action-button" onClick={handleStartExercises}>
                ابدأ التمارين 🚀
              </button>
            </NavLink>
          </div>

          {/* LEFT */}
          <div className="left-sidebar">
            <div className="stats-card">
              <div className="stats-card-title">تمارين مكتملة اليوم</div>

              <span className="stats-badge">🎯 أحرز تقدماً!</span>

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-value">{stats.completedExercises}</div>
                  <div className="stat-label">تمارين مكتملة</div>
                </div>

                <div className="stat-item">
                  <div className="stat-value">{stats.consistency}%</div>
                  <div className="stat-label">التحسن</div>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-item star-item">
                  <div className="star-icon">⭐</div>
                  <div className="stat-label">التقدم</div>
                </div>

                <div className="stat-item">
                  <div className="stat-value">{stats.points}</div>
                  <div className="stat-label">عدد السيشنز</div>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-label">هدف الأسبوع</div>

                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${stats.goalProgress}%`,
                    }}
                  />
                </div>

                <div className="progress-text">
                  {stats.daysCompleted}/7 أيام
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WEEKLY */}
        <div className="weekly-overview">
          <h2 className="weekly-title">نظرة عامة على الأسبوع</h2>

          <div className="weekly-grid">
            {weekDays.map((day, index) => (
              <div key={index} className={`day-card ${day.type}`}>
                <div className="day-name">{day.name}</div>

                {day.completed ? (
                  <div className="day-check">✓</div>
                ) : (
                  <div className="day-dots">• • •</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Traning;
