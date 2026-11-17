
"use client";

import React from "react";
import { Check, Lightbulb, Scale, Trophy, X } from "lucide-react";

import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { answerMatches } from "@/renderer/questionHelpers";

type Grade1MultiplicationFactsData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  leftExpression?: string;
  rightExpression?: string;
  leftProduct?: number;
  rightProduct?: number;
  choices?: string[];

  firstFactor?: number;
  secondFactor?: number;
  incorrectAnswer?: number;
  equation?: string;
  instruction?: string;

  leftFactorA?: number;
  leftFactorB?: number;
  rightKnownFactor?: number;
  missingFactor?: number;
  product?: number;

  answerMode?: string;
  answerType?: string;
};

type CompareSymbol = "<" | ">" | "=";

function Grade1MultiplicationAnswerInput({
  value,
  expectedAnswer,
  showAnswers,
  onChange,
  label,
}: {
  value: string;
  expectedAnswer: string;
  showAnswers: boolean;
  onChange: (value: string) => void;
  label: string;
}) {
  const hasAnswer = value.trim() !== "";

  const correct =
    hasAnswer &&
    expectedAnswer !== "" &&
    answerMatches(value.trim(), [expectedAnswer]);

  const inputStateClass = !showAnswers
    ? "grade1-multiplication-facts__input--pending"
    : correct
      ? "grade1-multiplication-facts__input--correct"
      : "grade1-multiplication-facts__input--incorrect";

  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      className={`grade1-multiplication-facts__input ${inputStateClass}`}
      value={value}
      disabled={showAnswers}
      placeholder="?"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Grade1MultiplicationFeedback({
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
      <div className="grade1-multiplication-facts__hint">
        <Lightbulb size={19} aria-hidden="true" />

        <span>
          Take your time. Work it out and check your answer.
        </span>
      </div>
    );
  }

  const hasAnswer = userAnswer.trim() !== "";

  const correct =
    hasAnswer && answerMatches(userAnswer, correctAnswers);

  return (
    <div
      className={`grade1-multiplication-facts__feedback ${
        correct
          ? "grade1-multiplication-facts__feedback--correct"
          : "grade1-multiplication-facts__feedback--incorrect"
      }`}
      role="status"
    >
      {correct ? (
        <>
          <Check size={20} aria-hidden="true" />
          <span>Well done! Your answer is correct.</span>
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

function Grade1CompareSymbolChoices({
  choices,
  selectedAnswer,
  correctAnswers,
  showAnswers,
  onSelect,
}: {
  choices: string[];
  selectedAnswer: string;
  correctAnswers: string[];
  showAnswers: boolean;
  onSelect: (value: string) => void;
}) {
  const validChoices: CompareSymbol[] = ["<", ">", "="];

  const normalizedChoices = choices
    .map((choice) => choice.trim())
    .filter(
      (choice): choice is CompareSymbol =>
        validChoices.includes(choice as CompareSymbol),
    );

  const finalChoices =
    normalizedChoices.length > 0
      ? [...new Set(normalizedChoices)]
      : validChoices;

  return (
    <div className="grade1-multiplication-facts__symbol-options">
      {finalChoices.map((symbol) => {
        const selected = selectedAnswer === symbol;

        const isCorrect = answerMatches(symbol, correctAnswers);

        let stateClass = "";

        if (showAnswers && isCorrect) {
          stateClass =
            "grade1-multiplication-facts__symbol-option--correct";
        } else if (showAnswers && selected && !isCorrect) {
          stateClass =
            "grade1-multiplication-facts__symbol-option--incorrect";
        } else if (selected) {
          stateClass =
            "grade1-multiplication-facts__symbol-option--selected";
        }

        return (
          <button
            type="button"
            key={symbol}
            className={`grade1-multiplication-facts__symbol-option ${stateClass}`}
            disabled={showAnswers}
            aria-label={`Choose ${symbol}`}
            aria-pressed={selected}
            onClick={() => onSelect(symbol)}
          >
            {symbol}

            {showAnswers && isCorrect && (
              <Check
                size={17}
                className="grade1-multiplication-facts__symbol-check"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function MultiplicationFactsQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const factsData =
    data as unknown as Grade1MultiplicationFactsData;

  const code = String(
    question.questionTypeCode ??
      factsData.questionType ??
      "",
  )
    .trim()
    .toUpperCase();

  const answers = (correctAnswers ?? []).map(String);

  const expectedAnswer = String(answers[0] ?? "").trim();

  const currentAnswer =
    typeof userAnswer === "string" ||
    typeof userAnswer === "number"
      ? String(userAnswer).trim()
      : "";

  const isProductCompare =
    code === "MULTIPLICATION_PRODUCT_COMPARE";

  const isErrorDetective =
    code === "MULTIPLICATION_ERROR_DETECTIVE";

  const isBalanceEquation =
    code === "MULTIPLICATION_BALANCE_EQUATION";

  const isSupported =
    isProductCompare || isErrorDetective || isBalanceEquation;

  const onAnswer = (value: string) => {
    if (!showAnswers) {
      onAnswerChange(value);
    }
  };

  const subtitle = isProductCompare
    ? "Find which product is bigger."
    : isErrorDetective
      ? "Can you find the multiplication mistake?"
      : "Make both sides equal.";

  return (
    <section className="grade1-multiplication-facts">
    
      {/* Original backend question */}
      <div className="grade1-multiplication-facts__prompt">
        <span className="grade1-multiplication-facts__prompt-icon">
          ✏️
        </span>

        <p className="grade1-multiplication-facts__prompt-text">
          {question.questionText}
        </p>
      </div>

      {/* Type 1: Compare products */}
      {isProductCompare && (
        <div className="grade1-multiplication-facts__activity">
        
          <div className="grade1-multiplication-facts__compare-answer">
            <span className="grade1-multiplication-facts__compare-instruction">
              Choose the correct symbol
            </span>

            <div className="grade1-multiplication-facts__comparison">
              <span className="grade1-multiplication-facts__comparison-expression">
                {factsData.leftExpression ?? "?"}
              </span>

              <span className="grade1-multiplication-facts__comparison-symbol">
                {currentAnswer || "□"}
              </span>

              <span className="grade1-multiplication-facts__comparison-expression">
                {factsData.rightExpression ?? "?"}
              </span>
            </div>

            <Grade1CompareSymbolChoices
              choices={factsData.choices ?? ["<", ">", "="]}
              selectedAnswer={currentAnswer}
              correctAnswers={answers}
              showAnswers={showAnswers}
              onSelect={onAnswer}
            />
          </div>
        </div>
      )}

      {/* Type 2: Error detective */}
      {isErrorDetective && (
        <div className="grade1-multiplication-facts__activity">
          

          <div className="grade1-multiplication-facts__answer-card">
            <label
              htmlFor={`grade1-multiplication-error-${question.generatedQuestionId}`}
              className="grade1-multiplication-facts__answer-label"
            >
              What is the correct product?
            </label>

            <div className="grade1-multiplication-facts__product-correction">
              <span>{factsData.firstFactor ?? "?"}</span>

              <span className="grade1-multiplication-facts__math-symbol">
                ×
              </span>

              <span>{factsData.secondFactor ?? "?"}</span>

              <span className="grade1-multiplication-facts__math-symbol">
                =
              </span>

              <Grade1MultiplicationAnswerInput
                value={currentAnswer}
                expectedAnswer={expectedAnswer}
                showAnswers={showAnswers}
                onChange={onAnswer}
                label="Correct multiplication product"
              />
            </div>
          </div>
        </div>
      )}

      {/* Type 3: Balance equation */}
      {isBalanceEquation && (
        <div className="grade1-multiplication-facts__activity">

          <div className="grade1-multiplication-facts__balance-equation">
            <div className="grade1-multiplication-facts__balance-side">
              <span className="grade1-multiplication-facts__balance-label">
                LEFT SIDE
              </span>

              <div className="grade1-multiplication-facts__factor-pair">
                <span>{factsData.leftFactorA ?? "?"}</span>
                <span className="grade1-multiplication-facts__math-symbol">
                  ×
                </span>
                <span>{factsData.leftFactorB ?? "?"}</span>
              </div>

              {showAnswers && factsData.product !== undefined && (
                <span className="grade1-multiplication-facts__balance-product">
                  Product: {factsData.product}
                </span>
              )}
            </div>

            <div className="grade1-multiplication-facts__balance-equals">
              =
            </div>

            <div className="grade1-multiplication-facts__balance-side grade1-multiplication-facts__balance-side--right">
              <span className="grade1-multiplication-facts__balance-label">
                RIGHT SIDE
              </span>

              <div className="grade1-multiplication-facts__factor-pair">
                <span>{factsData.rightKnownFactor ?? "?"}</span>

                <span className="grade1-multiplication-facts__math-symbol">
                  ×
                </span>

                <div className="grade1-multiplication-facts__missing-factor">
                  <Grade1MultiplicationAnswerInput
                    value={currentAnswer}
                    expectedAnswer={expectedAnswer}
                    showAnswers={showAnswers}
                    onChange={onAnswer}
                    label="Missing multiplication factor"
                  />
                </div>
              </div>

              <span className="grade1-multiplication-facts__balance-product">
                Find the missing factor
              </span>
            </div>
          </div>
        </div>
      )}
      {!isSupported && (
        <div className="grade1-multiplication-facts__unsupported">
          <X size={20} aria-hidden="true" />

          <span>
            Unsupported multiplication type: {code || "unknown"}.
          </span>
        </div>
      )}

      {/* One shared feedback area */}
      {isSupported && (
        <Grade1MultiplicationFeedback
          userAnswer={currentAnswer}
          correctAnswers={answers}
          showAnswers={showAnswers}
        />
      )}
    </section>
  );
}
