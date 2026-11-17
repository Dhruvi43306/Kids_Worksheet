"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

interface StarParticle {
  id: number;
  xPercent: number; // percentage of viewport width
  yPercent: number; // percentage of viewport height
  size: number;
  color: string;
  rotation: number;
  type: "sparkle" | "star";
  vx: number;
  vy: number;
}

const STAR_COLORS = [
  "#F59E0B", // Golden Yellow
  "#FBBF24", // Amber
  "#EC4899", // Pastel Pink
  "#A855F7", // Lavender Purple
  "#3B82F6", // Sky Blue
  "#10B981", // Mint Green
  "#06B6D4", // Cyan
  "#FFFFFF", // Pure White
];

const FUN_PHRASES = [
  "✨ Math is Magic!",
  "🌟 Keep Shining!",
  "🦄 Gliding across the page!",
  "✏️ Great work!",
  "💫 Sparkle superstar!",
];

export default function UnicornPencil() {
  // Starts strictly at the UP TO LEFT SIDE:
  // X: 4.5% (left side), Y: 16% (up top)
  const [posX, setPosX] = useState<number>(4.5); // % of viewport width (4.5% = left, 92% = right)
  const [posY, setPosY] = useState<number>(16); // % of viewport height (up top)
  const [isMovingRight, setIsMovingRight] = useState<boolean>(true);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [stars, setStars] = useState<StarParticle[]>([]);
  const [speechBubble, setSpeechBubble] = useState<string>("✨ Scroll to fly with me!");
  const [showSpeech, setShowSpeech] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const prevScrollY = useRef<number>(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const nextStarId = useRef<number>(0);

  // Helper to spawn sparkle stars trailing the pencil
  const spawnStar = useCallback((burst = false) => {
    const count = burst ? 14 : 2;
    const newParticles: StarParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = burst ? (Math.PI * 2 * i) / count : Math.random() * Math.PI * 2;
      const speed = burst ? Math.random() * 60 + 30 : Math.random() * 25 + 10;
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      const type = Math.random() > 0.4 ? "sparkle" : "star";

      newParticles.push({
        id: nextStarId.current++,
        xPercent: posX + (Math.random() * 2 - 1),
        yPercent: posY + (Math.random() * 2 - 1),
        size: burst ? Math.random() * 14 + 12 : Math.random() * 12 + 8,
        color,
        rotation: Math.random() * 360,
        type,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }

    setStars((prev) => [...prev.slice(-32), ...newParticles]);
  }, [posX, posY]);

  // Track page scroll:
  // Starts at UP LEFT (progress = 0) and glides from side to side across the page
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

      const deltaY = scrollY - prevScrollY.current;
      prevScrollY.current = scrollY;

      // Cycles of side-to-side movement as user scrolls down the page
      const cycles = 3.5;
      const theta = progress * Math.PI * cycles;

      // Starts at left side (0) when progress = 0:
      // (1 - cos(theta)) / 2 is strictly 0 at progress = 0 (Left side)!
      // Reaches 1 at theta = pi (Right side)!
      // Returns to 0 at theta = 2pi (Left side)!
      const wave = (1 - Math.cos(theta)) / 2; // 0 (left) to 1 (right)

      // Horizontal bounds: 4.5% (left side) to 92% (right side)
      const minX = 4.5;
      const maxX = 92;
      const currentX = minX + wave * (maxX - minX);

      // Vertical position starts UP (16% of viewport height) and floats down smoothly
      const minY = 16;
      const maxY = 74;
      const currentY = minY + progress * (maxY - minY) + Math.sin(theta * 0.8) * 6;

      // Derivative d((1 - cos(theta))/2)/dtheta = sin(theta)/2
      // Positive sin(theta) = moving from left to right!
      // Negative sin(theta) = moving from right to left!
      const movingRight = Math.sin(theta) >= 0;

      setPosX(currentX);
      setPosY(currentY);
      setIsMovingRight(movingRight);
      setIsScrolling(true);

      // Spawn sparkle stars as user moves the page
      if (Math.abs(deltaY) > 4) {
        spawnStar(false);
      }

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [spawnStar]);

  // Clean up older stars
  useEffect(() => {
    if (stars.length === 0) return;
    const timer = setTimeout(() => {
      setStars((prev) => prev.slice(2));
    }, 850);
    return () => clearTimeout(timer);
  }, [stars]);

  // Gentle idle sparkle interval
  useEffect(() => {
    const idleTimer = setInterval(() => {
      spawnStar(false);
    }, 1600);
    return () => clearInterval(idleTimer);
  }, [spawnStar]);

  const handlePencilClick = () => {
    setIsSpinning(true);
    spawnStar(true);

    const randomPhrase = FUN_PHRASES[Math.floor(Math.random() * FUN_PHRASES.length)];
    setSpeechBubble(randomPhrase);
    setShowSpeech(true);

    setTimeout(() => {
      setIsSpinning(false);
    }, 750);

    setTimeout(() => {
      setShowSpeech(false);
    }, 2800);
  };

  return (
    <aside
      className="ls-unicorn-pencil-viewport"
      aria-label="Magic Unicorn Pencil Animation"
    >
      {/* ── Sparkling Stars Trail ── */}
      <div className="ls-unicorn-stars-container" aria-hidden="true">
        {stars.map((star) => (
          <div
            key={star.id}
            className="ls-unicorn-star-particle"
            style={
              {
                left: `${star.xPercent}%`,
                top: `${star.yPercent}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                color: star.color,
                "--vx": `${star.vx}px`,
                "--vy": `${star.vy}px`,
                "--rot": `${star.rotation}deg`,
              } as React.CSSProperties
            }
          >
            {star.type === "sparkle" ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,16.8 5.5,21 7.5,14 2,9 9,9" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* ── Unicorn Pencil Character: Starts at Up-Left, Glides Side to Side ── */}
      <div
        className={`ls-unicorn-pencil-tracker ${
          isScrolling ? "ls-unicorn-pencil-tracker--flying" : ""
        }`}
        style={{
          left: `${posX}%`,
          top: `${posY}%`,
          transform: `translate(-50%, -50%) scaleX(${isMovingRight ? 1 : -1}) rotate(${
            isMovingRight ? 14 : -14
          }deg)`,
        }}
      >
        {/* Speech Bubble */}
        {showSpeech && (
          <div
            className="ls-unicorn-speech-bubble"
            style={{
              transform: `scaleX(${isMovingRight ? 1 : -1})`,
            }}
          >
            <span>{speechBubble}</span>
          </div>
        )}

        {/* The Magical Unicorn Pencil Button */}
        <button
          type="button"
          onClick={handlePencilClick}
          onMouseEnter={() => setShowSpeech(true)}
          onMouseLeave={() => !isSpinning && setShowSpeech(false)}
          className={`ls-unicorn-pencil-btn ${
            isSpinning ? "ls-unicorn-pencil-btn--spin" : ""
          }`}
          title="Click the Unicorn Pencil for magical star sparkles!"
        >
          {/* Whimsical Aura Halo */}
          <div className="ls-unicorn-halo" aria-hidden="true" />

          {/* SVG Artwork: Unicorn Pencil */}
          <svg
            viewBox="0 0 110 110"
            className="ls-unicorn-svg"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="unicornHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="85%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>

              <linearGradient id="rainbowBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9AA2" />
                <stop offset="22%" stopColor="#FFDAC1" />
                <stop offset="45%" stopColor="#E2F0CB" />
                <stop offset="70%" stopColor="#B5EAD7" />
                <stop offset="100%" stopColor="#C7CEEA" />
              </linearGradient>

              <linearGradient id="woodCone" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2D6" />
                <stop offset="100%" stopColor="#F6D59A" />
              </linearGradient>

              <linearGradient id="goldFerrule" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              <linearGradient id="eraserPink" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>

              <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E0E7FF" />
              </linearGradient>
            </defs>

            {/* Wing Back */}
            <g className="ls-unicorn-wing ls-unicorn-wing--back">
              <path
                d="M 38 48 C 30 32, 12 28, 6 36 C 0 44, 18 54, 34 56 Z"
                fill="url(#wingGrad)"
                stroke="#C7D2FE"
                strokeWidth="1.5"
                opacity="0.85"
              />
            </g>

            {/* Mane */}
            <g className="ls-unicorn-mane">
              <path
                d="M 28 34 C 20 28, 12 36, 14 46 C 18 42, 24 40, 30 40 Z"
                fill="#FF85A2"
                opacity="0.9"
              />
              <path
                d="M 22 42 C 14 38, 8 46, 12 54 C 16 50, 20 48, 26 48 Z"
                fill="#A78BFA"
                opacity="0.9"
              />
              <path
                d="M 20 52 C 12 50, 10 58, 14 64 C 18 60, 22 58, 26 58 Z"
                fill="#38BDF8"
                opacity="0.9"
              />
            </g>

            {/* Pencil Shaft */}
            <g id="pencil-core" transform="rotate(35 55 55)">
              <rect
                x="24"
                y="46"
                width="16"
                height="18"
                rx="5"
                fill="url(#eraserPink)"
                stroke="#DB2777"
                strokeWidth="1"
              />
              <ellipse cx="28" cy="50" rx="3" ry="2" fill="#FFFFFF" opacity="0.6" />

              <rect
                x="38"
                y="45"
                width="8"
                height="20"
                rx="2"
                fill="url(#goldFerrule)"
                stroke="#B45309"
                strokeWidth="0.8"
              />
              <line x1="41" y1="45" x2="41" y2="65" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

              <rect
                x="46"
                y="45"
                width="34"
                height="20"
                rx="3"
                fill="url(#rainbowBody)"
                stroke="#818CF8"
                strokeWidth="1"
              />

              <polygon
                points="80,45 80,65 100,55"
                fill="url(#woodCone)"
                stroke="#D97706"
                strokeWidth="1"
              />
              <polygon points="94,52 94,58 102,55" fill="#1E293B" />
              <circle cx="102" cy="55" r="2.5" fill="#FBBF24" opacity="0.9" />
            </g>

            {/* Cute Face */}
            <g id="kawaii-face" transform="translate(48, 48)">
              <ellipse cx="14" cy="5" rx="3.5" ry="4.5" fill="#1E293B" />
              <circle cx="15.2" cy="3.5" r="1.4" fill="#FFFFFF" />
              <circle cx="13" cy="6.8" r="0.8" fill="#FFFFFF" />

              <ellipse cx="2" cy="5" rx="3.5" ry="4.5" fill="#1E293B" />
              <circle cx="3.2" cy="3.5" r="1.4" fill="#FFFFFF" />
              <circle cx="1" cy="6.8" r="0.8" fill="#FFFFFF" />

              <path
                d="M 5 9 Q 8 13 11 9"
                stroke="#BE185D"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="#FDA4AF"
              />

              <ellipse cx="-2" cy="8" rx="3" ry="2" fill="#FB7185" opacity="0.75" />
              <ellipse cx="18" cy="8" rx="3" ry="2" fill="#FB7185" opacity="0.75" />
            </g>

            {/* Ears */}
            <g id="unicorn-ears">
              <path
                d="M 44 26 C 42 16, 49 14, 52 24 Z"
                fill="#FFFFFF"
                stroke="#F472B6"
                strokeWidth="1.2"
              />
              <path d="M 45 24 C 44 19, 48 18, 50 24 Z" fill="#FBCFE8" />

              <path
                d="M 54 28 C 54 18, 62 16, 64 27 Z"
                fill="#FFFFFF"
                stroke="#F472B6"
                strokeWidth="1.2"
              />
              <path d="M 56 26 C 56 20, 60 19, 62 26 Z" fill="#FBCFE8" />
            </g>

            {/* Golden Horn */}
            <g id="unicorn-horn">
              <polygon
                points="47,24 53,24 64,2"
                fill="url(#unicornHornGrad)"
                stroke="#D97706"
                strokeWidth="1.2"
              />
              <line x1="49" y1="19" x2="55" y2="20" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="52" y1="14" x2="57" y2="15" stroke="#FEF08A" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="56" y1="9" x2="60" y2="10" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />

              <g transform="translate(64, 2)">
                <circle cx="0" cy="0" r="4" fill="#FEF08A" opacity="0.8" />
                <path
                  d="M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z"
                  fill="#FFFBEB"
                />
              </g>
            </g>

            {/* Front Wing */}
            <g className="ls-unicorn-wing ls-unicorn-wing--front">
              <path
                d="M 44 52 C 34 38, 14 36, 12 46 C 10 56, 32 64, 46 58 Z"
                fill="url(#wingGrad)"
                stroke="#A5B4FC"
                strokeWidth="1.4"
              />
            </g>
          </svg>
        </button>
      </div>
    </aside>
  );
}
