"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ListOrdered, Sparkles, Clock3 } from "lucide-react";

import type { QuestionCountOption } from "./types";

interface Props {
  questionCount: QuestionCountOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.28,
      delay: i * 0.05,
      ease: "easeOut" as const,
    },
  }),
};

export default function QuestionCountSection({
  questionCount,
  selectedId,
  onSelect,
  isLoading = false,
}: Props) {
  const isUnavailable =
    !isLoading && questionCount.length === 0;

  return (
    <div className="wg__section">
      <div className="wg__section-head">
        <h3 className="wg__section-title">
          Number of Questions
        </h3>
      </div>

      <p className="wg__section-hint">
        How much practice do you need?
      </p>

      {/* Loading state */}
      {isLoading && (
        <div
          className="wg__skel-row"
          aria-label="Loading question counts"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="wg__skeleton wg__skel-count"
            />
          ))}
        </div>
      )}

      {/* No question counts available */}
      {isUnavailable && (
        <div
          className="wg__count-empty"
          role="status"
          aria-live="polite"
        >
          <div className="wg__count-empty-icon">
            <ListOrdered
              size={25}
              aria-hidden="true"
            />

            <span>
              <Clock3
                size={14}
                aria-hidden="true"
              />
            </span>
          </div>

          <div className="wg__count-empty-content">
            <h4 className="wg__count-empty-title">
              More practice options coming soon!
              <Sparkles
                size={17}
                aria-hidden="true"
              />
            </h4>

            <p>
              Question-count options aren't available for this
              selection yet. We're working on adding more
              practice choices.
            </p>
          </div>
        </div>
      )}

      {/* Available question-count options */}
      {!isLoading && questionCount.length > 0 && (
        <AnimatePresence mode="wait">
          <div className="count-grid">
            {questionCount.map((item, index) => {
              const selected =
                selectedId === item.questionCountOptionId;

              return (
                <motion.button
                  key={item.questionCountOptionId}
                  type="button"
                  className={[
                    "count-card",
                    selected ? "count-card--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    onSelect(item.questionCountOptionId)
                  }
                  aria-pressed={selected}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -3,
                    transition: { duration: 0.16 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="count-card__num">
                    {item.questionCount}
                  </span>

                  <span className="count-card__label">
                    {item.questionCount === 1
                      ? "question"
                      : "questions"}
                  </span>

                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        className="count-card__check"
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