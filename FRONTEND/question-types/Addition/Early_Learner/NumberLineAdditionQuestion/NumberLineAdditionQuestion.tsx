import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

type QuestionMode = "findTotal" | "findStart" | "findHops";

interface NumberLineAdditionDisplayProps {
  min?: number;
  max?: number;
  firstNumber: number;
  secondNumber: number;
  total: number;
  questionMode: QuestionMode;
  userAnswer: unknown;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
}

function NumberLineAdditionDisplay({
  min = 1,
  max = 10,
  firstNumber,
  secondNumber,
  total,
  questionMode,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: NumberLineAdditionDisplayProps) {
  const numbers = Array.from(
    { length: max - min + 1 },
    (_, index) => min + index,
  );

  const startNumber =
    questionMode === "findStart" ? total : firstNumber;

  const targetNumber =
    questionMode === "findStart" ? firstNumber : total;

  const direction = questionMode === "findStart" ? -1 : 1;

  const [path, setPath] = useState<number[]>([startNumber]);

  useEffect(() => {
    setPath([startNumber]);
  }, [firstNumber, secondNumber, total, questionMode, startNumber]);

  const currentPosition = path[path.length - 1];

  const correctAnswer =
    questionMode === "findTotal"
      ? total
      : questionMode === "findHops"
        ? Math.abs(total - firstNumber)
        : firstNumber;

  const currentAnswer = String(userAnswer ?? "").trim();

  const isCorrect =
    currentAnswer !== "" &&
    currentAnswer === String(correctAnswer);

  const handleNumberClick = (number: number) => {
    if (showAnswers) return;

    const expectedNext = currentPosition + direction;

    if (number !== expectedNext) return;
    if (number < min || number > max) return;

    setPath([...path, number]);
  };

  const getPercent = (number: number) => {
    if (numbers.length <= 1) return 50;

    return ((number - min) / (numbers.length - 1)) * 100;
  };

  const reachedTarget = currentPosition === targetNumber;

  const handleReset = () => {
    if (showAnswers) return;

    setPath([startNumber]);
    onAnswerChange("");
  };

  const renderQuestion = () => {
    if (questionMode === "findTotal") {
      return (
        <>
          {firstNumber} + {secondNumber} ={" "}
          <span className="number-line-addition__missing-number">?</span>
        </>
      );
    }

    if (questionMode === "findHops") {
      return (
        <>
          {firstNumber} +{" "}
          <span className="number-line-addition__missing-number">?</span>{" "}
          = {total}
        </>
      );
    }

    return (
      <>
        ? + {secondNumber} = {total}
      </>
    );
  };

  return (
    <div className="number-line-addition">
      <div className="number-line-addition__question">
        {renderQuestion()}
      </div>

      <div className="number-line-addition__scroll">
        <div
          className="number-line-addition__track"
          style={
            {
              "--number-line-addition-track-width": `${Math.max(
                numbers.length * 60,
                650,
              )}px`,
            } as React.CSSProperties
          }
        >
          <div className="number-line-addition__line" />

          <div className="number-line-addition__line-arrow" />

          {path.slice(1).map((currentNumber, index) => {
            const previousNumber = path[index];
            const previousPercent = getPercent(previousNumber);
            const currentPercent = getPercent(currentNumber);
            const leftPercent = Math.min(
              previousPercent,
              currentPercent,
            );
            const widthPercent = Math.abs(
              currentPercent - previousPercent,
            );
            const movingRight = currentNumber > previousNumber;

            return (
              <div
                key={`${previousNumber}-${currentNumber}-${index}`}
                className={`number-line-addition__jump ${
                  movingRight
                    ? "number-line-addition__jump--right"
                    : "number-line-addition__jump--left"
                }`}
                style={
                  {
                    "--number-line-addition-jump-left": `calc(${leftPercent}% + 15px)`,
                    "--number-line-addition-jump-width": `calc(${widthPercent}% - 2px)`,
                  } as React.CSSProperties
                }
              >
                <span className="number-line-addition__jump-label">
                  {movingRight ? "+1" : "-1"}
                </span>

                <div
                  className={`number-line-addition__jump-arrow ${
                    movingRight
                      ? "number-line-addition__jump-arrow--right"
                      : "number-line-addition__jump-arrow--left"
                  }`}
                />
              </div>
            );
          })}

          {numbers.map((number) => {
            const percent = getPercent(number);
            const isStart = number === startNumber;

            return (
              <button
                key={number}
                type="button"
                disabled={showAnswers}
                onClick={() => handleNumberClick(number)}
                className={`number-line-addition__number ${
                  isStart
                    ? "number-line-addition__number--start"
                    : ""
                }`}
                style={
                  {
                    "--number-line-addition-number-left": `calc(${percent}% - 20px)`,
                  } as React.CSSProperties
                }
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {!showAnswers && !reachedTarget && (
        <div className="number-line-addition__message">
          Click the next number one step at a time to draw each jump.
        </div>
      )}

      {!showAnswers && reachedTarget && (
        <div className="number-line-addition__message number-line-addition__message--success">
          Great! You reached the target. Now write your answer.
        </div>
      )}

      <div className="number-line-addition__answer-row">
        <label
          className="number-line-addition__answer-label"
          htmlFor="number-line-addition-answer"
        >
          Answer:
        </label>

        <input
          id="number-line-addition-answer"
          className={`number-line-addition__answer-input ${
            showAnswers
              ? isCorrect
                ? "number-line-addition__answer-input--correct"
                : "number-line-addition__answer-input--incorrect"
              : ""
          }`}
          type="text"
          inputMode="numeric"
          value={currentAnswer}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write answer"
        />

        {showAnswers && (
          <span
            className={`number-line-addition__feedback ${
              isCorrect
                ? "number-line-addition__feedback--correct"
                : "number-line-addition__feedback--incorrect"
            }`}
          >
            {isCorrect ? (
              <>
                <Check size={18} />
                Correct
              </>
            ) : (
              <>
                <X size={18} />
                Incorrect
              </>
            )}
          </span>
        )}
      </div>

      {!showAnswers && path.length > 1 && (
        <button
          type="button"
          className="number-line-addition__reset"
          onClick={handleReset}
        >
          Reset Path
        </button>
      )}

      {showAnswers && (
        <AnswerBox answer={String(correctAnswer)} />
      )}
    </div>
  );
}

export default function NumberLineAdditionQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const firstNumber = data.firstNumber;
  const secondNumber = data.secondNumber;
  const total = data.total;

  const numberLine = data.numberLine ?? {
    min: 1,
    max:
      total !== undefined
        ? total <= 10
          ? 10
          : total <= 15
            ? 15
            : 20
        : 10,
  };

  if (
    firstNumber === undefined ||
    secondNumber === undefined ||
    total === undefined
  ) {
    return (
      <div className="number-line-addition__error">
        Number Line Addition data is incomplete.
      </div>
    );
  }

  return (
    <NumberLineAdditionDisplay
      min={numberLine.min}
      max={numberLine.max}
      firstNumber={firstNumber}
      secondNumber={secondNumber}
      total={total}
      questionMode={
        (data.questionMode ?? "findTotal") as QuestionMode
      }
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}