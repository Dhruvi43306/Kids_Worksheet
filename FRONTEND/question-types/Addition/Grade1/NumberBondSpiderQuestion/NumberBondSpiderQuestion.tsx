
import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";

type SpiderPosition =
  | "body"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

type CompleteSpider = {
  body?: number;
  topLeft?: number;
  topRight?: number;
  bottomLeft?: number;
  bottomRight?: number;
};

type NumberBondSpiderDisplayProps = {
  questionText: string;
  body?: number | null;
  topLeft?: number | null;
  topRight?: number | null;
  bottomLeft?: number | null;
  bottomRight?: number | null;
  completeSpider?: CompleteSpider;
  missingPosition?: SpiderPosition;
  explanation?: string;
  userAnswer: unknown;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: string) => void;
};

function NumberBondSpiderDisplay({
  questionText,
  body,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  completeSpider,
  missingPosition,
  explanation,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: NumberBondSpiderDisplayProps) {
  const currentAnswer = String(userAnswer ?? "").trim();

  const correctAnswer =
    correctAnswers.length > 0
      ? String(correctAnswers[0]).trim()
      : "";

  const isCorrect =
    currentAnswer !== "" &&
    answerMatches(currentAnswer, correctAnswers);

  if (
    missingPosition === undefined ||
    body === undefined ||
    completeSpider?.body === undefined ||
    completeSpider?.topLeft === undefined ||
    completeSpider?.topRight === undefined ||
    completeSpider?.bottomLeft === undefined ||
    completeSpider?.bottomRight === undefined
  ) {
    return (
      <div className="number-bond-spider__error">
        Number-bond spider data is incomplete.
      </div>
    );
  }

  const displayValue = (
    value: number | null | undefined,
    position: SpiderPosition
  ) => {
    const missing = missingPosition === position;

    if (!missing) {
      return value ?? "?";
    }

    if (showAnswers) {
      return correctAnswer || "?";
    }

    return currentAnswer || "?";
  };

  const SpiderNode = ({
    value,
    position,
    isBody = false,
  }: {
    value: number | null | undefined;
    position: SpiderPosition;
    isBody?: boolean;
  }) => {
    const missing = missingPosition === position;
    const filled = missing && currentAnswer !== "";

    const nodeClasses = [
      "number-bond-spider__node",
      isBody ? "number-bond-spider__node--body" : "",
      missing ? "number-bond-spider__node--missing" : "",
      missing && !showAnswers && filled
        ? "number-bond-spider__node--selected"
        : "",
      showAnswers && missing
        ? isCorrect
          ? "number-bond-spider__node--correct"
          : "number-bond-spider__node--wrong"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.div
        className={nodeClasses}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={
          missing && !showAnswers
            ? { scale: 1.06 }
            : undefined
        }
      >
        <span className="number-bond-spider__node-value">
          {displayValue(value, position)}
        </span>

        {showAnswers && missing && (
          <span
            className={[
              "number-bond-spider__node-badge",
              isCorrect
                ? "number-bond-spider__node-badge--correct"
                : "number-bond-spider__node-badge--wrong",
            ].join(" ")}
            aria-label={isCorrect ? "Correct answer" : "Incorrect answer"}
          >
            {isCorrect ? "✓" : "×"}
          </span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="number-bond-spider">
      {/* Question heading */}
      <motion.h3
        className="number-bond-spider__question"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {questionText}
      </motion.h3>

      {/* Instruction */}
      {!showAnswers && (
        <div className="number-bond-spider__hint">
          Each pair of legs adds to the number in the spider body.
        </div>
      )}

      {/* Spider diagram */}
      <div className="number-bond-spider__diagram">
        {/* Top-left number */}
        <div className="number-bond-spider__position number-bond-spider__position--top-left">
          <SpiderNode
            value={topLeft}
            position="topLeft"
          />
        </div>

        {/* Top-right number */}
        <div className="number-bond-spider__position number-bond-spider__position--top-right">
          <SpiderNode
            value={topRight}
            position="topRight"
          />
        </div>

        {/* Bottom-left number */}
        <div className="number-bond-spider__position number-bond-spider__position--bottom-left">
          <SpiderNode
            value={bottomLeft}
            position="bottomLeft"
          />
        </div>

        {/* Bottom-right number */}
        <div className="number-bond-spider__position number-bond-spider__position--bottom-right">
          <SpiderNode
            value={bottomRight}
            position="bottomRight"
          />
        </div>

        {/* Spider legs */}
        <div
          className="number-bond-spider__leg number-bond-spider__leg--top-left"
          aria-hidden="true"
        />

        <div
          className="number-bond-spider__leg number-bond-spider__leg--top-right"
          aria-hidden="true"
        />

        <div
          className="number-bond-spider__leg number-bond-spider__leg--bottom-left"
          aria-hidden="true"
        />

        <div
          className="number-bond-spider__leg number-bond-spider__leg--bottom-right"
          aria-hidden="true"
        />

        {/* Center body */}
        <div className="number-bond-spider__body-position">
          <SpiderNode
            value={body}
            position="body"
            isBody
          />
        </div>

        {/* Decorative spider */}
        <div
          className="number-bond-spider__decoration"
          aria-hidden="true"
        >
          🕷️
        </div>
      </div>

      {/* Missing-number answer */}
      <div className="number-bond-spider__answer-section">
        <label
          className="number-bond-spider__answer-label"
          htmlFor="number-bond-spider-answer"
        >
          Enter the missing number
        </label>

        <input
          id="number-bond-spider-answer"
          className={[
            "number-bond-spider__answer-input",
            showAnswers
              ? isCorrect
                ? "number-bond-spider__answer-input--correct"
                : "number-bond-spider__answer-input--wrong"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          type="number"
          inputMode="numeric"
          min="0"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="?"
          aria-label="Missing number answer"
        />

        {showAnswers && (
          <div
            className={[
              "number-bond-spider__result",
              isCorrect
                ? "number-bond-spider__result--correct"
                : "number-bond-spider__result--wrong",
            ].join(" ")}
          >
            {isCorrect ? (
              <>
                <Check size={19} />
                Correct!
              </>
            ) : (
              <>
                <X size={19} />
                Incorrect
              </>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {showAnswers && (
        <motion.div
          className="number-bond-spider__explanation"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="number-bond-spider__explanation-title">
            How the spider works
          </div>

          <div className="number-bond-spider__explanation-text">
            {explanation ??
              `${completeSpider.topLeft} + ${completeSpider.topRight} = ${completeSpider.body}; ${completeSpider.bottomLeft} + ${completeSpider.bottomRight} = ${completeSpider.body}`}
          </div>
        </motion.div>
      )}

      {showAnswers && (
        <div className="number-bond-spider__final-answer">
          <AnswerBox answer={`Missing number = ${correctAnswer}`} />
        </div>
      )}
    </div>
  );
}

export default function NumberBondSpiderQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const spiderBody = data.completeSpider?.body ?? data.whole;

  const topLeft = data.topLeft;
  const topRight = data.topRight;
  const bottomLeft = data.bottomLeft;
  const bottomRight = data.bottomRight;

  const missingPosition = data.missingPosition;

  if (
    missingPosition === undefined ||
    spiderBody === undefined ||
    !data.completeSpider ||
    data.completeSpider.topLeft === undefined ||
    data.completeSpider.topRight === undefined ||
    data.completeSpider.bottomLeft === undefined ||
    data.completeSpider.bottomRight === undefined
  ) {
    return (
      <div className="number-bond-spider__error">
        Number-bond spider data is incomplete.
      </div>
    );
  }

  return (
    <NumberBondSpiderDisplay
      questionText={
        question.questionText ||
        "Complete the number-bond spider."
      }
      body={spiderBody}
      topLeft={topLeft}
      topRight={topRight}
      bottomLeft={bottomLeft}
      bottomRight={bottomRight}
      completeSpider={data.completeSpider}
      missingPosition={missingPosition as SpiderPosition}
      explanation={data.explanation}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
