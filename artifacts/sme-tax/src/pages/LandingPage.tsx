import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { isAuthenticated } from "@/lib/auth";

const BLUE = "#1a3a8f";
const BLUE_LIGHT = "#2451b3";
const SILVER = "#8a9bb0";
const SILVER_LIGHT = "#c5d0de";

const features = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="10" width="36" height="28" rx="4" fill="#1a3a8f" opacity=".15"/>
        <path d="M14 32v-8M22 32v-12M30 32v-6M38 32v-16" stroke="#1a3a8f" strokeWidth="3" strokeLinecap="round"/>
        <rect x="6" y="10" width="36" height="28" rx="4" stroke="#1a3a8f" strokeWidth="2"/>
      </svg>
    ),
    title: "التقويم الجبائي",
    desc: "متابعة كل المواعيد الضريبية في مكان واحد — G50، IBS، IRG، CNAS — مع تنبيهات للإيداعات العاجلة.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="16" fill="#1a3a8f" opacity=".1"/>
        <path d="M24 8v16l10 6" stroke="#1a3a8f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="24" r="16" stroke="#1a3a8f" strokeWidth="2"/>
      </svg>
    ),
    title: "حاسبة الغرامات",
    desc: "احسب غرامات التأخير بدقة وفق قانون الضرائب الجزائري — G50، G12، G12BIS، IRG، IBS، CNAS.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="8" y="8" width="32" height="32" rx="4" fill="#1a3a8f" opacity=".1"/>
        <path d="M16 18h16M16 24h12M16 30h8" stroke="#1a3a8f" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="#1a3a8f" strokeWidth="2"/>
      </svg>
    ),
    title: "قاعدة المعرفة",
    desc: "إجابات واضحة على أسئلتك الضريبية — موسوعة شاملة مُصنَّفة حسب النظام الجبائي.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="16" fill="#1a3a8f" opacity=".1"/>
        <path d="M24 16v2m0 12v2m-8-8h2m12 0h2" stroke="#1a3a8f" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M17.5 17.5l1.4 1.4m10.2 10.2l1.4 1.4m0-13l-1.4 1.4M18.9 29.1l-1.4 1.4" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="24" r="3" fill="#1a3a8f"/>
        <circle cx="24" cy="24" r="16" stroke="#1a3a8f" strokeWidth="2"/>
      </svg>
    ),
    title: "أخبار ضريبية",
    desc: "آخر التحديثات والتشريعات الجبائية من مديرية الضرائب — كل جديد في متناول يدك.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="8" y="8" width="32" height="32" rx="4" fill="#1a3a8f" opacity=".1"/>
        <path d="M24 16l2 4h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z" fill="#1a3a8f" opacity=".4" stroke="#1a3a8f" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 32h16" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round"/>
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="#1a3a8f" strokeWidth="2"/>
      </svg>
    ),
    title: "لوحة تحكم ذكية",
    desc: "نظرة شاملة على وضعك الجبائي — إحصائيات، تذكيرات، وضع المؤسسة في لمحة واحدة.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="18" r="7" fill="#1a3a8f" opacity=".15" stroke="#1a3a8f" strokeWidth="2"/>
        <path d="M10 38c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "إدارة المستخدمين",
    desc: "لوحة إدارة متكاملة — إدارة الأدوار والصلاحيات وإعدادات المؤسسة بكل سهولة.",
  },
];

const stats = [
  { value: "7", label: "أنواع تصريحات مدعومة" },
  { value: "3", label: "أنظمة جبائية مغطاة" },
  { value: "100%", label: "عربي بالكامل" },
  { value: "٢٤/٧", label: "متاح في أي وقت" },
];

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Radial glow top */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BLUE_LIGHT}33 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "pulse-slow 6s ease-in-out infinite",
        }}
      />
      {/* Silver shimmer bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${SILVER}22 0%, transparent 70%)`,
          filter: "blur(60px)",
          animation: "pulse-slow 8s ease-in-out infinite reverse",
        }}
      />
      {/* Floating grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={BLUE} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Compass ring decorative */}
      <svg
        className="absolute opacity-[0.06]"
        style={{ top: "5%", left: "3%", width: 320, height: 320 }}
        viewBox="0 0 320 320"
      >
        <circle cx="160" cy="160" r="140" fill="none" stroke={BLUE} strokeWidth="2" strokeDasharray="8 6"/>
        <circle cx="160" cy="160" r="100" fill="none" stroke={SILVER} strokeWidth="1.5" strokeDasharray="4 8"/>
        <line x1="160" y1="20" x2="160" y2="300" stroke={BLUE} strokeWidth="1" opacity=".5"/>
        <line x1="20" y1="160" x2="300" y2="160" stroke={BLUE} strokeWidth="1" opacity=".5"/>
      </svg>
    </div>
  );
}

function Navbar({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      dir="rtl"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 100,
        padding: "0 2rem",
        height: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${SILVER_LIGHT}` : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Logo + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/finmap-logo.jpg"
          alt="خريطة المالية"
          style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8 }}
        />
        <span
          style={{
            fontFamily: "Cairo, sans-serif",
            fontWeight: 800,
            fontSize: "1.25rem",
            background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          خريطة المالية
        </span>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={onLogin}
          style={{
            fontFamily: "Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: BLUE,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px 18px",
            borderRadius: 8,
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${BLUE}11`)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          تسجيل الدخول
        </button>
        <button
          onClick={onRegister}
          style={{
            fontFamily: "Cairo, sans-serif",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "#fff",
            background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})`,
            border: "none",
            cursor: "pointer",
            padding: "9px 22px",
            borderRadius: 10,
            boxShadow: `0 4px 15px ${BLUE}44`,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 6px 20px ${BLUE}55`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 4px 15px ${BLUE}44`;
          }}
        >
          ابدأ مجاناً
        </button>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const goLogin = () => setLocation("/login");
  const goRegister = () => setLocation("/register");

  return (
    <div
      dir="rtl"
      style={{
        fontFamily: "Cairo, system-ui, sans-serif",
        background: "#f8faff",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes float-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes compass-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes needle-rock {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .card-hover {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(26,58,143,0.15);
        }
        .stat-badge {
          animation: float-up 0.8s ease both;
        }
        .hero-title {
          animation: float-up 0.7s ease 0.1s both;
        }
        .hero-sub {
          animation: float-up 0.7s ease 0.25s both;
        }
        .hero-cta {
          animation: float-up 0.7s ease 0.4s both;
        }
        .hero-visual {
          animation: float-up 0.9s ease 0.3s both;
        }
        .features-title {
          animation: float-up 0.6s ease both;
        }
      `}</style>

      <Navbar onLogin={goLogin} onRegister={goRegister} />

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "90px 2rem 60px",
          background: `linear-gradient(160deg, #eef2ff 0%, #f8faff 50%, #e8f0fe 100%)`,
          overflow: "hidden",
        }}
      >
        <AnimatedBackground />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* Left: Text */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Badge */}
            <div
              className="stat-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: `${BLUE}11`,
                border: `1px solid ${BLUE}33`,
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 28,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE_LIGHT, display: "inline-block" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: BLUE }}>
                المساعد الضريبي الأول للمؤسسات الجزائرية
              </span>
            </div>

            <h1
              className="hero-title"
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
                fontWeight: 900,
                lineHeight: 1.2,
                color: "#0d1f4e",
                marginBottom: 20,
              }}
            >
              وجّه مؤسستك نحو{" "}
              <span
                style={{
                  background: `linear-gradient(90deg, ${BLUE}, ${BLUE_LIGHT}, ${SILVER}, ${BLUE})`,
                  backgroundSize: "300% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 4s linear infinite",
                }}
              >
                الامتثال الضريبي
              </span>
            </h1>

            <p
              className="hero-sub"
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.9,
                color: "#4a5568",
                marginBottom: 36,
                maxWidth: 500,
              }}
            >
              خريطة المالية — منصة ذكية تُرشدك في كل خطوة: من مواعيد التصريح إلى حساب الغرامات، مع أخبار جبائية حديثة وقاعدة معرفة شاملة لثلاثة أنظمة ضريبية.
            </p>

            <div
              className="hero-cta"
              style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
            >
              <button
                onClick={goRegister}
                style={{
                  fontFamily: "Cairo, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "#fff",
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_LIGHT} 100%)`,
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 32px",
                  cursor: "pointer",
                  boxShadow: `0 8px 25px ${BLUE}44`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 12px 30px ${BLUE}55`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 8px 25px ${BLUE}44`;
                }}
              >
                ابدأ مجاناً الآن ←
              </button>
              <button
                onClick={goLogin}
                style={{
                  fontFamily: "Cairo, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: BLUE,
                  background: "#fff",
                  border: `2px solid ${BLUE}33`,
                  borderRadius: 12,
                  padding: "14px 28px",
                  cursor: "pointer",
                  boxShadow: `0 4px 15px rgba(0,0,0,0.06)`,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${BLUE}88`;
                  e.currentTarget.style.boxShadow = `0 4px 18px ${BLUE}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${BLUE}33`;
                  e.currentTarget.style.boxShadow = `0 4px 15px rgba(0,0,0,0.06)`;
                }}
              >
                تسجيل الدخول
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: 24, marginTop: 40, flexWrap: "wrap" }}>
              {["بدون بطاقة ائتمان", "إعداد فوري", "دعم عربي"].map(b => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
                    <circle cx="8" cy="8" r="7" fill={BLUE} opacity=".15"/>
                    <path d="M5 8l2 2 4-4" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: "0.82rem", color: "#4a5568", fontWeight: 600 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div
            className="hero-visual"
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Glow ring */}
            <div
              style={{
                position: "absolute",
                width: 360,
                height: 360,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${BLUE}22 0%, transparent 70%)`,
                filter: "blur(20px)",
              }}
            />

            {/* Main logo */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                background: "#fff",
                borderRadius: 28,
                padding: 32,
                boxShadow: `0 30px 80px ${BLUE}25, 0 0 0 1px ${BLUE_LIGHT}22`,
              }}
            >
              <img
                src="/finmap-logo.jpg"
                alt="خريطة المالية"
                style={{ width: 200, height: 200, objectFit: "contain", display: "block" }}
              />
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: "1.4rem",
                    background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  خريطة المالية
                </div>
                <div style={{ fontSize: "0.8rem", color: SILVER, fontWeight: 600, marginTop: 2 }}>
                  Fin Map · الدليل الجبائي للمؤسسات
                </div>
              </div>
            </div>

            {/* Floating mini-cards */}
            <div
              style={{
                position: "absolute",
                top: "8%",
                left: "-10%",
                background: "#fff",
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: `0 8px 24px ${BLUE}20`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                animation: "float-up 1s ease 0.6s both",
                zIndex: 3,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>G50 — تم الإيداع</span>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "10%",
                left: "-8%",
                background: "#fff",
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: `0 8px 24px ${BLUE}20`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                animation: "float-up 1s ease 0.8s both",
                zIndex: 3,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>IBS — 12 يوم</span>
            </div>

            <div
              style={{
                position: "absolute",
                top: "15%",
                right: "-12%",
                background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})`,
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: `0 8px 24px ${BLUE}40`,
                animation: "float-up 1s ease 1s both",
                zIndex: 3,
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>غرامة 0 دج</div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)" }}>امتثال تام</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${BLUE} 0%, #0f2a7a 100%)`,
          padding: "56px 2rem",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {stats.map((s, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: "2.6rem",
                  fontWeight: 900,
                  color: "#fff",
                  fontFeatureSettings: "'tnum'",
                  lineHeight: 1.1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.85rem", color: SILVER_LIGHT, marginTop: 6, fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          padding: "80px 2rem",
          background: "#f8faff",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-block",
                background: `${BLUE}11`,
                border: `1px solid ${BLUE}22`,
                borderRadius: 100,
                padding: "5px 18px",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: BLUE,
                marginBottom: 16,
              }}
            >
              المميزات
            </div>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 900,
                color: "#0d1f4e",
                marginBottom: 12,
              }}
            >
              كل ما تحتاجه في منصة واحدة
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
              من التقويم الجبائي إلى حاسبة الغرامات — خريطة المالية تُغطي جميع احتياجاتك الضريبية
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1.5rem",
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="card-hover"
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "32px 28px",
                  border: `1px solid ${SILVER_LIGHT}`,
                  cursor: "default",
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: `${BLUE}0d`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#0d1f4e",
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "#6b7280", lineHeight: 1.8 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          padding: "80px 2rem",
          background: `linear-gradient(160deg, #eef2ff 0%, #f0f4ff 100%)`,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              background: `${BLUE}11`,
              border: `1px solid ${BLUE}22`,
              borderRadius: 100,
              padding: "5px 18px",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: BLUE,
              marginBottom: 16,
            }}
          >
            كيف يعمل
          </div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 900,
              color: "#0d1f4e",
              marginBottom: 48,
            }}
          >
            ثلاث خطوات للبدء
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            {[
              { step: "01", title: "أنشئ حسابك", desc: "سجّل مؤسستك واختر نظامك الجبائي (حقيقي / مبسط / جزافي) في دقيقتين." },
              { step: "02", title: "تابع مواعيدك", desc: "يحسب التقويم الذكي مواعيد تصريحاتك ويُنبّهك قبل كل استحقاق." },
              { step: "03", title: "تجنّب الغرامات", desc: "استخدم الحاسبة لمعرفة الغرامات الدقيقة وتجنّبها قبل فوات الأوان." },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "32px 24px",
                  boxShadow: `0 4px 20px ${BLUE}0e`,
                  border: `1px solid ${SILVER_LIGHT}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 20,
                    fontSize: "4rem",
                    fontWeight: 900,
                    color: `${BLUE}08`,
                    lineHeight: 1,
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${BLUE}, ${BLUE_LIGHT})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "1rem",
                  }}
                >
                  {i + 1}
                </div>
                <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#0d1f4e", marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.87rem", color: "#6b7280", lineHeight: 1.8 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "80px 2rem",
          background: `linear-gradient(135deg, #0d1f4e 0%, ${BLUE} 50%, #1a5cb5 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative rings */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />

        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <img
            src="/finmap-logo.jpg"
            alt="خريطة المالية"
            style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 16, marginBottom: 20, border: "2px solid rgba(255,255,255,0.2)" }}
          />
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 16,
              lineHeight: 1.3,
            }}
          >
            ابدأ رحلتك نحو الامتثال الجبائي اليوم
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.72)",
              marginBottom: 36,
              lineHeight: 1.9,
              maxWidth: 500,
              margin: "0 auto 36px",
            }}
          >
            انضم إلى المؤسسات التي تثق في خريطة المالية لإدارة التزاماتها الضريبية بثقة واحترافية.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={goRegister}
              style={{
                fontFamily: "Cairo, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                color: BLUE,
                background: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 36px",
                cursor: "pointer",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              سجّل مجاناً ←
            </button>
            <button
              onClick={goLogin}
              style={{
                fontFamily: "Cairo, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#fff",
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                borderRadius: 12,
                padding: "14px 28px",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#0a1630",
          padding: "36px 2rem",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <img src="/finmap-logo.jpg" alt="خريطة المالية" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 6 }} />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>خريطة المالية</span>
        </div>
        <p style={{ color: SILVER, fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Fin Map — المساعد الضريبي للمؤسسات الجزائرية
        </p>
      </footer>
    </div>
  );
}
