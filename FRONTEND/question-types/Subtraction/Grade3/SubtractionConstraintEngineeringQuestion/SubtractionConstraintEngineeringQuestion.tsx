
"use client";

import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import "@/styles/worksheet.css";

type ConstraintCard = {
  id: string;
  equation: string;
};

type ConstraintData = {
  questionType?: string;
  equation?: string;
  minuend?: number;
  minimumResult?: number;
  maximumResult?: number;
  originalMinuend?: number;
  originalSubtrahend?: number;
  originalDifference?: number;
  increaseFirst?: number;
  increaseSecond?: number;
  newMinuend?: number;
  newSubtrahend?: number;
  subtrahend?: number;
  currentDifference?: number;
  targetDifference?: number;
  rule?: {
    parity?: string;
    minimumDifference?: number;
    maximumDifference?: number;
    inclusive?: boolean;
  };
  cards?: ConstraintCard[];
};

type WindowAnswer = {
  smallestSubtrahend: number | null;
  largestSubtrahend: number | null;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseWindowAnswer(value: string): WindowAnswer {
  const parsed = parseJson<unknown>(value, null);

  if (typeof parsed !== "object" || parsed === null) {
    return {
      smallestSubtrahend: null,
      largestSubtrahend: null,
    };
  }

  const candidate = parsed as Partial<WindowAnswer>;

  return {
    smallestSubtrahend:
      typeof candidate.smallestSubtrahend === "number"
        ? candidate.smallestSubtrahend
        : null,
    largestSubtrahend:
      typeof candidate.largestSubtrahend === "number"
        ? candidate.largestSubtrahend
        : null,
  };
}

function parseStringArray(value: string): string[] {
  const parsed = parseJson<unknown>(value, []);

  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => typeof item === "string")
  ) {
    return [];
  }

  return parsed;
}

export default function SubtractionConstraintEngineeringQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const details = data as ConstraintData;

  const code = (
    question.questionTypeCode?.trim() ||
    details.questionType?.trim() ||
    ""
  ).toUpperCase();

  const answer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const correctAnswer = String(correctAnswers?.[0] ?? "");

  const isWindow = code === "CONSTRAINT_DIFFERENCE_WINDOW";
  const isOperandChange =
    code === "CONSTRAINT_OPERAND_CHANGE_IMPACT";
  const isAdjustment =
    code === "CONSTRAINT_MINIMUM_ADJUSTMENT";
  const isCount = code === "CONSTRAINT_COUNT_VALID_PAIRS";

  const windowAnswer = parseWindowAnswer(answer);
  const expectedWindow = parseWindowAnswer(correctAnswer);

const selectedEquationIds = parseStringArray(answer);

const expectedEquationIds = isCount
  ? getExpectedEquationIds(
      correctAnswers,
      correctAnswer,
      details.cards ?? [],
      details.rule,
    )
  : [];

  const hasAnswer = answer.trim() !== "";

  const windowCorrect =
    windowAnswer.smallestSubtrahend !== null &&
    windowAnswer.largestSubtrahend !== null &&
    expectedWindow.smallestSubtrahend !== null &&
    expectedWindow.largestSubtrahend !== null &&
    windowAnswer.smallestSubtrahend ===
      expectedWindow.smallestSubtrahend &&
    windowAnswer.largestSubtrahend ===
      expectedWindow.largestSubtrahend;

  const countCorrect =
    selectedEquationIds.length > 0 &&
    selectedEquationIds.length === expectedEquationIds.length &&
    selectedEquationIds.every((id) =>
      expectedEquationIds.includes(id),
    );

  const numericCorrect =
    hasAnswer &&
    correctAnswer.trim() !== "" &&
    Number.isFinite(Number(answer)) &&
    Number(answer) === Number(correctAnswer);

  const isCorrect = isWindow
    ? windowCorrect
    : isCount
      ? countCorrect
      : numericCorrect;

  const updateWindow = (
    field: keyof WindowAnswer,
    value: string,
  ) => {
    if (showAnswers) return;

    const next: WindowAnswer = {
      ...windowAnswer,
      [field]: value === "" ? null : Number(value),
    };

    onAnswerChange(JSON.stringify(next));
  };

  const toggleEquation = (id: string) => {
    if (showAnswers) return;

    const next = selectedEquationIds.includes(id)
      ? selectedEquationIds.filter((selectedId) => selectedId !== id)
      : [...selectedEquationIds, id];

    // The answer box below reads this same selection state.
    onAnswerChange(JSON.stringify(next));
  };

  const renderNumericAnswer = (label: string) => (
    <label className="subtraction-constraint-engineering__field">
      <span>{label}</span>

      <input
        type="number"
        inputMode="numeric"
        value={answer}
        placeholder="?"
        disabled={showAnswers}
        className={[
          "subtraction-constraint-engineering__input",
          showAnswers && hasAnswer
            ? isCorrect
              ? "subtraction-constraint-engineering__input--correct"
              : "subtraction-constraint-engineering__input--wrong"
            : "",
        ].filter(Boolean).join(" ")}
        onChange={(event) => onAnswerChange(event.target.value)}
      />
    </label>
  );

  return (
    <section className="subtraction-constraint-engineering">
      {/* The parent worksheet displays question.questionText once. */}

      {/* 1. DIFFERENCE WINDOW */}
      {isWindow && (
        <div className="subtraction-constraint-engineering__panel">
          <div className="subtraction-constraint-engineering__equation">
            {details.equation}
          </div>

          <div className="subtraction-constraint-engineering__range">
            <span>Allowed difference</span>
            <strong>{details.minimumResult}</strong>
            <span>to</span>
            <strong>{details.maximumResult}</strong>
          </div>

          <div className="subtraction-constraint-engineering__two-fields">
            <label className="subtraction-constraint-engineering__field">
              <span>Smallest x</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="?"
                value={windowAnswer.smallestSubtrahend ?? ""}
                disabled={showAnswers}
                className="subtraction-constraint-engineering__input"
                onChange={(event) =>
                  updateWindow(
                    "smallestSubtrahend",
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="subtraction-constraint-engineering__field">
              <span>Largest x</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="?"
                value={windowAnswer.largestSubtrahend ?? ""}
                disabled={showAnswers}
                className="subtraction-constraint-engineering__input"
                onChange={(event) =>
                  updateWindow(
                    "largestSubtrahend",
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        </div>
      )}

      {/* 2. OPERAND CHANGE IMPACT */}
      {isOperandChange && (
        <div className="subtraction-constraint-engineering__panel">
          <div className="subtraction-constraint-engineering__comparison">
            <div>
              <span>Original</span>
              <strong>
                {details.originalMinuend} −{" "}
                {details.originalSubtrahend}
              </strong>
              <small>
                Difference: {details.originalDifference}
              </small>
            </div>

            <div>
              <span>After changes</span>
              <strong>
                {details.newMinuend} − {details.newSubtrahend}
              </strong>
              <small>
                First +{details.increaseFirst}
                {" · "}
                Second +{details.increaseSecond}
              </small>
            </div>
          </div>

          {renderNumericAnswer("New difference")}
        </div>
      )}

      {/* 3. MINIMUM ADJUSTMENT */}
    
{isAdjustment && (
  <div className="subtraction-constraint-engineering__panel">
    <div className="subtraction-constraint-engineering__adjustment-row">
      <div className="subtraction-constraint-engineering__equation">
        {details.equation}
      </div>

      <label className="subtraction-constraint-engineering__adjustment-field">
        {/* <span>Answer</span> */}

        <input
          type="number"
          inputMode="numeric"
          placeholder="?"
          value={answer}
          disabled={showAnswers}
          className={[
            "subtraction-constraint-engineering__input",
            showAnswers && hasAnswer
              ? isCorrect
                ? "subtraction-constraint-engineering__input--correct"
                : "subtraction-constraint-engineering__input--wrong"
              : "",
          ].filter(Boolean).join(" ")}
          onChange={(event) => onAnswerChange(event.target.value)}
        />
      </label>
    </div>
  </div>
)}


      {/* 4. COUNT VALID PAIRS: SELECT EQUATIONS */}
      {isCount && (
        <div className="subtraction-constraint-engineering__panel">
          <div className="subtraction-constraint-engineering__rule">
            Difference must be {details.rule?.parity} and between{" "}
            <strong>{details.rule?.minimumDifference}</strong>
            {" and "}
            <strong>{details.rule?.maximumDifference}</strong>.
          </div>

          <div className="subtraction-constraint-engineering__cards">
            {(details.cards ?? []).map((card, index) => {
              const selected = selectedEquationIds.includes(card.id);
              const expected = expectedEquationIds.includes(card.id);

              const cardClass = [
                "subtraction-constraint-engineering__card",
                "subtraction-constraint-engineering__card--selectable",
                selected
                  ? "subtraction-constraint-engineering__card--selected"
                  : "",
                showAnswers && expected
                  ? "subtraction-constraint-engineering__card--correct"
                  : "",
                showAnswers && selected && !expected
                  ? "subtraction-constraint-engineering__card--wrong"
                  : "",
              ].filter(Boolean).join(" ");

              return (
                <button
                  key={card.id}
                  type="button"
                  disabled={showAnswers}
                  aria-pressed={selected}
                  className={cardClass}
                  onClick={() => toggleEquation(card.id)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>

                  <strong>{card.equation}</strong>

                  <span className="subtraction-constraint-engineering__checkbox">
                    {selected ? "✓" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="subtraction-constraint-engineering__selected-count">
            <label
              htmlFor={`valid-count-${question.generatedQuestionId}`}
            >
              Equations selected
            </label>

            <input
              id={`valid-count-${question.generatedQuestionId}`}
              type="number"
              value={selectedEquationIds.length}
              readOnly
              aria-label="Number of equations selected"
            />
          </div>

          {showAnswers && (
            <p className="subtraction-constraint-engineering__solution">
              Correct equations:{" "}
              <strong>{expectedEquationIds.length}</strong>
            </p>
          )}
        </div>
      )}

      {!isWindow && !isOperandChange && !isAdjustment && !isCount && (
        <div className="subtraction-constraint-engineering__unsupported">
          Unsupported question type: {code || "Unknown"}
        </div>
      )}

      {showAnswers && (
        <div
          className={[
            "subtraction-constraint-engineering__feedback",
            isCorrect
              ? "subtraction-constraint-engineering__feedback--correct"
              : "",
          ].filter(Boolean).join(" ")}
          role="status"
        >
          {isCorrect ? <Check size={18} /> : <X size={18} />}

          <span>
            {isCorrect
              ? "Correct answer!"
              : isWindow
                ? `Correct range: ${expectedWindow.smallestSubtrahend ?? "—"} to ${expectedWindow.largestSubtrahend ?? "—"}`
                : isCount
                  ? `Correct equations: ${expectedEquationIds.length}`
                  : `Correct answer: ${correctAnswer}`}
          </span>
        </div>
      )}
    </section>
  );
}
function getExpectedEquationIds(
  correctAnswers: string[] | undefined,
  rawCorrectAnswer: string,
  cards: ConstraintCard[],
  rule: ConstraintData["rule"],
): string[] {
  const availableIds = new Set(cards.map((card) => card.id));

  // Case 1: correctAnswers is already a list of equation IDs.
  const directIds = (correctAnswers ?? []).filter((id) =>
    availableIds.has(id),
  );

  if (directIds.length > 0) {
    return [...new Set(directIds)];
  }

  // Case 2: CorrectAnswer contains a serialized JSON array.
  const parsedIds = parseStringArray(rawCorrectAnswer).filter((id) =>
    availableIds.has(id),
  );

  if (parsedIds.length > 0) {
    return [...new Set(parsedIds)];
  }
  const minimum = rule?.minimumDifference;
  const maximum = rule?.maximumDifference;
  const parity = rule?.parity?.toLowerCase();

  if (
    typeof minimum !== "number" ||
    typeof maximum !== "number"
  ) {
    return [];
  }

  return cards
    .filter((card) => {
      const match = card.equation.match(
        /^\s*(\d+)\s*-\s*(\d+)\s*$/,
      );

      if (!match) return false;

      const difference = Number(match[1]) - Number(match[2]);

      const matchesParity =
        parity === "even"
          ? difference % 2 === 0
          : parity === "odd"
            ? difference % 2 !== 0
            : true;

      return (
        matchesParity &&
        difference >= minimum &&
        difference <= maximum
      );
    })
    .map((card) => card.id);
}