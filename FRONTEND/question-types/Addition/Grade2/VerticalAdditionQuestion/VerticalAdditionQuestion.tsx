
import React from "react";
import { motion } from "framer-motion";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

type VerticalAdditionDisplayProps = {
  firstNumber: number;
  secondNumber: number;
  total: number;
  digitCount: number;
  carryMode: "withCarry" | "withoutCarry";
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
};

function VerticalAdditionDisplay({
  firstNumber,
  secondNumber,
  total,
  digitCount,
  carryMode,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: VerticalAdditionDisplayProps) {
  const answerText = String(userAnswer ?? "").trim();

  const isCorrect =
    answerText !== "" && Number(answerText) === total;

  const placeLabels =
    digitCount === 4
      ? ["Th", "H", "T", "O"]
      : digitCount === 3
        ? ["H", "T", "O"]
        : ["T", "O"];

  const firstDigits = String(firstNumber)
    .padStart(digitCount, "0")
    .split("");

  const secondDigits = String(secondNumber)
    .padStart(digitCount, "0")
    .split("");

  const digitGridClass =
    digitCount === 4
      ? "vertical-addition__digit-grid--4"
      : digitCount === 3
        ? "vertical-addition__digit-grid--3"
        : "vertical-addition__digit-grid--2";

  const dividerClass =
    digitCount === 4
      ? "vertical-addition__divider--4"
      : digitCount === 3
        ? "vertical-addition__divider--3"
        : "vertical-addition__divider--2";

  const answerStateClass = !showAnswers
    ? "vertical-addition__answer-digit--pending"
    : isCorrect
      ? "vertical-addition__answer-digit--correct"
      : "vertical-addition__answer-digit--incorrect";

  const inputStateClass = !showAnswers
    ? "vertical-addition__input--pending"
    : isCorrect
      ? "vertical-addition__input--correct"
      : "vertical-addition__input--incorrect";

  const answerDigits = String(showAnswers ? total : answerText)
    .padStart(digitCount, " ")
    .split("");

  return (
    <motion.div
      className="vertical-addition__display"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Heading and carry mode */}
      <div className="vertical-addition__header">
        <span>Vertical Addition</span>

        {carryMode === "withCarry" && (
          <span className="vertical-addition__mode-badge vertical-addition__mode-badge--carry">
            Carry
          </span>
        )}

        {carryMode === "withoutCarry" && (
          <span className="vertical-addition__mode-badge vertical-addition__mode-badge--no-carry">
            No Carry
          </span>
        )}
      </div>

      {/* Place-value headings */}
      <div
        className={`vertical-addition__place-grid ${digitGridClass}`}
      >
        {placeLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="vertical-addition__place-label"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Vertical addition numbers */}
      <div className="vertical-addition__number-column">
        {/* First number */}
        <div
          className={`vertical-addition__digit-grid ${digitGridClass}`}
        >
          {firstDigits.map((digit, index) => (
            <motion.div
              key={`first-${index}`}
              className="vertical-addition__digit vertical-addition__digit--first"
              whileHover={{ scale: 1.04 }}
            >
              {digit}
            </motion.div>
          ))}
        </div>

        {/* Plus sign and second number */}
        <div className="vertical-addition__second-row">
          <div className="vertical-addition__plus-sign">+</div>

          <div
            className={`vertical-addition__digit-grid ${digitGridClass}`}
          >
            {secondDigits.map((digit, index) => (
              <motion.div
                key={`second-${index}`}
                className="vertical-addition__digit vertical-addition__digit--second"
                whileHover={{ scale: 1.04 }}
              >
                {digit}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className={`vertical-addition__divider ${dividerClass}`}
        />

        {/* Answer digit boxes */}
        <div
          className={`vertical-addition__answer-grid ${digitGridClass}`}
        >
          {Array.from({ length: digitCount }).map((_, index) => {
            const value = answerDigits[index] ?? " ";

            return (
              <div
                key={`answer-${index}`}
                className={`vertical-addition__answer-digit ${answerStateClass}`}
              >
                {value === " " && !showAnswers ? "?" : value}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer input */}
      <div className="vertical-addition__input-row">
        <label
          className="vertical-addition__input-label"
          htmlFor="vertical-addition-answer"
        >
          Your answer:
        </label>

        <input
          id="vertical-addition-answer"
          type="number"
          inputMode="numeric"
          className={`vertical-addition__input ${inputStateClass}`}
          value={answerText}
          disabled={showAnswers}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="?"
        />

        {showAnswers && (
          <span
            className={`vertical-addition__status ${
              isCorrect
                ? "vertical-addition__status--correct"
                : "vertical-addition__status--incorrect"
            }`}
            role="status"
          >
            {isCorrect ? "✓ Correct" : "✕ Incorrect"}
          </span>
        )}
      </div>

      {/* Helper text */}
      {!showAnswers && (
        <div className="vertical-addition__helper">
          <span>💡</span>
          <span>
            Line up the digits by place value, then add.
          </span>
        </div>
      )}

      {/* Final answer */}
      {showAnswers && (
        <AnswerBox
          answer={`${firstNumber} + ${secondNumber} = ${total}`}
        />
      )}
    </motion.div>
  );
}

export default function VerticalAdditionQuestion({
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  return (
    <div className="vertical-addition__container">
      <VerticalAdditionDisplay
        firstNumber={data.firstNumber ?? data.vertical?.top ?? 0}
        secondNumber={data.secondNumber ?? data.vertical?.bottom ?? 0}
        total={data.total ?? 0}
        digitCount={data.digitCount ?? 2}
        carryMode={data.carryMode ?? "withoutCarry"}
        userAnswer={userAnswer}
        showAnswers={showAnswers}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
}
