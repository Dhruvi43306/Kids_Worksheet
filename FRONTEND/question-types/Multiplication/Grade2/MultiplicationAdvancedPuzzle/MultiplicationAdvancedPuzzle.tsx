
import React from "react";
import "@/styles/worksheet.css";

type BallSet = {
  groups: number;
  itemsPerGroup: number;
  total: number;
};

type EquationOption = {
  id: string;
  equation: string;
};

type MultiplicationAdvancedData = {
  renderKey?: string;
  questionType?: string;
  title?: string;
  red?: BallSet;
  blue?: BallSet;
  fixedFactor?: number;
  minimumProduct?: number;
  maximumProduct?: number;
  instruction?: string;
  options?: EquationOption[];
};

type Props = {
  questionData?: string | Record<string, unknown> | null;
  data?: string | Record<string, unknown> | null;
  question?: Record<string, unknown> | null;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
};

function getProperty(
  obj: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }

  return undefined;
}

function parsePuzzleData(props: Props): MultiplicationAdvancedData {
  let raw: unknown =
    props.questionData ?? props.data ?? props.question ?? null;

  // Supports JSON strings and objects nested inside question wrappers.
  for (let depth = 0; depth < 8; depth++) {
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        return {};
      }
    }

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }

    const obj = raw as Record<string, unknown>;

    const questionType = getProperty(
      obj,
      "questionType",
      "QuestionType",
      "code",
      "Code"
    );

    const renderKey = getProperty(obj, "renderKey", "RenderKey");

    // Recognize both supported backend question types.
    if (
      obj.red ||
      obj.Red ||
      obj.fixedFactor !== undefined ||
      obj.FixedFactor !== undefined ||
      (typeof questionType === "string" &&
        questionType.toUpperCase().startsWith("MULTIPLICATION_"))
    ) {
      return {
        renderKey:
          typeof renderKey === "string" ? renderKey : undefined,
        questionType:
          typeof questionType === "string"
            ? questionType.toUpperCase()
            : undefined,
        title: getProperty(obj, "title", "Title") as string | undefined,
        red: getProperty(obj, "red", "Red") as BallSet | undefined,
        blue: getProperty(obj, "blue", "Blue") as BallSet | undefined,
        fixedFactor: getProperty(
          obj,
          "fixedFactor",
          "FixedFactor"
        ) as number | undefined,
        minimumProduct: getProperty(
          obj,
          "minimumProduct",
          "MinimumProduct"
        ) as number | undefined,
        maximumProduct: getProperty(
          obj,
          "maximumProduct",
          "MaximumProduct"
        ) as number | undefined,
        instruction: getProperty(
          obj,
          "instruction",
          "Instruction"
        ) as string | undefined,
        options: getProperty(
          obj,
          "options",
          "Options"
        ) as EquationOption[] | undefined,
      };
    }

    // Unwrap common API/DTO property names.
    raw = getProperty(
      obj,
      "questionData",
      "QuestionData",
      "QuestionDataJson",
      "questionDataJson",
      "data",
      "Data",
      "question",
      "Question"
    );
  }

  return {};
}

function BallGroup({
  color,
  groups,
  itemsPerGroup,
}: {
  color: "red" | "blue";
  groups: number;
  itemsPerGroup: number;
}) {
  const safeGroups = Math.min(Math.max(Number(groups) || 0, 0), 8);
  const safeItems = Math.min(
    Math.max(Number(itemsPerGroup) || 0, 0),
    10
  );

  return (
    <div className={`mabp26-${color}-group-list`}>
      {Array.from({ length: safeGroups }, (_, groupIndex) => (
        <div className="mabp26-ball-group" key={groupIndex}>
          <div className="mabp26-ball-group-label">
            Group {groupIndex + 1}
          </div>

          <div className="mabp26-ball-row">
            {Array.from({ length: safeItems }, (_, itemIndex) => (
              <span
                key={itemIndex}
                className={`mabp26-ball mabp26-ball-${color}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BundleQuestion({
  puzzle,
  questionText,
  value,
  onAnswerChange,
  disabled,
  isChecked,
  isCorrect,
  correctAnswer,
}: {
  puzzle: MultiplicationAdvancedData;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
}) {
  const red = puzzle.red;
  const blue = puzzle.blue;

  if (!red || !blue) {
    return (
      <div className="mabp26-error">
        The red and blue ball data is missing from this question.
      </div>
    );
  }
  return (
    <section className="mabp26-question">
      <div className="mabp26-question-heading">
        <span className="mabp26-question-icon" aria-hidden="true">
          ✖
        </span>
        <span>Multiplication</span>
      </div>

      <p className="mabp26-question-text">
        {questionText ||
          "Count the balls in both sets. How many balls are there altogether?"}
      </p>

      <div className="mabp26-sets">
        {(
          [
            { color: "red", label: "Red balls", set: red },
            { color: "blue", label: "Blue balls", set: blue },
          ] as const
        ).map(({ color, label, set }) => (
          <section
            key={color}
            className={`mabp26-set mabp26-set-${color}`}
          >
            <div className="mabp26-set-heading">
              <span
                className={`mabp26-set-dot mabp26-dot-${color}`}
              />
              <div>
                <div className="mabp26-set-name">{label}</div>
                <div className="mabp26-set-description">
                  {set.groups} groups · {set.itemsPerGroup} in each group
                </div>
              </div>
            </div>

            <BallGroup
              color={color}
              groups={set.groups}
              itemsPerGroup={set.itemsPerGroup}
            />

            <div className="mabp26-multiplication-hint">
              {set.groups} groups × {set.itemsPerGroup} balls
            </div>
          </section>
        ))}
      </div>
        <MultiplicationAnswerFeedback
  isChecked={isChecked}
  isCorrect={isCorrect}
  correctAnswer={correctAnswer}
/>

      <div className="mabp26-answer-area">
        <label
          className="mabp26-answer-label"
          htmlFor="mabp26-answer"
        >
          How many balls are there altogether?
        </label>

        <div className="mabp26-answer-entry">
          <span className="mabp26-answer-equation">
            Red + Blue =
          </span>

          <input
            id="mabp26-answer"
            className="mabp26-answer-input"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={value ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onAnswerChange?.(event.target.value)
            }
            aria-label="Enter the total number of balls"
          />

          <span className="mabp26-answer-unit">balls</span>
        </div>
      </div>
    </section>
    
  );
  
}

function ConstraintQuestion({
  puzzle,
  questionText,
  value,
  onAnswerChange,
  disabled,
}: {
  puzzle: MultiplicationAdvancedData;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
}) {
  const options = (puzzle.options ?? [])
    .map((option) => ({
      id: String(option.id ?? ""),
      equation: String(option.equation ?? ""),
    }))
    .filter((option) => option.id && option.equation);

  const selectedIds = String(value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const toggleOption = (id: string) => {
    if (disabled) return;

    const nextIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    // Backend expects comma-separated option IDs.
    onAnswerChange?.(nextIds.sort().join(","));
  };

  if (options.length === 0) {
    return (
      <div className="mabp26-error">
        Equation options are missing from this question's backend data.
      </div>
    );
  }

  return (
    <section className="mabp26-constraint">
      <div className="mabp26-constraint-heading">
        <span className="mabp26-constraint-icon" aria-hidden="true">
          ?
        </span>

        <div>
          <div className="mabp26-constraint-title">
            {puzzle.title || "Solve the multiplication clues"}
          </div>
          <div className="mabp26-constraint-subtitle">
            Choose every equation that follows the clues.
          </div>
        </div>
      </div>

      <p className="mabp26-constraint-question">
        {questionText ||
          puzzle.instruction ||
          "Select all equations that satisfy the clues."}
      </p>

      <div className="mabp26-constraint-clues">
        <div className="mabp26-constraint-clue">
          <span className="mabp26-constraint-clue-number">1</span>
          One factor must be{" "}
          <strong>{puzzle.fixedFactor ?? "?"}</strong>.
        </div>

        <div className="mabp26-constraint-clue">
          <span className="mabp26-constraint-clue-number">2</span>
          The other factor must be odd.
        </div>

        <div className="mabp26-constraint-clue">
          <span className="mabp26-constraint-clue-number">3</span>
          The product must be between{" "}
          <strong>{puzzle.minimumProduct ?? "?"}</strong> and{" "}
          <strong>{puzzle.maximumProduct ?? "?"}</strong>.
        </div>
      </div>

      <div className="mabp26-constraint-options">
        {options.map((option, index) => {
          const selected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              className={`mabp26-constraint-option ${
                selected ? "mabp26-constraint-option-selected" : ""
              }`}
              onClick={() => toggleOption(option.id)}
              disabled={disabled}
              aria-pressed={selected}
            >
              <span className="mabp26-constraint-option-letter">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="mabp26-constraint-equation">
                {option.equation}
              </span>

              <span className="mabp26-constraint-check" aria-hidden="true">
                {selected ? "✓" : "+"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mabp26-constraint-selection">
        {selectedIds.length === 0
          ? "Select all equations you think are correct."
          : `${selectedIds.length} equation${
              selectedIds.length === 1 ? "" : "s"
            } selected`}
      </div>
    </section>
  );
}

export default function MultiplicationAdvancedPuzzle(props: Props) {
  const puzzle = parsePuzzleData(props);

  const type = (puzzle.questionType ?? "").toUpperCase();

  // Determine the question by its actual data as well as its type code.
  const isBundleQuestion =
    type === "MULTIPLICATION_TWO_STAGE_BUNDLE_PUZZLE" ||
    Boolean(puzzle.red && puzzle.blue);

  const isConstraintQuestion =
    type === "MULTIPLICATION_CONSTRAINT_SATISFACTION" ||
    puzzle.fixedFactor !== undefined ||
    Boolean(puzzle.options?.length);

  if (isBundleQuestion) {
    return <BundleQuestion {...props} puzzle={puzzle} />;
  }

  if (isConstraintQuestion) {
    return <ConstraintQuestion {...props} puzzle={puzzle} />;
  }


  return (
    <div className="mabp26-error">
      This multiplication question has an unrecognized data structure.
      Check that the backend sends the questionData JSON for this question.
    </div>
  );
}
function MultiplicationAnswerFeedback({
  isChecked,
  isCorrect,
  correctAnswer,
}: {
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
}) {
  if (!isChecked) return null;

  return (
    <div
      className={`mabp26-answer-feedback ${
        isCorrect
          ? "mabp26-answer-feedback-correct"
          : "mabp26-answer-feedback-wrong"
      }`}
      role="status"
    >
      {isCorrect ? (
        <span>Correct! Well done!</span>
      ) : (
        <span>
          Not quite. The correct answer is:{" "}
          <strong>{correctAnswer || "Not available"}</strong>
        </span>
      )}
    </div>
  );
}