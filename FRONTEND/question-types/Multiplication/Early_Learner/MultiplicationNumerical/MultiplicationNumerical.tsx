
"use client";

import React from "react";
import { Check, CircleHelp, Lightbulb, X } from "lucide-react";
import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { answerMatches } from "@/renderer/questionHelpers";

/*
 * Keep this separate from QuestionData. This avoids conflicts if the
 * shared QuestionData type declares options or sequence differently.
 */
type MultiplicationData = {
  questionType?: string;
  firstNumber?: number | null;
  secondNumber?: number | null;
  product?: number | null;
  targetProduct?: number;
  operatorSymbol?: string;
  missingPosition?: "product" | "firstFactor" | "secondFactor";
  equation?: string;
  sequence?: Array<number | null>;
  missingIndex?: number;
  options?: unknown[];
  selectionMode?: string;
  answerType?: string;
};

type MultiplicationOption = {
  value: string;
  label: string;
};

function getOptionText(option: unknown): string {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  if (!option || typeof option !== "object") {
    return "";
  }

  const record = option as Record<string, unknown>;

  const keys = [
    "label",
    "Label",
    "text",
    "Text",
    "displayText",
    "DisplayText",
    "optionText",
    "OptionText",
    "equation",
    "Equation",
    "answer",
    "Answer",
    "value",
    "Value",
    "optionValue",
    "OptionValue",
    "name",
    "Name",
  ];

  for (const key of keys) {
    const candidate = record[key];

    if (
      typeof candidate === "string" ||
      typeof candidate === "number"
    ) {
      return String(candidate);
    }
  }

  return "";
}

function normalizeOptions(options: unknown): MultiplicationOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  const seen = new Set<string>();

  return options
    .map((option) => {
      const label = getOptionText(option).trim();

      return {
        value: label,
        label,
      };
    })
    .filter((option) => {
      if (!option.label || seen.has(option.value)) {
        return false;
      }

      seen.add(option.value);
      return true;
    });
}

function MultiplicationAnswerInput({
  value,
  expectedAnswer,
  showAnswers,
  onChange,
  placeholder = "?",
  compact = false,
}: {
  value: string;
  expectedAnswer: string;
  showAnswers: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const hasAnswer = value.trim() !== "";

  const isCorrect =
    hasAnswer &&
    expectedAnswer !== "" &&
    answerMatches(value.trim(), [expectedAnswer]);

  const inputStateClass = !showAnswers
    ? "multiplication_numerical__input--pending"
    : isCorrect
      ? "multiplication_numerical__input--correct"
      : "multiplication_numerical__input--incorrect";

  const displayedValue =
    showAnswers && !hasAnswer ? expectedAnswer : value;

  return (
    <input
      type="number"
      inputMode="numeric"
      className={[
        "multiplication_numerical__input",
        compact ? "multiplication_numerical__input--compact" : "",
        inputStateClass,
      ]
        .filter(Boolean)
        .join(" ")}
      value={displayedValue}
      disabled={showAnswers}
      placeholder={placeholder}
      aria-label="Enter your multiplication answer"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function MultiplicationChoiceList({
  options,
  selectedAnswer,
  correctAnswers,
  showAnswers,
  onSelect,
}: {
  options: MultiplicationOption[];
  selectedAnswer: string;
  correctAnswers: string[];
  showAnswers: boolean;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) {
    return (
      <div className="multiplication_numerical__empty-options">
        Answer choices are unavailable. Please check the generated
        question data.
      </div>
    );
  }

  return (
    <div className="multiplication_numerical__options">
      {options.map((option, index) => {
        const selected = selectedAnswer === option.value;

        const isCorrectOption = answerMatches(
          option.value,
          correctAnswers,
        );

        let stateClass = "";

        if (showAnswers && isCorrectOption) {
          stateClass =
            "multiplication_numerical__option--correct";
        } else if (showAnswers && selected && !isCorrectOption) {
          stateClass =
            "multiplication_numerical__option--incorrect";
        } else if (selected) {
          stateClass =
            "multiplication_numerical__option--selected";
        }

        return (
          <button
            type="button"
            key={`${option.value}-${index}`}
            className={[
              "multiplication_numerical__option",
              stateClass,
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={showAnswers}
            aria-pressed={selected}
            onClick={() => onSelect(option.value)}
          >
            <span className="multiplication_numerical__option-letter">
              {String.fromCharCode(65 + index)}
            </span>

            <span className="multiplication_numerical__option-text">
              {option.label}
            </span>

            {showAnswers && isCorrectOption && (
              <Check
                size={19}
                className="multiplication_numerical__option-status"
                aria-label="Correct option"
              />
            )}

            {showAnswers && selected && !isCorrectOption && (
              <X
                size={19}
                className="multiplication_numerical__option-status"
                aria-label="Incorrect selection"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function MultiplicationFeedback({
  userAnswer,
  correctAnswers,
  showAnswers,
}: {
  userAnswer: string;
  correctAnswers: string[];
  showAnswers: boolean;
}) {
  if (!showAnswers) {
    return (
      <div className="multiplication_numerical__hint">
        <Lightbulb size={18} aria-hidden="true" />
        <span>
          Take your time, work through the question, and check your answer.
        </span>
      </div>
    );
  }

  const hasAnswer = userAnswer.trim() !== "";

  const isCorrect =
    hasAnswer && answerMatches(userAnswer, correctAnswers);

  return (
    <div
      className={[
        "multiplication_numerical__feedback",
        isCorrect
          ? "multiplication_numerical__feedback--correct"
          : "multiplication_numerical__feedback--incorrect",
      ].join(" ")}
      role="status"
    >
      {isCorrect ? (
        <>
          <Check size={19} aria-hidden="true" />
          <span>Excellent! Your answer is correct.</span>
        </>
      ) : (
        <>
          <X size={19} aria-hidden="true" />
          <span>
            {hasAnswer ? "Not quite. " : "The correct answer is "}
            {correctAnswers[0] ?? "not available"}.
          </span>
        </>
      )}
    </div>
  );
}

export default function MultiplicationQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const multiplicationData =
    data as unknown as MultiplicationData;

  const code = String(
    question.questionTypeCode ??
      multiplicationData.questionType ??
      "",
  )
    .trim()
    .toUpperCase();

  const answers = (correctAnswers ?? []).map(String);

  const correctAnswer = String(answers[0] ?? "").trim();

  const currentAnswer =
    typeof userAnswer === "string" ||
    typeof userAnswer === "number"
      ? String(userAnswer).trim()
      : "";

  const firstNumber = multiplicationData.firstNumber;
  const secondNumber = multiplicationData.secondNumber;
  const operator = multiplicationData.operatorSymbol ?? "×";

  const options = normalizeOptions(multiplicationData.options);
  const pattern = multiplicationData.sequence ?? [];
  const missingIndex = multiplicationData.missingIndex ?? -1;
  const missingPosition =
    multiplicationData.missingPosition ?? "product";

  const isMissingNumber =
    code === "MULTIPLICATION_MISSING_NUMBER";

  const isProductSelection =
    code === "MULTIPLICATION_PRODUCT_SELECTION";

  const isEquationCheck =
    code === "MULTIPLICATION_EQUATION_CHECK";

  const isNumberPattern =
    code === "MULTIPLICATION_NUMBER_PATTERN";

  const isEquivalentFact =
    code === "MULTIPLICATION_EQUIVALENT_FACT";

  const isChoiceQuestion =
    isProductSelection || isEquationCheck || isEquivalentFact;

  const isSupported =
    isMissingNumber ||
    isProductSelection ||
    isEquationCheck ||
    isNumberPattern ||
    isEquivalentFact;

  const changeAnswer = (value: string) => {
    if (!showAnswers) {
      onAnswerChange(value);
    }
  };

  const changeOption = (value: string) => {
    if (!showAnswers) {
      onAnswerChange(value);
    }
  };

//   const questionTitle = isMissingNumber
//     ? "Find the Missing Number"
//     : isProductSelection
//       ? "Choose the Correct Product"
//       : isEquationCheck
//         ? "Spot the Incorrect Equation"
//         : isNumberPattern
//           ? "Complete the Number Pattern"
//           : isEquivalentFact
//             ? "Find the Equivalent Fact"
//             : "Multiplication Challenge";

  const questionIcon = isEquationCheck
    ? "🔎"
    : isNumberPattern
      ? "🔢"
      : isEquivalentFact
        ? "🧩"
        : isProductSelection
          ? "🎯"
          : "✖";

  return (
    <section className="multiplication_numerical">
      {/* Header */}
      {/* <header className="multiplication_numerical__header"> */}
        {/* <div className="multiplication_numerical__header-icon">
          <span aria-hidden="true">{questionIcon}</span>
        </div> */}

        {/* <div className="multiplication_numerical__header-copy">
          <span className="multiplication_numerical__eyebrow">
            MULTIPLICATION MISSION
          </span> */}

          {/* <h3 className="multiplication_numerical__title">
            {questionTitle}
          </h3> */}
        {/* </div> */}

        {/* <span className="multiplication_numerical__badge"> */}
          {/* <span className="multiplication_numerical__badge-dot" />
          PRACTICE
        </span> */}
      {/* </header> */}

      {/* Backend question prompt */}
      <div className="multiplication_numerical__prompt">
        <span className="multiplication_numerical__prompt-icon">
          {/* <CircleHelp size={20} aria-hidden="true" /> */}
          <div className="multiplication_numerical__header-icon">
          <span aria-hidden="true">{questionIcon}</span>
        </div>
        </span>

        <p className="multiplication_numerical__prompt-text">
          {question.questionText}
        </p>
      </div>

      {/* Type 155 — Missing number */}
      {isMissingNumber && (
        <div className="multiplication_numerical__activity">
          <div className="multiplication_numerical__section-label">
            COMPLETE THE EQUATION
          </div>

          <div className="multiplication_numerical__equation">
            {missingPosition === "firstFactor" ? (
              <>
                <div className="multiplication_numerical__number-tile multiplication_numerical__number-tile--missing">
                  <MultiplicationAnswerInput
                    value={currentAnswer}
                    expectedAnswer={correctAnswer}
                    showAnswers={showAnswers}
                    onChange={changeAnswer}
                  />
                </div>

                <span className="multiplication_numerical__operator">
                  {operator}
                </span>

                <div className="multiplication_numerical__number-tile">
                  {secondNumber ?? "?"}
                </div>

                <span className="multiplication_numerical__operator">
                  =
                </span>

                <div className="multiplication_numerical__number-tile multiplication_numerical__number-tile--result">
                  {multiplicationData.product ?? "?"}
                </div>
              </>
            ) : missingPosition === "secondFactor" ? (
              <>
                <div className="multiplication_numerical__number-tile">
                  {firstNumber ?? "?"}
                </div>

                <span className="multiplication_numerical__operator">
                  {operator}
                </span>

                <div className="multiplication_numerical__number-tile multiplication_numerical__number-tile--missing">
                  <MultiplicationAnswerInput
                    value={currentAnswer}
                    expectedAnswer={correctAnswer}
                    showAnswers={showAnswers}
                    onChange={changeAnswer}
                  />
                </div>

                <span className="multiplication_numerical__operator">
                  =
                </span>

                <div className="multiplication_numerical__number-tile multiplication_numerical__number-tile--result">
                  {multiplicationData.product ?? "?"}
                </div>
              </>
            ) : (
              <>
                <div className="multiplication_numerical__number-tile">
                  {firstNumber ?? "?"}
                </div>

                <span className="multiplication_numerical__operator">
                  {operator}
                </span>

                <div className="multiplication_numerical__number-tile">
                  {secondNumber ?? "?"}
                </div>

                <span className="multiplication_numerical__operator">
                  =
                </span>

                <div className="multiplication_numerical__number-tile multiplication_numerical__number-tile--missing">
                  <MultiplicationAnswerInput
                    value={currentAnswer}
                    expectedAnswer={correctAnswer}
                    showAnswers={showAnswers}
                    onChange={changeAnswer}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Type 156 — Product selection */}
      {isProductSelection && (
        <div className="multiplication_numerical__activity">
          <div className="multiplication_numerical__section-label">
            SOLVE THE MULTIPLICATION
          </div>

          <div className="multiplication_numerical__equation multiplication_numerical__equation--featured">
            <div className="multiplication_numerical__number-tile">
              {firstNumber ?? "?"}
            </div>

            <span className="multiplication_numerical__operator">
              {operator}
            </span>

            <div className="multiplication_numerical__number-tile">
              {secondNumber ?? "?"}
            </div>

            <span className="multiplication_numerical__operator">
              =
            </span>

            <div className="multiplication_numerical__number-tile multiplication_numerical__number-tile--unknown">
              ?
            </div>
          </div>

          <div className="multiplication_numerical__instruction">
            Choose the correct answer.
          </div>

          <MultiplicationChoiceList
            options={options}
            selectedAnswer={currentAnswer}
            correctAnswers={answers}
            showAnswers={showAnswers}
            onSelect={changeOption}
          />
        </div>
      )}

      {/* Type 157 — Choose the incorrect equation */}
      {isEquationCheck && (
        <div className="multiplication_numerical__activity">
          <div className="multiplication_numerical__section-label">
            FIND THE MISTAKE
          </div>

          <div className="multiplication_numerical__challenge-banner">
            <span className="multiplication_numerical__challenge-icon">
              🔍
            </span>

            <div className="multiplication_numerical__challenge-copy">
              <strong>Math detective</strong>
              <p>
                Check each equation. Select the one that is incorrect.
              </p>
            </div>
          </div>

          <MultiplicationChoiceList
            options={options}
            selectedAnswer={currentAnswer}
            correctAnswers={answers}
            showAnswers={showAnswers}
            onSelect={changeOption}
          />
        </div>
      )}

      {/* Type 158 — Number pattern */}
      {isNumberPattern && (
        <div className="multiplication_numerical__activity">
          <div className="multiplication_numerical__section-label">
            WHAT COMES IN THE GAP?
          </div>

          <div className="multiplication_numerical__pattern">
            {pattern.map((value, index) => {
              const isMissing =
                index === missingIndex || value === null;

              return (
                <React.Fragment key={`pattern-${index}`}>
                  {index > 0 && (
                    <span className="multiplication_numerical__pattern-connector">
                      →
                    </span>
                  )}

                  {isMissing ? (
                    <div className="multiplication_numerical__pattern-cell multiplication_numerical__pattern-cell--missing">
                      <MultiplicationAnswerInput
                        value={currentAnswer}
                        expectedAnswer={correctAnswer}
                        showAnswers={showAnswers}
                        onChange={changeAnswer}
                        compact
                      />
                    </div>
                  ) : (
                    <div className="multiplication_numerical__pattern-cell">
                      {value}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="multiplication_numerical__pattern-hint">
            <Lightbulb size={18} aria-hidden="true" />
            <span>
              Look for the same multiplication step between the numbers.
            </span>
          </div>
        </div>
      )}

      {/* Type 159 — Equivalent multiplication fact */}
      {isEquivalentFact && (
        <div className="multiplication_numerical__activity">
          <div className="multiplication_numerical__section-label">
            MATCH THE PRODUCT
          </div>

          <div className="multiplication_numerical__target-card">
            <span className="multiplication_numerical__target-label">
              TARGET EQUATION
            </span>

            <div className="multiplication_numerical__target-equation">
              {multiplicationData.equation ??
                `${firstNumber ?? "?"} ${operator} ${secondNumber ?? "?"} = ${multiplicationData.targetProduct ?? "?"}`}
            </div>

            <span className="multiplication_numerical__target-product">
              Product: {multiplicationData.targetProduct ?? "—"}
            </span>
          </div>

          <div className="multiplication_numerical__instruction">
            Choose a different equation with the same product.
          </div>

          <MultiplicationChoiceList
            options={options}
            selectedAnswer={currentAnswer}
            correctAnswers={answers}
            showAnswers={showAnswers}
            onSelect={changeOption}
          />
        </div>
      )}

      {/* Unsupported type / missing backend data */}
      {!isSupported && (
        <div className="multiplication_numerical__unsupported">
          <CircleHelp size={20} aria-hidden="true" />
          <span>
            This question type is not supported by the multiplication
            renderer. Received type: {code || "unknown"}.
          </span>
        </div>
      )}

      {/* One shared feedback area */}
      {isSupported && (
        <MultiplicationFeedback
          userAnswer={currentAnswer}
          correctAnswers={answers}
          showAnswers={showAnswers}
        />
      )}
    </section>
  );
}
