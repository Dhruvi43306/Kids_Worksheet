
import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

type AddTensAndOnesDisplayProps = {
  questionText: string;
  firstNumber?: number;
  secondNumber?: number;
  firstTensGroup?: string[];
  firstOnesGroup?: string[];
  secondTensGroup?: string[];
  secondOnesGroup?: string[];
  tens?: {
    first: number;
    second: number;
    answer: number;
  };
  ones?: {
    first: number;
    second: number;
    answer: number;
  };
  total?: number;
  correctAnswers: string[];
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
};

function AddTensAndOnesDisplay({
  questionText,
  firstNumber,
  secondNumber,
  firstTensGroup = [],
  firstOnesGroup = [],
  secondTensGroup = [],
  secondOnesGroup = [],
  tens,
  ones,
  total,
  correctAnswers,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: AddTensAndOnesDisplayProps) {
  const selectedAnswer = String(userAnswer ?? "").trim();

  const correctAnswer = String(
    correctAnswers[0] ?? total ?? "",
  ).trim();

  const isCorrect =
    selectedAnswer !== "" &&
    selectedAnswer === correctAnswer;

  const hasVisual =
    firstTensGroup.length > 0 ||
    firstOnesGroup.length > 0 ||
    secondTensGroup.length > 0 ||
    secondOnesGroup.length > 0;

  const optionBase =
    total ??
    (correctAnswer !== "" && Number.isFinite(Number(correctAnswer))
      ? Number(correctAnswer)
      : 0);

  const options = [
    optionBase,
    optionBase + 1,
    optionBase - 1,
  ].filter(
    (value, index, array) => array.indexOf(value) === index,
  );

  const renderOptions = () => (
    <div className="add-tens-ones__options">
      {options.map((option, index) => {
        const value = String(option);
        const selected = selectedAnswer === value;
        const correct = value === correctAnswer;
        const wrong = showAnswers && selected && !correct;

        const classes = [
          "add-tens-ones__option",
          selected && !showAnswers
            ? "add-tens-ones__option--selected"
            : "",
          showAnswers && correct
            ? "add-tens-ones__option--correct"
            : "",
          wrong
            ? "add-tens-ones__option--wrong"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <motion.button
            key={`${value}-${index}`}
            type="button"
            className={classes}
            disabled={showAnswers}
            aria-pressed={selected}
            whileHover={
              showAnswers ? undefined : { scale: 1.05 }
            }
            whileTap={
              showAnswers ? undefined : { scale: 0.97 }
            }
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
                className="add-tens-ones__option-icon"
                aria-hidden="true"
              />
            )}

            {wrong && (
              <X
                size={18}
                className="add-tens-ones__option-icon"
                aria-hidden="true"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderVisualGroup = (
    group: string[],
    label: string,
  ) => {
    if (group.length === 0) {
      return null;
    }

    return (
      <div className="add-tens-ones__visual-group">
        {group.map((icon, index) => (
          <span
            key={`${label}-${index}`}
            className="add-tens-ones__visual-icon"
          >
            {icon}
          </span>
        ))}
      </div>
    );
  };

  const renderPlaceValue = (
    group: string[],
    fallback: number | string,
    label: string,
  ) =>
    hasVisual ? (
      renderVisualGroup(group, label)
    ) : (
      <strong className="add-tens-ones__place-value">
        {fallback}
      </strong>
    );

  return (
    <div className="add-tens-ones">
      <h3 className="add-tens-ones__question">
        {questionText}
      </h3>

      {/* Place-value cargo box */}
      <div className="add-tens-ones__cargo">
        <div className="add-tens-ones__cargo-header">
          <div className="add-tens-ones__cargo-heading add-tens-ones__cargo-heading--tens">
            Tens (T)
          </div>

          <div className="add-tens-ones__cargo-heading">
            Ones (O)
          </div>
        </div>

        {/* First number */}
        <div className="add-tens-ones__cargo-row">
          <div className="add-tens-ones__cargo-cell add-tens-ones__cargo-cell--tens">
            {renderPlaceValue(
              firstTensGroup,
              tens?.first ??
                (firstNumber !== undefined
                  ? Math.floor(firstNumber / 10)
                  : ""),
              "first-tens",
            )}
          </div>

          <div className="add-tens-ones__cargo-cell">
            {renderPlaceValue(
              firstOnesGroup,
              ones?.first ??
                (firstNumber !== undefined
                  ? firstNumber % 10
                  : ""),
              "first-ones",
            )}
          </div>
        </div>

        {/* Second number */}
        <div className="add-tens-ones__cargo-row add-tens-ones__cargo-row--second">
          <div className="add-tens-ones__cargo-cell add-tens-ones__cargo-cell--tens">
            {renderPlaceValue(
              secondTensGroup,
              tens?.second ??
                (secondNumber !== undefined
                  ? Math.floor(secondNumber / 10)
                  : ""),
              "second-tens",
            )}
          </div>

          <div className="add-tens-ones__cargo-cell">
            {renderPlaceValue(
              secondOnesGroup,
              ones?.second ??
                (secondNumber !== undefined
                  ? secondNumber % 10
                  : ""),
              "second-ones",
            )}
          </div>
        </div>

        {/* Result placeholders */}
        <div className="add-tens-ones__cargo-result">
          <div className="add-tens-ones__result-cell">
            <div className="add-tens-ones__result-placeholder">
              ?
            </div>
          </div>

          <div className="add-tens-ones__result-cell">
            <div className="add-tens-ones__result-placeholder">
              ?
            </div>
          </div>
        </div>
      </div>

      {/* Select the answer */}
      {renderOptions()}

      {/* Answer feedback */}
      {showAnswers && (
        <div className="add-tens-ones__feedback">
          <div
            className={[
              "add-tens-ones__feedback-status",
              isCorrect
                ? "add-tens-ones__feedback-status--correct"
                : "add-tens-ones__feedback-status--wrong",
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
            answer={`${firstNumber} + ${secondNumber} = ${total}`}
          />
        </div>
      )}
    </div>
  );
}

export default function AddTensAndOnesQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <AddTensAndOnesDisplay
      questionText={
        question.questionText ||
        "Add the Ones first, then add the Tens to find the total."
      }
      firstNumber={data.firstNumber}
      secondNumber={data.secondNumber}
      firstTensGroup={data.firstTensGroup}
      firstOnesGroup={data.firstOnesGroup}
      secondTensGroup={data.secondTensGroup}
      secondOnesGroup={data.secondOnesGroup}
      tens={data.tens}
      ones={data.ones}
      total={data.total}
      correctAnswers={correctAnswers}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
