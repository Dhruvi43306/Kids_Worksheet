
"use client";

import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import "@/styles/worksheet.css";

type ColumnOption = {
  id: string;
  minuendDigits: (number | null)[];
  subtrahendDigits: (number | null)[];
};

type TraceColumn = {
  place: string;
  minuendDigit: number;
  subtrahendDigit: number;
  inputFields: string[];
};

type TraceAnswerColumn = {
  place: string;
  borrowFromRight: number | null;
  borrowFromLeft: number | null;
  adjustedMinuendDigit: number | null;
  differenceDigit: number | null;
};

type TraceAnswer = {
  columns: TraceAnswerColumn[];
  finalDifference: number | null;
};

type PartialAssemblyPart = {
  place: string;
  placeValue: number;
  minuendDigit: number;
  subtrahendDigit: number;
  equation: string;
};

type PartialAssemblyAnswer = {
  parts: {
    place: string;
    partialDifference: number | null;
  }[];
  sumOfParts: number | null;
  finalDifference: number | null;
};

type InverseOption = {
  id: string;
  equation: string;
};

type AlgorithmData = {
  questionType?: string;
  puzzleTitle?: string;

  minuend?: number;
  subtrahend?: number;
  difference?: number;

  subtractionEquation?: string;

  columns?: string[] | TraceColumn[];
  options?: ColumnOption[] | InverseOption[];

  parts?: PartialAssemblyPart[];
  finalEquation?: string;
};

const placeLabels: Record<string, string> = {
  millions: "M",
  hundredThousands: "HTh",
  tenThousands: "TTh",
  thousands: "Th",
  hundreds: "H",
  tens: "T",
  ones: "O",
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

function makeTraceAnswer(
  visibleColumns: TraceColumn[],
  inputs: TraceAnswerColumn[],
  finalDifference: number | null,
): TraceAnswer {
  return {
    columns: visibleColumns.map((column, index) => {
      const input = inputs[index];

      const adjustedMinuendDigit =
        input.borrowFromRight === null ||
        input.borrowFromLeft === null
          ? null
          : column.minuendDigit -
            input.borrowFromRight +
            input.borrowFromLeft * 10;

      return {
        place: column.place,
        borrowFromRight: input.borrowFromRight,
        borrowFromLeft: input.borrowFromLeft,
        adjustedMinuendDigit,
        differenceDigit: input.differenceDigit,
      };
    }),
    finalDifference,
  };
}

function readTraceAnswer(
  value: string,
  visibleColumns: TraceColumn[],
): TraceAnswer {
  const saved = parseJson<Partial<TraceAnswer>>(value, {});

  const inputs: TraceAnswerColumn[] = visibleColumns.map(
    (column, index) => {
      const previous =
        saved.columns?.find(
          (item) => item.place === column.place,
        ) ?? saved.columns?.[index];

      return {
        place: column.place,
        borrowFromRight: nullableNumber(
          previous?.borrowFromRight,
        ),
        borrowFromLeft: nullableNumber(
          previous?.borrowFromLeft,
        ),
        adjustedMinuendDigit: null,
        differenceDigit: nullableNumber(
          previous?.differenceDigit,
        ),
      };
    },
  );

  return makeTraceAnswer(
    visibleColumns,
    inputs,
    nullableNumber(saved.finalDifference),
  );
}

function readPartialAnswer(
  value: string,
  parts: PartialAssemblyPart[],
): PartialAssemblyAnswer {
  const saved = parseJson<Partial<PartialAssemblyAnswer>>(
    value,
    {},
  );

  const entries = parts.map((part, index) => {
    const previous =
      saved.parts?.find(
        (item) => item.place === part.place,
      ) ?? saved.parts?.[index];

    return {
      place: part.place,
      partialDifference: nullableNumber(
        previous?.partialDifference,
      ),
    };
  });

  const allPartsEntered = entries.every(
    (item) => item.partialDifference !== null,
  );

  const sumOfParts = allPartsEntered
    ? entries.reduce(
        (sum, item) => sum + (item.partialDifference ?? 0),
        0,
      )
    : null;

  return {
    parts: entries,
    sumOfParts,
    finalDifference: nullableNumber(
      saved.finalDifference,
    ),
  };
}

export default function SubtractionAlgorithmStudioQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const details = data as AlgorithmData;

  const code = (
    question.questionTypeCode?.trim() ||
    details.questionType?.trim() ||
    ""
  ).toUpperCase();

  const answer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const correctAnswer = String(
    correctAnswers?.[0] ?? "",
  );

  const isAlignment =
    code === "ALGORITHM_COLUMN_ALIGNMENT";

  const isTrace =
    code === "ALGORITHM_REGROUP_TRACE";

  const isPartial =
    code === "ALGORITHM_PARTIAL_DIFFERENCE_ASSEMBLY";

  const isInverse =
    code === "ALGORITHM_INVERSE_VERIFICATION";

  const traceColumns = Array.isArray(details.columns)
    ? (details.columns as TraceColumn[])
    : [];

  const partials = details.parts ?? [];

  const traceAnswer = readTraceAnswer(
    answer,
    traceColumns,
  );

  const expectedTrace = parseJson<TraceAnswer>(
    correctAnswer,
    {
      columns: [],
      finalDifference: null,
    },
  );

  const partialAnswer = readPartialAnswer(
    answer,
    partials,
  );

  const expectedPartial = parseJson<PartialAssemblyAnswer>(
    correctAnswer,
    {
      parts: [],
      sumOfParts: null,
      finalDifference: null,
    },
  );

  const hasAnswer = answer.trim().length > 0;

  // Correctness checks use the backend's answer.
  const traceCorrect =
    traceColumns.length > 0 &&
    traceAnswer.finalDifference !== null &&
    traceAnswer.finalDifference ===
      expectedTrace.finalDifference &&
    traceAnswer.columns.every((column, index) => {
      const expected = expectedTrace.columns[index];

      return (
        expected !== undefined &&
        column.place === expected.place &&
        column.borrowFromRight ===
          expected.borrowFromRight &&
        column.borrowFromLeft ===
          expected.borrowFromLeft &&
        column.adjustedMinuendDigit ===
          expected.adjustedMinuendDigit &&
        column.differenceDigit ===
          expected.differenceDigit
      );
    });

  const partialCorrect =
    partials.length > 0 &&
    partialAnswer.finalDifference !== null &&
    partialAnswer.sumOfParts !== null &&
    partialAnswer.finalDifference ===
      expectedPartial.finalDifference &&
    partialAnswer.sumOfParts ===
      expectedPartial.sumOfParts &&
    partialAnswer.parts.every((part, index) => {
      const expected = expectedPartial.parts[index];

      return (
        part.partialDifference !== null &&
        expected !== undefined &&
        part.place === expected.place &&
        part.partialDifference ===
          expected.partialDifference
      );
    });

  const isCorrect = isTrace
    ? traceCorrect
    : isPartial
      ? partialCorrect
      : hasAnswer &&
        answer.trim() === correctAnswer.trim();

  // ======================================================
  // COLUMN ALIGNMENT
  // ======================================================

  const alignmentOptions = isAlignment
    ? (details.options as ColumnOption[] | undefined) ?? []
    : [];

  // ======================================================
  // UPDATE REGROUP TRACE ANSWERS
  // ======================================================

  const updateTraceField = (
    columnIndex: number,
    field:
      | "borrowFromRight"
      | "borrowFromLeft"
      | "differenceDigit",
    value: string,
  ) => {
    if (showAnswers) return;

    const inputs = traceAnswer.columns.map(
      (column) => ({ ...column }),
    );

    inputs[columnIndex] = {
      ...inputs[columnIndex],
      [field]:
        value === "" ? null : Number(value),
    };

    const next = makeTraceAnswer(
      traceColumns,
      inputs,
      traceAnswer.finalDifference,
    );

    onAnswerChange(JSON.stringify(next));
  };

  const updateTraceFinalDifference = (
    value: string,
  ) => {
    if (showAnswers) return;

    onAnswerChange(
      JSON.stringify(
        makeTraceAnswer(
          traceColumns,
          traceAnswer.columns,
          value === "" ? null : Number(value),
        ),
      ),
    );
  };

  // ======================================================
  // UPDATE PARTIAL DIFFERENCES
  // ======================================================

  const updatePartial = (
    index: number,
    value: string,
  ) => {
    if (showAnswers) return;

    const nextParts = partialAnswer.parts.map(
      (part) => ({ ...part }),
    );

    nextParts[index].partialDifference =
      value === "" ? null : Number(value);

    const allEntered = nextParts.every(
      (part) => part.partialDifference !== null,
    );

    const sumOfParts = allEntered
      ? nextParts.reduce(
          (total, part) =>
            total + (part.partialDifference ?? 0),
          0,
        )
      : null;

    const next: PartialAssemblyAnswer = {
      parts: nextParts,
      sumOfParts,
      finalDifference:
        partialAnswer.finalDifference,
    };

    onAnswerChange(JSON.stringify(next));
  };

  const updatePartialFinal = (
    value: string,
  ) => {
    if (showAnswers) return;

    const allEntered = partialAnswer.parts.every(
      (part) => part.partialDifference !== null,
    );

    const sumOfParts = allEntered
      ? partialAnswer.parts.reduce(
          (total, part) =>
            total + (part.partialDifference ?? 0),
          0,
        )
      : null;

    const next: PartialAssemblyAnswer = {
      parts: partialAnswer.parts,
      sumOfParts,
      finalDifference:
        value === "" ? null : Number(value),
    };

    onAnswerChange(JSON.stringify(next));
  };

  const inputClass = (
    correct: boolean,
  ) =>
    [
      "subtraction-algorithm-studio__input",
      showAnswers
        ? correct
          ? "subtraction-algorithm-studio__input--correct"
          : "subtraction-algorithm-studio__input--wrong"
        : "",
    ]
      .filter(Boolean)
      .join(" ");

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <section className="subtraction-algorithm-studio">

      {/* Display the question generated by the backend. */}
      <h3 className="subtraction-algorithm-studio__prompt">
        {question.questionText}
      </h3>

      {/* 1. COLUMN ALIGNMENT */}
      {isAlignment && (
        <div className="subtraction-algorithm-studio__panel">
          <div className="subtraction-algorithm-studio__digits">
            {(
              details.columns as string[] | undefined
            )?.map((place) => (
              <span
                key={place}
                title={place}
                aria-label={place}
              >
                {placeLabels[place] ?? place}
              </span>
            ))}
          </div>

          <div className="subtraction-algorithm-studio__layouts">
            {alignmentOptions.map((option, index) => {
              const selected = answer === option.id;
              const correct =
                correctAnswer === option.id;

              const optionClass = [
                "subtraction-algorithm-studio__layout-option",
                selected
                  ? "subtraction-algorithm-studio__layout-option--selected"
                  : "",
                showAnswers && correct
                  ? "subtraction-algorithm-studio__layout-option--correct"
                  : "",
                showAnswers && selected && !correct
                  ? "subtraction-algorithm-studio__layout-option--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={showAnswers}
                  aria-pressed={selected}
                  className={optionClass}
                  onClick={() =>
                    onAnswerChange(option.id)
                  }
                >
                  <span className="subtraction-algorithm-studio__option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <div className="subtraction-algorithm-studio__digit-rows">
                    <div>
                      {option.minuendDigits.map(
                        (digit, digitIndex) => (
                          <span key={digitIndex}>
                            {digit ?? ""}
                          </span>
                        ),
                      )}
                    </div>

                    <div>
                      <b>−</b>

                      {option.subtrahendDigits.map(
                        (digit, digitIndex) => (
                          <span key={digitIndex}>
                            {digit ?? ""}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {showAnswers && correct && (
                    <Check size={18} aria-hidden="true" />
                  )}

                  {showAnswers &&
                    selected &&
                    !correct && (
                      <X size={18} aria-hidden="true" />
                    )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. REGROUP TRACE */}
      {isTrace && (
        <div className="subtraction-algorithm-studio__panel">
          <div className="subtraction-algorithm-studio__equation">
            {details.minuend} − {details.subtrahend}
          </div>

          {traceColumns.map((column, index) => {
            const entered =
              traceAnswer.columns[index];

            const expected =
              expectedTrace.columns[index];

            return (
              <div
                key={`${column.place}-${index}`}
                className="subtraction-algorithm-studio__trace-row"
              >
                <div className="subtraction-algorithm-studio__trace-heading">
                  <strong>{column.place}</strong>
                  <span>
                    {column.minuendDigit} −{" "}
                    {column.subtrahendDigit}
                  </span>
                </div>

                <label>
                  Borrow in
                  <input
                    type="number"
                    min={0}
                    max={1}
                    placeholder="?"
                    value={
                      entered.borrowFromRight ?? ""
                    }
                    disabled={showAnswers}
                    className={inputClass(
                      entered.borrowFromRight ===
                        expected?.borrowFromRight,
                    )}
                    onChange={(event) =>
                      updateTraceField(
                        index,
                        "borrowFromRight",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Borrow out
                  <input
                    type="number"
                    min={0}
                    max={1}
                    placeholder="?"
                    value={
                      entered.borrowFromLeft ?? ""
                    }
                    disabled={showAnswers}
                    className={inputClass(
                      entered.borrowFromLeft ===
                        expected?.borrowFromLeft,
                    )}
                    onChange={(event) =>
                      updateTraceField(
                        index,
                        "borrowFromLeft",
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Result digit
                  <input
                    type="number"
                    min={0}
                    max={9}
                    placeholder="?"
                    value={
                      entered.differenceDigit ?? ""
                    }
                    disabled={showAnswers}
                    className={inputClass(
                      entered.differenceDigit ===
                        expected?.differenceDigit,
                    )}
                    onChange={(event) =>
                      updateTraceField(
                        index,
                        "differenceDigit",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
            );
          })}

          <label className="subtraction-algorithm-studio__final-answer">
            Final difference

            <input
              type="number"
              placeholder="?"
              value={
                traceAnswer.finalDifference ?? ""
              }
              disabled={showAnswers}
              className={inputClass(
                traceAnswer.finalDifference ===
                  expectedTrace.finalDifference,
              )}
              onChange={(event) =>
                updateTraceFinalDifference(
                  event.target.value,
                )
              }
            />
          </label>

          {showAnswers && (
            <p className="subtraction-algorithm-studio__solution">
              Correct difference:{" "}
              <strong>
                {expectedTrace.finalDifference}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* 3. PARTIAL DIFFERENCE ASSEMBLY */}
      {isPartial && (
        <div className="subtraction-algorithm-studio__panel">
          <div className="subtraction-algorithm-studio__equation">
            {details.finalEquation}
          </div>

          {partials.map((part, index) => {
            const entered =
              partialAnswer.parts[index];

            const expected =
              expectedPartial.parts[index];

            return (
              <label
                key={`${part.place}-${index}`}
                className="subtraction-algorithm-studio__partial-row"
              >
                <span>
                  <strong>{part.place}</strong>
                  <small>{part.equation}</small>
                </span>

                <input
                  type="number"
                  placeholder="?"
                  value={
                    entered?.partialDifference ?? ""
                  }
                  disabled={showAnswers}
                  className={inputClass(
                    entered?.partialDifference ===
                      expected?.partialDifference,
                  )}
                  onChange={(event) =>
                    updatePartial(
                      index,
                      event.target.value,
                    )
                  }
                />
              </label>
            );
          })}

          <div className="subtraction-algorithm-studio__sum-row">
            <span>Sum of partial differences</span>
            <strong>
              {partialAnswer.sumOfParts ?? "—"}
            </strong>
          </div>

          <label className="subtraction-algorithm-studio__final-answer">
            Final difference

            <input
              type="number"
              placeholder="?"
              value={
                partialAnswer.finalDifference ?? ""
              }
              disabled={showAnswers}
              className={inputClass(
                partialAnswer.finalDifference ===
                  expectedPartial.finalDifference,
              )}
              onChange={(event) =>
                updatePartialFinal(
                  event.target.value,
                )
              }
            />
          </label>

          {showAnswers && (
            <p className="subtraction-algorithm-studio__solution">
              Correct final difference:{" "}
              <strong>
                {expectedPartial.finalDifference}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* 4. INVERSE VERIFICATION */}
      {isInverse && (
        <div className="subtraction-algorithm-studio__panel">
          <div className="subtraction-algorithm-studio__equation">
            {details.subtractionEquation}
          </div>

          <div className="subtraction-algorithm-studio__inverse-options">
            {(
              details.options as
                | InverseOption[]
                | undefined
            )?.map((option, index) => {
              const selected =
                answer === option.id;

              const correct =
                correctAnswer === option.id;

              const optionClass = [
                "subtraction-algorithm-studio__inverse-option",
                selected
                  ? "subtraction-algorithm-studio__inverse-option--selected"
                  : "",
                showAnswers && correct
                  ? "subtraction-algorithm-studio__inverse-option--correct"
                  : "",
                showAnswers && selected && !correct
                  ? "subtraction-algorithm-studio__inverse-option--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={showAnswers}
                  aria-pressed={selected}
                  className={optionClass}
                  onClick={() =>
                    onAnswerChange(option.id)
                  }
                >
                  <span>
                    {String.fromCharCode(65 + index)}
                  </span>

                  <strong>{option.equation}</strong>

                  {showAnswers && correct && (
                    <Check size={18} aria-hidden="true" />
                  )}

                  {showAnswers &&
                    selected &&
                    !correct && (
                      <X size={18} aria-hidden="true" />
                    )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isAlignment &&
        !isTrace &&
        !isPartial &&
        !isInverse && (
          <p className="subtraction-algorithm-studio__unsupported">
            Unsupported algorithm question type:{" "}
            {code || "Unknown"}
          </p>
        )}

      {showAnswers && (
        <p
          className={[
            "subtraction-algorithm-studio__feedback",
            isCorrect
              ? "subtraction-algorithm-studio__feedback--correct"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="status"
        >
          {isCorrect ? (
            <Check size={18} aria-hidden="true" />
          ) : (
            <X size={18} aria-hidden="true" />
          )}

          <span>
            {isCorrect
              ? "Correct answer!"
              : "Check your answer against the solution."}
          </span>
        </p>
      )}
    </section>
  );
}
