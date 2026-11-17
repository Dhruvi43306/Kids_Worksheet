
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";

function BridgeTenDisplay({
  firstNumber,
  secondNumber,
  bridgeAmount,
  remainingAmount,
  total,
  icon,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: {
  firstNumber: number;
  secondNumber: number;
  bridgeAmount: number;
  remainingAmount: number;
  total: number;
  icon: string;
  userAnswer: any;
  showAnswers: boolean;
  onAnswerChange: (value: string) => void;
}) {
  const currentAnswer = String(userAnswer ?? "").trim();
  const isCorrect =
    currentAnswer !== "" && currentAnswer === String(total);

  const renderTenFrame = (
    filledCount: number,
    additionalCount = 0
  ) => (
    <div className="bridge-ten__frame">
      {Array.from({ length: 10 }, (_, index) => {
        const filled = index < filledCount;
        const additional =
          index >= filledCount &&
          index < filledCount + additionalCount;

        return (
          <div
            key={index}
            className={`bridge-ten__frame-cell ${
              filled || additional
                ? "bridge-ten__frame-cell--filled"
                : ""
            }`}
          >
            {filled || additional ? icon : ""}
          </div>
        );
      })}
    </div>
  );

  const renderObjects = (count: number) => (
    <div className="bridge-ten__objects">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="bridge-ten__object">
          {icon}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bridge-ten">
      <h3 className="bridge-ten__question">
        {firstNumber} + {secondNumber} = ?
      </h3>

      {/* Starting ten frame */}
      <section className="bridge-ten__card">
        <div className="bridge-ten__card-title bridge-ten__card-title--spaced">
          Start with {firstNumber}
        </div>

        <div className="bridge-ten__frame-wrapper">
          {renderTenFrame(firstNumber)}
        </div>
      </section>

      {/* Split the second number */}
      <div className="bridge-ten__split">
        <span>{secondNumber}</span>
        <span>=</span>
        <span>{bridgeAmount}</span>
        <span>+</span>
        <span>{remainingAmount}</span>
      </div>

      {/* Make ten */}
      <section className="bridge-ten__card">
        <div className="bridge-ten__card-title">
          Make 10
        </div>

        {renderObjects(bridgeAmount)}

        <div className="bridge-ten__equation">
          {firstNumber} + {bridgeAmount} = 10
        </div>
      </section>

      {/* Add the remaining amount */}
      <section className="bridge-ten__card">
        <div className="bridge-ten__card-title">
          Add the remaining {remainingAmount}
        </div>

        {renderObjects(remainingAmount)}

        <div className="bridge-ten__equation">
          10 + {remainingAmount} = {total}
        </div>
      </section>

      {/* Final equation */}
      <div className="bridge-ten__final-equation">
        <span>{firstNumber}</span>
        <span>+</span>
        <span>{secondNumber}</span>
        <span>=</span>
        <span className="bridge-ten__unknown">?</span>
      </div>

      {/* Answer input */}
      <div className="bridge-ten__answer-section">
        <label className="bridge-ten__answer-label">
          Answer:
        </label>

        <input
          type="text"
          inputMode="numeric"
          value={userAnswer ?? ""}
          disabled={showAnswers}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Write answer"
          className={`bridge-ten__answer-input ${
            showAnswers
              ? isCorrect
                ? "bridge-ten__answer-input--correct"
                : "bridge-ten__answer-input--incorrect"
              : ""
          }`}
        />

        {showAnswers && (
          <span
            className={`bridge-ten__feedback ${
              isCorrect
                ? "bridge-ten__feedback--correct"
                : "bridge-ten__feedback--incorrect"
            }`}
          >
            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
          </span>
        )}
      </div>

      {showAnswers && <AnswerBox answer={String(total)} />}
    </div>
  );
}

export default function BridgeTenQuestion({
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  const firstNumber = data.firstNumber;
  const secondNumber = data.secondNumber;
  const bridgeAmount = data.bridgeAmount;
  const reaminingAmmount = data.reaminingAmmount;
  const total = data.total;
  const tenFrame = data.tenFrame ?? [];

  if (
    firstNumber === undefined ||
    secondNumber === undefined ||
    bridgeAmount === undefined ||
    reaminingAmmount === undefined ||
    total === undefined ||
    tenFrame.length === 0
  ) {
    return (
      <div className="bridge-ten__error">
        Bridge to Ten data is incomplete.
      </div>
    );
  }

  return (
    <BridgeTenDisplay
      firstNumber={firstNumber}
      secondNumber={secondNumber}
      bridgeAmount={bridgeAmount}
      remainingAmount={
        reaminingAmmount ?? data.remainingAmount ?? 0
      }
      total={total}
      icon={data.icon ?? "🍎"}
      userAnswer={userAnswer}
      showAnswers={showAnswers}
      onAnswerChange={onAnswerChange}
    />
  );
}
