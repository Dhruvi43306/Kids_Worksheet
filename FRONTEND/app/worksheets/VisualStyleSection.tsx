
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, Clock3 } from "lucide-react";
import { VisualStyle } from "./types";

interface Props {
  visualStyles: VisualStyle[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
  questionTypeName?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.055,
      ease: "easeOut" as const,
    },
  }),
};

export default function VisualStyleSection({
  visualStyles,
  selectedId,
  onSelect,
  isLoading,
  questionTypeName,
}: Props) {
  return (
    <div className="wg__section">
      <div className="wg__section-head">
        <h3 className="wg__section-title">Visual Style</h3>
      </div>

      <p className="wg__section-hint">
        Choose how your worksheet looks.
      </p>

      {/* Loading state */}
      {isLoading && (
        <div className="wg__skel-grid--style" aria-label="Loading visual styles">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="wg__skeleton wg__skel-style"
            />
          ))}
        </div>
      )}

      {/* Coming soon state */}
      {!isLoading && visualStyles.length === 0 && (
        <div
          className="wg__style-empty"
          role="status"
          aria-live="polite"
        >
          <div className="wg__style-empty-icon">
            <Palette size={25} aria-hidden="true" />
            <span>
              <Clock3 size={14} aria-hidden="true" />
            </span>
          </div>

          <div className="wg__style-empty-content">
            <div className="wg__style-empty-title">
              More visual styles are coming soon!
              <Sparkles size={16} aria-hidden="true" />
            </div>

            <p>
              {questionTypeName
                ? `We're working on new visual styles for ${questionTypeName}.`
                : "We're working on new visual styles for this question type."}
              {" "}For now, you can continue with the standard worksheet layout.
            </p>
          </div>
        </div>
      )}

      {/* Available visual styles */}
      {!isLoading && visualStyles.length > 0 && (
        <AnimatePresence mode="wait">
          <div className="vstyle-grid">
            {visualStyles.map((item, index) => {
              const selected = selectedId === item.visualStyleId;

              return (
                <motion.button
                  key={item.visualStyleId}
                  type="button"
                  className={`vstyle-card${
                    selected ? " vstyle-card--selected" : ""
                  }`}
                  onClick={() => onSelect(item.visualStyleId)}
                  aria-pressed={selected}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -3,
                    transition: { duration: 0.16 },
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="vstyle-card__icon">
                    {item.icon}
                  </span>

                  <span className="vstyle-card__label">
                    {item.name}
                  </span>

                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        className="vstyle-card__check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 18,
                        }}
                        aria-hidden="true"
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
