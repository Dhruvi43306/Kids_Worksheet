
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

export default function MovingStillObjectsAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const [movingAnswer, setMovingAnswer] = useState("");
  const [stillAnswer, setStillAnswer] = useState("");

  const icon = data.icons ?? "⭐";

  const movingObjects = Array.isArray(data.movingObject)
    ? data.movingObject
    : [];

  const stillObjects = Array.isArray(data.stillObject)
    ? data.stillObject
    : [];

  const movingCount =
    typeof data.movingcount === "number"
      ? data.movingcount
      : movingObjects.length;

  const stillCount =
    typeof data.stillcount === "number"
      ? data.stillcount
      : stillObjects.length;

  const total =
    typeof data.total === "number"
      ? data.total
      : movingCount + stillCount;

  const movingUserAnswer = String(movingAnswer ?? "").trim();
  const stillUserAnswer = String(stillAnswer ?? "").trim();
  const totalUserAnswer = String(userAnswer ?? "").trim();

  const movingCorrect =
    movingUserAnswer !== "" &&
    answerMatches(movingUserAnswer, [String(movingCount)]);

  const stillCorrect =
    stillUserAnswer !== "" &&
    answerMatches(stillUserAnswer, [String(stillCount)]);

  const totalCorrect =
    totalUserAnswer !== "" &&
    answerMatches(totalUserAnswer, [String(total)]);

  const allCorrect = movingCorrect && stillCorrect && totalCorrect;

  if (movingObjects.length === 0 && stillObjects.length === 0) {
    return (
      <div className="moving-still-addition__error">
        Moving and still objects are missing.
      </div>
    );
  }

  return (
    <div className="moving-still-addition">
      {/* Question */}
      <h3 className="moving-still-addition__question">
        {question.questionText}
      </h3>

      {/* Example instruction */}
      {question.questionNumber === 1 && (
        <motion.div
          className="moving-still-addition__example"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.span
            className="moving-still-addition__example-icon"
            animate={{
              rotate: [-5, 5, -5],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💡
          </motion.span>

          <div>
            <div className="moving-still-addition__example-title">
              Example
            </div>

            <div className="moving-still-addition__example-text">
              Count the moving objects first. Then count the still
              objects. Finally, add both groups to find the total.
            </div>
          </div>
        </motion.div>
      )}

      {/* Main scene container */}
      <motion.div
        className="moving-still-addition__main"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        {/* Scene header */}
        <div className="moving-still-addition__header">
          <div className="moving-still-addition__observe">
            <span className="moving-still-addition__status-dot" />
            OBSERVE THE OBJECTS
          </div>

          <div className="moving-still-addition__legend">
            <span>🏃 Moving</span>
            <span>🧍 Still</span>
          </div>
        </div>

        {/* Moving and still groups */}
        <div className="moving-still-addition__groups">
          {/* Moving objects card */}
          <motion.div
            className="moving-still-addition__group moving-still-addition__group--moving"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="moving-still-addition__group-header">
              <div className="moving-still-addition__group-title moving-still-addition__group-title--moving">
                <motion.span
                  className="moving-still-addition__group-icon moving-still-addition__group-icon--moving"
                  animate={{ x: [0, 3, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🏃
                </motion.span>

                MOVING
              </div>

              <motion.span
                className="moving-still-addition__badge moving-still-addition__badge--moving"
                animate={{ opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                IN MOTION
              </motion.span>
            </div>

            {/* Moving scene */}
            <div className="moving-still-addition__scene moving-still-addition__scene--moving">
              <motion.div
                className="moving-still-addition__scene-light"
                animate={{ x: ["-20%", "120%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              <motion.div
                className="moving-still-addition__cloud moving-still-addition__cloud--one"
                animate={{ x: [-15, 20, -15] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ☁️
              </motion.div>

              <motion.div
                className="moving-still-addition__cloud moving-still-addition__cloud--two"
                animate={{ x: [15, -18, 15] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ☁️
              </motion.div>

              <motion.div
                className="moving-still-addition__wind moving-still-addition__wind--one"
                animate={{
                  x: [-20, 20, -20],
                  opacity: [0.25, 0.65, 0.25],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="moving-still-addition__wind moving-still-addition__wind--two"
                animate={{
                  x: [20, -20, 20],
                  opacity: [0.15, 0.5, 0.15],
                }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="moving-still-addition__ground moving-still-addition__ground--moving" />

              <motion.div
                className="moving-still-addition__ground-streak"
                animate={{ x: ["-10%", "110%"] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* The grid grows naturally to fit every row. */}
              <div className="moving-still-addition__object-grid">
                {movingObjects.map((item, index) => (
                  <motion.div
                    key={`moving-${index}`}
                    className="moving-still-addition__object moving-still-addition__object--moving"
                    initial={{ opacity: 0, scale: 0.7, x: -15 }}
                    animate={{
                      opacity: 1,
                      x: [-3, 7, -2, 6, -3],
                      y: [0, -3, 0, 2, 0],
                      rotate: [0, 2, 0, -2, 0],
                      scale: [1, 1.04, 1, 1.03, 1],
                    }}
                    transition={{
                      opacity: {
                        duration: 0.4,
                        delay: index * 0.04,
                      },
                      x: {
                        duration: 2.1,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.08,
                      },
                      y: {
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.05,
                      },
                      rotate: {
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.06,
                      },
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.07,
                      },
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.span
                      className="moving-still-addition__object-glow"
                      animate={{
                        opacity: [0.15, 0.45, 0.15],
                        scale: [0.9, 1.2, 0.9],
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        delay: index * 0.08,
                      }}
                    />

                    <motion.span
                      className="moving-still-addition__motion-line moving-still-addition__motion-line--one"
                      animate={{
                        opacity: [0.15, 1, 0.15],
                        width: ["5px", "17px", "5px"],
                        x: [2, -2, 2],
                      }}
                      transition={{
                        duration: 0.75,
                        repeat: Infinity,
                        delay: index * 0.06,
                      }}
                    />

                    <motion.span
                      className="moving-still-addition__motion-line moving-still-addition__motion-line--two"
                      animate={{
                        opacity: [0.1, 0.8, 0.1],
                        width: ["3px", "11px", "3px"],
                      }}
                      transition={{
                        duration: 0.65,
                        repeat: Infinity,
                        delay: index * 0.08,
                      }}
                    />

                    <motion.span
                      className="moving-still-addition__motion-line moving-still-addition__motion-line--three"
                      animate={{
                        opacity: [0.1, 0.7, 0.1],
                        width: ["2px", "8px", "2px"],
                      }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: index * 0.1,
                      }}
                    />

                    <motion.span
                      className="moving-still-addition__wind-emoji"
                      animate={{
                        x: [0, 4, 0],
                        y: [0, -2, 0],
                        opacity: [0.35, 0.9, 0.35],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: index * 0.07,
                      }}
                    >
                      💨
                    </motion.span>

                    <span className="moving-still-addition__object-character">
                      {item || icon}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="moving-still-addition__scene-label moving-still-addition__scene-label--moving"
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💨 OBJECTS ARE MOVING
              </motion.div>
            </div>

            <div className="moving-still-addition__caption">
              Watch the movement and count the objects.
            </div>
          </motion.div>

          {/* Still objects card */}
          <motion.div
            className="moving-still-addition__group moving-still-addition__group--still"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="moving-still-addition__group-header">
              <div className="moving-still-addition__group-title moving-still-addition__group-title--still">
                <span className="moving-still-addition__group-icon moving-still-addition__group-icon--still">
                  🧍
                </span>

                STILL
              </div>

              <span className="moving-still-addition__badge moving-still-addition__badge--still">
                STATIONARY
              </span>
            </div>

            {/* Still scene */}
            <div className="moving-still-addition__scene moving-still-addition__scene--still">
              <div className="moving-still-addition__soft-light" />

              <div className="moving-still-addition__plant moving-still-addition__plant--one">
                🌿
              </div>

              <div className="moving-still-addition__plant moving-still-addition__plant--two">
                🌱
              </div>

              <div className="moving-still-addition__plant moving-still-addition__plant--three">
                🍃
              </div>

              <div className="moving-still-addition__ground moving-still-addition__ground--still" />

              <div className="moving-still-addition__object-grid">
                {stillObjects.map((item, index) => (
                  <motion.div
                    key={`still-${index}`}
                    className="moving-still-addition__object moving-still-addition__object--still"
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <span className="moving-still-addition__still-glow" />

                    <span className="moving-still-addition__still-shadow" />

                    <span className="moving-still-addition__object-character">
                      {item || icon}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="moving-still-addition__scene-label moving-still-addition__scene-label--still">
                🧍 OBJECTS ARE STILL
              </div>
            </div>

            <div className="moving-still-addition__caption">
              Count the objects that remain still.
            </div>
          </motion.div>
        </div>

        {/* Helper message */}
        <div className="moving-still-addition__helper">
          👀 Count carefully → Moving + Still → Total
        </div>
      </motion.div>

      {/* Answer section */}
      <motion.div
        className="moving-still-addition__answer-panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="moving-still-addition__answer-title">
          COUNT AND ADD
        </div>

        <div className="moving-still-addition__equation">
          {/* Moving count input */}
          <div className="moving-still-addition__equation-item">
            <input
              className={[
                "moving-still-addition__input",
                "moving-still-addition__input--moving",
                showAnswers
                  ? movingCorrect
                    ? "moving-still-addition__input--correct"
                    : "moving-still-addition__input--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="number"
              min="0"
              value={movingAnswer}
              disabled={showAnswers}
              onChange={(e) => setMovingAnswer(e.target.value)}
              placeholder="?"
              aria-label="Number of moving objects"
            />

            <span className="moving-still-addition__input-label">
              MOVING
            </span>
          </div>

          <span className="moving-still-addition__operator">+</span>

          {/* Still count input */}
          <div className="moving-still-addition__equation-item">
            <input
              className={[
                "moving-still-addition__input",
                "moving-still-addition__input--still",
                showAnswers
                  ? stillCorrect
                    ? "moving-still-addition__input--correct"
                    : "moving-still-addition__input--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="number"
              min="0"
              value={stillAnswer}
              disabled={showAnswers}
              onChange={(e) => setStillAnswer(e.target.value)}
              placeholder="?"
              aria-label="Number of still objects"
            />

            <span className="moving-still-addition__input-label">
              STILL
            </span>
          </div>

          <span className="moving-still-addition__operator">=</span>

          {/* Total input */}
          <div className="moving-still-addition__equation-item">
            <input
              className={[
                "moving-still-addition__input",
                "moving-still-addition__input--total",
                showAnswers
                  ? totalCorrect
                    ? "moving-still-addition__input--correct"
                    : "moving-still-addition__input--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="number"
              min="0"
              value={totalUserAnswer}
              disabled={showAnswers}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="?"
              aria-label="Total number of objects"
            />

            <span className="moving-still-addition__input-label">
              TOTAL
            </span>
          </div>
        </div>

        {/* Answer feedback */}
        {showAnswers && (
          <motion.div
            className="moving-still-addition__feedback"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className={[
                "moving-still-addition__feedback-status",
                allCorrect
                  ? "moving-still-addition__feedback-status--correct"
                  : "moving-still-addition__feedback-status--wrong",
              ].join(" ")}
            >
              {allCorrect ? (
                <>
                  <Check size={16} />
                  All answers are correct!
                </>
              ) : (
                <>
                  <X size={16} />
                  Some answers are incorrect.
                </>
              )}
            </div>

            <div className="moving-still-addition__feedback-list">
              <span
                className={[
                  "moving-still-addition__feedback-chip",
                  movingCorrect
                    ? "moving-still-addition__feedback-chip--correct"
                    : "moving-still-addition__feedback-chip--wrong",
                ].join(" ")}
              >
                Moving: {movingCorrect ? "✓" : `✗ ${movingCount}`}
              </span>

              <span
                className={[
                  "moving-still-addition__feedback-chip",
                  stillCorrect
                    ? "moving-still-addition__feedback-chip--correct"
                    : "moving-still-addition__feedback-chip--wrong",
                ].join(" ")}
              >
                Still: {stillCorrect ? "✓" : `✗ ${stillCount}`}
              </span>

              <span
                className={[
                  "moving-still-addition__feedback-chip",
                  totalCorrect
                    ? "moving-still-addition__feedback-chip--correct"
                    : "moving-still-addition__feedback-chip--wrong",
                ].join(" ")}
              >
                Total: {totalCorrect ? "✓" : `✗ ${total}`}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Correct equation */}
      {showAnswers && (
        <motion.div
          className="moving-still-addition__final-answer"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnswerBox answer={`${movingCount} + ${stillCount} = ${total}`} />
        </motion.div>
      )}
    </div>
  );
}
