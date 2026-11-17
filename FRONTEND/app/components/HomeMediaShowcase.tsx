"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Star,
  Heart,
  Lightbulb,
  BookOpen,
  Smile,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeMediaShowcase() {
  // Video State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeFruitTip, setActiveFruitTip] = useState<string>("apple");
  const [selectedFruitReaction, setSelectedFruitReaction] = useState<string | null>(null);

  // Tree Image Interactive State
  const [treeStarCount, setTreeStarCount] = useState<number>(24);
  const [treeSparkles, setTreeSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [treeToast, setTreeToast] = useState<boolean>(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFruitClick = (fruit: string, message: string) => {
    setActiveFruitTip(fruit);
    setSelectedFruitReaction(message);
    setTimeout(() => {
      setSelectedFruitReaction(null);
    }, 3000);
  };

  const sparkleTheTree = (e?: React.MouseEvent) => {
    setTreeStarCount((prev) => prev + 1);
    setTreeToast(true);

    // Create 6 new floating stars on the tree
    const newSparkles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 60,
    }));
    setTreeSparkles((prev) => [...prev.slice(-18), ...newSparkles]);

    setTimeout(() => {
      setTreeToast(false);
    }, 2200);
  };

  return (
    <section className="ls-home-section ls-home-media-showcase-section" id="wonder-hub">
      <div className="ls-home-container">
        {/* Section Header */}
        <div className="ls-home-section-header">
          <div className="ls-home-media-badge-pill">
            <Sparkles size={14} className="ls-home-media-badge-icon" />
            <span>Interactive Media &amp; Story Studio</span>
          </div>
          <h2 className="ls-home-section-title">
            Watch, Wonder &amp; Grow: Joyful Learning in Action
          </h2>
          <p className="ls-home-section-desc">
            Explore animated stories and inspiring visuals that nurture healthy habits,
            curiosity, and a love for reading and math together.
          </p>
        </div>

        {/* Two Featured Showcase Columns */}
        <div className="ls-home-media-grid">
          {/* ══════════════════════════════════════════════════════════
              CARD 1: ANIMATED VIDEO LESSON (Kids Fruit & Energy)
              ══════════════════════════════════════════════════════════ */}
          <div className="ls-media-card ls-media-card--video">
            <div className="ls-media-card__header">
              <div className="ls-media-card__tag ls-media-card__tag--video">
                <Play size={13} fill="currentColor" />
                <span>Animated Video Lesson • Healthy Bodies &amp; Minds</span>
              </div>
              <h3 className="ls-media-card__title">
                Red Apples for Energy, Yellow Bananas for Muscles!
              </h3>
              <p className="ls-media-card__desc">
                Watch our cheerful animated learners discover the super powers of healthy fruits.
                Learning how nutrition fuels our brains for math, reading, and play!
              </p>
            </div>

            {/* Video Player Device Frame */}
            <div className="ls-video-device-frame">
              <div className="ls-video-device-notch" />

              <div className="ls-video-viewport" onClick={togglePlay}>
                <video
                  ref={videoRef}
                  src="/kids-fruit-lesson.mp4"
                  className="ls-video-element"
                  loop
                  playsInline
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Big Floating Play Overlay if paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="ls-video-play-btn"
                    aria-label="Play animated lesson video"
                  >
                    <Play size={32} fill="#FFFFFF" color="#FFFFFF" className="ls-video-play-icon" />
                    <span className="ls-video-play-label">Tap to Play Video</span>
                  </button>
                )}

                {/* Floating Bottom Video Controls Bar */}
                <div
                  className="ls-video-controls-overlay"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="ls-video-ctrl-btn"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                  </button>

                  <div className="ls-video-status-text">
                    <span className="ls-video-dot" />
                    <span>{isPlaying ? "Playing Story..." : "Paused • Ready"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="ls-video-ctrl-btn"
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Floating Fruit Stickers */}
              <div className="ls-video-fruit-badge ls-video-fruit-badge--apple">
                <span>🍎 Energy!</span>
              </div>
              <div className="ls-video-fruit-badge ls-video-fruit-badge--banana">
                <span>🍌 Muscle Power!</span>
              </div>
            </div>

            {/* Interactive Fruit Discovery Chips */}
            <div className="ls-video-interactive-footer">
              <h4 className="ls-video-footer-title">
                <Smile size={16} color="#3478E8" />
                <span>Tap a fruit to learn its secret superpower:</span>
              </h4>

              <div className="ls-fruit-chips-row">
                <button
                  type="button"
                  onClick={() =>
                    handleFruitClick("apple", "🍎 Red Apple: Gives you long-lasting energy to solve math puzzles!")
                  }
                  className={`ls-fruit-chip ${activeFruitTip === "apple" ? "ls-fruit-chip--active" : ""}`}
                >
                  <span>🍎 Apple</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFruitClick("banana", "🍌 Banana: Packed with natural potassium to keep muscles agile & active!")
                  }
                  className={`ls-fruit-chip ${activeFruitTip === "banana" ? "ls-fruit-chip--active" : ""}`}
                >
                  <span>🍌 Banana</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFruitClick("berries", "🫐 Blueberries & Oranges: Vitamin champions for memory and bright smiles!")
                  }
                  className={`ls-fruit-chip ${activeFruitTip === "berries" ? "ls-fruit-chip--active" : ""}`}
                >
                  <span>🫐 Blueberries</span>
                </button>
              </div>

              {/* Active Superpower Tip Box */}
              <div className="ls-fruit-tip-box">
                {activeFruitTip === "apple" && (
                  <p>
                    <strong>🍎 Crunchy Red Apples:</strong> Loaded with natural fiber and steady fuel so kids can concentrate happily on every question!
                  </p>
                )}
                {activeFruitTip === "banana" && (
                  <p>
                    <strong>🍌 Cheerful Yellow Bananas:</strong> Provides quick natural energy that helps growing muscles and keeps hands ready to write and draw!
                  </p>
                )}
                {activeFruitTip === "berries" && (
                  <p>
                    <strong>🫐 Blueberries &amp; Oranges:</strong> Packed with brain-boosting antioxidants and Vitamin C that protect health and sharpen focus!
                  </p>
                )}
              </div>

              <AnimatePresence>
                {selectedFruitReaction && (
                  <motion.div
                    className="ls-fruit-reaction-banner"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {selectedFruitReaction}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARD 2: THE WONDER TREE OF KNOWLEDGE & SHARING (Image)
              ══════════════════════════════════════════════════════════ */}
          <div className="ls-media-card ls-media-card--tree">
            <div className="ls-media-card__header">
              <div className="ls-media-card__tag ls-media-card__tag--tree">
                <Sparkles size={13} fill="currentColor" />
                <span>Storybook Art • Sharing In Our Lives</span>
              </div>
              <h3 className="ls-media-card__title">
                The Wonder Tree: Feelings, Knowledge &amp; Community
              </h3>
              <p className="ls-media-card__desc">
                In our learning tree, every child finds their branch. From heart-centered feelings
                to golden balloons of knowledge, books, and sharing joy under starry night skies.
              </p>
            </div>

            {/* Tree Artwork Picture Frame with Floating Stars */}
            <div className="ls-tree-frame" onClick={sparkleTheTree}>
              <div className="ls-tree-image-wrapper">
                <Image
                  src="/learning-tree.jpeg"
                  alt="Tree of Knowledge showing children reading books, sharing feelings and knowledge among glowing stars"
                  width={720}
                  height={540}
                  className="ls-tree-image"
                  priority
                />

                {/* Subtle Night Star Shimmers Over Tree */}
                <div className="ls-tree-ambient-stars" aria-hidden="true">
                  <span className="ls-ambient-star ls-ambient-star--1">⭐</span>
                  <span className="ls-ambient-star ls-ambient-star--2">✨</span>
                  <span className="ls-ambient-star ls-ambient-star--3">⭐</span>
                  <span className="ls-ambient-star ls-ambient-star--4">✨</span>
                  <span className="ls-ambient-star ls-ambient-star--5">⭐</span>
                </div>

                {/* Interactive Dynamic Sparkles emitted when tapped */}
                {treeSparkles.map((sp) => (
                  <div
                    key={sp.id}
                    className="ls-tree-dynamic-sparkle"
                    style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
                  >
                    ⭐
                  </div>
                ))}

                {/* Floating Story Badges on Art */}
                <div className="ls-tree-badge ls-tree-badge--feelings">
                  <Heart size={14} fill="#EC4899" color="#EC4899" />
                  <span>Feelings &amp; Empathy</span>
                </div>

                <div className="ls-tree-badge ls-tree-badge--knowledge">
                  <Lightbulb size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>Knowledge &amp; Curiosity</span>
                </div>
              </div>

              {/* Tap Prompt Hint */}
              <div className="ls-tree-tap-hint">
                <Sparkles size={13} color="#F59E0B" />
                <span>Click image to sparkle the branches with stars!</span>
              </div>
            </div>

            {/* Tree Pillars & Interactive Sparkle Counter */}
            <div className="ls-tree-footer-content">
              <div className="ls-tree-pillars-grid">
                <div className="ls-tree-pillar-item">
                  <div className="ls-tree-pillar-icon" style={{ backgroundColor: "#FDF2F8", color: "#EC4899" }}>
                    <Heart size={16} />
                  </div>
                  <div>
                    <h5>Sharing Feelings</h5>
                    <p>Learning emotional confidence and teamwork.</p>
                  </div>
                </div>

                <div className="ls-tree-pillar-item">
                  <div className="ls-tree-pillar-icon" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>
                    <Lightbulb size={16} />
                  </div>
                  <div>
                    <h5>Lifelong Knowledge</h5>
                    <p>Reading, counting, and discovering every day.</p>
                  </div>
                </div>

                <div className="ls-tree-pillar-item">
                  <div className="ls-tree-pillar-icon" style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h5>Storybook Imagination</h5>
                    <p>Building wonder through colorful illustrations.</p>
                  </div>
                </div>
              </div>

              {/* Sparkle Action Button */}
              <div className="ls-tree-action-bar">
                <button
                  type="button"
                  onClick={sparkleTheTree}
                  className="ls-tree-sparkle-btn"
                >
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span>Sparkle the Tree! ({treeStarCount} ⭐)</span>
                </button>

                <div className="ls-tree-share-quote">
                  <em>&ldquo;Sharing In Our Lives — Growing Branch by Branch&rdquo;</em>
                </div>
              </div>

              <AnimatePresence>
                {treeToast && (
                  <motion.div
                    className="ls-tree-toast-message"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>The Wonder Tree sparkles with learning magic! ⭐✨</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
