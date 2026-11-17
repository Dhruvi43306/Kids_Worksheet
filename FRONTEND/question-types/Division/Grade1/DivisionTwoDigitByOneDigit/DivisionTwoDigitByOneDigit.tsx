import React from "react";
import {
  CheckCircle2,
  Divide,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type VerticalDivisionData = {
  divisor?: number;
  dividend?: number;
  quotient?: string | number;
  notation?: string;
};

type DivisionData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  layout?: "horizontal" | "vertical";
  firstNumber?: number;
  secondNumber?: number;
  equation?: string;

  verticalLayout?: VerticalDivisionData;

  answerMode?: string;
  answerType?: string;
};

type QuestionMetadata = {
  questionTypeCode?: string;
  code?: string;
  questionId?: number | string;
  generatedQuestionId?: number | string;
  questionNumber?: number;
};

function isCorrectDivisionAnswer(
  userAnswer: string,
  correctAnswers: string[]
): boolean {
  if (!userAnswer.trim() || correctAnswers.length === 0) {
    return false;
  }

  const actual = Number(userAnswer);

  if (!Number.isFinite(actual)) {
    return false;
  }

  return correctAnswers.some((item) => {
    const expected = Number(item);

    return Number.isFinite(expected) && actual === expected;
  });
}

function DivisionTwoDigitFeedback({
  showAnswers,
  answer,
  correctAnswers,
}: {
  showAnswers: boolean;
  answer: string;
  correctAnswers: string[];
}) {
  if (!showAnswers) return null;

  const correct = isCorrectDivisionAnswer(
    answer,
    correctAnswers
  );

  return (
    <div
      className={[
        "division_two_digit_by_one_digit__feedback",
        correct
          ? "division_two_digit_by_one_digit__feedback--correct"
          : "division_two_digit_by_one_digit__feedback--incorrect",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="division_two_digit_by_one_digit__feedback-heading">
        {correct ? (
          <CheckCircle2 size={20} />
        ) : (
          <XCircle size={20} />
        )}

        <strong>
          {correct
            ? "Correct!"
            : answer.trim()
              ? "Not quite. Here is the correct quotient."
              : "No answer entered. Here is the correct quotient."}
        </strong>
      </div>

      <div className="division_two_digit_by_one_digit__feedback-answer">
        <span>Correct quotient</span>
        <AnswerBox answer={correctAnswers[0] ?? ""} />
      </div>
    </div>
  );
}

export default function Grade1DivisionTwoDigitByOneDigit({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const divisionData = data as unknown as DivisionData;

  const metadata = question as unknown as QuestionMetadata;

  const questionType = String(
    divisionData.questionType ??
      metadata.questionTypeCode ??
      metadata.code ??
      ""
  ).toUpperCase();

  const renderKey = divisionData.renderKey ?? "";

  const isVertical =
    divisionData.layout === "vertical" ||
    questionType === "DIVISION_TWO_DIGIT_BY_ONE_DIGIT_VERTICAL";

  const isHorizontal =
    divisionData.layout === "horizontal" ||
    questionType === "DIVISION_TWO_DIGIT_BY_ONE_DIGIT_HORIZONTAL";

  const firstNumber = divisionData.firstNumber ?? 0;
  const secondNumber = divisionData.secondNumber ?? 0;

  const divisor =
    divisionData.verticalLayout?.divisor ?? secondNumber;

  const dividend =
    divisionData.verticalLayout?.dividend ?? firstNumber;

  const answer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const inputId = `division_two_digit_by_one_digit__answer-${metadata.generatedQuestionId ?? metadata.questionId ?? metadata.questionNumber ?? questionType}`;

  const updateAnswer = (value: string) => {
    if (showAnswers) return;

    onAnswerChange(value);
  };

  if (
    renderKey !== "DivisionTwoDigitByOneDigit" &&
    !isVertical &&
    !isHorizontal
  ) {
    return (
      <div className="division_two_digit_by_one_digit__unsupported">
        Unsupported division question type: {questionType || "Unknown"}
      </div>
    );
  }

  return (
    <section className="division_two_digit_by_one_digit__container">
      <div
        className={[
          "division_two_digit_by_one_digit__card",
          isVertical
            ? "division_two_digit_by_one_digit__card--vertical"
            : "division_two_digit_by_one_digit__card--horizontal",
        ].join(" ")}
      >
        <div className="division_two_digit_by_one_digit__heading">
          <div className="division_two_digit_by_one_digit__heading-icon">
            <Divide size={23} />
          </div>

          <div className="division_two_digit_by_one_digit__heading-content">
          
            <h3 className="division_two_digit_by_one_digit__title">
              {divisionData.title ?? "Two-Digit Division"}
            </h3>
          </div>
        </div>

        {isHorizontal && (
          <div className="division_two_digit_by_one_digit__horizontal-workspace">
            <div className="division_two_digit_by_one_digit__horizontal-equation">
              <strong className="division_two_digit_by_one_digit__horizontal-number">
                {firstNumber}
              </strong>

              <span className="division_two_digit_by_one_digit__division-symbol">
                ÷
              </span>

              <strong className="division_two_digit_by_one_digit__horizontal-number">
                {secondNumber}
              </strong>

              <span className="division_two_digit_by_one_digit__equals">
                =
              </span>

              {showAnswers ? (
                <strong className="division_two_digit_by_one_digit__revealed-answer">
                  {expectedAnswers[0] ?? ""}
                </strong>
              ) : (
                <input
                  id={inputId}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="division_two_digit_by_one_digit__horizontal-input"
                  value={answer}
                  onChange={(event) =>
                    updateAnswer(event.target.value)
                  }
                  placeholder="?"
                  disabled={showAnswers}
                  aria-label="Division quotient"
                />
              )}
            </div>

            <div className="division_two_digit_by_one_digit__work-hint">
              Find the quotient.
            </div>
          </div>
        )}

        {isVertical && (
          <div className="division_two_digit_by_one_digit__vertical-workspace">
            <div className="division_two_digit_by_one_digit__vertical-paper">
              <span className="division_two_digit_by_one_digit__vertical-label">
                LONG DIVISION
              </span>

              <div className="division_two_digit_by_one_digit__long-division">
                <div className="division_two_digit_by_one_digit__quotient-row">
                  <span aria-hidden="true" />

                  <span aria-hidden="true" />

                  <div className="division_two_digit_by_one_digit__quotient-column">
                    <label
                      className="division_two_digit_by_one_digit__quotient-label"
                      htmlFor={inputId}
                    >
                      QUOTIENT
                    </label>

                    {showAnswers ? (
                      <strong className="division_two_digit_by_one_digit__revealed-answer division_two_digit_by_one_digit__vertical-revealed-answer">
                        {expectedAnswers[0] ?? ""}
                      </strong>
                    ) : (
                      <input
                        id={inputId}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        className="division_two_digit_by_one_digit__vertical-input"
                        value={answer}
                        onChange={(event) =>
                          updateAnswer(event.target.value)
                        }
                        placeholder="?"
                        disabled={showAnswers}
                        aria-label="Long division quotient"
                      />
                    )}
                  </div>
                </div>

                <div className="division_two_digit_by_one_digit__division-row">
                  <strong className="division_two_digit_by_one_digit__divisor">
                    {divisor}
                  </strong>

                  <span className="division_two_digit_by_one_digit__division-bracket">
                    )
                  </span>

                  <strong className="division_two_digit_by_one_digit__dividend">
                    {dividend}
                  </strong>
                </div>
              </div>
            </div>

            <p className="division_two_digit_by_one_digit__work-hint">
              Write the quotient above the dividend.
            </p>
          </div>
        )}

        <DivisionTwoDigitFeedback
          showAnswers={showAnswers}
          answer={answer}
          correctAnswers={expectedAnswers}
        />
      </div>
    </section>
  );
}