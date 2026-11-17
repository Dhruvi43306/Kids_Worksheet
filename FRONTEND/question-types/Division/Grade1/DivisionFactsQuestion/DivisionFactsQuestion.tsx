import React from "react";
import {
  Boxes,
  CheckCircle2,
  Package,
  Scale,
  Search,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { AnswerBox, answerMatches } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type DivisionBox = {
  id?: string;
  itemCount: number;
  isPartiallyFilled?: boolean;
};

type DivisionItem = {
  id?: string;
  icon?: string;
};

type DivisionFactsData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  leftExpression?: string;
  rightExpression?: string;
  leftQuotient?: number;
  rightQuotient?: number;
  choices?: string[];

  dividend?: number;
  divisor?: number;
  incorrectAnswer?: number;
  equation?: string;
  instruction?: string;

  icon?: string;
  itemName?: string;
  itemNamePlural?: string;
  itemCount?: number;
  boxCapacity?: number;
  fullBoxes?: number;
  remainingItems?: number;
  boxesNeeded?: number;
  items?: DivisionItem[];
  boxes?: DivisionBox[];
};

function getNumber(value: unknown, fallback = 0): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : fallback;
}

export default function Grade1DivisionFactsQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const divisionData = data as QuestionData & DivisionFactsData;

  const questionType = String(divisionData.questionType ?? "").toUpperCase();
  const title = divisionData.title ?? "Division Challenge";
  const currentAnswer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map((value) => String(value).trim())
    : [];

  const expectedAnswer = expectedAnswers[0] ?? "";

  const hasAnswered = currentAnswer !== "";

  const isCorrect =
    hasAnswered &&
    answerMatches(currentAnswer, expectedAnswers);

  const isComparisonQuestion =
    questionType === "DIVISION_QUOTIENT_COMPARE";

  const isErrorDetective =
    questionType === "DIVISION_ERROR_DETECTIVE";

  const isPackingQuestion =
    questionType === "DIVISION_PACKING_EXTRA_GROUP";

  const updateAnswer = (value: string) => {
    if (showAnswers) return;
    onAnswerChange(value);
  };

  const renderFeedback = () => {
    if (!showAnswers) return null;

    return (
      <div
        className={[
          "grade1-division-facts__feedback",
          isCorrect
            ? "grade1-division-facts__feedback--correct"
            : "grade1-division-facts__feedback--incorrect",
        ].join(" ")}
        role="status"
      >
        <div className="grade1-division-facts__feedback-heading">
          {isCorrect ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}

          <strong>
            {isCorrect
              ? "Correct answer!"
              : hasAnswered
                ? "Not quite. Check the correct answer."
                : "You did not enter an answer."}
          </strong>
        </div>

        <AnswerBox answer={expectedAnswer || "No correct answer was provided."} />
      </div>
    );
  };

  const renderHeading = (icon: React.ReactNode) => (
    <div className="grade1-division-facts__heading">
      <div className="grade1-division-facts__heading-icon">
        {icon}
      </div>

      <h3 className="grade1-division-facts__title">{title}</h3>
    </div>
  );

  const renderAnswerInput = (
    label: string,
    placeholder: string
  ) => (
    <div className="grade1-division-facts__answer-area">
      <label className="grade1-division-facts__answer-label">
        {label}
      </label>

      <input
        className={[
          "grade1-division-facts__answer-input",
          showAnswers
            ? isCorrect
              ? "grade1-division-facts__answer-input--correct"
              : "grade1-division-facts__answer-input--incorrect"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={currentAnswer}
        onChange={(event) => updateAnswer(event.target.value)}
        placeholder={placeholder}
        disabled={showAnswers}
        aria-label={label}
      />
    </div>
  );

  if (isComparisonQuestion) {
    const choices = divisionData.choices?.length
      ? divisionData.choices
      : ["<", ">", "="];

    return (
      <section className="grade1-division-facts__container">
        <div className="grade1-division-facts__card grade1-division-facts__compare">
          {renderHeading(<Scale size={23} />)}

          <p className="grade1-division-facts__prompt">
            {question.questionText}
          </p>

          <div className="grade1-division-facts__compare-board">
            <div className="grade1-division-facts__expression">
              <span className="grade1-division-facts__expression-label">
                LEFT
              </span>

              <span className="grade1-division-facts__expression-value">
                {divisionData.leftExpression}
              </span>
            </div>

            <div className="grade1-division-facts__answer-slot">
              <span className="grade1-division-facts__selected-symbol">
                {currentAnswer || "?"}
              </span>
            </div>

            <div className="grade1-division-facts__expression">
              <span className="grade1-division-facts__expression-label">
                RIGHT
              </span>

              <span className="grade1-division-facts__expression-value">
                {divisionData.rightExpression}
              </span>
            </div>
          </div>

          <div
            className="grade1-division-facts__symbol-options"
            role="group"
            aria-label="Choose a comparison symbol"
          >
            {choices.map((choice) => {
              const isSelected = currentAnswer === choice;
              const isExpected = showAnswers && expectedAnswer === choice;
              const isWrongSelected =
                showAnswers && isSelected && !isCorrect;

              return (
                <button
                  key={choice}
                  type="button"
                  className={[
                    "grade1-division-facts__symbol-button",
                    isSelected
                      ? "grade1-division-facts__symbol-button--selected"
                      : "",
                    isExpected
                      ? "grade1-division-facts__symbol-button--correct"
                      : "",
                    isWrongSelected
                      ? "grade1-division-facts__symbol-button--incorrect"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => updateAnswer(choice)}
                  disabled={showAnswers}
                  aria-pressed={isSelected}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {renderFeedback()}
        </div>
      </section>
    );
  }

  if (isErrorDetective) {
    return (
      <section className="grade1-division-facts__container">
        <div className="grade1-division-facts__card grade1-division-facts__detective">
          {renderHeading(<Search size={23} />)}

          <p className="grade1-division-facts__prompt">
            {question.questionText}
          </p>

          <div className="grade1-division-facts__wrong-equation">
            <span className="grade1-division-facts__equation-caption">
              STUDENT&apos;S EQUATION
            </span>

            <div className="grade1-division-facts__equation">
              <span>{getNumber(divisionData.dividend)}</span>
              <span className="grade1-division-facts__operator">÷</span>
              <span>{getNumber(divisionData.divisor)}</span>
              <span className="grade1-division-facts__operator">=</span>

              <span className="grade1-division-facts__wrong-number">
                {getNumber(divisionData.incorrectAnswer)}
              </span>
            </div>
          </div>

          {renderAnswerInput(
            "Correct quotient",
            "Enter the correct quotient"
          )}

          {renderFeedback()}
        </div>
      </section>
    );
  }

  if (isPackingQuestion) {
    const items = Array.isArray(divisionData.items)
      ? divisionData.items
      : [];

    const boxes = Array.isArray(divisionData.boxes)
      ? divisionData.boxes
      : [];

    const defaultIcon = divisionData.icon || "⭐";

    return (
      <section className="grade1-division-facts__container">
        <div className="grade1-division-facts__card grade1-division-facts__packing">
          {renderHeading(<Package size={23} />)}

          <p className="grade1-division-facts__prompt">
            {question.questionText}
          </p>

          {/* Before checking, display the loose objects only.
              Showing the backend's completed boxes here would reveal
              the answer before the learner tries the question. */}
          <div className="grade1-division-facts__loose-items">
            {items.map((item, index) => (
              <span
                key={item.id ?? `division-item-${index}`}
                className="grade1-division-facts__loose-item"
                aria-hidden="true"
              >
                {item.icon || defaultIcon}
              </span>
            ))}
          </div>

          {renderAnswerInput(
            "Number of boxes needed",
            "Enter the number of boxes"
          )}

          {showAnswers && (
            <div className="grade1-division-facts__revealed-packing">
              <div className="grade1-division-facts__revealed-heading">
                <Boxes size={20} />
                <strong>Correct packing</strong>
              </div>

              <div className="grade1-division-facts__boxes-grid">
                {boxes.map((box, index) => {
                  const count = Math.max(0, getNumber(box.itemCount));
                  const isPartial = Boolean(box.isPartiallyFilled);

                  return (
                    <div
                      key={box.id ?? `division-box-${index}`}
                      className={[
                        "grade1-division-facts__box-card",
                        isPartial
                          ? "grade1-division-facts__box-card--partial"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="grade1-division-facts__box-top">
                        <span className="grade1-division-facts__box-label">
                          BOX {index + 1}
                        </span>

                        {isPartial && (
                          <span className="grade1-division-facts__partial-tag">
                            Last box
                          </span>
                        )}
                      </div>

                      <div className="grade1-division-facts__box-visual">
                        {Array.from({ length: count }, (_, itemIndex) => (
                          <span
                            key={`${box.id ?? index}-item-${itemIndex}`}
                            className="grade1-division-facts__box-object"
                            aria-hidden="true"
                          >
                            {defaultIcon}
                          </span>
                        ))}
                      </div>

                      <div className="grade1-division-facts__box-footer">
                        <span className="grade1-division-facts__box-item-count">
                          {count} {count === 1 ? "object" : "objects"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {renderFeedback()}
        </div>
      </section>
    );
  }

  return (
    <div className="grade1-division-facts__unsupported">
      This division question type is not supported by this renderer.
    </div>
  );
}