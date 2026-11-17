
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock3, Gauge } from "lucide-react";

import type { Difficulty } from "./types";

interface DifficultyUI {
  icon: string;
  color: string;
}

interface Props {
  difficulty: Difficulty[];
  selectedId: number | null;
  loading: boolean;
  ui: DifficultyUI[];
  onSelect: (id: number) => void;
}

const SUBTITLES = [
  "Great for getting started",
  "A little more challenge",
  "Push your limits",
  "Mix it all together",
];

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      delay: i * 0.06,
      ease: "easeOut" as const,
    },
  }),
};

export default function DifficultySection({
  difficulty,
  selectedId,
  loading,
  ui,
  onSelect,
}: Props) {
  return (
    <div className="wg__section">
      <div className="wg__section-head">
        <h3 className="wg__section-title">
          Difficulty
        </h3>
      </div>

      <p className="wg__section-hint">
        Choose the level that feels right.
      </p>

      {/* Loading state */}
      {loading && (
        <div
          className="wg__skel-grid--diff"
          aria-label="Loading difficulty options"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="wg__skeleton wg__skel-diff"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && difficulty.length === 0 && (
        <div
          className="wg__difficulty-empty"
          role="status"
          aria-live="polite"
        >
          <div className="wg__difficulty-empty-icon">
            <Gauge size={25} aria-hidden="true" />

            <span>
              <Clock3 size={14} aria-hidden="true" />
            </span>
          </div>

          <div className="wg__difficulty-empty-content">
            <h4 className="wg__difficulty-empty-title">
              More difficulty levels coming soon!
              <Sparkles size={17} aria-hidden="true" />
            </h4>

            <p>
              Difficulty options aren't available for this
              selection yet. We're working on adding more
              ways to practise and learn.
            </p>
          </div>
        </div>
      )}

      {/* Available difficulty options */}
      {!loading && difficulty.length > 0 && (
        <AnimatePresence mode="wait">
          <div className="diff-grid">
            {difficulty.map((item, index) => {
              const selected =
                selectedId === item.difficultyId;

              const currentUI =
                ui.length > 0
                  ? ui[index % ui.length]
                  : undefined;

              const subtitle =
                SUBTITLES[index % SUBTITLES.length];

              return (
                <motion.button
                  key={item.difficultyId}
                  type="button"
                  className={[
                    "diff-card",
                    selected ? "diff-card--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    {
                      "--opt-color": currentUI?.color ?? "#6366f1",
                    } as React.CSSProperties
                  }
                  onClick={() =>
                    onSelect(item.difficultyId)
                  }
                  aria-pressed={selected}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -3,
                    transition: { duration: 0.18 },
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="diff-card__icon">
                    {currentUI?.icon ?? "⭐"}
                  </span>

                  <span className="diff-card__label">
                    {item.name}
                  </span>

                  <span className="diff-card__sub">
                    {subtitle}
                  </span>

                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        className="diff-card__check"
                        initial={{
                          scale: 0,
                          opacity: 0,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                        }}
                        exit={{
                          scale: 0,
                          opacity: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                        }}
                        aria-hidden="true"
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <span
                    className="diff-card__stripe"
                    aria-hidden="true"
                  />
                </motion.button>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
