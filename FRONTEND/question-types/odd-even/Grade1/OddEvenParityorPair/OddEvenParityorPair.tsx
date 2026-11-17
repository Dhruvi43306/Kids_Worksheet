import React from "react";
import "@/styles/worksheet.css";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

type OddEvenObject = {
  id: string;
  icon?: string | null;
};

type OddEvenPair = {
  id: string;
  objects: OddEvenObject[];
};

type OddEvenData = {
  renderKey?: string;
  questionType?: string;
  title?: string;

  totalItems?: number;
  pairSize?: number;
  pairCount?: number;
  remainder?: number;
  counters?: OddEvenObject[];
  pairs?: OddEvenPair[];
  unpairedObjects?: OddEvenObject[];

  numbers?: number[];
  numberCount?: number;
  oddNumbers?: number[];
  evenNumbers?: number[];
  oddCount?: number;
  evenCount?: number;

  firstNumber?: number;
  secondNumber?: number;
  equation?: string;
  options?: string[];
};

type CountAnswer = {
  odd: string;
  even: string;
};

const getCountAnswer = (answer: unknown): CountAnswer => {
  if (typeof answer !== "string" || !answer.trim()) {
    return { odd: "", even: "" };
  }

  try {
    const parsed = JSON.parse(answer) as {
      odd?: number | string;
      even?: number | string;
    };

    return {
      odd: parsed.odd == null ? "" : String(parsed.odd),
      even: parsed.even == null ? "" : String(parsed.even),
    };
  } catch {
    return { odd: "", even: "" };
  }
};

const getIcon = (icon?: string | null) =>
  icon?.trim() || "🔵";

export default function OddEvenAdvancedQuestion({
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const d = data as OddEvenData;
  const questionType = d.questionType ?? "";
  const inputId = React.useId();

  const currentAnswer =
    userAnswer == null ? "" : String(userAnswer);

  const countAnswer = getCountAnswer(userAnswer);

  const expectedParity =
    Number(d.firstNumber ?? 0) + Number(d.secondNumber ?? 0);

  const correctParity =
    expectedParity % 2 === 0 ? "Even" : "Odd";

  const answerInput = (
    value: string,
    label: string,
    onChange: (value: string) => void
  ) => (
    <label className="odd_even_parity_pair__answer-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="?"
        aria-label={label}
      />
    </label>
  );

  // 1. Pair the objects and find the remainder.
  if (questionType === "ODD_EVEN_PAIRING_REMAINDER") {
    const pairs = d.pairs ?? [];
    const unpaired = d.unpairedObjects ?? [];

    return (
      <section className="odd_even_parity_pair__card">
        <div className="odd_even_parity_pair__summary">
          <div>
            <span className="odd_even_parity_pair__summary-label">
              Total objects
            </span>
            <strong>{d.totalItems ?? 0}</strong>
          </div>

          <div>
            <span className="odd_even_parity_pair__summary-label">
              Pairs made
            </span>
            <strong>{d.pairCount ?? pairs.length}</strong>
          </div>
        </div>

        <div className="odd_even_parity_pair__section">
          <h4 className="odd_even_parity_pair__section-title">
            Pair the objects
          </h4>
           <div>
            
            <p className="odd_even_parity_pair__muted">
              Count the objects that do not make a pair.
            </p>
          </div>

          <div className="odd_even_parity_pair__pair-grid">
            {pairs.map((pair, index) => (
              <div
                className="odd_even_parity_pair__pair"
                key={pair.id}
              >
                <span className="odd_even_parity_pair__pair-label">
                  Pair {index + 1}
                </span>

                <div className="odd_even_parity_pair__pair-objects">
                  {pair.objects.map((object) => (
                    <span
                      className="odd_even_parity_pair__object"
                      key={object.id}
                    >
                      {getIcon(object.icon)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="odd_even_parity_pair__leftover">
         

          <div className="odd_even_parity_pair__leftover-objects">
            {unpaired.length > 0 ? (
              unpaired.map((object) => (
                <span
                  className="odd_even_parity_pair__object odd_even_parity_pair__object--leftover"
                  key={object.id}
                >
                  {getIcon(object.icon)}
                </span>
              ))
            ) : (
              <span className="odd_even_parity_pair__none-left">
                No objects left
              </span>
            )}
          </div>
        </div>

        <div className="odd_even_parity_pair__answer-row">
          {answerInput(
            currentAnswer,
            "How many remain unpaired?",
            onAnswerChange
          )}
        </div>

        {showAnswers && (
          <div className="odd_even_parity_pair__feedback">
            Correct answer: <strong>{d.remainder ?? 0}</strong>
          </div>
        )}
      </section>
    );
  }

  // 2. Count how many numbers are odd and how many are even.
  if (questionType === "ODD_EVEN_COUNT_SET") {
    const numbers = d.numbers ?? [];

    const sendCountAnswer = (odd: string, even: string) => {
      onAnswerChange(
        JSON.stringify({
          odd: odd === "" ? "" : Number(odd),
          even: even === "" ? "" : Number(even),
        })
      );
    };

    return (
      <section className="odd_even_parity_pair__card">
        <div className="odd_even_parity_pair__number-grid">
          {numbers.map((number, index) => (
            <div
              className={`odd_even_parity_pair__number-card ${
                number % 2 === 0
                  ? "odd_even_parity_pair__number-card--even"
                  : "odd_even_parity_pair__number-card--odd"
              }`}
              key={`${number}-${index}`}
            >
              {number}
            </div>
          ))}
        </div>

        <div className="odd_even_parity_pair__count-fields">
          {answerInput(
            showAnswers
              ? String(d.oddCount ?? 0)
              : countAnswer.odd,
            "How many are odd?",
            (value) => sendCountAnswer(value, countAnswer.even)
          )}

          {answerInput(
            showAnswers
              ? String(d.evenCount ?? 0)
              : countAnswer.even,
            "How many are even?",
            (value) => sendCountAnswer(countAnswer.odd, value)
          )}
        </div>

        {showAnswers && (
          <div className="odd_even_parity_pair__feedback">
            Correct answers:
            <strong> Odd: {d.oddCount ?? 0}</strong>
            <span> · </span>
            <strong>Even: {d.evenCount ?? 0}</strong>
          </div>
        )}
      </section>
    );
  }

  // 3. Predict whether the sum is odd or even.
  if (questionType === "ODD_EVEN_SUM_PARITY") {
    const options = d.options ?? ["Odd", "Even"];

    return (
      <section className="odd_even_parity_pair__card">
        <div className="odd_even_parity_pair__sum-equation">
          <span>{d.firstNumber ?? 0}</span>
          <span className="odd_even_parity_pair__operator">+</span>
          <span>{d.secondNumber ?? 0}</span>
          <span className="odd_even_parity_pair__operator">=</span>
          <span className="odd_even_parity_pair__question-mark">
            ?
          </span>
        </div>

        <div className="odd_even_parity_pair__choice-list">
          {options.map((option) => {
            const selected = currentAnswer === option;
            const isCorrect =
              showAnswers && option === correctParity;

            return (
              <button
                type="button"
                key={option}
                className={[
                  "odd_even_parity_pair__choice",
                  selected
                    ? "odd_even_parity_pair__choice--selected"
                    : "",
                  isCorrect
                    ? "odd_even_parity_pair__choice--correct"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onAnswerChange(option)}
                aria-pressed={selected}
              >
                <span className="odd_even_parity_pair__choice-indicator">
                  {selected ? "✓" : ""}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {showAnswers && (
          <div className="odd_even_parity_pair__feedback">
            Correct answer: <strong>{correctParity}</strong>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="odd_even_parity_pair__card">
      <p className="odd_even_parity_pair__muted">
        Unsupported question type: {questionType || "Unknown"}
      </p>
    </section>
  );
}