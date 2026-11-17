
"use client";

import { useState } from "react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import "@/styles/worksheet.css";

type StrategyData = {
  questionType?: string;

  originalStart?: number;
  originalTakeAway?: number;
  roundedTakeAway?: number;

  leftStart?: number;
  leftTakeAway?: number;
  rightTakeAway?: number;

  targetDifference?: number;
  numberTiles?: { id: string; value: number }[];
  requiredEquationCount?: number;

  sequence?: { id: string; position: number; value: number }[];
};

type EquationPair = {
  minuendTileId: string;
  subtrahendTileId: string;
};

type PatternAnswer = {
  position?: number;
  correctedValue?: number | null;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export default function SubtractionNumberStrategyLabQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const strategy = data as StrategyData;

  const code = (
    question.questionTypeCode?.trim() ||
    strategy.questionType ||
    ""
  ).toUpperCase();

  const answer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const correctAnswer = String(correctAnswers?.[0] ?? "");

  const isNumeric =
    code === "NUMERIC_COMPENSATION_BRIDGE" ||
    code === "NUMERIC_EQUATION_BALANCER";

  const isBuilder =
    code === "NUMERIC_TARGET_DIFFERENCE_BUILDER";

  const isPattern =
    code === "NUMERIC_DIFFERENCE_PATTERN_CHECK";
const pairs = parseEquationPairs(answer);
const correctPairs = parseEquationPairs(correctAnswer);

  const pattern = parseJson<PatternAnswer>(answer, {});
  const correctPattern = parseJson<PatternAnswer>(correctAnswer, {});

  const tiles = strategy.numberTiles ?? [];
  const sequence = strategy.sequence ?? [];

  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);

  const usedTileIds = new Set(
    pairs.flatMap((pair) => [
      pair.minuendTileId,
      pair.subtrahendTileId,
    ]),
  );

  const samePairs = (
    first: EquationPair[],
    second: EquationPair[],
  ) => {
    if (first.length === 0 || first.length !== second.length) {
      return false;
    }

    const key = (pair: EquationPair) =>
      `${pair.minuendTileId}:${pair.subtrahendTileId}`;

    const a = first.map(key).sort();
    const b = second.map(key).sort();

    return a.every((value, index) => value === b[index]);
  };

  const isCorrect =
    answer.trim() !== "" &&
    (
      isNumeric
        ? answer.trim() === correctAnswer.trim()
        : isBuilder
          ? samePairs(pairs, correctPairs)
          : isPattern &&
            Number(pattern.position) === Number(correctPattern.position) &&
            Number(pattern.correctedValue) === Number(correctPattern.correctedValue)
    );

  // NUMERIC_TARGET_DIFFERENCE_BUILDER
  const addEquation = () => {
    if (showAnswers || selectedTiles.length !== 2) return;

    const first = tiles.find((tile) => tile.id === selectedTiles[0]);
    const second = tiles.find((tile) => tile.id === selectedTiles[1]);

    if (!first || !second || first.value === second.value) return;

    const pair: EquationPair =
      first.value > second.value
        ? {
            minuendTileId: first.id,
            subtrahendTileId: second.id,
          }
        : {
            minuendTileId: second.id,
            subtrahendTileId: first.id,
          };

    const next = [...pairs, pair];
    const order = new Map(tiles.map((tile, index) => [tile.id, index]));

    next.sort(
      (a, b) =>
        (order.get(a.minuendTileId) ?? 0) -
          (order.get(b.minuendTileId) ?? 0) ||
        (order.get(a.subtrahendTileId) ?? 0) -
          (order.get(b.subtrahendTileId) ?? 0),
    );

    onAnswerChange(JSON.stringify(next));
    setSelectedTiles([]);
  };

  const toggleTile = (id: string) => {
    if (showAnswers || usedTileIds.has(id)) return;

    setSelectedTiles((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      return previous.length >= 2
        ? [previous[1], id]
        : [...previous, id];
    });
  };

  const removePair = (index: number) => {
    if (showAnswers) return;

    onAnswerChange(
      JSON.stringify(pairs.filter((_, i) => i !== index)),
    );

    setSelectedTiles([]);
  };

  // NUMERIC_DIFFERENCE_PATTERN_CHECK
  const updatePattern = (
    position: number | undefined,
    value: string,
  ) => {
    if (showAnswers) return;

    onAnswerChange(
      JSON.stringify({
        position,
        correctedValue: value.trim() === "" ? null : Number(value),
      }),
    );
  };

  const inputClass = (
    isCorrect && showAnswers
      ? "subtraction-strategy-lab__input--correct"
      : answer && showAnswers
        ? "subtraction-strategy-lab__input--wrong"
        : ""
  );

  return (
    <section className="subtraction-strategy-lab">
          <h3 className="generated-question__text">
      {question.questionText}
    </h3>
      {/* The question text is rendered once by the parent worksheet. */}

      {isNumeric && (
        <div className="subtraction-strategy-lab__answer">
          {code === "NUMERIC_COMPENSATION_BRIDGE" && (
            <span>
              {strategy.originalStart} − {strategy.originalTakeAway}
              {" = "}
              {strategy.originalStart} − {strategy.roundedTakeAway} + □
            </span>
          )}

          {code === "NUMERIC_EQUATION_BALANCER" && (
            <span>
              {strategy.leftStart} − {strategy.leftTakeAway}
              {" = □ − "}
              {strategy.rightTakeAway}
            </span>
          )}

          <input
            type="number"
            inputMode="numeric"
            aria-label="Enter your answer"
            placeholder="?"
            value={answer}
            disabled={showAnswers}
            className={inputClass}
            onChange={(event) => onAnswerChange(event.target.value)}
          />
        </div>
      )}

      {isBuilder && (
        <div className="subtraction-strategy-lab__builder">

          <div className="subtraction-strategy-lab__target">
            Target difference: <strong>{strategy.targetDifference}</strong>
          </div>

          <div className="subtraction-strategy-lab__tiles">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                type="button"
                disabled={showAnswers || usedTileIds.has(tile.id)}
                aria-pressed={selectedTiles.includes(tile.id)}
                className={[
                  "subtraction-strategy-lab__tile",
                  selectedTiles.includes(tile.id)
                    ? "subtraction-strategy-lab__tile--selected"
                    : "",
                  usedTileIds.has(tile.id)
                    ? "subtraction-strategy-lab__tile--used"
                    : "",
                ].filter(Boolean).join(" ")}
                onClick={() => toggleTile(tile.id)}
              >
                {tile.value}
              </button>
            ))}
          </div>

          {!showAnswers && (
            <button
              type="button"
              className="subtraction-strategy-lab__add"
              disabled={
                selectedTiles.length !== 2 ||
                pairs.length >= (strategy.requiredEquationCount ?? 2)
              }
              onClick={addEquation}
            >
              Add equation
            </button>
          )}

          <div className="subtraction-strategy-lab__equations">
            {pairs.map((pair, index) => {
              const start = tiles.find(
                (tile) => tile.id === pair.minuendTileId,
              );
              const takeAway = tiles.find(
                (tile) => tile.id === pair.subtrahendTileId,
              );

              return (
                <div key={`${pair.minuendTileId}-${pair.subtrahendTileId}`}>
                  <span>
                    {start?.value} − {takeAway?.value} ={" "}
                    {(start?.value ?? 0) - (takeAway?.value ?? 0)}
                  </span>

                  {!showAnswers && (
                    <button
                      type="button"
                      aria-label={`Remove equation ${index + 1}`}
                      onClick={() => removePair(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {showAnswers && (
            <div className="subtraction-strategy-lab__solution">
              <strong>Correct equations</strong>

              {correctPairs.map((pair) => {
                const start = tiles.find(
                  (tile) => tile.id === pair.minuendTileId,
                );
                const takeAway = tiles.find(
                  (tile) => tile.id === pair.subtrahendTileId,
                );

                return (
                  <div key={`${pair.minuendTileId}-${pair.subtrahendTileId}`}>
                    {start?.value} − {takeAway?.value} ={" "}
                    {(start?.value ?? 0) - (takeAway?.value ?? 0)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

     
{isPattern && (
  <div className="subtraction-strategy-lab__pattern">
    <div className="subtraction-strategy-lab__sequence">
      {sequence.map((item) => {
        const selected =
          Number(pattern.position) === item.position;

        const isBroken =
          showAnswers &&
          item.position === correctPattern.position;

        return (
          <button
            key={item.id}
            type="button"
            disabled={showAnswers}
            aria-pressed={selected}
            className={[
              "subtraction-strategy-lab__sequence-item",
              selected
                ? "subtraction-strategy-lab__sequence-item--selected"
                : "",
              isBroken
                ? "subtraction-strategy-lab__sequence-item--correct"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() =>
              updatePattern(
                item.position,
                String(pattern.correctedValue ?? ""),
              )
            }
          >
            <span>{item.position}</span>
            <strong>{item.value}</strong>
          </button>
        );
      })}
    </div>

    <div className="subtraction-strategy-lab__pattern-answer">
      <label
        htmlFor={`pattern-position-${question.generatedQuestionId}`}
      >
        Incorrect position
        <select
          id={`pattern-position-${question.generatedQuestionId}`}
          value={pattern.position ?? ""}
          disabled={showAnswers}
          onChange={(event) =>
            updatePattern(
              event.target.value
                ? Number(event.target.value)
                : undefined,
              String(pattern.correctedValue ?? ""),
            )
          }
        >
          <option value="">Choose position</option>

          {sequence.map((item) => (
            <option key={item.id} value={item.position}>
              Position {item.position}
            </option>
          ))}
        </select>
      </label>

      <label
        htmlFor={`pattern-corrected-${question.generatedQuestionId}`}
      >
        Correct number
        <input
          id={`pattern-corrected-${question.generatedQuestionId}`}
          type="number"
          inputMode="numeric"
          placeholder="?"
          value={pattern.correctedValue ?? ""}
          disabled={showAnswers}
          onChange={(event) =>
            updatePattern(pattern.position, event.target.value)
          }
        />
      </label>

      {showAnswers && (
        <p className="subtraction-strategy-lab__solution">
          Position <strong>{correctPattern.position}</strong> should contain{" "}
          <strong>{correctPattern.correctedValue}</strong>.
        </p>
      )}
    </div>
  </div>
)}


      {showAnswers && (
        <p
          className={
            isCorrect
              ? "subtraction-strategy-lab__feedback--correct"
              : "subtraction-strategy-lab__feedback"
          }
        >
          {isCorrect ? "Correct answer!" : "Review the solution above."}
        </p>
      )}

    </section>
  );
}
function parseEquationPairs(value: string): EquationPair[] {
  const parsed = parseJson<unknown>(value, []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(
    (item): item is EquationPair =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as EquationPair).minuendTileId === "string" &&
      typeof (item as EquationPair).subtrahendTileId === "string",
  );
}