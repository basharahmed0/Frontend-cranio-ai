import { createContext, useContext, useState } from "react";

const translations = {
  ar: {
    dir: "rtl",
    lang: "ar",
    nav: {
      home:     "الرئيسية",
      training: "تمارين",
      tracking: "التقدم",
      profile:  "الملف الشخصي",
      notifications: "الإشعارات",
    },
    notifications: {
      new:     "📢 عندك إشعار جديد",
      updated: "✅ تم تحديث الجلسة",
      report:  "⚡ فيه تقرير جاهز",
    },
    home: {
      title:       "كيف تشعر اليوم؟",
      cameraBtn:   "للمتابعة بالكاميرا",
      improvement: "تحسن ملحوظ",
      sessions:    "جلسة علاج",
      satisfaction:"رضا العملاء",
      features: {
        reports:    "تقارير مفصلة",
        monitoring: "متابعة مستمرة",
        results:    "نتائج مضمونة",
        support:    "دعم متخصص",
      },
      description: "يساعدك على متابعة جلسات العلاج وتقييم حالتك بسهولة",
    },
    tracking: {
      title:       "التقدم",
      subtitle:    "تابع تحسنك عبر الجلسات العلاجية",
      currentImprovement: "التحسن الحالي",
      daysRemaining:      "أيام التمارين المتبقية",
      completedSessions:  "جلسات مكتملة",
      curve:       "منحنى التحسن",
      details:     "تفاصيل الجلسات",
      noSessions:  "لا توجد جلسات مكتملة حتى الآن",
      avgInfo:     "بمعدل تحسن {avg}% لكل جلسة، من المتوقع الوصول لـ 100% خلال {days} يوم",
      cameraResults: "نتايج تحليل الكاميرا",
      framesAnalyzed:"إطار تم تحليله",
      avgConfidence: "متوسط الثقة",
      lastDiagnosis: "آخر تشخيص",
      clearResults:  "🗑 مسح نتايج الكاميرا",
    },
    camera: {
      title:    "جلسة المتابعة",
      subtitle: "سيتم التقاط 30 إطار وتحليلهم تلقائيًا كل دورة",
      start:    "🎥 بدء الجلسة",
      stop:     "⏹ إنهاء الجلسة",
      retry:    "إعادة المحاولة",
      viewProgress: "عرض التقدم →",
      newSession:   "جلسة جديدة",
      analyzing:    "جارٍ تحليل الإطارات...",
      waiting:      "في انتظار اكتمال أول batch (30 إطار)...",
      resultTitle:  "نتيجة التحليل (weighted average)",
      historyTitle: "سجل الجلسة",
      tipsTitle:    "💡 نصائح للجلسة",
      tips: [
        "تأكد من إضاءة جيدة على وجهك",
        "اجلس مقابل الكاميرا مباشرة",
        "حافظ على مسافة 30–50 سم من الشاشة",
        "كل دورة تحليل = 30 إطار (3 ثواني تقريباً)",
      ],
      labels: { Mild: "خفيف", Moderate: "متوسط", "Moderate Severe": "شديد نسبياً", Severe: "شديد", Normal: "طبيعي" },
    },
  },

  en: {
    dir: "ltr",
    lang: "en",
    nav: {
      home:     "Home",
      training: "Exercises",
      tracking: "Progress",
      profile:  "Profile",
      notifications: "Notifications",
    },
    notifications: {
      new:     "📢 You have a new notification",
      updated: "✅ Session updated",
      report:  "⚡ A report is ready",
    },
    home: {
      title:       "How are you feeling today?",
      cameraBtn:   "Track with Camera",
      improvement: "Notable Improvement",
      sessions:    "Treatment Sessions",
      satisfaction:"Client Satisfaction",
      features: {
        reports:    "Detailed Reports",
        monitoring: "Continuous Monitoring",
        results:    "Guaranteed Results",
        support:    "Expert Support",
      },
      description: "Helps you track your therapy sessions and assess your condition easily",
    },
    tracking: {
      title:       "Progress",
      subtitle:    "Track your improvement across therapy sessions",
      currentImprovement: "Current Improvement",
      daysRemaining:      "Days Remaining",
      completedSessions:  "Completed Sessions",
      curve:       "Improvement Curve",
      details:     "Session Details",
      noSessions:  "No completed sessions yet",
      avgInfo:     "At an average improvement of {avg}% per session, you're expected to reach 100% in {days} days",
      cameraResults: "Camera Analysis Results",
      framesAnalyzed:"Frames Analyzed",
      avgConfidence: "Avg. Confidence",
      lastDiagnosis: "Last Diagnosis",
      clearResults:  "🗑 Clear Camera Results",
    },
    camera: {
      title:    "Monitoring Session",
      subtitle: "30 frames will be captured and analyzed automatically each round",
      start:    "🎥 Start Session",
      stop:     "⏹ End Session",
      retry:    "Retry",
      viewProgress: "View Progress →",
      newSession:   "New Session",
      analyzing:    "Analyzing frames...",
      waiting:      "Waiting for first batch (30 frames)...",
      resultTitle:  "Analysis Result (weighted average)",
      historyTitle: "Session Log",
      tipsTitle:    "💡 Session Tips",
      tips: [
        "Make sure your face is well-lit",
        "Sit directly in front of the camera",
        "Keep a distance of 30–50 cm from the screen",
        "Each analysis round = 30 frames (~3 seconds)",
      ],
      labels: { Mild: "Mild", Moderate: "Moderate", "Moderate Severe": "Moderately Severe", Severe: "Severe", Normal: "Normal" },
    },
  },
};

export const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState("ar");
  const t = translations[lang];
  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      <div dir={t.dir} lang={t.lang}>
        {children}
      </div>
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

export default translations;
