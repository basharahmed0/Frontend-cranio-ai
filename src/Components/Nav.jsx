import React, { useState } from "react";
import "./nav.css";
import { NavLink } from "react-router-dom";
import { useLang } from "./LangContext";

const Nav = () => {
  const { t, lang, toggle } = useLang();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  const handleNotificationClick = () => {
    setOpen(!open);
    setShowNotificationBadge(false);
    setNotifications(0);
  };

  return (
    <header className="header" dir={t.dir}>
      {/* Logo */}
      <div className="header-logo">cranio ai</div>

      {/* Navigation */}
      <nav className="header-nav">
        <NavLink to="/" className="nav-item">
          {t.nav.home}
        </NavLink>
        <NavLink
          to="/traning"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          {t.nav.training}
        </NavLink>
        <NavLink to="/tracking" className="nav-item">
          {t.nav.tracking}
        </NavLink>
      </nav>

      {/* Left Icons */}
      <div className="header-icons">
        {/* Language Toggle */}
        <button
          className="lang-toggle"
          onClick={toggle}
          title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
        >
          {lang === "ar" ? "EN" : "ع"}
        </button>

        {/* Notifications */}
        <div
          className="icon-button"
          title={t.nav.notifications}
          onClick={handleNotificationClick}
        >
          <img src="/image/logo/notf.png" alt="" />
          {showNotificationBadge && notifications > 0 && (
            <span className="notification-badge">{notifications}</span>
          )}
          {open && (
            <div className="notification-menu">
              <p>{t.notifications.new}</p>
              <p>{t.notifications.updated}</p>
              <p>{t.notifications.report}</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="icon-button" title={t.nav.profile}>
          <NavLink to="/profile">
            <img src="/image/logo/profile.png" alt="" />
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Nav;
