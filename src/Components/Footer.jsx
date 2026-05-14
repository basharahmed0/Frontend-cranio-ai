import React, { useState } from "react";


import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const navigationLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "التمارين", href: "/traning" },
    { label: "التقدم", href: "/tracking" },
    { label: "الملف الشخصي", href: "/profile" },
  ];

  const contactInfo = [
    { icon: "✉️", label: "البريد الإلكتروني", value: "hello@cranioai.com" },
    { icon: "📱", label: "الهاتف", value: "+966 50 123 4567" },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer" dir="rtl">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section brand-section">
          <div className="brand-header">
            <h3 className="brand-name">cranio ai</h3>
          </div>
          <p className="brand-description">
            منصة متخصصة في تحسين الصحة النفسية والعافية الشخصية من خلال تمارين
            علمية وجلسات تدريبية متقدمة
          </p>

          {/* Newsletter Subscription */}
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-group">
              <button type="submit" className="newsletter-button">
                {subscribed ? "✓ تم" : "اشترك"}
              </button>
            </div>
            {subscribed && (
              <p className="subscription-message">شكراً لاشتراكك معنا!</p>
            )}
          </form>
        </div>

        {/* Navigation Links Section */}
        <div className="footer-section navigation-section">
          <h4 className="section-title">روابط سريعة</h4>
          <ul className="links-list">
            {navigationLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="footer-link">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact-section">
          <h4 className="section-title">تواصل معنا</h4>
          <div className="contact-list">
            {contactInfo.map((contact, index) => (
              <div key={index} className="contact-item">
                <span className="contact-icon">{contact.icon}</span>
                <div className="contact-info">
                  <p className="contact-label">{contact.label}</p>
                  <p className="contact-value">{contact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Section */}
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">© 2024 Cranio AI. جميع الحقوق محفوظة.</p>
          <div className="footer-bottom-links">
            <a href="#" className="bottom-link">
              سياسة الخصوصية
            </a>
            <span className="separator">•</span>
            <a href="#" className="bottom-link">
              شروط الاستخدام
            </a>
            <span className="separator">•</span>
            <a href="#" className="bottom-link">
              سياسة الكوكيز
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
