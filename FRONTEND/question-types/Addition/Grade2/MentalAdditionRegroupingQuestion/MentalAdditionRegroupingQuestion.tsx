
import React from "react";
import { Check, X } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";
import { answerMatches } from "@/renderer/questionHelpers";

type MentalAdditionDisplayProps = {
  questionText: string;
  data: QuestionData;
  userAnswer: unknown;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: string) => void;
};

function MentalAdditionNumberCard({
  value,
}: {
  value: number;
}) {
  return (
    <div className="mental-addition-regrouping__number-card">
      {value}
    </div>
  );
}

function MentalAdditionPlusSign() {
  return (
    <span className="mental-addition-regrouping__operator">
      +
    </span>
  );
}

function MentalAdditionAnswerInput({
  label,
  currentAnswer,
  showAnswers,
  isCorrect,
  onAnswerChange,
}: {
  label: string;
  currentAnswer: string;
  showAnswers: boolean;
  isCorrect: boolean;
  onAnswerChange: (value: string) => void;
}) {
  const inputStateClass = !showAnswers
    ? "mental-addition-regrouping__missing-box--pending"
    : isCorrect
      ? "mental-addition-regrouping__missing-box--correct"
      : "mental-addition-regrouping__missing-box--incorrect";

  return (
    <div className="mental-addition-regrouping__missing-answer">
      <div
        className={`mental-addition-regrouping__missing-box ${inputStateClass}`}
      >
        <input
          type="number"
          className="mental-addition-regrouping__missing-input"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="?"
          aria-label={label}
        />
      </div>

      <span className="mental-addition-regrouping__missing-label">
        {label}
      </span>
    </div>
  );
}

function MentalAdditionRegroupingDisplay({
  questionText,
  data,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: MentalAdditionDisplayProps) {
  const numbers = data.numbers ?? [];
  const numberCount = data.numberCount ?? numbers.length;
  const missingAddend = data.missingAddend ?? false;
  const missingIndex = data.missingIndex ?? -1;
  const total = data.total;
  const equation = data.equation ?? "";

  const currentAnswer = String(userAnswer ?? "").trim();
  const correctAnswer =
    correctAnswers.length > 0 ? correctAnswers[0] : "";

  const isCorrect =
    currentAnswer !== "" &&
    answerMatches(currentAnswer, correctAnswers);

  if (numbers.length === 0 || total === undefined) {
    return (
      <div className="mental-addition-regrouping__error">
        Mental addition data is incomplete.
      </div>
    );
  }

  const resultClass = isCorrect
    ? "mental-addition-regrouping__result--correct"
    : "mental-addition-regrouping__result--incorrect";

  const answerInputClass = !showAnswers
    ? "mental-addition-regrouping__answer-input--pending"
    : isCorrect
      ? "mental-addition-regrouping__answer-input--correct"
      : "mental-addition-regrouping__answer-input--incorrect";

  return (
    <div className="mental-addition-regrouping__display">
      <h3 className="mental-addition-regrouping__question">
        {questionText}
      </h3>

      <div className="mental-addition-regrouping__card">
        {/* Title */}
        <div className="mental-addition-regrouping__header">
          <span className="mental-addition-regrouping__badge">
            🧠 MENTAL ADDITION
          </span>
        </div>

        {/* Instruction */}
        <div className="mental-addition-regrouping__instruction">
          {missingAddend
            ? "Find the missing addend."
            : `Add these ${numberCount} numbers.`}
        </div>

        {/* Equation */}
        <div className="mental-addition-regrouping__equation-panel">
          <div className="mental-addition-regrouping__equation">
            {missingAddend ? (
              <>
                {numbers.map((number, index) => (
                  <React.Fragment key={`missing-number-${index}`}>
                    {index === missingIndex ? (
                      <MentalAdditionAnswerInput
                        label="MISSING"
                        currentAnswer={currentAnswer}
                        showAnswers={showAnswers}
                        isCorrect={isCorrect}
                        onAnswerChange={onAnswerChange}
                      />
                    ) : (
                      <MentalAdditionNumberCard value={number} />
                    )}

                    {index < numbers.length - 1 && (
                      <MentalAdditionPlusSign />
                    )}
                  </React.Fragment>
                ))}

                <span className="mental-addition-regrouping__operator">
                  =
                </span>

                <div className="mental-addition-regrouping__total-card">
                  {total}
                </div>
              </>
            ) : (
              <>
                {numbers.map((number, index) => (
                  <React.Fragment key={`normal-number-${index}`}>
                    <MentalAdditionNumberCard value={number} />

                    {index < numbers.length - 1 && (
                      <MentalAdditionPlusSign />
                    )}
                  </React.Fragment>
                ))}

                <span className="mental-addition-regrouping__operator">
                  =
                </span>

                <div className="mental-addition-regrouping__unknown-card">
                  ?
                </div>
              </>
            )}
          </div>
        </div>

        {/* Answer input for normal addition */}
        {!missingAddend && (
          <div className="mental-addition-regrouping__answer-row">
            <label
              className="mental-addition-regrouping__answer-label"
              htmlFor="mental-addition-regrouping-answer"
            >
              Answer:
            </label>

            <input
              id="mental-addition-regrouping-answer"
              type="number"
              className={`mental-addition-regrouping__answer-input ${answerInputClass}`}
              value={currentAnswer}
              disabled={showAnswers}
              onChange={(event) =>
                onAnswerChange(event.target.value)
              }
              placeholder="Write answer"
              aria-label="Addition answer"
            />
          </div>
        )}

        {/* Answer result */}
        {showAnswers && (
          <div
            className={`mental-addition-regrouping__result ${resultClass}`}
            role="status"
          >
            {isCorrect ? (
              <>
                <Check
                  size={17}
                  className="mental-addition-regrouping__result-icon"
                  aria-hidden="true"
                />
                Correct!
              </>
            ) : (
              <>
                <X
                  size={17}
                  className="mental-addition-regrouping__result-icon"
                  aria-hidden="true"
                />
                Incorrect. Correct answer: {correctAnswer}
              </>
            )}
          </div>
        )}

        {/* Complete equation after checking */}
        {showAnswers && (
          <div className="mental-addition-regrouping__completed-equation">
            {missingAddend
              ? equation.replace("__", correctAnswer)
              : `${numbers.join(" + ")} = ${total}`}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MentalAdditionRegroupingQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <MentalAdditionRegroupingDisplay
      questionText={question.questionText}
      data={data}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
