import React from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleCheck,
  Equal,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type GameOption = {
  id: string;
  expression?: string;
  equation?: string;
};

type GameData = {
  renderKey?: string;
  questionType?: string;
  title?: string;
  firstFactor?: number;
  secondFactor?: number;
  product?: number;
  originalEquation?: string;
  instruction?: string;
  targetProduct?: number;
  options?: GameOption[];
};

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[x*]/g, "×");

function getOptionText(option: GameOption): string {
  return option.expression ?? option.equation ?? option.id;
}

function splitAnswerIds(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function expectedAnswerText(answers: string[]): string {
  return answers.map(String).join(",");
}

function isCorrectAnswer(
  answer: string,
  correctAnswers: string[]
): boolean {
  if (!answer.trim() || correctAnswers.length === 0) {
    return false;
  }

  return correctAnswers.some(
    (correct) => normalize(correct) === normalize(answer)
  );
}

function GameFeedback({
  showAnswers,
  answer,
  correctAnswers,
  displayAnswer,
}: {
  showAnswers: boolean;
  answer: string;
  correctAnswers: string[];
  displayAnswer: string;
}) {
  if (!showAnswers) return null;

  const correct = isCorrectAnswer(answer, correctAnswers);

  return (
    <div
      className={`multiplicationfact_game__feedback ${
        correct
          ? "multiplicationfact_game__feedback--correct"
          : "multiplicationfact_game__feedback--incorrect"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="multiplicationfact_game__feedback-heading">
        {correct ? (
          <CheckCircle2 size={19} />
        ) : (
          <XCircle size={19} />
        )}
        <strong>
          {correct
            ? "Correct!"
            : answer.trim()
              ? "Not quite. Check the correct answer."
              : "No answer entered. Here is the correct answer."}
        </strong>
      </div>

      <AnswerBox answer={displayAnswer || expectedAnswerText(correctAnswers)} />
    </div>
  );
}

export default function Grade1MultiplicationGameFacts({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const gameData = data as unknown as GameData;

  const questionMetadata = question as unknown as {
    questionTypeCode?: string;
    code?: string;
  };

  const questionType = String(
    gameData.questionType ??
      questionMetadata.questionTypeCode ??
      questionMetadata.code ??
      ""
  ).toUpperCase();

  const title = gameData.title ?? "Multiplication Game";
  const answer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const updateAnswer = (nextAnswer: string) => {
    if (!showAnswers) {
      onAnswerChange(nextAnswer);
    }
  };

  const heading = (
    <div className="multiplicationfact_game__heading">
      <div className="multiplicationfact_game__heading-icon">
        <Equal size={22} />
      </div>
      <div className="multiplicationfact_game__heading-content">
        <span className="multiplicationfact_game__eyebrow">
          MULTIPLICATION GAMES
        </span>
        <h3 className="multiplicationfact_game__title">{title}</h3>
      </div>
    </div>
  );

  /* 1. MULTIPLICATION_TURNAROUND_FACT_MATCH */

  if (questionType === "MULTIPLICATION_TURNAROUND_FACT_MATCH") {
    const firstFactor = gameData.firstFactor ?? 0;
    const secondFactor = gameData.secondFactor ?? 0;

    return (
      <section className="multiplicationfact_game__container">
        <div className="multiplicationfact_game__card multiplicationfact_game__card--turnaround">
          {heading}

          <p className="multiplicationfact_game__prompt">
            {question.questionText}
          </p>

          <div className="multiplicationfact_game__turnaround-board">
            <div className="multiplicationfact_game__original-fact">
              {/* <span className="multiplicationfact_game__small-label">
                ORIGINAL FACT
              </span> */}

              <strong className="multiplicationfact_game__original-equation">
                {gameData.originalEquation ??
                  `${firstFactor} × ${secondFactor} = ${gameData.product ?? firstFactor * secondFactor}`}
              </strong>
            </div>

            {/* <div className="multiplicationfact_game__swap-row">
              <div className="multiplicationfact_game__factor-chip">
                {secondFactor}
              </div>

              <span className="multiplicationfact_game__swap-symbol">
                ×
              </span>

              <div className="multiplicationfact_game__factor-chip">
                {firstFactor}
              </div>

              <span className="multiplicationfact_game__swap-arrow" aria-hidden="true">
                ↔
              </span>
            </div> */}

            <div className="multiplicationfact_game__answer-area">
              <label
                className="multiplicationfact_game__answer-label"
                htmlFor={`multiplicationfact_game__turnaround-${question.questionNumber ?? question.questionTypeId ?? "question"}`}
              >
                Your turnaround fact
              </label>

              <input
                id={`multiplicationfact_game__turnaround-${question.questionNumber ?? question.questionTypeId ?? "question"}`}
                type="text"
                className="multiplicationfact_game__answer-input"
                value={answer}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder={`${secondFactor} × ${firstFactor}`}
                disabled={showAnswers}
                autoComplete="off"
              />

              <span className="multiplicationfact_game__input-hint">
                Enter the factors in reverse order.
              </span>
            </div>
          </div>

          <GameFeedback
            showAnswers={showAnswers}
            answer={answer}
            correctAnswers={expectedAnswers}
            displayAnswer={expectedAnswers[0] ?? ""}
          />
        </div>
      </section>
    );
  }

  /* 2. MULTIPLICATION_TARGET_PRODUCT_PAIRS */

  if (questionType === "MULTIPLICATION_TARGET_PRODUCT_PAIRS") {
    const options = gameData.options ?? [];
    const selectedIds = new Set(splitAnswerIds(answer));
    const correctIds = new Set(
      splitAnswerIds(expectedAnswerText(expectedAnswers))
    );

    const correctDisplay = options
      .filter((option) => correctIds.has(option.id))
      .map(getOptionText)
      .join(", ");

    const toggleOption = (id: string) => {
      const next = new Set(selectedIds);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      updateAnswer(Array.from(next).sort().join(","));
    };

    return (
      <section className="multiplicationfact_game__container">
        <div className="multiplicationfact_game__card multiplicationfact_game__card--pairs">
          {heading}

          {/* <div className="multiplicationfact_game__target">
            <span className="multiplicationfact_game__small-label">
              TARGET PRODUCT
            </span>
            <strong className="multiplicationfact_game__target-number">
              {gameData.targetProduct}
            </strong>
          </div> */}

          <p className="multiplicationfact_game__prompt">
            {question.questionText}
          </p>

          <div
            className="multiplicationfact_game__options"
            role="group"
            aria-label="Choose multiplication pairs"
          >
            {options.map((option) => {
              const selected = selectedIds.has(option.id);
              const correctOption = correctIds.has(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={[
                    "multiplicationfact_game__option",
                    selected
                      ? "multiplicationfact_game__option--selected"
                      : "",
                    showAnswers && correctOption
                      ? "multiplicationfact_game__option--correct"
                      : "",
                    showAnswers && selected && !correctOption
                      ? "multiplicationfact_game__option--incorrect"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleOption(option.id)}
                  disabled={showAnswers}
                  aria-pressed={selected}
                >
                  <span className="multiplicationfact_game__option-id">
                    {option.id}
                  </span>

                  <span className="multiplicationfact_game__option-equation">
                    {getOptionText(option)}
                  </span>

                  {showAnswers && correctOption && (
                    <CircleCheck size={19} />
                  )}
                </button>
              );
            })}
          </div>

          <GameFeedback
            showAnswers={showAnswers}
            answer={answer}
            correctAnswers={expectedAnswers}
            displayAnswer={correctDisplay}
          />
        </div>
      </section>
    );
  }

  /* 3. MULTIPLICATION_PRODUCT_SORTING */

  if (questionType === "MULTIPLICATION_PRODUCT_SORTING") {
    const options = gameData.options ?? [];
    const allIds = options.map((option) => option.id);

    const submittedOrder = splitAnswerIds(answer).filter((id) =>
      allIds.includes(id)
    );

    const currentOrder =
      submittedOrder.length === allIds.length
        ? submittedOrder
        : allIds;

    const correctOrder = splitAnswerIds(
      expectedAnswerText(expectedAnswers)
    );

    const correctDisplay = correctOrder
      .map((id) => options.find((option) => option.id === id))
      .filter((option): option is GameOption => option !== undefined)
      .map(getOptionText)
      .join(" → ");

    const moveOption = (
      index: number,
      direction: -1 | 1
    ) => {
      const nextOrder = [...currentOrder];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= nextOrder.length) return;

      [nextOrder[index], nextOrder[nextIndex]] = [
        nextOrder[nextIndex],
        nextOrder[index],
      ];

      updateAnswer(nextOrder.join(","));
    };

    return (
      <section className="multiplicationfact_game__container">
        <div className="multiplicationfact_game__card multiplicationfact_game__card--sorting">
          {heading}

          <p className="multiplicationfact_game__prompt">
            {question.questionText}
          </p>

          <div className="multiplicationfact_game__sorting-list">
            {currentOrder.map((id, index) => {
              const option = options.find((item) => item.id === id);
              if (!option) return null;

              const correctPosition = correctOrder[index] === id;

              return (
                <div
                  key={id}
                  className={[
                    "multiplicationfact_game__sort-row",
                    showAnswers && correctPosition
                      ? "multiplicationfact_game__sort-row--correct"
                      : "",
                    showAnswers && !correctPosition
                      ? "multiplicationfact_game__sort-row--incorrect"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="multiplicationfact_game__sort-position">
                    {index + 1}
                  </span>

                  <strong className="multiplicationfact_game__sort-equation">
                    {getOptionText(option)}
                  </strong>

                  <div className="multiplicationfact_game__sort-controls">
                    <button
                      type="button"
                      className="multiplicationfact_game__move-button"
                      onClick={() => moveOption(index, -1)}
                      disabled={showAnswers || index === 0}
                      aria-label={`Move ${getOptionText(option)} up`}
                    >
                      <ArrowUp size={17} />
                    </button>

                    <button
                      type="button"
                      className="multiplicationfact_game__move-button"
                      onClick={() => moveOption(index, 1)}
                      disabled={
                        showAnswers || index === currentOrder.length - 1
                      }
                      aria-label={`Move ${getOptionText(option)} down`}
                    >
                      <ArrowDown size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <GameFeedback
            showAnswers={showAnswers}
            answer={answer}
            correctAnswers={expectedAnswers}
            displayAnswer={correctDisplay}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="multiplicationfact_game__unsupported">
      Unsupported multiplication game type: {questionType || "Unknown"}
    </div>
  );
}