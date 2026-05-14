import React, { useState } from "react";
import "./nav.css";
import { NavLink } from "react-router-dom";

const Nav = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  const handleNotificationClick = () => {
    setOpen(!open);
    setShowNotificationBadge(false);
    setNotifications(0);
  };

  return (
    <header className="header" dir="rtl">
      {/* Logo */}
      <div className="header-logo">cranio ai</div>

      {/* Navigation */}
      <nav className="header-nav">
        <NavLink to="/" className="nav-item">
          الرئيسية
        </NavLink>
        <NavLink
          to="/traning"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          تمارين
        </NavLink>
        <NavLink to="/tracking" className="nav-item">
          التقدم
        </NavLink>
      </nav>
      {/* Left Icons */}

      <div className="header-icons">
        <div
          className="icon-button"
          title="الإشعارات"
          onClick={handleNotificationClick}
        >
          <img src="/image/logo/notf.png" alt="" />
          {showNotificationBadge && notifications > 0 && (
            <span className="notification-badge">{notifications}</span>
          )}
          {open && (
            <div className="notification-menu">
              <p>📢 عندك إشعار جديد</p>
              <p>✅ تم تحديث الجلسة</p>
              <p>⚡ فيه تقرير جاهز</p>
            </div>
          )}
        </div>
        <div className="icon-button" title="الملف الشخصي">
          <NavLink to="/profile">
            <img src="/image/logo/profile.png" alt="" />
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Nav;
