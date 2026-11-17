"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Star,
  Play,
  Check,
  Target,
  Sliders,
  Printer,
  Palette,
  GraduationCap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { categories, popularWorksheets } from "@/lib/dummyData";
import CategoryCard from "./components/CategoryCard";
import WorksheetCard from "./components/WorksheetCard";
import UnicornPencil from "./components/UnicornPencil";
import "./index.css";
import "./unicorn-and-media.css";

/* ─── How It Works 3-Step Process ──────────────────────────────── */
const steps = [
  {
    num: "1",
    title: "Choose a Topic",
    desc: "Select the math topic and learning level.",
    icon: <Target size={22} className="ls-home-step-icon" />,
    color: "#3478E8",
    bg: "#EAF4FF",
    border: "#D2E4FC",
    emoji: "🎯",
  },
  {
    num: "2",
    title: "Pick Options",
    desc: "Choose difficulty, question types and other preferences.",
    icon: <Sliders size={22} className="ls-home-step-icon" />,
    color: "#10B981",
    bg: "#EAF7EF",
    border: "#D1EEDC",
    emoji: "⚙️",
  },
  {
    num: "3",
    title: "Generate & Print",
    desc: "Create your worksheet and print it instantly.",
    icon: <Printer size={22} className="ls-home-step-icon" />,
    color: "#8B5CF6",
    bg: "#F1EDFF",
    border: "#E0D7FE",
    emoji: "🖨️",
  },
];

/* ─── Learning Benefits ────────────────────────────────────────── */
const learningBenefits = [
  {
    icon: <Palette size={22} />,
    title: "Visual & Picture-Rich",
    desc: "Friendly illustrations and playful exercises across foundational math that make learning feel natural and fun.",
    color: "#3478E8",
    bg: "#EAF4FF",
    borderColor: "#D2E4FC",
    tag: "Visual Learning",
    emoji: "🎨",
  },
  {
    icon: <Printer size={22} />,
    title: "1-Click Print Ready",
    desc: "Standard A4 layout with student name lines, generous writing boxes, and clear ink-friendly black-and-white print output.",
    color: "#10B981",
    bg: "#EAF7EF",
    borderColor: "#D1EEDC",
    tag: "Instant Print",
    emoji: "🖨️",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Scaffolded Progression",
    desc: "Carefully designed for primary stages from Preschool & Kindergarten fundamentals to Grade 5 mastery.",
    color: "#8B5CF6",
    bg: "#F1EDFF",
    borderColor: "#E0D7FE",
    tag: "Ages 3 to 10",
    emoji: "🎓",
  },
  {
    icon: <Sparkles size={22} />,
    title: "100% Free Forever",
    desc: "No paywalls or subscriptions. Created so teachers, parents, and homeschoolers can generate unlimited printables.",
    color: "#F59E0B",
    bg: "#FFF5D9",
    borderColor: "#FEE7AC",
    tag: "Free Forever",
    emoji: "✨",
  },
];

/* ─── Teacher & Parent Reviews ─────────────────────────────────── */
const testimonials = [
  {
    quote:
      "LearnSpark is wonderful for my classroom! The kids love the friendly illustrations, and I can generate worksheets for math in seconds.",
    name: "Sarah M.",
    role: "2nd Grade Teacher",
    avatarBg: "#EAF4FF",
    avatarColor: "#3478E8",
    rating: 5,
    emoji: "👩‍🏫",
  },
  {
    quote:
      "As a homeschooling mom, finding high-quality printables across basic arithmetic and reading in one place is fantastic. Clean and completely free!",
    name: "David K.",
    role: "Homeschooling Parent",
    avatarBg: "#EAF7EF",
    avatarColor: "#10B981",
    rating: 5,
    emoji: "👨‍👩‍👧",
  },
  {
    quote:
      "The visual clarity is unmatched. No ink-draining dark blocks, just clean typography and engaging exercises aligned with primary standards.",
    name: "Elena R.",
    role: "Primary Education Specialist",
    avatarBg: "#FFF5D9",
    avatarColor: "#F59E0B",
    rating: 5,
    emoji: "📚",
  },
];

const mathDecorations = ["➕", "✖️", "➗", "➖", "🔢", "📐", "📏", "🔣", "💯", "🌟"];

/* ─── Video Showcase Items ──────────────────────────────────────── */
const VIDEO_SHOWCASE_ITEMS: {
  src: string;
  type: "video" | "image";
  size: "small" | "medium" | "large";
  label: string;
}[] = [
  { src: "/kids-fruit-lesson.mp4", type: "video",  size: "large",  label: "Fruit Lesson" },
  { src: "/i1.jpeg",               type: "image",  size: "small",  label: "Math Fun" },
  { src: "/i2.jpeg",               type: "image",  size: "medium", label: "Learning" },
  { src: "/video1.mp4",            type: "video",  size: "medium", label: "Lesson Video" },
  { src: "/i3.jpeg",               type: "image",  size: "small",  label: "Kids Study" },
  { src: "/i4.jpeg",               type: "image",  size: "medium", label: "Classroom" },
  { src: "/v2.mp4",                type: "video",  size: "large",  label: "Activity Video" },
  { src: "/i5.jpeg",               type: "image",  size: "small",  label: "Math Tools" },
  { src: "/WhatsApp Video 2026-10-31 at 9.39.59 AM.mp4", type: "video", size: "medium", label: "Fun Activity" },
  { src: "/i6.jpeg",               type: "image",  size: "small",  label: "Numbers" },
  { src: "/i7.jpeg",               type: "image",  size: "medium", label: "Worksheet" },
  { src: "/i8.jpeg",               type: "image",  size: "small",  label: "Practice" },
];

/* ─── Video Showcase Component ─────────────────────────────────── */
// function VideoShowcase() {
//   const [mutedStates, setMutedStates] = useState<Record<number, boolean>>({});

//   const toggleMute = (idx: number) => {
//     setMutedStates((prev) => ({ ...prev, [idx]: !prev[idx] }));
//   };

//   return (
//     <section className="ls-video-showcase-section">
//       <div className="ls-home-container">
//         <div className="ls-home-section-header">
//           <span className="ls-home-eyebrow">Watch &amp; Learn</span>
//           <h2 className="ls-home-section-title">Videos &amp; Highlights</h2>
//           <p className="ls-home-section-desc">
//             Explore animated lessons and classroom moments that make learning math a joyful adventure.
//           </p>
//         </div>

//         <div className="ls-showcase-grid">
//           {VIDEO_SHOWCASE_ITEMS.map((item, idx) => (
//             <motion.div
//               key={idx}
//               className={`ls-showcase-card ls-showcase-card--${item.size} ${
//                 item.type === "video" ? "ls-showcase-card--video" : "ls-showcase-card--image"
//               }`}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.4, delay: idx * 0.055 }}
//             >
//               {item.type === "video" ? (
//                 <div className="ls-showcase-video-wrapper">
//                   <video
//                     src={item.src}
//                     className="ls-showcase-media"
//                     autoPlay
//                     muted={mutedStates[idx] !== false}
//                     loop
//                     playsInline
//                   />
//                   <div className="ls-showcase-video-overlay">
//                     <div className="ls-showcase-play-badge">
//                       <Play size={13} fill="#fff" color="#fff" />
//                       <span>{item.label}</span>
//                     </div>
//                     <button
//                       className="ls-showcase-mute-btn"
//                       onClick={() => toggleMute(idx)}
//                       title={mutedStates[idx] === false ? "Mute" : "Unmute"}
//                     >
//                       {mutedStates[idx] === false ? <Volume2 size={13} /> : <VolumeX size={13} />}
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="ls-showcase-image-wrapper">
//                   <Image
//                     src={item.src}
//                     alt={item.label}
//                     fill
//                     sizes="(max-width: 768px) 100vw, 33vw"
//                     className="ls-showcase-media ls-showcase-media--img"
//                   />
//                   <div className="ls-showcase-image-label">
//                     <span>{item.label}</span>
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

/* ─── Strip Carousel (images only) ─────────────────────────────── */
const CAROUSEL_MEDIA: { src: string; type: "image" | "video" }[] = [
  { src: "/i1.jpeg", type: "image" },
  { src: "/i2.jpeg", type: "image" },
  { src: "/i3.jpeg", type: "image" },
  { src: "/i4.jpeg", type: "image" },
  { src: "/i5.jpeg", type: "image" },
  { src: "/i6.jpeg", type: "image" },
  { src: "/i7.jpeg", type: "image" },
  { src: "/i8.jpeg", type: "image" },
  { src: "/i9.jpeg", type: "image" },
];

const STRIP_MEDIA = [...CAROUSEL_MEDIA, ...CAROUSEL_MEDIA];

function MultiStripCarousel() {
  const total    = CAROUSEL_MEDIA.length;
  const VISIBLE  = 4;
  const GAP      = 20;
  const SPEED_MS = 2500;

  const [offset, setOffset]   = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => {
        const next = prev + 1;
        if (next >= total) {
          setTimeout(() => {
            setAnimate(false);
            setOffset(0);
            requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
          }, 680);
        }
        return next;
      });
      setAnimate(true);
    }, SPEED_MS);
    return () => clearInterval(timer);
  }, [total]);

  const cardW  = `calc((100% - ${GAP * (VISIBLE - 1)}px) / ${VISIBLE})`;
  const shiftX = `calc(-${offset} * (${cardW} + ${GAP}px))`;

  return (
    <div className="ms-section">
      <div className="ms-viewport">
        <div
          className="ms-track"
          style={{
            transform:  `translateX(${shiftX})`,
            transition: animate ? `transform 0.68s cubic-bezier(0.22, 1, 0.36, 1)` : "none",
          }}
        >
          {STRIP_MEDIA.map((item, i) => (
            <div key={i} className="ms-card" style={{ flex: `0 0 ${cardW}`, maxWidth: cardW }}>
              <Image
                src={item.src}
                alt={`Slide ${(i % total) + 1}`}
                fill
                sizes="(max-width:600px) 90vw, 25vw"
                className="ms-media"
                priority={i < VISIBLE}
              />
              <div className="ms-card__shimmer" />
            </div>
          ))}
        </div>
      </div>
      <div className="ms-dots">
        {CAROUSEL_MEDIA.map((_, i) => (
          <span key={i} className={`ms-dot${i === offset % total ? " ms-dot--active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

/* ─── Hero Illustration ─────────────────────────────────────────── */
function HeroIllustration() {
  return (
    <div className="ls-hero-illustration-scene">
      <div className="ls-hero-illus-main">
        <svg viewBox="0 0 420 400" className="ls-hero-illus-svg" aria-hidden="true">
          {/* Background blobs */}
          <circle cx="210" cy="200" r="175" fill="#EAF4FF" opacity="0.55" />
          <circle cx="210" cy="200" r="130" fill="#DBEAFE" opacity="0.45" />
          <ellipse cx="320" cy="280" rx="60" ry="40" fill="#EAF7EF" opacity="0.5" />
          <ellipse cx="100" cy="280" rx="55" ry="38" fill="#FFF5D9" opacity="0.5" />

          {/* Floating math symbols */}
          <text x="22"  y="90"  fontSize="30" opacity="0.75">➕</text>
          <text x="362" y="110" fontSize="26" opacity="0.70">✖️</text>
          <text x="18"  y="295" fontSize="24" opacity="0.60">📐</text>
          <text x="374" y="270" fontSize="24" opacity="0.60">📏</text>
          <text x="168" y="38"  fontSize="20" opacity="0.65">🔢</text>
          <text x="332" y="50"  fontSize="18" opacity="0.55">💡</text>

          {/* Stars */}
          <text x="62"  y="168" fontSize="42" className="ls-illus-bounce-1">⭐</text>
          <text x="304" y="138" fontSize="34" className="ls-illus-bounce-2">🌟</text>

          {/* Kid character */}
          <g transform="translate(128, 70)">
            {/* Body */}
            <ellipse cx="84" cy="198" rx="54" ry="65" fill="#FBBF24" opacity="0.92" />
            {/* Head */}
            <circle cx="84" cy="114" r="50" fill="#FDE68A" />
            {/* Eyes */}
            <circle cx="68"  cy="108" r="7.5" fill="#1E293B" />
            <circle cx="100" cy="108" r="7.5" fill="#1E293B" />
            <circle cx="70"  cy="106" r="2.5" fill="#FFFFFF" />
            <circle cx="102" cy="106" r="2.5" fill="#FFFFFF" />
            {/* Smile */}
            <path d="M 68 127 Q 84 142 100 127" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Hair */}
            <ellipse cx="84"  cy="68"  rx="48" ry="22" fill="#92400E" />
            <ellipse cx="40"  cy="86"  rx="17" ry="26" fill="#92400E" />
            <ellipse cx="128" cy="86"  rx="17" ry="26" fill="#92400E" />
            {/* Cheeks */}
            <ellipse cx="56" cy="124" rx="10" ry="7" fill="#FCA5A5" opacity="0.55" />
            <ellipse cx="112" cy="124" rx="10" ry="7" fill="#FCA5A5" opacity="0.55" />
            {/* Shirt */}
            <rect x="36" y="162" width="96" height="76" rx="14" fill="#3478E8" />
            <text x="66" y="207" fontSize="22" fill="#FFF">📚</text>
            {/* Arms */}
            <ellipse cx="18"  cy="185" rx="15" ry="36" fill="#FDE68A" transform="rotate(-14 18 185)" />
            <ellipse cx="150" cy="185" rx="15" ry="36" fill="#FDE68A" transform="rotate(14 150 185)" />
            {/* Pencil */}
            <g transform="translate(150, 152) rotate(28)">
              <rect x="0" y="0" width="11" height="62" rx="3" fill="#F59E0B" />
              <polygon points="5.5,62 0,80 11,80" fill="#FCA5A5" />
              <polygon points="0,62 11,62 5.5,74" fill="#1E293B" />
              <rect x="0" y="0" width="11" height="9" rx="2" fill="#CBD5E1" />
            </g>
          </g>

          {/* Floating worksheet */}
          <g transform="translate(294, 196) rotate(14)">
            <rect x="0" y="0" width="95" height="118" rx="7" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1.5"
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.08))" />
            <rect x="0" y="0" width="95" height="22" rx="7" fill="#EFF6FF" />
            <text x="8"  y="15"  fontSize="8"  fill="#3478E8" fontWeight="700">MATH ✦</text>
            <line x1="8" y1="36" x2="87" y2="36" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1="8" y1="50" x2="87" y2="50" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1="8" y1="64" x2="87" y2="64" stroke="#E2E8F0" strokeWidth="1.5" />
            <line x1="8" y1="78" x2="87" y2="78" stroke="#E2E8F0" strokeWidth="1.5" />
            <text x="30" y="105" fontSize="26" fill="#F59E0B">🏆</text>
          </g>

          {/* Bottom small elements */}
          <text x="50"  y="356" fontSize="26" className="ls-illus-bounce-3">🎯</text>
          <text x="345" y="352" fontSize="26" className="ls-illus-bounce-1">🎉</text>
          <text x="200" y="370" fontSize="22" className="ls-illus-bounce-2">💡</text>
        </svg>
      </div>

      {/* Stat bubbles */}
      <div className="ls-hero-stat-bubble ls-hero-stat-bubble--top">
        <span className="ls-hero-stat-icon">📊</span>
        <div>
          <span className="ls-hero-stat-num">10,000+</span>
          <span className="ls-hero-stat-label">Worksheets</span>
        </div>
      </div>
      <div className="ls-hero-stat-bubble ls-hero-stat-bubble--bottom">
        <span className="ls-hero-stat-icon">⭐</span>
        <div>
          <span className="ls-hero-stat-num">100% Free</span>
          <span className="ls-hero-stat-label">Forever</span>
        </div>
      </div>
      <div className="ls-hero-stat-bubble ls-hero-stat-bubble--left">
        <span className="ls-hero-stat-icon">🚀</span>
        <div>
          <span className="ls-hero-stat-num">Instant</span>
          <span className="ls-hero-stat-label">Print Ready</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main HomeClient ────────────────────────────────────────────── */
export default function HomeClient() {
  const handleScrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("how-it-works");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="ls-home">
      <UnicornPencil />

      {/* Background floating math decorations */}
      <div className="ls-bg-decorations" aria-hidden="true">
        {mathDecorations.map((sym, i) => (
          <span
            key={i}
            className="ls-floating-deco"
            style={{
              left: `${(i * 11 + 3) % 94}%`,
              top: `${(i * 17 + 5) % 88}%`,
              animationDelay: `${i * 0.65}s`,
              fontSize: `${1.1 + (i % 3) * 0.45}rem`,
              opacity: 0.07 + (i % 4) * 0.015,
            }}
            aria-hidden="true"
          >
            {sym}
          </span>
        ))}
      </div>

      {/* ── 1. HERO ── */}
      <section className="ls-home-hero">
        <div className="ls-home-hero__ambient ls-home-hero__ambient--top-left" aria-hidden="true" />
        <div className="ls-home-hero__ambient ls-home-hero__ambient--top-right" aria-hidden="true" />
        <div className="ls-home-hero__ambient ls-home-hero__ambient--bottom" aria-hidden="true" />

        <div className="ls-home-container ls-home-hero__inner">
          {/* Left: Copy */}
          <div className="ls-home-hero__copy">
            <motion.div
              className="ls-home-hero__badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Star size={14} className="ls-home-hero__badge-star" fill="#3478E8" />
              <span>A little learning, a lot of fun</span>
            </motion.div>

            <motion.h1
              className="ls-home-hero__heading"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              Learning Math <br />
              Can Be{" "}
              <span className="ls-home-hero__highlight">
                Fun
                <span className="ls-home-hero__spark" aria-hidden="true">✦</span>
              </span>
            </motion.h1>

            <motion.p
              className="ls-home-hero__subtext"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16 }}
            >
              Discover engaging worksheets that help children practice math, build
              confidence, and enjoy learning every day.
            </motion.p>

            <motion.div
              className="ls-home-hero__actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
            >
              <Link href="/math" className="ls-home-btn ls-home-btn--primary">
                <span>Explore All Worksheets</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={handleScrollToHowItWorks}
                className="ls-home-btn ls-home-btn--secondary"
              >
                <Play size={15} fill="#3478E8" color="#3478E8" />
                <span>How It Works</span>
              </button>
            </motion.div>

            <motion.div
              className="ls-home-hero__features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, delay: 0.32 }}
            >
              {["Free Forever", "Instant Print", "All Skill Levels", "Age Appropriate"].map(
                (feat) => (
                  <div key={feat} className="ls-home-feature-item">
                    <span className="ls-home-feature-check">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{feat}</span>
                  </div>
                )
              )}
            </motion.div>
          </div>

          {/* Right: Illustration */}
          <motion.div
            className="ls-home-hero__illustration-wrapper"
            initial={{ opacity: 0, scale: 0.94, x: 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section id="how-it-works" className="ls-home-section ls-home-section--how-it-works">
        <div className="ls-home-container">
          <div className="ls-home-section-header">
            <span className="ls-home-eyebrow">Simple Steps</span>
            <h2 className="ls-home-section-title">How It Works</h2>
            <p className="ls-home-section-desc">
              Get started in just a few clicks and create wonderful worksheets in no time.
            </p>
          </div>

          <div className="ls-home-steps-grid">
            {steps.map((st, i) => (
              <React.Fragment key={st.num}>
                <motion.div
                  className="ls-home-step-card"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                >
                  <div className="ls-step-emoji-badge" style={{ background: st.bg }}>
                    {st.emoji}
                  </div>
                  <div className="ls-home-step-card__badge-row">
                    <span className="ls-home-step-card__num" style={{ backgroundColor: st.color }}>
                      {st.num}
                    </span>
                    <div className="ls-home-step-card__icon" style={{ backgroundColor: st.bg, color: st.color }}>
                      {st.icon}
                    </div>
                  </div>
                  <h3 className="ls-home-step-card__title">{st.title}</h3>
                  <p className="ls-home-step-card__desc">{st.desc}</p>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="ls-home-step-connector" aria-hidden="true">➔</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. STRIP CAROUSEL ── */}
      <MultiStripCarousel />

      {/* ── 4. LEARNING BENEFITS ── */}
      <section className="ls-home-section ls-home-section--benefits">
        <div className="ls-home-container">
          <div className="ls-benefits-side-deco ls-benefits-side-deco--left" aria-hidden="true">
            <span style={{ fontSize: "2.8rem" }}>📚</span>
            <span style={{ fontSize: "2.2rem" }}>✏️</span>
            <span style={{ fontSize: "2.5rem" }}>🔭</span>
          </div>
          <div className="ls-benefits-side-deco ls-benefits-side-deco--right" aria-hidden="true">
            <span style={{ fontSize: "2.8rem" }}>🌈</span>
            <span style={{ fontSize: "2.2rem" }}>🎯</span>
            <span style={{ fontSize: "2.5rem" }}>🚀</span>
          </div>

          <div className="ls-home-section-header">
            <span className="ls-home-eyebrow">Why LearnSpark</span>
            <h2 className="ls-home-section-title">Built for Confident, Joyful Learning</h2>
            <p className="ls-home-section-desc">
              Every worksheet is thoughtfully engineered to blend curriculum standards with engaging visual design.
            </p>
          </div>

          <div className="ls-home-benefits-grid">
            {learningBenefits.map((b, i) => (
              <motion.div
                key={i}
                className="ls-home-benefit-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="ls-benefit-emoji-cap" style={{ background: b.bg }}>
                  {b.emoji}
                </div>
                <div className="ls-home-benefit-card__icon-box" style={{ backgroundColor: b.bg, color: b.color }}>
                  {b.icon}
                </div>
                <span className="ls-home-benefit-card__tag" style={{ backgroundColor: b.bg, color: b.color }}>
                  {b.tag}
                </span>
                <h3 className="ls-home-benefit-card__title">{b.title}</h3>
                <p className="ls-home-benefit-card__desc">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PRINTABLE WORKSHEETS GALLERY ── */}
      <section id="ready-made-worksheets" className="ls-home-section">
        <div className="ls-home-container">
          <div className="ls-home-section-header">
            <span className="ls-home-eyebrow">Ready to Print</span>
            <h2 className="ls-home-section-title">Printable Worksheets</h2>
            <p className="ls-home-section-desc">
              Explore and create printable worksheets for your child.
            </p>
            
<Link
  href="/printable-worksheets"
  className="ls-home-btn ls-home-btn--primary"
>
  <span>Browse Worksheets</span>
  <ArrowRight size={16} />
</Link>

          </div>
        </div>
      </section>

      {/* ── 6. VIDEO SHOWCASE ── */}
      {/* <VideoShowcase /> */}

      {/* ── 7. EXPLORE SUBJECTS ── */}
      <section className="ls-home-section ls-home-section--subjects">
        <div className="ls-home-container">
          <div className="ls-home-section-header">
            <span className="ls-home-eyebrow">Discover Every Subject</span>
            <h2 className="ls-home-section-title">Where Every Subject is an Adventure</h2>
            <p className="ls-home-section-desc">
              From friendly numbers and reading adventures to exciting nature experiments and creative arts.
            </p>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. POPULAR WORKSHEETS ── */}
      <section className="ls-home-section ls-home-section--popular">
        <div className="ls-home-container">
          <div className="ls-home-section-header">
            <span className="ls-home-eyebrow">Most Loved This Week</span>
            <h2 className="ls-home-section-title">Popular Printable Worksheets</h2>
            <p className="ls-home-section-desc">
              Tried, tested, and printed by thousands of happy teachers and parents across the world.
            </p>
          </div>
          <div className="worksheets-grid">
            {popularWorksheets.map((ws, i) => (
              <WorksheetCard key={ws.id} worksheet={ws} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. REVIEWS ── */}
      <section className="ls-home-section ls-home-section--reviews">
        <div className="ls-home-container">
          <div className="ls-reviews-trust-banner">
            <span>🌍</span>
            <span>Trusted by teachers &amp; parents in 30+ countries</span>
            <span>🌏</span>
          </div>

          <div className="ls-home-section-header">
            <span className="ls-home-eyebrow">Trusted Feedback</span>
            <h2 className="ls-home-section-title">Loved by Teachers &amp; Parents Worldwide</h2>
            <p className="ls-home-section-desc">
              See how LearnSpark brings smiles, confidence, and clarity to daily learning.
            </p>
          </div>

          <div className="ls-home-reviews-grid">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                className="ls-home-review-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
              >
                <div className="ls-review-emoji-top">{t.emoji}</div>
                <div className="ls-home-review-stars">
                  {[...Array(t.rating)].map((_, sIdx) => (
                    <Star key={sIdx} size={15} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p className="ls-home-review-card__quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="ls-home-review-card__author">
                  <div
                    className="ls-home-review-avatar"
                    style={{ backgroundColor: t.avatarBg, color: t.avatarColor }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="ls-home-review-name">{t.name}</h4>
                    <p className="ls-home-review-role">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
