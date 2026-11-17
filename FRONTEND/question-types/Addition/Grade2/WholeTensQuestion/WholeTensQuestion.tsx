
import React from "react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

function WholeTensAnswerInput({
  value,
  onChange,
  disabled,
  correctAnswer,
  showAnswers,
  placeholder = "Answer",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  correctAnswer?: string;
  showAnswers: boolean;
  placeholder?: string;
}) {
  const hasAnswer = value.trim() !== "";

  const isCorrect =
    hasAnswer &&
    correctAnswer !== undefined &&
    value.trim() === String(correctAnswer).trim();

  const stateClass = !showAnswers
    ? "wholetens-addition__input--pending"
    : isCorrect
      ? "wholetens-addition__input--correct"
      : "wholetens-addition__input--incorrect";

  return (
    <input
      type="text"
      inputMode="numeric"
      className={`wholetens-addition__input ${stateClass}`}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function WholeTensAnswerLabel({
  index = 0,
  correctAnswers,
  showAnswers,
}: {
  index?: number;
  correctAnswers: string[];
  showAnswers: boolean;
}) {
  if (!showAnswers) {
    return null;
  }

  const value = correctAnswers[index] ?? "";

  return (
    <span className="wholetens-addition__answer-label">
      ✓ {value}
    </span>
  );
}

function WholeTensDisplay({
  questionText,
  data,
  userAnswer,
  showAnswers,
  correctAnswers,
  onAnswerChange,
}: {
  questionText: string;
  data: QuestionData;
  userAnswer: unknown;
  showAnswers: boolean;
  correctAnswers: string[];
  onAnswerChange: (value: unknown) => void;
}) {
  const format = data.format ?? "";

  const singleAnswer =
    typeof userAnswer === "string" ||
    typeof userAnswer === "number"
      ? String(userAnswer)
      : "";

  const arrayAnswer: string[] = Array.isArray(userAnswer)
    ? userAnswer.map((value) => String(value))
    : [];

  const setSingleAnswer = (value: string) => {
    if (!showAnswers) {
      onAnswerChange(value);
    }
  };

  const setArrayAnswer = (index: number, value: string) => {
    if (showAnswers) {
      return;
    }

    const next = [...arrayAnswer];

    while (next.length <= index) {
      next.push("");
    }

    next[index] = value;
    onAnswerChange(next);
  };

  const answerInput = (
    value: string,
    onChange: (value: string) => void,
    index = 0,
    placeholder = "Answer",
  ) => (
    <WholeTensAnswerInput
      value={value}
      onChange={onChange}
      disabled={showAnswers}
      correctAnswer={correctAnswers[index]}
      showAnswers={showAnswers}
      placeholder={placeholder}
    />
  );

  const answerLabel = (index = 0) => (
    <WholeTensAnswerLabel
      index={index}
      correctAnswers={correctAnswers}
      showAnswers={showAnswers}
    />
  );

  return (
    <div className="wholetens-addition__display">
      <h3 className="wholetens-addition__question">
        {questionText}
      </h3>

      {/* TYPE 1 — UNIT NOTATION */}
      {format === "unitNotation" && (
        <div className="wholetens-addition__unit-notation">
          <div className="wholetens-addition__unit-equation">
            {data.firstTens} tens + {data.secondTens} tens =
          </div>

          <div className="wholetens-addition__unit-answer-row">
            {answerInput(
              arrayAnswer[0] ?? "",
              (value) => setArrayAnswer(0, value),
              0,
              "tens",
            )}

            <span className="wholetens-addition__unit-equals">
              tens =
            </span>

            {answerInput(
              arrayAnswer[1] ?? "",
              (value) => setArrayAnswer(1, value),
              1,
              "total",
            )}
          </div>

          {showAnswers && (
            <div className="wholetens-addition__answer-labels">
              {answerLabel(0)}
              {answerLabel(1)}
            </div>
          )}
        </div>
      )}

      {/* TYPE 1 — VERTICAL */}
      {format === "vertical" && (
        <div className="wholetens-addition__vertical">
          <div className="wholetens-addition__vertical-number">
            {data.firstNumber}
          </div>

          <div className="wholetens-addition__vertical-second-row">
            <span className="wholetens-addition__vertical-plus">
              +
            </span>
            <span>{data.secondNumber}</span>
          </div>

          <div className="wholetens-addition__vertical-divider" />

          {answerInput(singleAnswer, setSingleAnswer)}
        </div>
      )}

      {/* TYPE 2 — BALANCE SCALE */}
      {format === "balanceScale" && data.balanceScale && (
        <div className="wholetens-addition__balance-scale">
          {answerInput(singleAnswer, setSingleAnswer)}

          <span className="wholetens-addition__operator">+</span>

          <span className="wholetens-addition__balance-known">
            {data.balanceScale.left.known}
          </span>

          <span className="wholetens-addition__operator">=</span>

          <span className="wholetens-addition__balance-expression">
            {data.balanceScale.right.first} +{" "}
            {data.balanceScale.right.second}
          </span>

          {answerLabel()}
        </div>
      )}

      {/* TYPE 2 — PART WHOLE */}
      {format === "partWhole" && (
        <div className="wholetens-addition__part-whole">
          <div className="wholetens-addition__part-whole-line">
            Total = <strong>{data.total}</strong>
          </div>

          <div className="wholetens-addition__part-whole-line">
            Known Part = <strong>{data.knownPart}</strong>
          </div>

          <div className="wholetens-addition__part-whole-answer">
            <span>Missing Part =</span>

            {answerInput(singleAnswer, setSingleAnswer)}

            {answerLabel()}
          </div>
        </div>
      )}

      {/* TYPE 3 — GROUP TO 100 */}
      {format === "groupTo100" && data.groupTo100 && (
        <div className="wholetens-addition__group-to-100">
          <div className="wholetens-addition__group-equation">
            ({data.groupTo100.first} + {data.groupTo100.second}) +{" "}
            {data.groupTo100.remaining}
          </div>

          <div className="wholetens-addition__group-equation">
            = 100 + {data.groupTo100.remaining} = ?
          </div>

          {answerInput(singleAnswer, setSingleAnswer)}
        </div>
      )}

      {/* TYPE 3 — SEQUENTIAL JUMPS */}
      {format === "sequentialJumps" &&
        data.sequentialJumps &&
        data.sequentialJumps.length >= 2 && (
          <div className="wholetens-addition__sequential-jumps">
            <span>Start at {data.firstNumber}</span>

            <span className="wholetens-addition__jump-text">
              → +{data.secondNumber} →
            </span>

            {answerInput(
              arrayAnswer[0] ?? "",
              (value) => setArrayAnswer(0, value),
              0,
            )}

            <span className="wholetens-addition__jump-text">
              → +{data.thirdNumber} →
            </span>

            {answerInput(
              arrayAnswer[1] ?? "",
              (value) => setArrayAnswer(1, value),
              1,
            )}
          </div>
        )}

      {/* TYPE 4 — SUBTOTAL STEP */}
      {format === "subTotalStep" && (
        <div className="wholetens-addition__subtotal-step">
          <div className="wholetens-addition__equation-text">
            {data.equation}
          </div>

          <div className="wholetens-addition__equation-text">
            {data.subTotalEquation}
          </div>

          {answerInput(singleAnswer, setSingleAnswer)}
        </div>
      )}

      {/* TYPE 4 — TARGET SUM */}
      {format === "targetSum" && (
        <div className="wholetens-addition__target-sum">
          <div className="wholetens-addition__target-line">
            Target = {data.target}
          </div>

          <div className="wholetens-addition__target-line">
            You have {data.knownNumbers?.join(" and ")}.
          </div>

          <div className="wholetens-addition__target-answer">
            <span>You need</span>

            {answerInput(singleAnswer, setSingleAnswer)}

            <span>more.</span>
          </div>
        </div>
      )}

      {/* TYPE 5 — FRIENDLY PAIRS */}
      {format === "friendlyPairs" && data.friendlyPairs && (
        <div className="wholetens-addition__friendly-pairs">
          <div className="wholetens-addition__friendly-equation">
            ({data.friendlyPairs.firstPair.first} +{" "}
            {data.friendlyPairs.firstPair.second}) + (
            {data.friendlyPairs.secondPair.first} +{" "}
            {data.friendlyPairs.secondPair.second})
          </div>

          <div className="wholetens-addition__friendly-answer-row">
            <span className="wholetens-addition__operator">=</span>

            {answerInput(
              arrayAnswer[0] ?? "",
              (value) => setArrayAnswer(0, value),
              0,
            )}

            <span className="wholetens-addition__operator">+</span>

            {answerInput(
              arrayAnswer[1] ?? "",
              (value) => setArrayAnswer(1, value),
              1,
            )}

            <span className="wholetens-addition__operator">=</span>

            {answerInput(
              arrayAnswer[2] ?? "",
              (value) => setArrayAnswer(2, value),
              2,
            )}
          </div>
        </div>
      )}

      {/* TYPE 5 — CHAIN ADDITION */}
      {format === "chainAddition" && (
        <div className="wholetens-addition__chain-addition">
          {(data.numbers ?? []).map((number, index) => (
            <React.Fragment key={`${number}-${index}`}>
              {index > 0 && (
                <span className="wholetens-addition__operator">+</span>
              )}

              <span className="wholetens-addition__chain-number">
                {number}
              </span>
            </React.Fragment>
          ))}

          <span className="wholetens-addition__operator">=</span>

          {answerInput(singleAnswer, setSingleAnswer)}
        </div>
      )}

      {/* TYPE 6 — SIMPLIFIED EQUATION */}
      {format === "simplifiedEquation" && (
        <div className="wholetens-addition__simplified-equation">
          <div className="wholetens-addition__equation-text">
            Combine knowns: {data.knownNumbers?.join(" + ")} ={" "}
            {data.knownSum}
          </div>

          <div className="wholetens-addition__equation-text">
            {data.simplifiedEquation}
          </div>

          {answerInput(singleAnswer, setSingleAnswer)}
        </div>
      )}

      {/* TYPE 6 — BALANCE EQUATION */}
      {format === "balanceEquation" && (
        <div className="wholetens-addition__balance-equation">
          {(data.numbers ?? []).map((number, index) => (
            <React.Fragment key={`${number}-${index}`}>
              {index > 0 && (
                <span className="wholetens-addition__operator">+</span>
              )}

              {index === data.missingIndex ? (
                answerInput(singleAnswer, setSingleAnswer)
              ) : (
                <span className="wholetens-addition__balance-number">
                  {number}
                </span>
              )}
            </React.Fragment>
          ))}

          <span className="wholetens-addition__operator">=</span>

          <span className="wholetens-addition__balance-expression">
            {data.rightSide?.first} + {data.rightSide?.second}
          </span>
        </div>
      )}

      {/* TYPE 7 — DISTANCE TO BENCHMARK / TEN FRAME GAP */}
      {(format === "distanceToBenchmark" ||
        format === "tenFrameGap") && (
        <div className="wholetens-addition__benchmark">
          {format === "distanceToBenchmark" ? (
            <>
              <div className="wholetens-addition__benchmark-prompt">
                How far is {data.currentNumber} from {data.benchmark}?
              </div>

              <div className="wholetens-addition__benchmark-equation">
                <span>{data.currentNumber} +</span>

                {answerInput(singleAnswer, setSingleAnswer)}

                <span>= {data.benchmark}</span>
              </div>
            </>
          ) : (
            <>
              <div className="wholetens-addition__benchmark-prompt">
                You have {data.currentNumber}.
              </div>

              <div className="wholetens-addition__benchmark-equation">
                <span>To reach {data.target}, add</span>

                {answerInput(singleAnswer, setSingleAnswer)}

                <span>units.</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* TYPE 8 — DECOMPOSITION */}
      {format === "decomposition" && data.split && (
        <div className="wholetens-addition__decomposition">
          <div className="wholetens-addition__equation-text">
            To solve {data.firstNumber} + {data.secondNumber}:
          </div>

          <div className="wholetens-addition__equation-text">
            Split {data.secondNumber} into {data.split.first} +{" "}
            {data.split.second}
          </div>

          <div className="wholetens-addition__equation-text">
            Step 1: {data.firstNumber} + {data.bridgeAmount} ={" "}
            {data.nextTen}
          </div>

          <div className="wholetens-addition__decomposition-answer">
            <span>
              Step 2: {data.nextTen} + {data.remainingAmount} =
            </span>

            {answerInput(singleAnswer, setSingleAnswer)}
          </div>
        </div>
      )}

      {/* TYPE 8 — FILL IN STEPS */}
      {format === "fillInSteps" && (
        <div className="wholetens-addition__fill-in-steps">
          <div className="wholetens-addition__fill-step">
            <span>
              {data.firstNumber} + {data.secondNumber} ={" "}
              {data.firstNumber} +
            </span>

            {answerInput(
              arrayAnswer[0] ?? "",
              (value) => setArrayAnswer(0, value),
              0,
            )}

            <span>+</span>

            {answerInput(
              arrayAnswer[1] ?? "",
              (value) => setArrayAnswer(1, value),
              1,
            )}
          </div>

          <div className="wholetens-addition__fill-step">
            <span>
              = {data.nextTen} + {data.remainingAmount} =
            </span>

            {answerInput(
              arrayAnswer[2] ?? "",
              (value) => setArrayAnswer(2, value),
              2,
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WholeTensQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  return (
    <WholeTensDisplay
      questionText={
        question.questionText ||
        "Complete the whole-tens addition."
      }
      data={data as QuestionData}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      correctAnswers={correctAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
