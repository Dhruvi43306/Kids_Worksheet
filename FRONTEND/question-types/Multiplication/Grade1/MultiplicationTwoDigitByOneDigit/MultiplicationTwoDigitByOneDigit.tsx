import React from "react";
import {
  CheckCircle2,
  Columns3,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type VerticalLayoutData = {
  topLine?: string;
  operatorLine?: string;
  separatorLine?: string;
  answerLine?: string;
};

type MultiplicationTwoDigitData = {
  renderKey?: string;
  questionType?: string;
  title?: string;
  layout?: "horizontal" | "vertical";
  firstNumber?: number;
  secondNumber?: number;
  equation?: string;
  verticalLayout?: VerticalLayoutData;
  answerMode?: string;
  answerType?: string;
};

type QuestionMetadata = {
  questionText?: string;
  questionTypeCode?: string;
  code?: string;
  questionNumber?: number;
  questionId?: number | string;
};

function isAnswerCorrect(
  answer: string,
  correctAnswers: string[]
): boolean {
  if (!answer.trim() || correctAnswers.length === 0) {
    return false;
  }

  const userNumber = Number(answer);

  if (!Number.isFinite(userNumber)) {
    return false;
  }

  return correctAnswers.some((correctAnswer) => {
    const expectedNumber = Number(correctAnswer);

    return (
      Number.isFinite(expectedNumber) &&
      userNumber === expectedNumber
    );
  });
}

function MultiplicationTwoDigitFeedback({
  showAnswers,
  answer,
  correctAnswers,
}: {
  showAnswers: boolean;
  answer: string;
  correctAnswers: string[];
}) {
  if (!showAnswers) return null;

  const correct = isAnswerCorrect(answer, correctAnswers);

  return (
    <div
      className={[
        "multiplication_two_digit_by_one_digit__feedback",
        correct
          ? "multiplication_two_digit_by_one_digit__feedback--correct"
          : "multiplication_two_digit_by_one_digit__feedback--incorrect",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className="multiplication_two_digit_by_one_digit__feedback-heading">
        {correct ? (
          <CheckCircle2 size={20} />
        ) : (
          <XCircle size={20} />
        )}

        <strong>
          {correct
            ? "Correct!"
            : answer.trim()
              ? "Not quite. Here is the correct product."
              : "No answer entered. Here is the correct product."}
        </strong>
      </div>

      <div className="multiplication_two_digit_by_one_digit__feedback-answer">
        <span>Correct product</span>
        <AnswerBox answer={correctAnswers[0] ?? ""} />
      </div>
    </div>
  );
}

export default function Grade1MultiplicationTwoDigitByOneDigit({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const multiplicationData =
    data as unknown as MultiplicationTwoDigitData;

  const metadata = question as unknown as QuestionMetadata;

  const questionType = String(
    multiplicationData.questionType ??
      metadata.questionTypeCode ??
      metadata.code ??
      ""
  ).toUpperCase();

  const renderKey = multiplicationData.renderKey ?? "";

  const firstNumber = multiplicationData.firstNumber ?? 0;
  const secondNumber = multiplicationData.secondNumber ?? 0;

  const layout =
    multiplicationData.layout === "vertical"
      ? "vertical"
      : "horizontal";

  const answer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const inputId = `multiplication_two_digit_by_one_digit__answer-${metadata.questionId ?? metadata.questionNumber ?? questionType}`;

  const updateAnswer = (value: string) => {
    if (showAnswers) return;
    onAnswerChange(value);
  };

  const title =
    multiplicationData.title ?? "Two-Digit Multiplication";

  const verticalData = multiplicationData.verticalLayout;

  /*
   * Both backend question codes share the same renderKey.
   * layout controls which calculation UI appears.
   */
  if (
    renderKey !== "MultiplicationTwoDigitByOneDigitHorizontalOrVertical" &&
    ![
      "MULTIPLICATION_TWO_DIGIT_BY_ONE_DIGIT_HORIZONTAL",
      "MULTIPLICATION_TWO_DIGIT_BY_ONE_DIGIT_VERTICAL",
    ].includes(questionType)
  ) {
    return (
      <div className="multiplication_two_digit_by_one_digit__unsupported">
        Unsupported multiplication layout: {questionType || "Unknown"}
      </div>
    );
  }

  return (
    <section className="multiplication_two_digit_by_one_digit__container">
      <div
        className={[
          "multiplication_two_digit_by_one_digit__card",
          layout === "vertical"
            ? "multiplication_two_digit_by_one_digit__card--vertical"
            : "multiplication_two_digit_by_one_digit__card--horizontal",
        ].join(" ")}
      >
        <div className="multiplication_two_digit_by_one_digit__heading">
          <div className="multiplication_two_digit_by_one_digit__heading-icon">
            <Columns3 size={23} />
          </div>

          <div className="multiplication_two_digit_by_one_digit__heading-content">
           

            <h3 className="multiplication_two_digit_by_one_digit__title">
              {title}
            </h3>
          </div>
        </div>

        {layout === "horizontal" ? (
          <div className="multiplication_two_digit_by_one_digit__horizontal-workspace">
            <div className="multiplication_two_digit_by_one_digit__horizontal-equation">
              <span className="multiplication_two_digit_by_one_digit__operand">
                {firstNumber}
              </span>

              <span className="multiplication_two_digit_by_one_digit__operator">
                ×
              </span>

              <span className="multiplication_two_digit_by_one_digit__operand">
                {secondNumber}
              </span>

              <span className="multiplication_two_digit_by_one_digit__operator">
                =
              </span>

              {showAnswers ? (
                <strong className="multiplication_two_digit_by_one_digit__revealed-product">
                  {expectedAnswers[0] ?? ""}
                </strong>
              ) : (
                <input
                  id={inputId}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="multiplication_two_digit_by_one_digit__horizontal-input"
                  value={answer}
                  onChange={(event) =>
                    updateAnswer(event.target.value)
                  }
                  placeholder="?"
                  disabled={showAnswers}
                  aria-label="Multiplication product"
                />
              )}
            </div>

            <div className="multiplication_two_digit_by_one_digit__work-hint">
              Multiply the two numbers to find the product.
            </div>
          </div>
        ) : (
          <div className="multiplication_two_digit_by_one_digit__vertical-workspace">
            <div className="multiplication_two_digit_by_one_digit__vertical-paper">
              <div className="multiplication_two_digit_by_one_digit__vertical-label">
                SOLVE VERTICALLY
              </div>

              <div className="multiplication_two_digit_by_one_digit__vertical-calculation">
                <div className="multiplication_two_digit_by_one_digit__vertical-first-row">
                  <span className="multiplication_two_digit_by_one_digit__vertical-placeholder" />
                  <strong>
                    {verticalData?.topLine ?? String(firstNumber)}
                  </strong>
                </div>

                <div className="multiplication_two_digit_by_one_digit__vertical-second-row">
                  <span className="multiplication_two_digit_by_one_digit__vertical-operator">
                    ×
                  </span>

                  <strong>
                    {verticalData?.operatorLine?.replace(/^×\s*/, "") ??
                      String(secondNumber)}
                  </strong>
                </div>

                <div
                  className="multiplication_two_digit_by_one_digit__vertical-separator"
                  aria-hidden="true"
                />

                <div className="multiplication_two_digit_by_one_digit__vertical-answer-row">
                  <span className="multiplication_two_digit_by_one_digit__vertical-placeholder" />

                  {showAnswers ? (
                    <strong className="multiplication_two_digit_by_one_digit__revealed-product">
                      {expectedAnswers[0] ?? ""}
                    </strong>
                  ) : (
                    <input
                      id={inputId}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      className="multiplication_two_digit_by_one_digit__vertical-input"
                      value={answer}
                      onChange={(event) =>
                        updateAnswer(event.target.value)
                      }
                      placeholder="?"
                      disabled={showAnswers}
                      aria-label="Vertical multiplication product"
                    />
                  )}
                </div>
              </div>
            </div>

            <p className="multiplication_two_digit_by_one_digit__work-hint">
              Write the product below the line.
            </p>
          </div>
        )}

        <MultiplicationTwoDigitFeedback
          showAnswers={showAnswers}
          answer={answer}
          correctAnswers={expectedAnswers}
        />
      </div>
    </section>
  );
}