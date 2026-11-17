import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Grid3X3,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type MachineExample = {
  input: number;
  output: number;
};

type PartialCompletionData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  rule?: string;
  input?: number;
  output?: number | null;
  knownExamples?: MachineExample[];

  rowFactor?: number;
  columnHeaders?: number[];
  cells?: (number | null)[];
  missingColumn?: number;

  answerMode?: string;
  answerType?: string;
};

type QuestionMetadata = {
  questionText?: string;
  questionTypeCode?: string;
  code?: string;
};

function normalizeNumber(value: unknown): string {
  return String(value ?? "").trim();
}

function isAnswerCorrect(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  const userValue = normalizeNumber(userAnswer);

  if (!userValue || correctAnswers.length === 0) {
    return false;
  }

  const numericUserValue = Number(userValue);

  return correctAnswers.some((correctAnswer) => {
    const expectedValue = normalizeNumber(correctAnswer);

    if (!expectedValue) return false;

    const numericExpectedValue = Number(expectedValue);

    if (
      Number.isFinite(numericUserValue) &&
      Number.isFinite(numericExpectedValue)
    ) {
      return numericUserValue === numericExpectedValue;
    }

    return userValue === expectedValue;
  });
}

function PartialCompletionFeedback({
  showAnswers,
  userAnswer,
  correctAnswers,
  answerLabel,
}: {
  showAnswers: boolean;
  userAnswer: string;
  correctAnswers: string[];
  answerLabel: string;
}) {
  if (!showAnswers) return null;

  const isCorrect = isAnswerCorrect(
    userAnswer,
    correctAnswers
  );

  const correctAnswer = correctAnswers[0] ?? "";

  return (
    <div
      className={[
        "multiplication_partial_completion__feedback",
        isCorrect
          ? "multiplication_partial_completion__feedback--correct"
          : "multiplication_partial_completion__feedback--incorrect",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="multiplication_partial_completion__feedback-heading">
        {isCorrect ? (
          <CheckCircle2 size={20} />
        ) : (
          <XCircle size={20} />
        )}

        <strong>
          {isCorrect
            ? "Correct!"
            : userAnswer.trim()
              ? "Not quite. Check the correct answer."
              : "No answer entered. Here is the correct answer."}
        </strong>
      </div>

      <div className="multiplication_partial_completion__feedback-answer">
        <span>{answerLabel}</span>
        <AnswerBox answer={correctAnswer} />
      </div>
    </div>
  );
}

export default function Grade1MultiplicationPartialCompletion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const partialData = data as unknown as PartialCompletionData;

  const questionMetadata = question as unknown as QuestionMetadata;

  const questionType = String(
    partialData.questionType ??
      questionMetadata.questionTypeCode ??
      questionMetadata.code ??
      ""
  ).toUpperCase();

  const renderKey = partialData.renderKey ?? "";

  const answer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const questionText = questionMetadata.questionText ?? "";

  const updateAnswer = (value: string) => {
    if (showAnswers) return;

    onAnswerChange(value);
  };

  const renderHeading = (
    icon: React.ReactNode,
    title: string,
    eyebrow: string
  ) => (
    <div className="multiplication_partial_completion__heading">
      <div className="multiplication_partial_completion__heading-icon">
        {icon}
      </div>

      <div className="multiplication_partial_completion__heading-content">
        <span className="multiplication_partial_completion__eyebrow">
          {eyebrow}
        </span>

        <h3 className="multiplication_partial_completion__title">
          {title}
        </h3>
      </div>
    </div>
  );

  /* =====================================================
     1. MULTIPLICATION_INPUT_OUTPUT_MACHINE
     RenderKey: MultiplicationPartialCompletion
  ===================================================== */

  if (
    renderKey === "MultiplicationPartialCompletion" &&
    questionType === "MULTIPLICATION_INPUT_OUTPUT_MACHINE"
  ) {
    const knownExamples = partialData.knownExamples ?? [];

    return (
      <section className="multiplication_partial_completion__container">
        <div className="multiplication_partial_completion__card multiplication_partial_completion__card--machine">
        
          {questionText && (
             
            <p className="multiplication_partial_completion__prompt">
               
              {questionText}
            </p>
          )}

          <div className="multiplication_partial_completion__machine">
            <div className="multiplication_partial_completion__machine-input">
              <span className="multiplication_partial_completion__machine-label">
                INPUT
              </span>

              <strong className="multiplication_partial_completion__machine-number">
                {partialData.input ?? "?"}
              </strong>
            </div>

            <div className="multiplication_partial_completion__machine-connector">
              <ArrowRight size={23} />
            </div>

            <div className="multiplication_partial_completion__machine-body">
              <div className="multiplication_partial_completion__machine-icon">
                <Cpu size={28} />
              </div>

              <span className="multiplication_partial_completion__machine-body-label">
                MACHINE RULE
              </span>

              <strong className="multiplication_partial_completion__machine-rule">
                {partialData.rule ?? "× ?"}
              </strong>
            </div>

            <div className="multiplication_partial_completion__machine-connector">
              <ArrowRight size={23} />
            </div>

            <div className="multiplication_partial_completion__machine-output">
              <span className="multiplication_partial_completion__machine-label">
                OUTPUT
              </span>

              {showAnswers ? (
                <strong className="multiplication_partial_completion__machine-number multiplication_partial_completion__machine-number--revealed">
                  {expectedAnswers[0] ?? ""}
                </strong>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="multiplication_partial_completion__machine-input"
                  value={answer}
                  onChange={(event) =>
                    updateAnswer(event.target.value)
                  }
                  placeholder="?"
                  disabled={showAnswers}
                  aria-label="Machine output"
                />
              )}
            </div>
          </div>

          {knownExamples.length > 0 && (
            <div className="multiplication_partial_completion__examples">
              {/* <h4 className="multiplication_partial_completion__section-title">
                Machine examples
              </h4> */}

              <div className="multiplication_partial_completion__examples-grid">
                {/* {knownExamples.map((example, index) => (
                  <div
                    key={`machine-example-${index}`}
                    className="multiplication_partial_completion__example-card"
                  >
                    <div className="multiplication_partial_completion__example-value">
                      <span>Input</span>
                      <strong>{example.input}</strong>
                    </div>

                    <ArrowRight
                      className="multiplication_partial_completion__example-arrow"
                      size={19}
                    />

                    <div className="multiplication_partial_completion__example-value">
                      <span>Output</span>
                      <strong>{example.output}</strong>
                    </div>
                  </div>
                ))} */}
              </div>
            </div>
          )}

          <PartialCompletionFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correctAnswers={expectedAnswers}
            answerLabel="Correct machine output"
          />
        </div>
      </section>
    );
  }

  /* =====================================================
     2. MULTIPLICATION_TABLE_COMPLETION
     RenderKey: MultiplicationPartialCompletion
  ===================================================== */

  if (
    renderKey === "MultiplicationPartialCompletion" &&
    questionType === "MULTIPLICATION_TABLE_COMPLETION"
  ) {
    const rowFactor = partialData.rowFactor ?? 1;

    const columnHeaders = partialData.columnHeaders ?? [
      2,
      3,
      4,
    ];

    const missingColumn = partialData.missingColumn;

    const cells =
      partialData.cells ??
      columnHeaders.map((column) =>
        column === missingColumn ? null : rowFactor * column
      );

    const resolvedMissingColumn =
      missingColumn ??
      columnHeaders.find(
        (_, index) => cells[index] === null
      );

    return (
      <section className="multiplication_partial_completion__container">
        <div className="multiplication_partial_completion__card multiplication_partial_completion__card--table">
        

          {questionText && (
            <p className="multiplication_partial_completion__prompt">
              {questionText}
            </p>
          )}

          <div className="multiplication_partial_completion__table-wrapper">
            <table className="multiplication_partial_completion__table">
              <thead>
                <tr>
                  <th scope="col">×</th>

                  {columnHeaders.map((column) => (
                    <th
                      key={`table-heading-${column}`}
                      scope="col"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th scope="row">{rowFactor}</th>

                  {columnHeaders.map((column, index) => {
                    const cellValue = cells[index];
                    const isMissing =
                      cellValue === null ||
                      cellValue === undefined ||
                      column === resolvedMissingColumn;

                    return (
                      <td
                        key={`table-cell-${column}`}
                        className={
                          isMissing
                            ? "multiplication_partial_completion__table-cell--missing"
                            : ""
                        }
                      >
                        {isMissing ? (
                          showAnswers ? (
                            <span className="multiplication_partial_completion__table-answer">
                              {expectedAnswers[0] ?? ""}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              className="multiplication_partial_completion__table-input"
                              value={answer}
                              onChange={(event) =>
                                updateAnswer(event.target.value)
                              }
                              placeholder="?"
                              disabled={showAnswers}
                              aria-label={`Missing product for ${rowFactor} times ${column}`}
                            />
                          )
                        ) : (
                          <span className="multiplication_partial_completion__table-value">
                            {cellValue}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <PartialCompletionFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correctAnswers={expectedAnswers}
            answerLabel="Missing product"
          />
        </div>
      </section>
    );
  }

  return (
    <div className="multiplication_partial_completion__unsupported">
      Unsupported multiplication partial-completion type:{" "}
      {questionType || "Unknown"}
    </div>
  );
}