import React, { useState, useEffect } from "react";
import "./traning.css";
import { NavLink } from "react-router-dom";
import { apiRequest } from "./api";
import { useLang } from "./LangContext";

const Traning = () => {
  const { t } = useLang();
  const tr = t.training;

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

        const [exercisesData, statsData, weekData] = await Promise.all([
          apiRequest("/api/Exercises/today"),
          apiRequest("/api/Progress/dashboard"),
          apiRequest("/api/Schedule/weekly"),
        ]);

        // 1. EXERCISES
        const categories = exercisesData?.data?.categories || [];
        const allExercises = categories.flatMap((cat) => cat.exercises || []);
        const formattedExercises = allExercises.map((ex) => ({
          id: ex.id,
          title: ex.name,
          duration: `${ex.durationInMinutes} ${tr.minuteUnit}`,
          meta: tr.setsReps
            .replace("{sets}", ex.sets)
            .replace("{reps}", ex.repetitions),
          video: ex.videoUrl,
          completed: ex.isCompleted,
        }));
        setExercises(formattedExercises);

        // 2. STATS
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

        // 3. WEEK
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
    alert(tr.startAlert);
  };

  return (
    <div className="exercise-dashboard" dir={t.dir}>
      <div className="traning-container">
        {/* TITLE */}
        <div className="page-title">
          <h1>{tr.title}</h1>
          <p>{tr.subtitle}</p>
        </div>

        <div className="content-grid">
          {/* RIGHT */}
          <div className="right-content">
            <div className="content-header">
              <h2>{tr.todayExercises}</h2>
            </div>

            {/* DOTS */}
            <div className="carousel-dots">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`dot ${activeCarouselDot === index ? "active" : ""}`}
                  onClick={() => setActiveCarouselDot(index)}
                />
              ))}
            </div>

            {/* EXERCISES */}
            {loading ? (
              <p>{tr.loading}</p>
            ) : exercises.length === 0 ? (
              <p>{tr.noExercises}</p>
            ) : (
              exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`exercise-item ${exercise.completed ? "done" : ""}`}
                  onClick={() => {
                    if (exercise.video) window.open(exercise.video);
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
                {tr.startBtn}
              </button>
            </NavLink>
          </div>

          {/* LEFT */}
          <div className="left-sidebar">
            <div className="stats-card">
              <div className="stats-card-title">{tr.statsTitle}</div>
              <span className="stats-badge">{tr.badge}</span>

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-value">{stats.completedExercises}</div>
                  <div className="stat-label">{tr.completedExercises}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.consistency}%</div>
                  <div className="stat-label">{tr.improvement}</div>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-item star-item">
                  <div className="star-icon">⭐</div>
                  <div className="stat-label">{tr.progress}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.points}</div>
                  <div className="stat-label">{tr.sessionsCount}</div>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-label">{tr.weeklyGoal}</div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${stats.goalProgress}%` }}
                  />
                </div>
                <div className="progress-text">
                  {stats.daysCompleted}/7 {tr.days}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WEEKLY */}
        <div className="weekly-overview">
          <h2 className="weekly-title">{tr.weeklyOverview}</h2>
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