import React, { useState } from "react";
import "./Footer.css";
import { useLang } from "./LangContext";

const Footer = () => {
  const { t } = useLang();
  const f = t.footer || {};
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer" dir={t.dir}>
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-section brand-section">
          <div className="brand-header">
            <h3 className="brand-name">{f.brand}</h3>
          </div>
          <p className="brand-description">{f.description}</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-group">
              <button type="submit" className="newsletter-button">
                {subscribed ? f.subscribedBtn : f.subscribeBtn}
              </button>
            </div>
            {subscribed && (
              <p className="subscription-message">{f.subscribedMsg}</p>
            )}
          </form>
        </div>

        {/* Links */}
        <div className="footer-section navigation-section">
          <h4 className="section-title">{f.quickLinks}</h4>
          <ul className="links-list">
            {(f.links || []).map((link, i) => (
              <li key={i}>
                <a href={link.href} className="footer-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section contact-section">
          <h4 className="section-title">{f.contactUs}</h4>
          <div className="contact-list">
            {(f.contact || []).map((c, i) => (
              <div key={i} className="contact-item">
                <span className="contact-icon">{c.icon}</span>
                <div className="contact-info">
                  <p className="contact-label">{c.label}</p>
                  <p className="contact-value">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">{f.copyright}</p>
          <div className="footer-bottom-links">
            <a href="#" className="bottom-link">
              {f.privacy}
            </a>
            <span className="separator">•</span>
            <a href="#" className="bottom-link">
              {f.terms}
            </a>
            <span className="separator">•</span>
            <a href="#" className="bottom-link">
              {f.cookies}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
