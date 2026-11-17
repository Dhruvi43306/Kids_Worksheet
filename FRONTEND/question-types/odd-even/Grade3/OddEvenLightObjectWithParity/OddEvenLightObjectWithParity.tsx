
"use client";

import { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

// =========================================================
// TYPES
// =========================================================

interface OddEvenContextData {
  [key: string]: unknown;

  questionType?: unknown;
  title?: unknown;

  // Light toggle
  objectName?: unknown;
  objectIcon?: unknown;
  initialState?: unknown;
  toggleCount?: unknown;
  finalState?: unknown;

  // Elevator
  startingFloor?: unknown;
  floorsMoved?: unknown;
  direction?: unknown;
  destinationFloor?: unknown;

  // Toy copy machine
  machineIcon?: unknown;
  initialToyCount?: unknown;
  copiesMade?: unknown;
  totalToyCount?: unknown;

  // Options and answers
  options?: unknown;
  answerMode?: unknown;
  answerType?: unknown;
  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface OddEvenContextQuestionData {
  questionNumber?: number;
  questionType?: string;
  questionText?: string;
  questionDataJson?: unknown;

  correctAnswer?: unknown;
  CorrectAnswer?: unknown;
}

interface OddEvenContextQuestionProps {
  question?: OddEvenContextQuestionData | null;
  correctAnswer?: unknown;
  value?: string | null;
  onAnswerChange?: (answer: string) => void;

  // Controlled by the existing navbar.
  showAnswers?: boolean;
}

interface ContextAnswerOption {
  value: string;
  label: string;
}

// =========================================================
// HELPER FUNCTIONS
// =========================================================

function parseQuestionData(
  value: unknown
): OddEvenContextData {
  if (!value) {
    return {};
  }

  if (
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as OddEvenContextData;
  }

  if (typeof value !== "string") {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as OddEvenContextData;
  } catch (error) {
    console.error(
      "Unable to parse OddEvenContext QuestionDataJson:",
      error
    );

    return {};
  }
}

function toNumber(value: unknown): number | null {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result) ? result : null;
}

function toText(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  return "";
}

function normalizeAnswer(value: unknown): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? normalizeAnswer(value[0])
      : "";
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  try {
    const parsed: unknown = JSON.parse(text);

    if (
      typeof parsed === "string" ||
      typeof parsed === "number" ||
      typeof parsed === "boolean"
    ) {
      return String(parsed).trim();
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeAnswer(parsed[0]);
    }
  } catch {
    // Normal backend string.
  }

  return text;
}

function getParity(number: number): string {
  return Math.abs(Math.trunc(number)) % 2 === 0
    ? "Even"
    : "Odd";
}

// =========================================================
// BACKEND OPTIONS
// =========================================================

function getAnswerOptions(
  data: OddEvenContextData
): ContextAnswerOption[] {
  if (!Array.isArray(data.options)) {
    return [];
  }

  const uniqueOptions = new Map<
    string,
    ContextAnswerOption
  >();

  for (const option of data.options) {
    if (
      typeof option !== "string" &&
      typeof option !== "number"
    ) {
      continue;
    }

    const label = String(option).trim();

    if (!label) {
      continue;
    }

    const key = label.toLowerCase();

    if (!uniqueOptions.has(key)) {
      uniqueOptions.set(key, {
        value: label,
        label,
      });
    }
  }

  return Array.from(uniqueOptions.values());
}

// =========================================================
// CALCULATE FALLBACK ANSWER
//
// Backend CorrectAnswer takes priority.
// =========================================================

function calculateCorrectAnswer(
  questionType: string,
  data: OddEvenContextData
): string {

  // -------------------------------------------------------
  // 1. LIGHT TOGGLE STATE
  // -------------------------------------------------------

  switch (questionType) {
    case "ODD_EVEN_LIGHT_TOGGLE_STATE": {
      const providedFinalState = toText(
        data.finalState
      ).toUpperCase();

      if (
        providedFinalState === "ON" ||
        providedFinalState === "OFF"
      ) {
        return providedFinalState;
      }

      const initialState = toText(
        data.initialState
      ).toUpperCase();

      const toggleCount = toNumber(
        data.toggleCount
      );

      if (
        (initialState !== "ON" &&
          initialState !== "OFF") ||
        toggleCount === null ||
        !Number.isInteger(toggleCount) ||
        toggleCount < 0
      ) {
        return "";
      }

      // Even toggles preserve initial state.
      // Odd toggles reverse initial state.
      if (toggleCount % 2 === 0) {
        return initialState;
      }

      return initialState === "ON"
        ? "OFF"
        : "ON";
    }

    // -----------------------------------------------------
    // 2. ELEVATOR FLOOR PARITY
    // -----------------------------------------------------

    case "ODD_EVEN_ELEVATOR_FLOOR_PARITY": {
      let destinationFloor = toNumber(
        data.destinationFloor
      );

      if (destinationFloor === null) {
        const startingFloor = toNumber(
          data.startingFloor
        );

        const floorsMoved = toNumber(
          data.floorsMoved
        );

        if (
          startingFloor === null ||
          floorsMoved === null
        ) {
          return "";
        }

        const direction = toText(
          data.direction
        ).toUpperCase();

        destinationFloor =
          startingFloor +
          (direction === "DOWN"
            ? -floorsMoved
            : floorsMoved);
      }

      return getParity(destinationFloor);
    }

    // -----------------------------------------------------
    // 3. TOY COPY MACHINE
    // -----------------------------------------------------

    case "ODD_EVEN_TOY_COPY_MACHINE": {
      const providedTotal = toNumber(
        data.totalToyCount
      );

      const initialToyCount = toNumber(
        data.initialToyCount
      );

      const copiesMade = toNumber(
        data.copiesMade
      );

      let totalToyCount = providedTotal;

      if (totalToyCount === null) {
        if (
          initialToyCount === null ||
          copiesMade === null
        ) {
          return "";
        }

        totalToyCount =
          initialToyCount + copiesMade;
      }

      return `${totalToyCount} (${getParity(totalToyCount)})`;
    }

    default:
      return "";
  }
}

// =========================================================
// RESOLVE EXPECTED ANSWER
// =========================================================

function resolveCorrectAnswer(
  question: OddEvenContextQuestionData | null | undefined,
  correctAnswer: unknown,
  data: OddEvenContextData,
  questionType: string,
  options: ContextAnswerOption[]
): string {
  const backendAnswers = [
    correctAnswer,
    question?.correctAnswer,
    question?.CorrectAnswer,
    data.correctAnswer,
    data.CorrectAnswer,
  ];

  const backendAnswer = backendAnswers
    .map(normalizeAnswer)
    .find((answer) => answer.length > 0);

  const rawAnswer =
    backendAnswer ??
    calculateCorrectAnswer(questionType, data);

  if (!rawAnswer) {
    return "";
  }

  // Preserve the exact option spelling.
  const matchingOption = options.find(
    (option) =>
      option.value.trim().toLowerCase() ===
      rawAnswer.trim().toLowerCase()
  );

  return matchingOption?.value ?? rawAnswer;
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function OddEvenContextQuestion({
  question,
  correctAnswer,
  value,
  onAnswerChange,
  showAnswers = false,
}: OddEvenContextQuestionProps) {

  // -------------------------------------------------------
  // PARSE BACKEND DATA
  // -------------------------------------------------------

  const data = useMemo(
    () => parseQuestionData(
      question?.questionDataJson
    ),
    [question?.questionDataJson]
  );

  const questionType = String(
    data.questionType ??
    question?.questionType ??
    ""
  )
    .trim()
    .toUpperCase();

  // -------------------------------------------------------
  // BACKEND OPTIONS
  // -------------------------------------------------------

  const options = useMemo(
    () => getAnswerOptions(data),
    [data]
  );

  // -------------------------------------------------------
  // ANSWER STATE
  // -------------------------------------------------------

  const [internalAnswer, setInternalAnswer] =
    useState("");

  const selectedAnswer =
    value !== undefined && value !== null
      ? value
      : internalAnswer;

  const isControlled =
    value !== undefined && value !== null;

  // -------------------------------------------------------
  // CORRECT ANSWER
  // -------------------------------------------------------

  const expectedAnswer = useMemo(
    () =>
      resolveCorrectAnswer(
        question,
        correctAnswer,
        data,
        questionType,
        options
      ),
    [
      question,
      correctAnswer,
      data,
      questionType,
      options,
    ]
  );

  // -------------------------------------------------------
  // RESET ANSWER WHEN QUESTION CHANGES
  // -------------------------------------------------------

  const questionKey = [
    question?.questionNumber ?? "",
    typeof question?.questionDataJson === "string"
      ? question.questionDataJson
      : JSON.stringify(
          question?.questionDataJson ?? {}
        ),
  ].join(":");

  useEffect(() => {
    setInternalAnswer("");
  }, [questionKey]);

  // -------------------------------------------------------
  // SELECT ANSWER
  // -------------------------------------------------------

  function handleAnswerSelect(answer: string) {
    if (!isControlled) {
      setInternalAnswer(answer);
    }

    onAnswerChange?.(answer);
  }

  // =========================================================
  // 1. LIGHT TOGGLE VISUAL
  // =========================================================

  function renderLightToggle() {
    const objectName =
      toText(data.objectName) || "Light Bulb";

    const objectIcon =
      toText(data.objectIcon) || "💡";

    const initialState =
      toText(data.initialState).toUpperCase();

    const toggleCount = toNumber(
      data.toggleCount
    );

    if (
      (initialState !== "ON" &&
        initialState !== "OFF") ||
      toggleCount === null ||
      !Number.isInteger(toggleCount) ||
      toggleCount < 0
    ) {
      return null;
    }

    const visiblePresses = Math.min(
      toggleCount,
      12
    );

    const extraPresses =
      toggleCount - visiblePresses;

    return (
      <div className="oecq-light-visual">

        <div className="oecq-light-heading">
          <span>{objectIcon}</span>

          <strong>{objectName}</strong>
        </div>

        <div className="oecq-light-board">

          <div
            className={[
              "oecq-bulb-display",
              initialState === "ON"
                ? "oecq-bulb-display--on"
                : "oecq-bulb-display--off",
            ].join(" ")}
          >
            <div className="oecq-bulb-glow">
              <span className="oecq-bulb-icon">
                {objectIcon}
              </span>
            </div>

            <span className="oecq-bulb-label">
               INITIAL STATE (BEFORE PRESSES)
            </span>

            <strong className="oecq-bulb-state">
              {initialState}
            </strong>
          </div>

          <div className="oecq-toggle-process">
            <div className="oecq-process-heading">
              <span>🔘</span>
              <strong>Switch Presses</strong>
            </div>

            <div className="oecq-toggle-count">
              <strong>{toggleCount}</strong>
              <span>Total Presses</span>
            </div>

            <div className="oecq-toggle-sequence">
              {Array.from(
                { length: visiblePresses },
                (_, index) => (
                  <span
                    className="oecq-toggle-dot"
                    key={`toggle-${index}`}
                  >
                    {index + 1}
                  </span>
                )
              )}

              {extraPresses > 0 && (
                <span className="oecq-toggle-extra">
                  +{extraPresses}
                </span>
              )}

              {toggleCount === 0 && (
                <span className="oecq-toggle-none">
                  No presses
                </span>
              )}
            </div>
          </div>

        </div>

      <div className="oecq-light-caption">
  ⚡ Each press changes the light from ON to OFF or OFF to ON.
</div>

      </div>
    );
  }

  // =========================================================
  // 2. ELEVATOR FLOOR VISUAL
  // =========================================================

  function renderElevator() {
    const startingFloor = toNumber(
      data.startingFloor
    );

    const floorsMoved = toNumber(
      data.floorsMoved
    );

    const destinationFloor = toNumber(
      data.destinationFloor
    );

    const direction =
      toText(data.direction).toUpperCase() || "UP";

    const elevatorIcon =
      toText(data.objectIcon) || "🛗";

    let actualDestination = destinationFloor;

    if (actualDestination === null) {
      if (
        startingFloor === null ||
        floorsMoved === null
      ) {
        return null;
      }

      actualDestination =
        startingFloor +
        (direction === "DOWN"
          ? -floorsMoved
          : floorsMoved);
    }

    if (
      startingFloor === null ||
      floorsMoved === null ||
      !Number.isInteger(startingFloor) ||
      !Number.isInteger(floorsMoved) ||
      floorsMoved < 0 ||
      !Number.isInteger(actualDestination)
    ) {
      return null;
    }

    const visibleFloors = Math.min(
      floorsMoved,
      8
    );

    const extraFloors =
      floorsMoved - visibleFloors;

    return (
      <div className="oecq-elevator-visual">

        <div className="oecq-elevator-heading">
          <span>🏢</span>
          <strong>Elevator Journey</strong>
        </div>

        <div className="oecq-elevator-board">

          <div className="oecq-elevator-summary">
            <div>
              <small>STARTING FLOOR</small>
              <strong>{startingFloor}</strong>
            </div>

            <span className="oecq-elevator-arrow">
              {direction === "DOWN" ? "⬇" : "⬆"}
            </span>

            <div>
              <small>FLOORS MOVED</small>
              <strong>{floorsMoved}</strong>
            </div>
          </div>

          <div className="oecq-elevator-shaft">

            <div className="oecq-elevator-floor oecq-elevator-floor--destination">
              <div>
                <span>🏁</span>
                <small>DESTINATION</small>
              </div>

              <strong>{actualDestination}</strong>
            </div>

            <div className="oecq-elevator-route">

              <div className="oecq-elevator-track">
                <span className="oecq-elevator-car">
                  {elevatorIcon}
                </span>

                <span className="oecq-elevator-movement">
                  {direction === "DOWN" ? "↓" : "↑"}
                </span>
              </div>

              <div className="oecq-elevator-steps">
                {Array.from(
                  { length: visibleFloors },
                  (_, index) => (
                    <span
                      className="oecq-elevator-step"
                      key={`floor-step-${index}`}
                    >
                      {index + 1}
                    </span>
                  )
                )}

                {extraFloors > 0 && (
                  <span className="oecq-elevator-step-extra">
                    +{extraFloors}
                  </span>
                )}
              </div>

            </div>

            <div className="oecq-elevator-floor oecq-elevator-floor--start">
              <div>
                <span>🚪</span>
                <small>START</small>
              </div>

              <strong>{startingFloor}</strong>
            </div>

          </div>

        </div>

        <div className="oecq-elevator-caption">
          🛗 Follow the elevator to its destination floor.
        </div>

      </div>
    );
  }

  // =========================================================
  // 3. TOY COPY MACHINE VISUAL
  // =========================================================

  function renderToyCopyMachine() {
    const initialToyCount = toNumber(
      data.initialToyCount
    );

    const copiesMade = toNumber(
      data.copiesMade
    );

    if (
      initialToyCount === null ||
      copiesMade === null ||
      !Number.isInteger(initialToyCount) ||
      !Number.isInteger(copiesMade) ||
      initialToyCount < 0 ||
      copiesMade < 0 ||
      initialToyCount > 1000 ||
      copiesMade > 1000
    ) {
      return null;
    }

    const objectName =
      toText(data.objectName) || "Toy Car";

    const objectIcon =
      toText(data.objectIcon) || "🚗";

    const machineIcon =
      toText(data.machineIcon) || "🖨️";

    function renderToyIcons(count: number) {
      const visibleCount = Math.min(count, 12);

      const extraCount = count - visibleCount;

      return (
        <div className="oecq-toy-icons">
          {Array.from(
            { length: visibleCount },
            (_, index) => (
              <span
                className="oecq-toy-icon"
                key={`toy-${index}`}
              >
                {objectIcon}
              </span>
            )
          )}

          {extraCount > 0 && (
            <span className="oecq-toy-extra">
              +{extraCount}
            </span>
          )}

          {count === 0 && (
            <span className="oecq-toy-empty">
              No toys
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="oecq-toy-visual">

        <div className="oecq-toy-heading">
          <span>🧸</span>
          <strong>Toy Copy Machine</strong>
        </div>

        <div className="oecq-toy-machine-board">

          {/* ORIGINAL TOYS */}

          <div className="oecq-toy-group oecq-toy-group--original">

            <div className="oecq-toy-group-heading">
              <span>📥</span>
              <strong>Original Toys</strong>
            </div>

            <div className="oecq-toy-group-count">
              {initialToyCount}
            </div>

            {renderToyIcons(initialToyCount)}

            <small>{objectName}</small>

          </div>

          {/* MACHINE */}

          <div className="oecq-machine-process">

            <div className="oecq-machine-icon">
              <span>{machineIcon}</span>
            </div>

            <span className="oecq-machine-arrow">
              →
            </span>

            <small>MAKE ONE EXTRA COPY</small>

          </div>

          {/* COPIES */}

          <div className="oecq-toy-group oecq-toy-group--copies">

            <div className="oecq-toy-group-heading">
              <span>📤</span>
              <strong>Extra Copies</strong>
            </div>

            <div className="oecq-toy-group-count">
              {copiesMade}
            </div>

            {renderToyIcons(copiesMade)}

            <small>{objectName}</small>

          </div>

        </div>

        <div className="oecq-toy-caption">
          🚗 Each original toy gets one extra copy.
        </div>

      </div>
    );
  }

  // =========================================================
  // RENDER VISUAL BY BACKEND QUESTION TYPE
  // =========================================================

  function renderVisual() {
    switch (questionType) {
      case "ODD_EVEN_LIGHT_TOGGLE_STATE":
        return renderLightToggle();

      case "ODD_EVEN_ELEVATOR_FLOOR_PARITY":
        return renderElevator();

      case "ODD_EVEN_TOY_COPY_MACHINE":
        return renderToyCopyMachine();

      default:
        return null;
    }
  }

  const visual = renderVisual();

  // =========================================================
  // ANSWER OPTIONS
  // =========================================================

  function renderAnswerOptions() {
    if (options.length === 0) {
      return (
        <div className="oecq-error">
          No answer options received from backend.
        </div>
      );
    }

    return (
      <div
        className="oecq-answer-section"
        role="group"
        aria-label="Select your answer"
      >
        {options.map((option, index) => {
          const isSelected =
            selectedAnswer.trim().toLowerCase() ===
            option.value.trim().toLowerCase();

          const optionClass =
            option.value.toLowerCase() === "on"
              ? "oecq-answer-button--on"
              : option.value.toLowerCase() === "off"
                ? "oecq-answer-button--off"
                : option.value.toLowerCase() === "odd"
                  ? "oecq-answer-button--odd"
                  : option.value.toLowerCase() === "even"
                    ? "oecq-answer-button--even"
                    : "oecq-answer-button--default";

          return (
            <button
              type="button"
              key={`${option.value}-${index}`}
              className={[
                "oecq-answer-button",
                optionClass,
                isSelected
                  ? "oecq-answer-button--selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                handleAnswerSelect(option.value)
              }
              aria-pressed={isSelected}
            >
              <span className="oecq-answer-label">
                {option.label}
              </span>

              <span className="oecq-answer-indicator">
                {isSelected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================
  // CORRECT ANSWER
  // Existing navbar controls showAnswers.
  // =========================================================

  function renderCorrectAnswer() {
    if (!showAnswers) {
      return null;
    }

    if (!expectedAnswer) {
      return (
        <div
          className="oecq-feedback oecq-feedback--unavailable"
          role="alert"
        >
          <span className="oecq-feedback-icon">!</span>

          <div>
            <strong>Correct answer unavailable</strong>
            <span>
              Please check the backend CorrectAnswer.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="oecq-feedback oecq-feedback--correct"
        role="status"
        aria-live="polite"
      >
        <span className="oecq-feedback-icon">✨</span>

        <div>
          <strong>Correct Answer</strong>
          <span>{expectedAnswer}</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // FINAL UI
  // =========================================================

  if (!visual) {
    return (
      <div className="oecq-error" role="alert">
        Unable to display this Odd/Even context question.
        Please check the question type and QuestionDataJson.
      </div>
    );
  }

  return (
    <section className="oecq-card">

      {/* BACKEND QUESTION TEXT IS DISPLAYED BY PARENT */}

      <div className="oecq-visual">
        {visual}
      </div>

      {/* BACKEND GENERATED ANSWER OPTIONS */}

      {renderAnswerOptions()}

      {/* EXISTING NAVBAR EVALUATION */}

      {renderCorrectAnswer()}

    </section>
  );
}
