"use client";

import type { Question } from "@/lib/dummyData";
import "@/app/components/components.css";

interface Props {
  question: Question;
  showAnswers?: boolean;
  isPrint?: boolean;
}

/* ─── Shape SVGs ─────────────────────────────────────── */
const ShapeSVG = ({ shape, size = 32 }: { shape: string; size?: number }) => {
  switch (shape) {
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon
            points="16,3 19.9,12.3 30,12.9 22.5,19.5 24.9,29.1 16,23.7 7.1,29.1 9.5,19.5 2,12.9 12.1,12.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <path
            d="M16 28s-14-9-14-17a7 7 0 0114 0 7 7 0 0114 0c0 8-14 17-14 17z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "triangle":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon
            points="16,4 30,28 2,28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "square":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <rect
            x="4"
            y="4"
            width="24"
            height="24"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <polygon
            points="16,2 30,16 16,30 2,16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
  }
};

/* ─── Answer Box ─────────────────────────────────────── */
const AnswerBox = ({
  label,
  correct,
  shown,
}: {
  label: string;
  correct: boolean;
  shown: boolean;
}) => (
  <div
    className={`qr-answer-box${shown && correct ? " qr-answer-box--correct" : ""}`}
  >
    <div className="qr-answer-circle" />
    <span className="qr-answer-label">{label}</span>
  </div>
);

/* ─── Blank line ─────────────────────────────────────── */
const BlankLine = () => <span className="qr-blank" />;

export default function QuestionRenderer({
  question,
  showAnswers = false,
  isPrint = false,
}: Props) {
  const q = question;

  /* ── Identify ── */
  if (q.type === "Identify") {
    return (
      <div className="qr qr--identify">
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__number-display">
          <span className="qr__big-number">{q.number}</span>
        </div>
        <div className="qr__options">
          {(q.options ?? ["Odd", "Even"]).map((opt) => (
            <AnswerBox
              key={opt}
              label={opt}
              correct={opt === q.answer}
              shown={showAnswers}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── TrueFalse ── */
  if (q.type === "TrueFalse") {
    return (
      <div className="qr qr--truefalse">
        <div className="qr__number-badge">{q.number}</div>
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__options">
          {["True", "False"].map((opt) => (
            <AnswerBox
              key={opt}
              label={opt}
              correct={opt === q.answer}
              shown={showAnswers}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── EmojiCount ── */
  if (q.type === "EmojiCount") {
    const count = q.count ?? 4;
    return (
      <div className="qr qr--emoji">
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__emoji-grid">
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="qr__emoji-item" aria-hidden="true">
              {q.emoji}
            </span>
          ))}
        </div>
        <p className="qr__count-label">
          I count <BlankLine /> {q.emoji} — it is <BlankLine />
        </p>
        {showAnswers && (
          <p className="qr__answer-reveal">
            Answer: {count} — {q.answer as string}
          </p>
        )}
      </div>
    );
  }

  /* ── ShapeCount ── */
  if (q.type === "ShapeCount") {
    const count = q.count ?? 4;
    return (
      <div className="qr qr--shape">
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__shape-grid" style={{ color: "#7B5EA7" }}>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="qr__shape-item">
              <ShapeSVG shape={q.shape ?? "circle"} size={30} />
            </span>
          ))}
        </div>
        <p className="qr__count-label">
          I count <BlankLine /> {q.shape}s — it is <BlankLine />
        </p>
        {showAnswers && (
          <p className="qr__answer-reveal">
            Answer: {count} — {q.answer as string}
          </p>
        )}
      </div>
    );
  }

  /* ── Pattern ── */
  if (q.type === "Pattern") {
    return (
      <div className="qr qr--pattern">
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__pattern-row">
          {(q.numbers ?? []).map((n, i) => (
            <span
              key={i}
              className={`qr__pattern-num${n % 2 !== 0 ? " qr__pattern-num--odd" : " qr__pattern-num--even"}`}
            >
              {n}
            </span>
          ))}
          <span className="qr__pattern-blank">___</span>
        </div>
        {showAnswers && (
          <p className="qr__answer-reveal">Answer: {q.answer as string}</p>
        )}
      </div>
    );
  }

  /* ── CircleOdd / CircleEven ── */
  if (q.type === "CircleOdd" || q.type === "CircleEven") {
    const target = q.type === "CircleOdd" ? "odd" : "even";
    return (
      <div className="qr qr--circle">
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__circle-grid">
          {(q.numbers ?? []).map((n, i) => {
            const isTarget = target === "odd" ? n % 2 !== 0 : n % 2 === 0;
            return (
              <span
                key={i}
                className={`qr__circle-num${showAnswers && isTarget ? " qr__circle-num--circled" : ""}`}
              >
                {n}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Sorting ── */
  if (q.type === "Sorting") {
    return (
      <div className="qr qr--sorting">
        <p className="qr__prompt">{q.question}</p>
        <div className="qr__sort-numbers">
          {(q.numbers ?? []).map((n, i) => (
            <span key={i} className="qr__sort-num">
              {n}
            </span>
          ))}
        </div>
        <div className="qr__sort-boxes">
          <div className="qr__sort-box qr__sort-box--odd">
            <span className="qr__sort-box-label">ODD</span>
            <div className="qr__sort-box-area" />
          </div>
          <div className="qr__sort-box qr__sort-box--even">
            <span className="qr__sort-box-label">EVEN</span>
            <div className="qr__sort-box-area" />
          </div>
        </div>
        {showAnswers && (
          <p className="qr__answer-reveal">
            Odd: {(q.answer as string[])[0]}, {(q.answer as string[])[1]},{" "}
            {(q.answer as string[])[2]}, {(q.answer as string[])[3]}
          </p>
        )}
      </div>
    );
  }

  /* ── Reasoning ── */
  if (q.type === "Reasoning") {
    return (
      <div className="qr qr--reasoning">
        <p className="qr__prompt">{q.question}</p>
        {q.hint && <p className="qr__hint">💡 Hint: {q.hint}</p>}
        <div className="qr__options">
          {(q.options ?? []).map((opt) => (
            <AnswerBox
              key={opt}
              label={opt}
              correct={opt === q.answer}
              shown={showAnswers}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Fallback ── */
  return (
    <div className="qr qr--fallback">
      <p className="qr__prompt">{q.question}</p>
      <BlankLine />
    </div>
  );
}
