import React from "react";
import {
  ArrowDown,
  CheckCircle2,
  CircleCheck,
  Search,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type DivisionGameOption = {
  id: string;
  equation: string;
};

type DivisionPatternRow = {
  id: string;
  equation: string;
  quotient: number | null;
};

type DivisionGameData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  targetQuotient?: number;

  options?: DivisionGameOption[];

  dividend?: number;
  divisor?: number;
  steps?: number[];
  instruction?: string;

  rows?: DivisionPatternRow[];
};

function normalizeDivisionAnswer(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function splitDivisionIds(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getExpectedAnswer(correctAnswers: string[]): string {
  return correctAnswers.map(String).join(",");
}

function getExpectedOptionIds(correctAnswers: string[]): string[] {
  return Array.from(
    new Set(
      correctAnswers.flatMap((answer) =>
        splitDivisionIds(String(answer))
      )
    )
  ).sort();
}

function areDivisionIdsCorrect(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  if (!userAnswer.trim() || correctAnswers.length === 0) {
    return false;
  }

  const userIds = splitDivisionIds(userAnswer).sort();
  const expectedIds = getExpectedOptionIds(correctAnswers);

  return (
    userIds.length === expectedIds.length &&
    userIds.every((id, index) => id === expectedIds[index])
  );
}

function isNumericAnswerCorrect(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  if (!userAnswer.trim() || correctAnswers.length === 0) {
    return false;
  }

  return correctAnswers.some(
    (correct) =>
      normalizeDivisionAnswer(correct) ===
      normalizeDivisionAnswer(userAnswer)
  );
}

function DivisionGameFeedback({
  showAnswers,
  userAnswer,
  correct,
  answerDisplay,
}: {
  showAnswers: boolean;
  userAnswer: string;
  correct: boolean;
  answerDisplay: string;
}) {
  if (!showAnswers) return null;

  return (
    <div
      className={[
        "divisionfact_game__feedback",
        correct
          ? "divisionfact_game__feedback--correct"
          : "divisionfact_game__feedback--incorrect",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="divisionfact_game__feedback-heading">
        {correct ? (
          <CheckCircle2 size={20} />
        ) : (
          <XCircle size={20} />
        )}

        <strong>
          {correct
            ? "Correct!"
            : userAnswer.trim()
              ? "Not quite. Here is the correct answer."
              : "No answer entered. Here is the correct answer."}
        </strong>
      </div>

      <AnswerBox answer={answerDisplay || "No correct answer was provided."} />
    </div>
  );
}

export default function Grade1DivisionGameFacts({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const gameData = data as unknown as DivisionGameData;

  const questionMetadata = question as unknown as {
    questionTypeCode?: string;
    code?: string;
    questionText?: string;
  };

  const questionType = String(
    gameData.questionType ??
      questionMetadata.questionTypeCode ??
      questionMetadata.code ??
      ""
  ).toUpperCase();

  const answer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const questionText = questionMetadata.questionText ?? "";

  const updateAnswer = (nextAnswer: string) => {
    if (showAnswers) return;
    onAnswerChange(nextAnswer);
  };



     




 

  if (questionType === "DIVISION_QUOTIENT_TARGET_HUNT") {
    const options = gameData.options ?? [];

    const selectedIds = new Set(splitDivisionIds(answer));

    const expectedIds = new Set(
      getExpectedOptionIds(expectedAnswers)
    );

    const allCorrectSelected = areDivisionIdsCorrect(
      answer,
      expectedAnswers
    );

    const correctDisplay = options
      .filter((option) => expectedIds.has(option.id))
      .map((option) => option.equation)
      .join(", ");

    const toggleOption = (optionId: string) => {
      const nextIds = new Set(selectedIds);

      if (nextIds.has(optionId)) {
        nextIds.delete(optionId);
      } else {
        nextIds.add(optionId);
      }

      
      updateAnswer(Array.from(nextIds).sort().join(","));
    };

    return (
      <section className="divisionfact_game__container">
        <div className="divisionfact_game__card divisionfact_game__card--target">
          {/* {renderHeading()} */}
        
          <p className="divisionfact_game__prompt">
            {questionText}
          </p>

          {/* <div
            className="divisionfact_game__target"
            aria-label={`Target quotient ${gameData.targetQuotient ?? ""}`}
          >
            <span className="divisionfact_game__target-label">
              TARGET QUOTIENT
            </span>

            <strong className="divisionfact_game__target-number">
              {gameData.targetQuotient}
            </strong>
          </div> */}

          <div
            className="divisionfact_game__options"
            role="group"
            aria-label="Choose division equations"
          >
            {options.map((option) => {
              const selected = selectedIds.has(option.id);
              const isCorrectOption = expectedIds.has(option.id);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={[
                    "divisionfact_game__option",
                    selected
                      ? "divisionfact_game__option--selected"
                      : "",
                    showAnswers && isCorrectOption
                      ? "divisionfact_game__option--correct"
                      : "",
                    showAnswers && selected && !isCorrectOption
                      ? "divisionfact_game__option--incorrect"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleOption(option.id)}
                  disabled={showAnswers}
                  aria-pressed={selected}
                >
                  <span className="divisionfact_game__option-id">
                    {option.id}
                  </span>

                  <strong className="divisionfact_game__option-equation">
                    {option.equation}
                  </strong>

                  {showAnswers && isCorrectOption && (
                    <CircleCheck size={19} />
                  )}
                </button>
              );
            })}
          </div>

          <DivisionGameFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correct={allCorrectSelected}
            answerDisplay={correctDisplay || expectedAnswers.join(",")}
          />
        </div>
      </section>
    );
  }

 

  if (questionType === "DIVISION_REPEATED_SUBTRACTION_TRACE") {
    const steps = Array.isArray(gameData.steps)
      ? gameData.steps
      : [];

    const divisor = Number(gameData.divisor ?? 0);

    const correct = isNumericAnswerCorrect(
      answer,
      expectedAnswers
    );

    return (
      <section className="divisionfact_game__container">
        <div className="divisionfact_game__card divisionfact_game__card--trace">
          {/* {renderHeading()} */}

          <p className="divisionfact_game__prompt">
            {questionText}
          </p>

          <div className="divisionfact_game__trace-summary">
            <div className="divisionfact_game__trace-summary-item">
              <span className="divisionfact_game__trace-summary-label">
                START
              </span>

              <strong className="divisionfact_game__trace-summary-number">
                {gameData.dividend}
              </strong>
            </div>

            <div className="divisionfact_game__trace-summary-divider" />

            <div className="divisionfact_game__trace-summary-item">
              <span className="divisionfact_game__trace-summary-label">
                SUBTRACT EACH TIME
              </span>

              <strong className="divisionfact_game__trace-summary-number">
                − {divisor}
              </strong>
            </div>
          </div>

          <div className="divisionfact_game__trace-heading">
            <strong>Follow the subtraction trail</strong>
          </div>

          <div className="divisionfact_game__trace">
            {steps.map((step, index) => (
              <React.Fragment key={`division-trace-${index}`}>
                <div
                  className={[
                    "divisionfact_game__trace-step",
                    step === 0
                      ? "divisionfact_game__trace-step--zero"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="divisionfact_game__trace-step-index">
                    {index === 0
                      ? "START"
                      : index === steps.length - 1
                        ? "FINISH"
                        : `STEP ${index}`}
                  </span>

                  <strong className="divisionfact_game__trace-number">
                    {step}
                  </strong>
                </div>

                {index < steps.length - 1 && (
                  <div className="divisionfact_game__trace-connector">
                    <span className="divisionfact_game__trace-operation">
                      − {divisor}
                    </span>

                    <ArrowDown size={18} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="divisionfact_game__answer-area">
            <label className="divisionfact_game__answer-label">
              Number of subtraction jumps
            </label>

            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className="divisionfact_game__answer-input"
              value={answer}
              onChange={(event) =>
                updateAnswer(event.target.value)
              }
              placeholder="Enter the number of jumps"
              disabled={showAnswers}
              aria-label="Number of subtraction jumps"
            />
          </div>

          <DivisionGameFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correct={correct}
            answerDisplay={expectedAnswers[0] ?? ""}
          />
        </div>
      </section>
    );
  }

 

  if (questionType === "DIVISION_QUOTIENT_PATTERN_GROUPING") {
    const rows = Array.isArray(gameData.rows)
      ? gameData.rows
      : [];

    const correct = isNumericAnswerCorrect(
      answer,
      expectedAnswers
    );

    return (
      <section className="divisionfact_game__container">
        <div className="divisionfact_game__card divisionfact_game__card--pattern">

          <p className="divisionfact_game__prompt">
            {questionText}
          </p>

          <div className="divisionfact_game__pattern-table">
            {rows.map((row, index) => {
              const isMissing = row.quotient === null;

              return (
                <div
                  key={row.id}
                  className={[
                    "divisionfact_game__pattern-row",
                    isMissing
                      ? "divisionfact_game__pattern-row--missing"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="divisionfact_game__pattern-index">
                    {index + 1}
                  </span>

                  <strong className="divisionfact_game__pattern-equation">
                    {row.equation}
                  </strong>

                  <span className="divisionfact_game__pattern-equals">
                    =
                  </span>

                  {isMissing ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      className="divisionfact_game__pattern-input"
                      value={
                        showAnswers
                          ? expectedAnswers[0] ?? ""
                          : answer
                      }
                      onChange={(event) =>
                        updateAnswer(event.target.value)
                      }
                      placeholder="?"
                      disabled={showAnswers}
                      aria-label="Missing quotient"
                    />
                  ) : (
                    <strong className="divisionfact_game__pattern-quotient">
                      {row.quotient}
                    </strong>
                  )}
                </div>
              );
            })}
          </div>

          <DivisionGameFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correct={correct}
            answerDisplay={expectedAnswers[0] ?? ""}
          />
        </div>
      </section>
    );
  }

  return (
    <div className="divisionfact_game__unsupported">
      Unsupported division game type: {questionType || "Unknown"}
    </div>
  );
}