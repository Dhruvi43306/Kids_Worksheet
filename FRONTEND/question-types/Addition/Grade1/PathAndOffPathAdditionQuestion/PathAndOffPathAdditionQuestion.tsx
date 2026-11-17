
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

export default function PathAndOffPathAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const [pathAnswer, setPathAnswer] = useState("");
  const [offPathAnswer, setOffPathAnswer] = useState("");

  const icon = data.icon ?? "⭐";

  const onPathObjects = Array.isArray(data.onPathobjects)
    ? data.onPathobjects
    : [];

  const offPathObjects = Array.isArray(data.offPathobjects)
    ? data.offPathobjects
    : [];

  const onPathCount =
    typeof data.onPathCount === "number"
      ? data.onPathCount
      : onPathObjects.length;

  const offPathCount =
    typeof data.offPathCount === "number"
      ? data.offPathCount
      : offPathObjects.length;

  const total =
    typeof data.total === "number"
      ? data.total
      : onPathCount + offPathCount;

  const pathAnswerValue = String(pathAnswer ?? "").trim();
  const offPathAnswerValue = String(offPathAnswer ?? "").trim();
  const totalAnswerValue = String(userAnswer ?? "").trim();

  const pathCorrect =
    pathAnswerValue !== "" &&
    answerMatches(pathAnswerValue, [String(onPathCount)]);

  const offPathCorrect =
    offPathAnswerValue !== "" &&
    answerMatches(offPathAnswerValue, [String(offPathCount)]);

  const totalCorrect =
    totalAnswerValue !== "" &&
    answerMatches(totalAnswerValue, [String(total)]);

  const allCorrect = pathCorrect && offPathCorrect && totalCorrect;

  if (onPathObjects.length === 0 && offPathObjects.length === 0) {
    return (
      <div className="path-off-path-addition__error">
        Path and off-path objects are missing.
      </div>
    );
  }

  const renderVisualIcon = (item: unknown, key: string) => {
    const value =
      typeof item === "string" && item.trim() !== ""
        ? item
        : icon;

    if (
      typeof value === "string" &&
      value.trim().startsWith("<svg")
    ) {
      return (
        <div
          key={key}
          className="path-off-path-addition__svg-icon"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );
    }

    return (
      <span
        key={key}
        className="path-off-path-addition__visual-icon"
      >
        {value}
      </span>
    );
  };

  return (
    <div className="path-off-path-addition">
      {/* Question heading */}
      <h3 className="path-off-path-addition__question">
        {question.questionText}
      </h3>

      {/* Example instruction */}
      {question.questionNumber === 1 && (
        <div className="path-off-path-addition__example">
          <span className="path-off-path-addition__example-icon">
            💡
          </span>

          <div>
            <div className="path-off-path-addition__example-title">
              Example
            </div>

            <div className="path-off-path-addition__example-text">
              Count the objects on the path. Then count the objects
              off the path. Finally, add both numbers.
            </div>
          </div>
        </div>
      )}

      {/* Main visual panel */}
      <div className="path-off-path-addition__main">
        <div className="path-off-path-addition__header">
          <div className="path-off-path-addition__header-title">
            Count the objects
          </div>

          <div className="path-off-path-addition__legend">
            <span>🛤️ On Path</span>
            <span>🌿 Off Path</span>
          </div>
        </div>

        {/* On-path objects */}
        <div className="path-off-path-addition__path-section">
          <div className="path-off-path-addition__section-label-wrap">
            <span className="path-off-path-addition__section-label path-off-path-addition__section-label--on">
              ON THE PATH
            </span>
          </div>

          <div className="path-off-path-addition__road">
            <div className="path-off-path-addition__road-inner">
              <div className="path-off-path-addition__on-grid">
                {onPathObjects.map((item, index) => (
                  <motion.div
                    key={`on-path-${index}`}
                    className="path-off-path-addition__object path-off-path-addition__object--on"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.035 }}
                  >
                    {renderVisualIcon(item, `on-icon-${index}`)}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Off-path objects */}
        <div className="path-off-path-addition__off-section">
          <div className="path-off-path-addition__section-label-wrap">
            <span className="path-off-path-addition__section-label path-off-path-addition__section-label--off">
              OFF THE PATH
            </span>
          </div>

          <div className="path-off-path-addition__off-grid">
            {offPathObjects.map((item, index) => (
              <motion.div
                key={`off-path-${index}`}
                className="path-off-path-addition__object path-off-path-addition__object--off"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.15 + index * 0.035,
                }}
              >
                {renderVisualIcon(item, `off-icon-${index}`)}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Answer panel */}
      <div className="path-off-path-addition__answer-panel">
        <div className="path-off-path-addition__answer-title">
          COUNT AND ANSWER
        </div>

        <div className="path-off-path-addition__equation">
          {/* On-path count */}
          <div className="path-off-path-addition__answer-item">
            <input
              className={[
                "path-off-path-addition__input",
                "path-off-path-addition__input--path",
                showAnswers
                  ? pathCorrect
                    ? "path-off-path-addition__input--correct"
                    : "path-off-path-addition__input--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="number"
              min="0"
              inputMode="numeric"
              value={pathAnswer}
              disabled={showAnswers}
              onChange={(e) => setPathAnswer(e.target.value)}
              placeholder="?"
              aria-label="Number of objects on path"
            />

            <span className="path-off-path-addition__input-label">
              ON PATH
            </span>
          </div>

          <span className="path-off-path-addition__operator">+</span>

          {/* Off-path count */}
          <div className="path-off-path-addition__answer-item">
            <input
              className={[
                "path-off-path-addition__input",
                "path-off-path-addition__input--path",
                showAnswers
                  ? offPathCorrect
                    ? "path-off-path-addition__input--correct"
                    : "path-off-path-addition__input--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="number"
              min="0"
              inputMode="numeric"
              value={offPathAnswer}
              disabled={showAnswers}
              onChange={(e) => setOffPathAnswer(e.target.value)}
              placeholder="?"
              aria-label="Number of objects off path"
            />

            <span className="path-off-path-addition__input-label">
              OFF PATH
            </span>
          </div>

          <span className="path-off-path-addition__operator">=</span>

          {/* Total */}
          <div className="path-off-path-addition__answer-item">
            <input
              className={[
                "path-off-path-addition__input",
                "path-off-path-addition__input--total",
                showAnswers
                  ? totalCorrect
                    ? "path-off-path-addition__input--correct"
                    : "path-off-path-addition__input--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="number"
              min="0"
              inputMode="numeric"
              value={totalAnswerValue}
              disabled={showAnswers}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="?"
              aria-label="Total number of objects"
            />

            <span className="path-off-path-addition__input-label">
              TOTAL
            </span>
          </div>
        </div>

        {/* Feedback */}
        {showAnswers && (
          <div className="path-off-path-addition__feedback">
            <div
              className={[
                "path-off-path-addition__feedback-status",
                allCorrect
                  ? "path-off-path-addition__feedback-status--correct"
                  : "path-off-path-addition__feedback-status--wrong",
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

            <div className="path-off-path-addition__feedback-list">
              <span
                className={[
                  "path-off-path-addition__feedback-chip",
                  pathCorrect
                    ? "path-off-path-addition__feedback-chip--correct"
                    : "path-off-path-addition__feedback-chip--wrong",
                ].join(" ")}
              >
                On Path: {pathCorrect ? "✓" : `✗ ${onPathCount}`}
              </span>

              <span
                className={[
                  "path-off-path-addition__feedback-chip",
                  offPathCorrect
                    ? "path-off-path-addition__feedback-chip--correct"
                    : "path-off-path-addition__feedback-chip--wrong",
                ].join(" ")}
              >
                Off Path: {offPathCorrect ? "✓" : `✗ ${offPathCount}`}
              </span>

              <span
                className={[
                  "path-off-path-addition__feedback-chip",
                  totalCorrect
                    ? "path-off-path-addition__feedback-chip--correct"
                    : "path-off-path-addition__feedback-chip--wrong",
                ].join(" ")}
              >
                Total: {totalCorrect ? "✓" : `✗ ${total}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {showAnswers && (
        <div className="path-off-path-addition__final-answer">
          <AnswerBox
            answer={`${onPathCount} + ${offPathCount} = ${total}`}
          />
        </div>
      )}
    </div>
  );
}
