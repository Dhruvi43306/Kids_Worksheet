
import React from "react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

export default function NumberGridMazeQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const startNumber = data.startNumber;
  const steps = data.steps ?? [];
  const numbers = data.numbers ?? [];

  const userString = String(userAnswer ?? "").trim();

  const isTextCorrect = answerMatches(userString, correctAnswers);

  if (
    startNumber === undefined ||
    steps.length === 0 ||
    numbers.length === 0
  ) {
    return (
      <div className="number-grid-maze__error">
        Number Grid Maze data is incomplete.
      </div>
    );
  }

  return (
    <div className="number-grid-maze">
      {/* Question */}
      <h3 className="number-grid-maze__question">
        {question.questionText}
      </h3>

      {/* Number sequence */}
      <div className="number-grid-maze__sequence">
        <div className="number-grid-maze__sequence-item">
          <span className="number-grid-maze__item-label">
            Start
          </span>

          <div className="number-grid-maze__start-number">
            {startNumber}
          </div>
        </div>

        <span
          className="number-grid-maze__arrow"
          aria-hidden="true"
        >
          →
        </span>

        {steps.map((step, index) => (
          <React.Fragment key={`${step}-${index}`}>
            <div className="number-grid-maze__step">
              +{step}
            </div>

            {index < steps.length - 1 && (
              <span
                className="number-grid-maze__step-arrow"
                aria-hidden="true"
              >
                →
              </span>
            )}
          </React.Fragment>
        ))}

        <span
          className="number-grid-maze__arrow"
          aria-hidden="true"
        >
          →
        </span>

        <div className="number-grid-maze__missing-number">
          ?
        </div>
      </div>

      {/* Answer input */}
      <div className="number-grid-maze__answer-section">
        <label
          className="number-grid-maze__answer-label"
          htmlFor="number-grid-maze-answer"
        >
          What number comes next?
        </label>

        <input
          id="number-grid-maze-answer"
          className={[
            "number-grid-maze__input",
            showAnswers
              ? isTextCorrect
                ? "number-grid-maze__input--correct"
                : "number-grid-maze__input--wrong"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          type="number"
          inputMode="numeric"
          value={userAnswer ?? ""}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Answer"
          aria-label="Enter the next number"
        />

        {showAnswers && (
          <div
            className={[
              "number-grid-maze__feedback",
              isTextCorrect
                ? "number-grid-maze__feedback--correct"
                : "number-grid-maze__feedback--wrong",
            ].join(" ")}
            role="status"
          >
            {isTextCorrect ? "✓ Correct" : "✗ Incorrect"}
          </div>
        )}
      </div>

      {/* Correct answer */}
      {showAnswers && (
        <div className="number-grid-maze__result">
          <AnswerBox answer={correctAnswers.join(", ")} />
        </div>
      )}
    </div>
  );
}
