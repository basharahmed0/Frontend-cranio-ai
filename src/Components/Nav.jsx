import React, { useState } from "react";
import "./nav.css";
import { NavLink } from "react-router-dom";
import { useLang } from "./LangContext";

const Nav = () => {
  const { t, toggle, lang } = useLang();
  const n = t.nav;
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="header">
      {/* Icons */}
      <div className="header-icons">
        <button className="lang-toggle" onClick={toggle}>
          {lang === "ar" ? "EN" : "عربي"}
        </button>
        <div
          className="icon-button"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          🔔
          <span className="notification-badge">3</span>
          {showNotifications && (
            <div className="notification-menu">
              <p>{t.notifications.new}</p>
              <p>{t.notifications.updated}</p>
              <p>{t.notifications.report}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          {n.profile}
        </NavLink>
        <NavLink
          to="/tracking"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          {n.tracking}
        </NavLink>
        <NavLink
          to="/traning"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          {n.training}
        </NavLink>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          {n.home}
        </NavLink>
      </nav>

      {/* Logo */}
      <NavLink to="/" className="header-logo" style={{ textDecoration: "none" }}>
        Cranio AI
      </NavLink>
    </header>
  );
};

export default Nav;
