
export function GridNumberBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="ws-grid-number-box">
      <span className="ws-grid-number-box__label">
        {label}
      </span>

      <span className="ws-grid-number-box__value">
        {value}
      </span>
    </div>
  );
}

export function GridTotalBox({
  label,
  correctValue,
  userValue,
  showAnswers,
  onChange,
}: {
  label: string;
  correctValue: number;
  userValue: string;
  showAnswers: boolean;
  onChange: (value: string) => void;
}) {
  const isCorrect =
    userValue.trim() !== "" && Number(userValue) === correctValue;

  const inputStateClass = showAnswers
    ? isCorrect
      ? "ws-grid-total-box__input--correct"
      : "ws-grid-total-box__input--wrong"
    : "ws-grid-total-box__input--idle";

  return (
    <div className="ws-grid-total-box">
      <span className="ws-grid-total-box__label">
        {label}
      </span>

      <input
        type="number"
        value={showAnswers ? correctValue : userValue}
        disabled={showAnswers}
        onChange={(e) => onChange(e.target.value)}
        placeholder="?"
        className={`ws-grid-total-box__input ${inputStateClass}`}
      />

      {showAnswers && (
        <span
          className={
            isCorrect
              ? "ws-grid-total-box__feedback--correct"
              : "ws-grid-total-box__feedback--wrong"
          }
        >
          {isCorrect ? "✓ Correct" : `Answer: ${correctValue}`}
        </span>
      )}
    </div>
  );
}
