
import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

type SolveDoubleDisplayProps = {
  questionText: string;
  firstNumber?: number;
  secondNumber?: number;
  total?: number;
  firstGroup?: string[];
  secondGroup?: string[];
  extraGroup?: string[];
  extraValue?: number;
  equation?: string;
  correctDouble?: number;
  options: Array<string | number>;
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
};

function SolveDoubleDisplay({
  questionText,
  firstNumber,
  secondNumber,
  total,
  firstGroup,
  secondGroup,
  extraGroup,
  extraValue,
  equation,
  correctDouble,
  options,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: SolveDoubleDisplayProps) {
  const selectedAnswer = String(userAnswer ?? "").trim();
  const isDoublePlus = extraValue !== undefined;

  const isPictureMode =
    Array.isArray(firstGroup) &&
    firstGroup.length > 0 &&
    Array.isArray(secondGroup) &&
    secondGroup.length > 0;

  const isMissingDoubleMode =
    correctDouble !== undefined &&
    total !== undefined &&
    typeof equation === "string" &&
    equation.startsWith("? + ?");

  const isEquationMode =
    !isPictureMode &&
    !isMissingDoubleMode &&
    firstNumber !== undefined &&
    secondNumber !== undefined;

  const correctAnswer =
    correctDouble !== undefined
      ? String(correctDouble)
      : String(total ?? "");

  const isCorrect =
    selectedAnswer !== "" &&
    selectedAnswer === correctAnswer;

  const renderOptions = () => (
    <div className="solve-double__options">
      {options.map((option, index) => {
        const value = String(option);
        const selected = selectedAnswer === value;
        const correct = value === correctAnswer;
        const wrong = showAnswers && selected && !correct;

        const optionClasses = [
          "solve-double__option",
          selected && !showAnswers
            ? "solve-double__option--selected"
            : "",
          showAnswers && correct
            ? "solve-double__option--correct"
            : "",
          wrong
            ? "solve-double__option--wrong"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <motion.button
            key={`${value}-${index}`}
            type="button"
            className={optionClasses}
            disabled={showAnswers}
            aria-pressed={selected}
            whileHover={{
              scale: showAnswers ? 1 : 1.05,
            }}
            whileTap={{
              scale: showAnswers ? 1 : 0.97,
            }}
            onClick={() => {
              if (!showAnswers) {
                onAnswerChange(value);
              }
            }}
          >
            <span>{value}</span>

            {showAnswers && correct && (
              <Check
                size={18}
                className="solve-double__option-icon"
                aria-hidden="true"
              />
            )}

            {wrong && (
              <X
                size={18}
                className="solve-double__option-icon"
                aria-hidden="true"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderGroup = (
    group: string[],
    number: number | undefined,
    label: string,
  ) => (
    <div className="solve-double__picture-group">
      <div className="solve-double__picture-items">
        {group.length > 0 ? (
          group.map((icon, index) => (
            <span
              key={`${label}-${index}`}
              className="solve-double__picture-icon"
            >
              {icon}
            </span>
          ))
        ) : (
          <span className="solve-double__picture-number">
            {number ?? ""}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="solve-double">
      <h3 className="solve-double__question">
        {questionText}
      </h3>

      {/* Picture mode */}
      {isPictureMode && (
        <>
          <div className="solve-double__picture-equation">
            {renderGroup(
              firstGroup ?? [],
              firstNumber,
              "First group",
            )}

            <span className="solve-double__picture-operator">
              +
            </span>

            {renderGroup(
              secondGroup ?? [],
              secondNumber,
              "Second group",
            )}

            {isDoublePlus && (
              <>
                <span className="solve-double__picture-operator">
                  +
                </span>

                {renderGroup(
                  extraGroup ?? [],
                  extraValue,
                  `Add ${extraValue}`,
                )}
              </>
            )}
          </div>

          <div className="solve-double__picture-number-equation">
            <span>{firstNumber}</span>
            <span>+</span>
            <span>{secondNumber}</span>

            {isDoublePlus && (
              <>
                <span>+</span>
                <span>{extraValue}</span>
              </>
            )}

            <span>=</span>

            <span className="solve-double__picture-result">
              ?
            </span>
          </div>

          {renderOptions()}
        </>
      )}

      {/* Ordinary equation mode */}
      {isEquationMode && (
        <>
          <div className="solve-double__equation-card">
            {equation ?? `${firstNumber} + ${secondNumber} = ?`}
          </div>

          {renderOptions()}
        </>
      )}

      {/* Missing-number double mode */}
      {isMissingDoubleMode && (
        <>
          <div className="solve-double__missing-equation">
            <span>?</span>
            <span>+</span>
            <span>?</span>

            {isDoublePlus && (
              <>
                <span>+</span>
                <span>{extraValue}</span>
              </>
            )}

            <span>=</span>
            <span>{total}</span>
          </div>

          {renderOptions()}
        </>
      )}

      {/* Answer feedback */}
      {showAnswers && (
        <div className="solve-double__result">
          <div
            className={[
              "solve-double__result-status",
              isCorrect
                ? "solve-double__result-status--correct"
                : "solve-double__result-status--wrong",
            ].join(" ")}
          >
            {isCorrect ? (
              <>
                <Check size={18} />
                Correct
              </>
            ) : (
              <>
                <X size={18} />
                Incorrect
              </>
            )}
          </div>

          <AnswerBox
            answer={
              correctDouble !== undefined
                ? isDoublePlus
                  ? `${correctAnswer} + ${correctAnswer} + ${extraValue} = ${total}`
                  : `${correctAnswer} + ${correctAnswer} = ${total}`
                : isDoublePlus
                  ? `${firstNumber} + ${secondNumber} + ${extraValue} = ${total}`
                  : `${firstNumber} + ${secondNumber} = ${total}`
            }
          />
        </div>
      )}
    </div>
  );
}

export default function SolveDoubleQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const firstNumber = data.firstNumber;
  const secondNumber = data.secondNumber;
  const total = data.total;
  const firstGroup = data.firstGroup ?? [];
  const secondGroup = data.secondGroup ?? [];
  const extraGroup = data.extraGroup ?? [];
  const extraValue = data.extraValue;
  const equation = data.equation;
  const correctDouble = data.correctDouble;
  const options = data.options ?? [];

  if (options.length === 0) {
    return (
      <div className="solve-double__error">
        Solve-double options are missing.
      </div>
    );
  }

  return (
    <SolveDoubleDisplay
      questionText={question.questionText}
      firstNumber={firstNumber}
      secondNumber={secondNumber}
      total={total}
      firstGroup={firstGroup}
      secondGroup={secondGroup}
      extraGroup={extraGroup}
      extraValue={extraValue}
      equation={equation}
      correctDouble={correctDouble}
      options={options}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
