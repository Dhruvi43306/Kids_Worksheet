
"use client";

import React from "react";
import {
  ArrowDown,
  Check,
  CircleHelp,
  Divide,
  Lightbulb,
  X,
} from "lucide-react";

import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { answerMatches } from "@/renderer/questionHelpers";

type DivisionData = {
  questionType?: string;
  dividend?: number | null;
  divisor?: number | null;
  quotient?: number | null;
  operatorSymbol?: string;
  missingPosition?: "dividend" | "divisor";
  equation?: string;
  options?: unknown[];
  selectionMode?: string;
  answerType?: string;
};

type DivisionOption = {
  value: string;
  label: string;
};

function getOptionData(option: unknown): DivisionOption | null {
  if (typeof option === "string" || typeof option === "number") {
    const text = String(option).trim();

    return text ? { value: text, label: text } : null;
  }

  if (!option || typeof option !== "object") {
    return null;
  }

  const record = option as Record<string, unknown>;

  const labelKeys = [
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
  ];

  let label = "";

  for (const key of labelKeys) {
    const candidate = record[key];

    if (
      typeof candidate === "string" ||
      typeof candidate === "number"
    ) {
      label = String(candidate).trim();

      if (label) {
        break;
      }
    }
  }

  if (!label) {
    return null;
  }

  const valueKeys = [
    "answer",
    "Answer",
    "optionValue",
    "OptionValue",
    "value",
    "Value",
    "equation",
    "Equation",
    "text",
    "Text",
    "label",
    "Label",
  ];

  let value = label;

  for (const key of valueKeys) {
    const candidate = record[key];

    if (
      typeof candidate === "string" ||
      typeof candidate === "number"
    ) {
      const text = String(candidate).trim();

      if (text) {
        value = text;
        break;
      }
    }
  }

  return { value, label };
}

function normalizeDivisionOptions(options: unknown): DivisionOption[] {
  if (!Array.isArray(options)) {
    return [];
  }

  const seen = new Set<string>();

  return options
    .map(getOptionData)
    .filter((option): option is DivisionOption => option !== null)
    .filter((option) => {
      if (seen.has(option.value)) {
        return false;
      }

      seen.add(option.value);
      return true;
    });
}

function DivisionAnswerInput({
  value,
  expectedAnswer,
  showAnswers,
  onChange,
  placeholder = "?",
}: {
  value: string;
  expectedAnswer: string;
  showAnswers: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const hasAnswer = value.trim() !== "";

  const isCorrect =
    hasAnswer &&
    expectedAnswer !== "" &&
    answerMatches(value.trim(), [expectedAnswer]);

  const inputStateClass = !showAnswers
    ? "division_numerical__input--pending"
    : isCorrect
      ? "division_numerical__input--correct"
      : "division_numerical__input--incorrect";

  const displayedValue =
    showAnswers && !hasAnswer
      ? expectedAnswer
      : value;

  return (
    <input
      type="number"
      inputMode="numeric"
      className={[
        "division_numerical__input",
        inputStateClass,
      ].join(" ")}
      value={displayedValue}
      disabled={showAnswers}
      placeholder={placeholder}
      aria-label="Enter your division answer"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function DivisionChoiceList({
  options,
  selectedAnswer,
  correctAnswers,
  showAnswers,
  onSelect,
}: {
  options: DivisionOption[];
  selectedAnswer: string;
  correctAnswers: string[];
  showAnswers: boolean;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) {
    return (
      <div className="division_numerical__empty-options">
        <CircleHelp size={20} aria-hidden="true" />

        <span>
          Answer options are unavailable. Please check the generated
          backend question data.
        </span>
      </div>
    );
  }

  return (
    <div className="division_numerical__options">
      {options.map((option, index) => {
        const selected =
          selectedAnswer === option.value ||
          selectedAnswer === option.label;

        const isCorrectOption =
          answerMatches(option.value, correctAnswers) ||
          answerMatches(option.label, correctAnswers);

        let stateClass = "";

        if (showAnswers && isCorrectOption) {
          stateClass =
            "division_numerical__option--correct";
        } else if (showAnswers && selected && !isCorrectOption) {
          stateClass =
            "division_numerical__option--incorrect";
        } else if (selected) {
          stateClass =
            "division_numerical__option--selected";
        }

        return (
          <button
            type="button"
            key={`${option.value}-${index}`}
            className={[
              "division_numerical__option",
              stateClass,
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={showAnswers}
            aria-pressed={selected}
            onClick={() => onSelect(option.value)}
          >
            <span className="division_numerical__option-letter">
              {String.fromCharCode(65 + index)}
            </span>

            <span className="division_numerical__option-text">
              {option.label}
            </span>

            {showAnswers && isCorrectOption && (
              <Check
                size={19}
                className="division_numerical__option-status"
                aria-label="Correct option"
              />
            )}

            {showAnswers && selected && !isCorrectOption && (
              <X
                size={19}
                className="division_numerical__option-status"
                aria-label="Incorrect selection"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function DivisionFeedback({
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
      <div className="division_numerical__hint">
        <Lightbulb size={18} aria-hidden="true" />

        <span>
          Think carefully, solve the division, and check your answer.
        </span>
      </div>
    );
  }

  const hasAnswer = userAnswer.trim() !== "";

  const isCorrect =
    hasAnswer &&
    answerMatches(userAnswer, correctAnswers);

  return (
    <div
      className={[
        "division_numerical__feedback",
        isCorrect
          ? "division_numerical__feedback--correct"
          : "division_numerical__feedback--incorrect",
      ].join(" ")}
      role="status"
    >
      {isCorrect ? (
        <>
          <Check size={20} aria-hidden="true" />

          <span>
            Excellent! Your answer is correct.
          </span>
        </>
      ) : (
        <>
          <X size={20} aria-hidden="true" />

          <span>
            {hasAnswer ? "Not quite. " : "Correct answer: "}
            {correctAnswers[0] ?? "Not available"}
          </span>
        </>
      )}
    </div>
  );
}

export default function DivisionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const divisionData = data as unknown as DivisionData;

  const code = String(
    question.questionTypeCode ??
      divisionData.questionType ??
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

  const dividend = divisionData.dividend;
  const divisor = divisionData.divisor;
  const operator = divisionData.operatorSymbol ?? "÷";

  const options = normalizeDivisionOptions(divisionData.options);

  const isMissingQuotient =
    code === "DIVISION_MISSING_QUOTIENT";

  const isMissingDividendOrDivisor =
    code === "DIVISION_MISSING_DIVIDEND_OR_DIVISOR";

  const isQuotientSelection =
    code === "DIVISION_QUOTIENT_SELECTION";

  const isEquationCheck =
    code === "DIVISION_EQUATION_CHECK";

  const isRelatedMultiplication =
    code === "DIVISION_RELATED_MULTIPLICATION";

  const isChoiceQuestion =
    isQuotientSelection ||
    isEquationCheck ||
    isRelatedMultiplication;

  const isSupported =
    isMissingQuotient ||
    isMissingDividendOrDivisor ||
    isChoiceQuestion;

  const missingPosition =
    divisionData.missingPosition ?? "dividend";

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

  let title = "Division Challenge";
  let icon = "➗";

  if (isMissingQuotient) {
    title = "Find the Missing Quotient";
    icon = "🎯";
  } else if (isMissingDividendOrDivisor) {
    title =
      missingPosition === "dividend"
        ? "Find the Missing Dividend"
        : "Find the Missing Divisor";
    icon = "🔎";
  } else if (isQuotientSelection) {
    title = "Choose the Correct Quotient";
    icon = "🏆";
  } else if (isEquationCheck) {
    title = "Spot the Incorrect Equation";
    icon = "🕵️";
  } else if (isRelatedMultiplication) {
    title = "Related Multiplication Fact";
    icon = "🧩";
  }

  return (
    <section className="division_numerical">
      {/* Backend question prompt */}
      <div className="division_numerical__prompt">
        <div className="division_numerical__prompt-icon">
          <CircleHelp size={21} aria-hidden="true" />
           <div className="division_numerical__header-icon">
          <span aria-hidden="true">{icon}</span>
        </div>
        </div>

        <p className="division_numerical__prompt-text">
          {question.questionText}
        </p>
      </div>

      {/* Type 1: Missing quotient */}
      {isMissingQuotient && (
        <div className="division_numerical__activity">
          <div className="division_numerical__section-label">
            CALCULATE THE QUOTIENT
          </div>

          <div className="division_numerical__equation">
            <div className="division_numerical__number-tile">
              {dividend ?? "?"}
            </div>

            <span className="division_numerical__operator">
              {operator}
            </span>

            <div className="division_numerical__number-tile">
              {divisor ?? "?"}
            </div>

            <span className="division_numerical__operator">
              =
            </span>

            <div className="division_numerical__number-tile division_numerical__number-tile--missing">
              <DivisionAnswerInput
                value={currentAnswer}
                expectedAnswer={correctAnswer}
                showAnswers={showAnswers}
                onChange={changeAnswer}
              />
            </div>
          </div>

          <div className="division_numerical__instruction">
            Divide the dividend by the divisor.
          </div>
        </div>
      )}

      {/* Type 2: Missing dividend or divisor */}
      {isMissingDividendOrDivisor && (
        <div className="division_numerical__activity">
          <div className="division_numerical__section-label">
            COMPLETE THE EQUATION
          </div>

          <div className="division_numerical__equation">
            {missingPosition === "dividend" ? (
              <>
                <div className="division_numerical__number-tile division_numerical__number-tile--missing">
                  <DivisionAnswerInput
                    value={currentAnswer}
                    expectedAnswer={correctAnswer}
                    showAnswers={showAnswers}
                    onChange={changeAnswer}
                  />
                </div>

                <span className="division_numerical__operator">
                  {operator}
                </span>

                <div className="division_numerical__number-tile">
                  {divisor ?? "?"}
                </div>

                <span className="division_numerical__operator">
                  =
                </span>

                <div className="division_numerical__number-tile division_numerical__number-tile--result">
                  {divisionData.quotient ?? "?"}
                </div>
              </>
            ) : (
              <>
                <div className="division_numerical__number-tile">
                  {dividend ?? "?"}
                </div>

                <span className="division_numerical__operator">
                  {operator}
                </span>

                <div className="division_numerical__number-tile division_numerical__number-tile--missing">
                  <DivisionAnswerInput
                    value={currentAnswer}
                    expectedAnswer={correctAnswer}
                    showAnswers={showAnswers}
                    onChange={changeAnswer}
                  />
                </div>

                <span className="division_numerical__operator">
                  =
                </span>

                <div className="division_numerical__number-tile division_numerical__number-tile--result">
                  {divisionData.quotient ?? "?"}
                </div>
              </>
            )}
          </div>

          <div className="division_numerical__instruction">
            {missingPosition === "dividend"
              ? "Which number must be divided to get the given quotient?"
              : "Which number divides the dividend to give the given quotient?"}
          </div>
        </div>
      )}

      {/* Type 3: Quotient selection */}
      {isQuotientSelection && (
        <div className="division_numerical__activity">
          <div className="division_numerical__section-label">
            CHOOSE YOUR ANSWER
          </div>

          <div className="division_numerical__equation division_numerical__equation--featured">
            <div className="division_numerical__number-tile">
              {dividend ?? "?"}
            </div>

            <span className="division_numerical__operator">
              {operator}
            </span>

            <div className="division_numerical__number-tile">
              {divisor ?? "?"}
            </div>

            <span className="division_numerical__operator">
              =
            </span>

            <div className="division_numerical__number-tile division_numerical__number-tile--unknown">
              ?
            </div>
          </div>

          <div className="division_numerical__instruction">
            What is the quotient? Select one answer.
          </div>

          <DivisionChoiceList
            options={options}
            selectedAnswer={currentAnswer}
            correctAnswers={answers}
            showAnswers={showAnswers}
            onSelect={changeOption}
          />
        </div>
      )}

      {/* Type 4: Select the incorrect division equation */}
      {isEquationCheck && (
        <div className="division_numerical__activity">
          <div className="division_numerical__section-label">
            FIND THE MISTAKE
          </div>

          <div className="division_numerical__challenge-banner">
            <div className="division_numerical__challenge-icon">
              🕵️
            </div>

            <div className="division_numerical__challenge-copy">
              <strong>Division detective</strong>

              <p>
                Check each equation. Select the one that is incorrect.
              </p>
            </div>
          </div>

          <DivisionChoiceList
            options={options}
            selectedAnswer={currentAnswer}
            correctAnswers={answers}
            showAnswers={showAnswers}
            onSelect={changeOption}
          />
        </div>
      )}

      {/* Type 5: Related multiplication fact */}
      {isRelatedMultiplication && (
        <div className="division_numerical__activity">
          <div className="division_numerical__section-label">
            DIVISION AND MULTIPLICATION
          </div>

          <div className="division_numerical__related-card">
            <span className="division_numerical__related-label">
              DIVISION EQUATION
            </span>

            <div className="division_numerical__related-equation">
              {divisionData.equation ??
                `${dividend ?? "?"} ${operator} ${divisor ?? "?"} = ?`}
            </div>

            <div className="division_numerical__related-divider">
              <ArrowDown size={20} aria-hidden="true" />
            </div>

            <span className="division_numerical__related-label">
              CHECK USING MULTIPLICATION
            </span>

            <div className="division_numerical__related-hint">
              <Divide size={19} aria-hidden="true" />

              <span>
                Divisor × Quotient = Dividend
              </span>
            </div>
          </div>

          <div className="division_numerical__instruction">
            Choose the multiplication equation that verifies the division.
          </div>

          <DivisionChoiceList
            options={options}
            selectedAnswer={currentAnswer}
            correctAnswers={answers}
            showAnswers={showAnswers}
            onSelect={changeOption}
          />
        </div>
      )}

      {/* Unsupported code */}
      {!isSupported && (
        <div className="division_numerical__unsupported">
          <CircleHelp size={21} aria-hidden="true" />

          <span>
            This division question type is not supported yet.
            Received type: {code || "unknown"}.
          </span>
        </div>
      )}

      {/* Shared answer feedback */}
      {isSupported && (
        <DivisionFeedback
          userAnswer={currentAnswer}
          correctAnswers={answers}
          showAnswers={showAnswers}
        />
      )}
    </section>
  );
}
