
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

export default function DominoChainAdditionQuestion({
  question,
  data,
  showAnswers,
}: QuestionRendererProps) {
  const [dominoAnswers, setDominoAnswers] = useState<Record<number, number>>(
    {}
  );

  const dominoes = Array.isArray(data.dominoes) ? data.dominoes : [];

  const startingDots =
    typeof data.startingDots === "number" ? data.startingDots : 1;

  const chainLength =
    typeof data.chainLength === "number"
      ? data.chainLength
      : dominoes.length;

  const answerCount = Math.max(0, dominoes.length - 1);

  const correctDominoAnswers = dominoes
    .slice(0, answerCount)
    .map((domino: any) => Number(domino.total));

  const getUserDots = (dominoNumber: number) =>
    dominoAnswers[dominoNumber];

  const isDominoCorrect = (dominoNumber: number, correctValue: number) => {
    const userValue = getUserDots(dominoNumber);
    return userValue !== undefined && Number(userValue) === Number(correctValue);
  };

  const allDominoesCorrect = correctDominoAnswers.every(
    (correctValue: number, index: number) =>
      isDominoCorrect(index + 2, correctValue)
  );

  const correctCount = correctDominoAnswers.filter(
    (correctValue: number, index: number) =>
      isDominoCorrect(index + 2, correctValue)
  ).length;

  if (dominoes.length === 0 || chainLength === 0) {
    return (
      <div className="domino-chain-addition__error">
        Domino chain data is missing.
      </div>
    );
  }

  const dotPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const renderPips = (value: number, color = "#334155") => {
    const safeValue = Number(value);

    if (safeValue < 1 || safeValue > 6) {
      return (
        <div className="domino-chain-addition__number-wrap">
          <span className="domino-chain-addition__number">
            {safeValue}
          </span>
        </div>
      );
    }

    return (
      <div className="domino-chain-addition__pips">
        {Array.from({ length: 9 }, (_, index) => {
          const showDot = dotPositions[safeValue]?.includes(index) ?? false;

          return (
            <span
              key={`pip-${index}`}
              className={`domino-chain-addition__pip ${
                showDot ? "domino-chain-addition__pip--visible" : ""
              }`}
              style={{ "--pip-color": color } as React.CSSProperties}
            />
          );
        })}
      </div>
    );
  };

  const handleDominoAnswer = (dominoNumber: number, value: number) => {
    if (showAnswers) return;

    setDominoAnswers((previous) => ({
      ...previous,
      [dominoNumber]: value,
    }));
  };

  const renderHalf = ({
    value,
    isBlank,
    isAnswerHalf,
    dominoNumber,
    correctValue,
  }: {
    value?: number;
    isBlank?: boolean;
    isAnswerHalf?: boolean;
    dominoNumber: number;
    correctValue?: number;
  }) => {
    const userValue = getUserDots(dominoNumber);
    const answered = userValue !== undefined;

    const correct =
      correctValue !== undefined &&
      answered &&
      Number(userValue) === Number(correctValue);

    const halfClass = [
      "domino-chain-addition__half",
      isAnswerHalf ? "domino-chain-addition__half--answer" : "",
      isAnswerHalf && showAnswers
        ? correct
          ? "domino-chain-addition__half--correct"
          : "domino-chain-addition__half--incorrect"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={halfClass}>
        {!isBlank && value !== undefined && renderPips(value)}

        {isAnswerHalf && (
          <>
            {!answered && !showAnswers && (
              <motion.div
                animate={{
                  scale: [0.95, 1.04, 0.95],
                  opacity: [0.55, 1, 0.55],
                }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="domino-chain-addition__question-mark"
              >
                ?
              </motion.div>
            )}

            {answered &&
              !showAnswers &&
              renderPips(Number(userValue), "#d97706")}

            {showAnswers &&
              correctValue !== undefined &&
              renderPips(
                Number(correctValue),
                correct ? "#15803d" : "#dc2626"
              )}

            {showAnswers && answered && (
              <div
                className={`domino-chain-addition__half-status ${
                  correct
                    ? "domino-chain-addition__half-status--correct"
                    : "domino-chain-addition__half-status--incorrect"
                }`}
              >
                {correct ? "✓" : "✕"}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="domino-chain-addition">
      <motion.h3
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="domino-chain-addition__title"
      >
        {question.questionText}
      </motion.h3>

      <div className="domino-chain-addition__instruction">
        <div className="domino-chain-addition__instruction-icon">🁢</div>
        <div>
          <div className="domino-chain-addition__instruction-title">
            Complete the domino chain
          </div>
          <div className="domino-chain-addition__instruction-text">
            Solve the addition on each domino. The total becomes the dots on
            the next domino.
          </div>
        </div>
      </div>

      <div className="domino-chain-addition__panel">
        <div className="domino-chain-addition__panel-header">
          <div className="domino-chain-addition__chain-label">
            <span className="domino-chain-addition__chain-indicator" />
            DOMINO CHAIN
          </div>
          <span className="domino-chain-addition__count-badge">
            {chainLength} DOMINOES
          </span>
        </div>

        <div className="domino-chain-addition__scroll">
          <div
            className="domino-chain-addition__chain"
            style={{
              minWidth: `${
                dominoes.length * 315 + (dominoes.length - 1) * 70
              }px`,
            }}
          >
            {dominoes.map((domino: any, index: number) => {
              const dominoNumber = Number(domino.dominoNumber ?? index + 1);
              const isFirst = index === 0;

              const correctValue = !isFirst
                ? correctDominoAnswers[index - 1]
                : undefined;

              const previousTotal = !isFirst
                ? Number(domino.expectedLeftDots)
                : undefined;

              const selectedValue = getUserDots(dominoNumber);
              const isAnswered = selectedValue !== undefined;

              const isCorrect =
                correctValue !== undefined &&
                isAnswered &&
                Number(selectedValue) === Number(correctValue);

              return (
                <React.Fragment key={`domino-${dominoNumber}`}>
                  <motion.div
                    initial={{ opacity: 0, x: 15, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="domino-chain-addition__domino-column"
                  >
                    <div className="domino-chain-addition__domino-label">
                      <span
                        className={`domino-chain-addition__domino-number ${
                          isFirst
                            ? "domino-chain-addition__domino-number--start"
                            : ""
                        }`}
                      >
                        {dominoNumber}
                      </span>
                      <span className="domino-chain-addition__domino-caption">
                        {isFirst ? "START" : "NEXT DOMINO"}
                      </span>
                    </div>

                    <div
                      className={`domino-chain-addition__domino ${
                        isFirst
                          ? "domino-chain-addition__domino--start"
                          : isCorrect
                            ? "domino-chain-addition__domino--correct"
                            : "domino-chain-addition__domino--next"
                      }`}
                    >
                      {renderHalf({
                        value: isFirst
                          ? Number(domino.leftDots ?? startingDots)
                          : undefined,
                        isBlank: !isFirst,
                        isAnswerHalf: !isFirst,
                        dominoNumber,
                        correctValue,
                      })}

                      <div className="domino-chain-addition__divider" />

                      <div className="domino-chain-addition__addition-half">
                        <span className="domino-chain-addition__add-label">
                          ADD
                        </span>

                        <div className="domino-chain-addition__equation">
                          <span className="domino-chain-addition__operand domino-chain-addition__operand--first">
                            {domino.firstNumber}
                          </span>
                          <span>+</span>
                          <span className="domino-chain-addition__operand">
                            {domino.secondNumber}
                          </span>
                        </div>

                        <div className="domino-chain-addition__total">
                          <span className="domino-chain-addition__equals">=</span>
                          <span className="domino-chain-addition__total-value">
                            {domino.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="domino-chain-addition__previous-total">
                      {isFirst
                        ? `Start with ${startingDots} dots`
                        : `Previous total: ${previousTotal}`}
                    </div>

                    {!isFirst && showAnswers && (
                      <div
                        className={`domino-chain-addition__domino-feedback ${
                          isCorrect
                            ? "domino-chain-addition__domino-feedback--correct"
                            : "domino-chain-addition__domino-feedback--incorrect"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <Check size={14} />
                            Correct
                          </>
                        ) : (
                          <>
                            <X size={14} />
                            Correct = {correctValue}
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {index < dominoes.length - 1 && (
                    <div className="domino-chain-addition__connector">
                      <div className="domino-chain-addition__connector-line" />
                      <div className="domino-chain-addition__connector-arrow" />
                      <span className="domino-chain-addition__connector-center" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {!showAnswers && answerCount > 0 && (
          <div className="domino-chain-addition__selector-panel">
            <div className="domino-chain-addition__selector-title">
              🎯 CHOOSE THE MISSING DOTS
            </div>

            <div className="domino-chain-addition__selector-list">
              {dominoes.slice(1).map((domino: any, index: number) => {
                const dominoNumber = Number(domino.dominoNumber ?? index + 2);
                const expected = Number(domino.expectedLeftDots);
                const selected = getUserDots(dominoNumber);
                const optionCount = Math.min(Math.max(6, expected), 20);

                return (
                  <div
                    key={`selector-${dominoNumber}`}
                    className="domino-chain-addition__selector-row"
                  >
                    <div className="domino-chain-addition__selector-label">
                      <span className="domino-chain-addition__selector-number">
                        {dominoNumber}
                      </span>
                      <div>
                        <div className="domino-chain-addition__selector-heading">
                          Missing dots
                        </div>
                        <div className="domino-chain-addition__selector-hint">
                          Previous total becomes dots
                        </div>
                      </div>
                    </div>

                    <div className="domino-chain-addition__options">
                      {Array.from({ length: optionCount }, (_, dotIndex) => {
                        const value = dotIndex + 1;
                        const isSelected = selected === value;

                        return (
                          <motion.button
                            key={`${dominoNumber}-${value}`}
                            type="button"
                            disabled={showAnswers}
                            whileHover={{ scale: showAnswers ? 1 : 1.08 }}
                            whileTap={{ scale: showAnswers ? 1 : 0.94 }}
                            onClick={() =>
                              handleDominoAnswer(dominoNumber, value)
                            }
                            className={`domino-chain-addition__option ${
                              isSelected
                                ? "domino-chain-addition__option--selected"
                                : ""
                            }`}
                          >
                            {value}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="domino-chain-addition__progress-track">
          <motion.div
            animate={{
              width:
                answerCount === 0
                  ? "0%"
                  : `${
                      (Object.keys(dominoAnswers).length / answerCount) * 100
                    }%`,
            }}
            transition={{ duration: 0.35 }}
            className="domino-chain-addition__progress-fill"
          />
        </div>

        <div className="domino-chain-addition__progress-label">
          {Object.keys(dominoAnswers).length} of {answerCount} missing dominoes
          completed
        </div>

        {showAnswers && (
          <div
            className={`domino-chain-addition__result ${
              allDominoesCorrect
                ? "domino-chain-addition__result--correct"
                : "domino-chain-addition__result--incorrect"
            }`}
          >
            <div className="domino-chain-addition__result-title">
              {allDominoesCorrect ? (
                <>
                  <Check size={17} />
                  Perfect! The domino chain is complete.
                </>
              ) : (
                <>
                  <X size={17} />
                  Some missing dominoes are incorrect.
                </>
              )}
            </div>

            <div className="domino-chain-addition__result-description">
              {correctCount} of {answerCount} missing dominoes are correct.
            </div>
          </div>
        )}
      </div>

      {showAnswers && (
        <div className="domino-chain-addition__answer-box">
          <AnswerBox
            answer={correctDominoAnswers
              .map(
                (value: number, index: number) =>
                  `Domino ${index + 2}: ${value} dots`
              )
              .join(" • ")}
          />
        </div>
      )}
    </div>
  );
}
