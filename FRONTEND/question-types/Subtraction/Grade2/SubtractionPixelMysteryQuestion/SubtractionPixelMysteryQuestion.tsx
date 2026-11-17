
"use client";

import { useEffect, useState } from "react";

import {
  Check,
  Palette,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData } from "@/app/worksheet/type";

import "@/styles/worksheet.css";

// ======================================================
// BACKEND DATA TYPES
// ======================================================

type PixelColor = {
  color: string;
  hex: string;
  difference: number;
};

type PixelCell = {
  id: string;
  row: number;
  column: number;
  equation: string;
  colorOptions?: string[];
  shownColor?: string;
  missingPart?: string;
};

type PixelMysteryData = QuestionData & {
  renderKey?: string;
  questionType?: string;
  puzzleTitle?: string;
  instructions?: string;
  rows?: number;
  columns?: number;
  colorKey?: PixelColor[];
  cells?: PixelCell[];
  brokenPixelCount?: number;
  targetDifference?: number;
  requiredSelections?: number;
  answerMode?: string;
  answerType?: string;
};

// ======================================================
// SERIALIZED ANSWER HELPERS
// ======================================================

type AnswerMap = Record<string, string | number>;

function parseAnswerMap(value?: string | null): AnswerMap {
  if (!value) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as AnswerMap;
    }
  } catch {
    return {};
  }

  return {};
}

function parseAnswerArray(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    return [];
  }

  return [];
}

function mapsMatch(
  expected: AnswerMap,
  actual: AnswerMap,
): boolean {
  const expectedKeys = Object.keys(expected).sort();
  const actualKeys = Object.keys(actual).sort();

  if (
    expectedKeys.length === 0 ||
    expectedKeys.length !== actualKeys.length
  ) {
    return false;
  }

  return expectedKeys.every(
    (key, index) =>
      key === actualKeys[index] &&
      String(expected[key]) === String(actual[key]),
  );
}

function arraysMatch(
  expected: string[],
  actual: string[],
): boolean {
  if (
    expected.length === 0 ||
    expected.length !== actual.length
  ) {
    return false;
  }

  const expectedSorted = [...expected].sort();
  const actualSorted = [...actual].sort();

  return expectedSorted.every(
    (value, index) => value === actualSorted[index],
  );
}

function getColorToken(color?: string | number | null): string {
  if (color === undefined || color === null || color === "") {
    return "none";
  }

  return String(color).toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// ======================================================
// COMPONENT
// ======================================================

export default function SubtractionPixelMysteryQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const pixelData = data as PixelMysteryData;

  const code = (
    question.questionTypeCode?.trim() ||
    pixelData.questionType?.trim() ||
    ""
  ).toUpperCase();

  const cells = pixelData.cells ?? [];
  const colorKey = pixelData.colorKey ?? [];

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const correctPayload = correctAnswers?.[0] ?? "";

  const currentMap = parseAnswerMap(currentAnswer);
  const expectedMap = parseAnswerMap(correctPayload);

  const currentIds = parseAnswerArray(currentAnswer);
  const expectedIds = parseAnswerArray(correctPayload);

  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [selectedPaletteColor, setSelectedPaletteColor] =
    useState<string | null>(null);

  useEffect(() => {
    setActiveCellId(null);
    setSelectedPaletteColor(null);
  }, [question.generatedQuestionId, code]);

  const isColorByDifference =
    code === "PIXEL_COLOR_BY_DIFFERENCE";

  const isBrokenPixels =
    code === "PIXEL_FIX_BROKEN_SQUARES";

  const isMatchDifference =
    code === "PIXEL_MATCH_DIFFERENCE";

  const isMissingEquation =
    code === "PIXEL_MISSING_EQUATION";

  const isColorPaintingMode =
    isColorByDifference || isBrokenPixels;

  const requiredSelections =
    pixelData.requiredSelections ?? 2;

  const hasResponse =
    Object.keys(currentMap).length > 0 ||
    currentIds.length > 0;

  const isCorrect =
    isMatchDifference
      ? arraysMatch(expectedIds, currentIds)
      : mapsMatch(expectedMap, currentMap);

  // ======================================================
  // ANSWER UPDATE
  // ======================================================

  const saveMap = (nextMap: AnswerMap) => {
    onAnswerChange(JSON.stringify(nextMap));
  };

  const saveIds = (nextIds: string[]) => {
    onAnswerChange(JSON.stringify(nextIds));
  };

  // ======================================================
  // COLOR PICKER
  // ======================================================

  const paintCell = (cell: PixelCell, color: string) => {
    if (showAnswers) {
      return;
    }

    const nextMap: AnswerMap = { ...currentMap };

    if (
      isBrokenPixels &&
      color.toUpperCase() === cell.shownColor?.toUpperCase()
    ) {
      // Returning to the existing color removes this repair.
      delete nextMap[cell.id];
    } else {
      nextMap[cell.id] = color;
    }

    saveMap(nextMap);
    setActiveCellId(null);
  };

  const handlePaletteSelect = (color: string) => {
    if (showAnswers) {
      return;
    }

    setSelectedPaletteColor(color);

    if (activeCellId) {
      const activeCell = cells.find(
        (cell) => cell.id === activeCellId,
      );

      if (activeCell) {
        paintCell(activeCell, color);
      }
    }
  };

  const handlePaintCell = (cell: PixelCell) => {
    if (showAnswers) {
      return;
    }

    if (selectedPaletteColor) {
      paintCell(cell, selectedPaletteColor);
      return;
    }

    setActiveCellId((previous) =>
      previous === cell.id ? null : cell.id,
    );
  };

  // ======================================================
  // MATCHING PIXEL SELECTION
  // ======================================================

  const togglePixelSelection = (cellId: string) => {
    if (showAnswers) {
      return;
    }

    let nextIds: string[];

    if (currentIds.includes(cellId)) {
      nextIds = currentIds.filter((id) => id !== cellId);
    } else {
      if (currentIds.length >= requiredSelections) {
        return;
      }

      nextIds = [...currentIds, cellId];
    }

    saveIds(nextIds);
  };

  // ======================================================
  // MISSING NUMBER ENTRY
  // ======================================================

  const updateMissingNumber = (
    cellId: string,
    inputValue: string,
  ) => {
    if (showAnswers) {
      return;
    }

    const nextMap: AnswerMap = { ...currentMap };

    if (inputValue.trim() === "") {
      delete nextMap[cellId];
    } else {
      nextMap[cellId] = Number(inputValue);
    }

    saveMap(nextMap);
  };

  const getColorForDifference = (
    difference: string | number | undefined,
  ): string | undefined => {
    if (
      difference === undefined ||
      difference === ""
    ) {
      return undefined;
    }

    return colorKey.find(
      (entry) =>
        entry.difference === Number(difference),
    )?.color;
  };

  const getCellColor = (cell: PixelCell): string | undefined => {
    // Reveal the expected colors only when requested.
    if (showAnswers) {
      if (isBrokenPixels) {
        return String(
          expectedMap[cell.id] ?? cell.shownColor ?? "",
        ) || undefined;
      }

      if (isColorByDifference) {
        return String(expectedMap[cell.id] ?? "") || undefined;
      }

      if (isMissingEquation) {
        return getColorForDifference(expectedMap[cell.id]);
      }
    }

    if (isBrokenPixels) {
      return String(
        currentMap[cell.id] ?? cell.shownColor ?? "",
      ) || undefined;
    }

    if (isColorByDifference) {
      return String(currentMap[cell.id] ?? "") || undefined;
    }

    return undefined;
  };

  // ======================================================
  // COLOR KEY
  // ======================================================

  const renderColorKey = () => {
    if (colorKey.length === 0) {
      return null;
    }

    return (
      <div className="pixel-mystery-question__color-key">
        <div className="pixel-mystery-question__section-heading">
          <span className="pixel-mystery-question__section-icon">
            <Palette size={19} aria-hidden="true" />
          </span>

          <div>
            <h4>Color key</h4>
            <p>
              Match each subtraction answer to its color.
            </p>
          </div>
        </div>

        <div className="pixel-mystery-question__color-list">
          {colorKey.map((entry) => {
            const token = getColorToken(entry.color);

            const isSelected =
              selectedPaletteColor === entry.color;

            if (isColorPaintingMode) {
              return (
                <button
                  key={entry.color}
                  type="button"
                  disabled={showAnswers}
                  aria-pressed={isSelected}
                  className={[
                    "pixel-mystery-question__color-option",
                    isSelected
                      ? "pixel-mystery-question__color-option--selected"
                      : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handlePaletteSelect(entry.color)}
                >
                  <span
                    className={[
                      "pixel-mystery-question__swatch",
                      `pixel-mystery-question__swatch--${token}`,
                    ].join(" ")}
                  />

                  <span className="pixel-mystery-question__color-name">
                    {entry.color}
                  </span>

                  <strong>
                    {entry.difference}
                  </strong>
                </button>
              );
            }

            return (
              <div
                key={entry.color}
                className="pixel-mystery-question__color-option"
              >
                <span
                  className={[
                    "pixel-mystery-question__swatch",
                    `pixel-mystery-question__swatch--${token}`,
                  ].join(" ")}
                />

                <span className="pixel-mystery-question__color-name">
                  {entry.color}
                </span>

                <strong>{entry.difference}</strong>
              </div>
            );
          })}
        </div>

        {isColorPaintingMode && !showAnswers && (
          <p className="pixel-mystery-question__palette-hint">
            {activeCellId
              ? "Choose a color to fill the selected square."
              : selectedPaletteColor
                ? "Color selected. Click a square to apply it."
                : "Select a color, then click the squares to paint them."}
          </p>
        )}
      </div>
    );
  };

  // ======================================================
  // COLOR-BY-DIFFERENCE AND BROKEN-PIXEL GRID
  // ======================================================

  const renderPaintingGrid = () => (
    <div
      className="pixel-mystery-question__grid pixel-mystery-question__grid--picture"
      role="group"
      aria-label="Pixel coloring grid"
    >
      {cells.map((cell) => {
        const visibleColor = getCellColor(cell);
        const token = getColorToken(visibleColor);

        const cellClassName = [
          "pixel-mystery-question__cell",
          "pixel-mystery-question__cell--painting",
          visibleColor
            ? `pixel-mystery-question__cell--color-${token}`
            : "pixel-mystery-question__cell--uncolored",
          activeCellId === cell.id
            ? "pixel-mystery-question__cell--active"
            : "",
        ].filter(Boolean).join(" ");

        return (
          <button
            key={cell.id}
            type="button"
            disabled={showAnswers}
            aria-pressed={activeCellId === cell.id}
            aria-label={`${cell.id}, equation ${cell.equation}, ${
              visibleColor ? `color ${visibleColor}` : "uncolored"
            }`}
            className={cellClassName}
            onClick={() => handlePaintCell(cell)}
          >
            <span className="pixel-mystery-question__cell-id">
              {cell.id.replace("PIXEL_", "")}
            </span>

            <strong className="pixel-mystery-question__cell-equation">
              {cell.equation}
            </strong>

            {visibleColor && (
              <span className="pixel-mystery-question__filled-label">
                {visibleColor}
              </span>
            )}

            {showAnswers && expectedMap[cell.id] !== undefined && (
              <Check
                className="pixel-mystery-question__cell-check"
                size={16}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );

  // ======================================================
  // MATCH THE DIFFERENCE
  // ======================================================

  const renderMatchGrid = () => (
    <div className="pixel-mystery-question__match-area">
      <div className="pixel-mystery-question__match-summary">
        <Sparkles size={18} aria-hidden="true" />

        <span>
          Selected{" "}
          <strong>{currentIds.length}</strong>
          {" / "}
          {requiredSelections}
        </span>
      </div>

      <div
        className="pixel-mystery-question__grid pixel-mystery-question__grid--match"
        role="group"
        aria-label="Select matching subtraction equations"
      >
        {cells.map((cell) => {
          const selected = currentIds.includes(cell.id);
          const expected = expectedIds.includes(cell.id);

          const className = [
            "pixel-mystery-question__cell",
            "pixel-mystery-question__match-cell",
            selected
              ? "pixel-mystery-question__match-cell--selected"
              : "",
            showAnswers && expected
              ? "pixel-mystery-question__match-cell--correct"
              : "",
            showAnswers && selected && !expected
              ? "pixel-mystery-question__match-cell--wrong"
              : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              key={cell.id}
              type="button"
              disabled={showAnswers}
              aria-pressed={selected}
              className={className}
              onClick={() => togglePixelSelection(cell.id)}
            >
              <span className="pixel-mystery-question__cell-id">
                {cell.id.replace("PIXEL_", "")}
              </span>

              <strong className="pixel-mystery-question__match-equation">
                {cell.equation} = ?
              </strong>

              {showAnswers && expected && (
                <Check size={17} aria-hidden="true" />
              )}

              {showAnswers && selected && !expected && (
                <X size={17} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ======================================================
  // MISSING EQUATION GRID
  // ======================================================

  const renderMissingGrid = () => (
    <div
      className="pixel-mystery-question__grid pixel-mystery-question__grid--picture"
      role="group"
      aria-label="Complete the missing subtraction results"
    >
      {cells.map((cell) => {
        const visibleColor = getCellColor(cell);
        const token = getColorToken(visibleColor);

        const expression = cell.equation
          .replace(/\s*=\s*\?\s*$/, "")
          .trim();

        const rawValue = showAnswers
          ? expectedMap[cell.id]
          : currentMap[cell.id];

        const value =
          rawValue === undefined || rawValue === null
            ? ""
            : String(rawValue);

        return (
          <div
            key={cell.id}
            className={[
              "pixel-mystery-question__cell",
              "pixel-mystery-question__cell--missing",
              visibleColor
                ? `pixel-mystery-question__cell--color-${token}`
                : "pixel-mystery-question__cell--uncolored",
            ].join(" ")}
          >
            <span className="pixel-mystery-question__cell-id">
              {cell.id.replace("PIXEL_", "")}
            </span>

            <label
              className="pixel-mystery-question__missing-equation"
              htmlFor={`pixel-missing-${question.generatedQuestionId}-${cell.id}`}
            >
              <span>{expression}</span>
              <span className="pixel-mystery-question__equals">=</span>

              <input
                id={`pixel-missing-${question.generatedQuestionId}-${cell.id}`}
                type="number"
                inputMode="numeric"
                value={value}
                disabled={showAnswers}
                placeholder="?"
                aria-label={`Missing difference for ${cell.equation}`}
                className="pixel-mystery-question__missing-input"
                onChange={(event) =>
                  updateMissingNumber(cell.id, event.target.value)
                }
              />
            </label>

            {showAnswers && (
              <Check
                className="pixel-mystery-question__cell-check"
                size={16}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ======================================================
  // MAIN CONTENT
  // ======================================================

  if (![
    "PIXEL_COLOR_BY_DIFFERENCE",
    "PIXEL_FIX_BROKEN_SQUARES",
    "PIXEL_MATCH_DIFFERENCE",
    "PIXEL_MISSING_EQUATION",
  ].includes(code)) {
    return (
      <div className="pixel-mystery-question__unsupported">
        Unsupported Pixel Mystery type: {code || "Unknown"}
      </div>
    );
  }

  if (cells.length === 0) {
    return (
      <div className="pixel-mystery-question__unsupported">
        Pixel grid data is missing from the generated question.
      </div>
    );
  }

  const titles: Record<string, string> = {
    PIXEL_COLOR_BY_DIFFERENCE: "Reveal the Hidden Picture",
    PIXEL_FIX_BROKEN_SQUARES: "Repair the Broken Pixels",
    PIXEL_MATCH_DIFFERENCE: "Find the Matching Pixels",
    PIXEL_MISSING_EQUATION: "Complete the Missing Pixels",
  };

  return (
    <section className="pixel-mystery-question">

      {/* The parent already displays question.questionText.
          Do not repeat it in this component. */}

      <header className="pixel-mystery-question__header">
        <div className="pixel-mystery-question__header-icon">
          <Sparkles size={25} aria-hidden="true" />
        </div>

        <div className="pixel-mystery-question__header-copy">
          <span>SUBTRACTION PIXEL MYSTERY</span>

          <h4>
            {pixelData.puzzleTitle ?? titles[code]}
          </h4>
        </div>

        {showAnswers && isCorrect && (
          <span className="pixel-mystery-question__complete-badge">
            <Check size={15} aria-hidden="true" />
            Complete
          </span>
        )}
      </header>

      {renderColorKey()}

      <div className="pixel-mystery-question__board-section">
        <div className="pixel-mystery-question__board-heading">
          <div>
            <h5>Pixel grid</h5>

            <p>
              {isMatchDifference
                ? "Select the matching equation squares."
                : isMissingEquation
                  ? "Complete each result to reveal the colors."
                  : isBrokenPixels
                    ? "Repair the squares with incorrect colors."
                    : "Select each square and apply its matching color."}
            </p>
          </div>

          {!showAnswers && isColorPaintingMode && (
            <button
              type="button"
              className="pixel-mystery-question__reset-button"
              onClick={() => {
                onAnswerChange("{}");
                setActiveCellId(null);
                setSelectedPaletteColor(null);
              }}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          )}

          {!showAnswers && isMissingEquation && (
            <button
              type="button"
              className="pixel-mystery-question__reset-button"
              onClick={() => onAnswerChange("{}")}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          )}

          {!showAnswers && isMatchDifference && (
            <button
              type="button"
              className="pixel-mystery-question__reset-button"
              onClick={() => onAnswerChange("[]")}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          )}
        </div>

        {isColorPaintingMode && renderPaintingGrid()}
        {isMatchDifference && renderMatchGrid()}
        {isMissingEquation && renderMissingGrid()}
      </div>

      {showAnswers && (
        <div
          className={[
            "pixel-mystery-question__result-message",
            isCorrect
              ? "pixel-mystery-question__result-message--correct"
              : "pixel-mystery-question__result-message--revealed",
          ].join(" ")}
          role="status"
        >
          {isCorrect ? (
            <>
              <Check size={19} aria-hidden="true" />
              Your answer is correct!
            </>
          ) : (
            <>
              <Sparkles size={19} aria-hidden="true" />
              The correct pixel pattern is shown above.
            </>
          )}
        </div>
      )}

      {!showAnswers && hasResponse && (
        <div className="pixel-mystery-question__progress">
          {isMatchDifference
            ? `${currentIds.length} of ${requiredSelections} squares selected`
            : `${Object.keys(currentMap).length} squares answered`}
        </div>
      )}

    </section>
  );
}
