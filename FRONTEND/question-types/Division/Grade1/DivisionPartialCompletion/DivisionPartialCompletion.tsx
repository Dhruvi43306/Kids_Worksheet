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

type DivisionMachineExample = {
  input: number;
  output: number;
};

type DivisionTableRow = {
  dividend: number;
  divisor: number;
  quotient: number | null;
};

type DivisionPartialData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  rule?: string;
  input?: number;
  output?: number | null;
  knownExamples?: DivisionMachineExample[];

  rows?: DivisionTableRow[];
  missingQuotient?: number;

  answerMode?: string;
  answerType?: string;
};

type DivisionQuestionMetadata = {
  questionText?: string;
  questionTypeCode?: string;
  code?: string;
};

function normalizeDivisionAnswer(value: unknown): string {
  return String(value ?? "").trim();
}

function isDivisionAnswerCorrect(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  if (!userAnswer.trim() || correctAnswers.length === 0) {
    return false;
  }

  const userValue = Number(userAnswer);

  if (!Number.isFinite(userValue)) {
    return false;
  }

  return correctAnswers.some((correctAnswer) => {
    const expectedValue = Number(
      normalizeDivisionAnswer(correctAnswer)
    );

    return (
      Number.isFinite(expectedValue) &&
      userValue === expectedValue
    );
  });
}

function DivisionPartialFeedback({
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

  const isCorrect = isDivisionAnswerCorrect(
    userAnswer,
    correctAnswers
  );

  return (
    <div
      className={[
        "division_partial_completion__feedback",
        isCorrect
          ? "division_partial_completion__feedback--correct"
          : "division_partial_completion__feedback--incorrect",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="division_partial_completion__feedback-heading">
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

      <div className="division_partial_completion__feedback-answer">
        <span>{answerLabel}</span>
        <AnswerBox answer={correctAnswers[0] ?? ""} />
      </div>
    </div>
  );
}

export default function Grade1DivisionPartialCompletion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const divisionData = data as unknown as DivisionPartialData;

  const questionMetadata =
    question as unknown as DivisionQuestionMetadata;

  const questionType = String(
    divisionData.questionType ??
      questionMetadata.questionTypeCode ??
      questionMetadata.code ??
      ""
  ).toUpperCase();

  const renderKey = divisionData.renderKey ?? "";
  const answer = normalizeDivisionAnswer(userAnswer);

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const questionText = questionMetadata.questionText ?? "";

  const updateAnswer = (nextAnswer: string) => {
    if (showAnswers) return;

    onAnswerChange(nextAnswer);
  };

  const renderHeading = (
    icon: React.ReactNode,
    title: string,
    eyebrow: string
  ) => (
    <div className="division_partial_completion__heading">
      <div className="division_partial_completion__heading-icon">
        {icon}
      </div>

      <div className="division_partial_completion__heading-content">
        <span className="division_partial_completion__eyebrow">
          {eyebrow}
        </span>

        <h3 className="division_partial_completion__title">
          {title}
        </h3>
      </div>
    </div>
  );

  /* =====================================================
     1. DIVISION_INPUT_OUTPUT_MACHINE
     RenderKey: DivisionPartialCompletion
  ===================================================== */

  if (
    renderKey === "DivisionPartialCompletion" &&
    questionType === "DIVISION_INPUT_OUTPUT_MACHINE"
  ) {
    const examples = divisionData.knownExamples ?? [];

    return (
      <section className="division_partial_completion__container">
        <div className="division_partial_completion__card division_partial_completion__card--machine">
          {/* {renderHeading(
            <Cpu size={23} />,
            divisionData.title ?? "Division Machine",
            "INPUT · RULE · OUTPUT"
          )} */}

          {questionText && (
            <p className="division_partial_completion__prompt">
              {questionText}
            </p>
          )}

          <div className="division_partial_completion__machine">
            <div className="division_partial_completion__machine-input-panel">
              <span className="division_partial_completion__machine-label">
                INPUT
              </span>

              <strong className="division_partial_completion__machine-number">
                {divisionData.input ?? "?"}
              </strong>
            </div>

            <div className="division_partial_completion__machine-connector">
              <ArrowRight size={23} />
            </div>

            <div className="division_partial_completion__machine-body">
              <div className="division_partial_completion__machine-icon">
                <Cpu size={27} />
              </div>

              <span className="division_partial_completion__machine-body-label">
                MACHINE RULE
              </span>

              <strong className="division_partial_completion__machine-rule">
                {divisionData.rule ?? "÷ ?"}
              </strong>
            </div>

            <div className="division_partial_completion__machine-connector">
              <ArrowRight size={23} />
            </div>

            <div className="division_partial_completion__machine-output-panel">
              <span className="division_partial_completion__machine-label">
                OUTPUT
              </span>

              {showAnswers ? (
                <strong className="division_partial_completion__machine-number division_partial_completion__machine-number--revealed">
                  {expectedAnswers[0] ?? ""}
                </strong>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="division_partial_completion__machine-output-input"
                  value={answer}
                  onChange={(event) =>
                    updateAnswer(event.target.value)
                  }
                  placeholder="?"
                  disabled={showAnswers}
                  aria-label="Division machine output"
                />
              )}
            </div>
          </div>

          {examples.length > 0 && (
            <div className="division_partial_completion__examples">
              {/* <h4 className="division_partial_completion__section-title">
                Known examples
              </h4> */}

              {/* <div className="division_partial_completion__examples-grid">
                {examples.map((example, index) => (
                  <div
                    key={`division-example-${index}`}
                    className="division_partial_completion__example-card"
                  >
                    <div className="division_partial_completion__example-value">
                      <span>Input</span>
                      <strong>{example.input}</strong>
                    </div>

                    <ArrowRight
                      className="division_partial_completion__example-arrow"
                      size={19}
                    />

                    <div className="division_partial_completion__example-value">
                      <span>Output</span>
                      <strong>{example.output}</strong>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          )}

          <DivisionPartialFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correctAnswers={expectedAnswers}
            answerLabel="Correct division output"
          />
        </div>
      </section>
    );
  }

  /* =====================================================
     2. DIVISION_PARTIAL_TABLE_COMPLETION
     RenderKey: DivisionPartialCompletion
  ===================================================== */

  if (
    renderKey === "DivisionPartialCompletion" &&
    questionType === "DIVISION_PARTIAL_TABLE_COMPLETION"
  ) {
    const rows = divisionData.rows ?? [];

    const missingRow = rows.find(
      (row) => row.quotient === null
    );

    const divisor =
      missingRow?.divisor ??
      rows[0]?.divisor ??
      0;

    const correctAnswer = expectedAnswers[0] ?? "";

    return (
      <section className="division_partial_completion__container">
        <div className="division_partial_completion__card division_partial_completion__card--table">
          {/* {renderHeading(
            <Grid3X3 size={23} />,
            divisionData.title ?? "Complete the Division Table",
            "DIVISION TABLE"
          )} */}

          {questionText && (
            <p className="division_partial_completion__prompt">
              {questionText}
            </p>
          )}

          {/* <div className="division_partial_completion__table-rule">
            <span className="division_partial_completion__table-rule-label">
              DIVIDE BY
            </span>

            <strong className="division_partial_completion__table-rule-number">
              {divisor}
            </strong>
          </div> */}

          <div className="division_partial_completion__table-wrapper">
            <table className="division_partial_completion__table">
              <thead>
                <tr>
                  <th scope="col">Dividend</th>
                  <th scope="col">Divisor</th>
                  <th scope="col">Quotient</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => {
                  const isMissing = row.quotient === null;

                  return (
                    <tr
                      key={`division-row-${index}`}
                      className={
                        isMissing
                          ? "division_partial_completion__table-row--missing"
                          : ""
                      }
                    >
                      <td>
                        <span className="division_partial_completion__table-number">
                          {row.dividend}
                        </span>
                      </td>

                      <td>
                        <span className="division_partial_completion__table-number">
                          {row.divisor}
                        </span>
                      </td>

                      <td>
                        {isMissing ? (
                          showAnswers ? (
                            <span className="division_partial_completion__table-answer">
                              {correctAnswer}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              className="division_partial_completion__table-input"
                              value={answer}
                              onChange={(event) =>
                                updateAnswer(event.target.value)
                              }
                              placeholder="?"
                              disabled={showAnswers}
                              aria-label={`Missing quotient for ${row.dividend} divided by ${row.divisor}`}
                            />
                          )
                        ) : (
                          <span className="division_partial_completion__table-number division_partial_completion__table-number--quotient">
                            {row.quotient}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <DivisionPartialFeedback
            showAnswers={showAnswers}
            userAnswer={answer}
            correctAnswers={expectedAnswers}
            answerLabel="Missing quotient"
          />
        </div>
      </section>
    );
  }

  return (
    <div className="division_partial_completion__unsupported">
      Unsupported division partial-completion type:{" "}
      {questionType || "Unknown"}
    </div>
  );
}