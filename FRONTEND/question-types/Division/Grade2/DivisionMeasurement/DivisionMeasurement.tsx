
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type QuestionRecord = Record<string, unknown>;

interface DivisionMeasurementProps {
  questionData?: string | QuestionRecord | null;
  data?: string | QuestionRecord | null;
  question?: string | QuestionRecord | null;
  renderKey?: string;
  questionType?: string;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  showAnswers?: boolean;
  correctAnswer?: string | number;
}

const SUPPORTED_TYPES = [
  "DIVISION_SQUARE_SIDE_FROM_PERIMETER",
  "DIVISION_MEASUREMENT_LENGTH_PER_GROUP",
  "DIVISION_TIME_PER_ACTIVITY",
];

const NESTED_KEYS = [
  "question",
  "generatedQuestion",
  "questionData",
  "data",
  "questionDetails",
  "payload",
  "content",
  "generatedData",
];

function toRecord(input: unknown): QuestionRecord {
  if (typeof input === "string") {
    try {
      return toRecord(JSON.parse(input));
    } catch {
      return {};
    }
  }

  if (
    input !== null &&
    typeof input === "object" &&
    !Array.isArray(input)
  ) {
    return input as QuestionRecord;
  }

  return {};
}

function read(
  record: QuestionRecord,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    const pascalKey =
      key.charAt(0).toUpperCase() + key.slice(1);

    if (record[key] != null) return record[key];
    if (record[pascalKey] != null) return record[pascalKey];
  }

  return undefined;
}

function extractRecords(input: unknown): QuestionRecord[] {
  const records: QuestionRecord[] = [];
  const visited = new Set<QuestionRecord>();

  function visit(current: unknown, depth: number): void {
    if (depth > 8) return;

    const record = toRecord(current);

    if (Object.keys(record).length === 0 || visited.has(record)) {
      return;
    }

    visited.add(record);
    records.push(record);

    for (const key of NESTED_KEYS) {
      const nested = read(record, key);
      if (nested !== undefined) visit(nested, depth + 1);
    }
  }

  visit(input, 0);
  return records;
}

function getString(
  record: QuestionRecord,
  ...keys: string[]
): string {
  const result = read(record, ...keys);
  return result == null ? "" : String(result);
}

function getNumber(
  record: QuestionRecord,
  ...keys: string[]
): number {
  const result = read(record, ...keys);

  if (result === undefined || result === null || result === "") {
    return Number.NaN;
  }

  const parsed = Number(result);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function findString(
  records: QuestionRecord[],
  ...keys: string[]
): string {
  for (const record of records) {
    const result = getString(record, ...keys);
    if (result.trim()) return result.trim();
  }

  return "";
}

function findNumber(
  records: QuestionRecord[],
  ...keys: string[]
): number {
  for (const record of records) {
    const result = getNumber(record, ...keys);
    if (Number.isFinite(result)) return result;
  }

  return Number.NaN;
}

function normalizeType(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeRenderKey(value: string): string {
  return value.trim().replace(/[^a-z0-9]/gi, "").toLowerCase();
}

const DivisionMeasurement: React.FC<DivisionMeasurementProps> = ({
  questionData,
  data: dataProp,
  question,
  renderKey: renderKeyProp,
  questionType: questionTypeProp,
  questionText: questionTextProp,
  value,
  onAnswerChange,
  disabled = false,
  showAnswers = false,
  correctAnswer,
}) => {
  const [answer, setAnswer] = useState("");

  const data = useMemo(() => {
    const records = extractRecords(
      questionData ?? dataProp ?? question ?? {}
    );

    const merged: QuestionRecord = Object.assign(
      {},
      ...[...records].reverse()
    );

    const questionType = normalizeType(
      questionTypeProp ||
        findString(
          records,
          "questionType",
          "typeCode",
          "questionCode",
          "code"
        )
    );

    return {
      questionType,
      renderKey:
        renderKeyProp ||
        findString(records, "renderKey", "componentKey", "rendererKey") ||
        (questionType.startsWith("DIVISION_")
          ? "DivisionMeasurement"
          : ""),
      title: getString(merged, "title", "heading"),
      questionText:
        questionTextProp?.trim() ||
        findString(
          records,
          "questionText",
          "text",
          "prompt",
          "statement"
        ),
      perimeter: findNumber(records, "perimeter"),
      sideCount: findNumber(records, "sideCount"),
      totalLength: findNumber(records, "totalLength"),
      sectionCount: findNumber(records, "sectionCount", "groupCount"),
      totalMinutes: findNumber(records, "totalMinutes"),
      activityCount: findNumber(records, "activityCount"),
      unit: getString(merged, "unit"),
    };
  }, [
    questionData,
    dataProp,
    question,
    renderKeyProp,
    questionTypeProp,
    questionTextProp,
  ]);

  useEffect(() => {
    setAnswer(value == null ? "" : String(value));
  }, [value, data.questionType]);

  const updateAnswer = (nextValue: string) => {
    if (disabled || showAnswers) return;

    const numericValue = nextValue.replace(/\D/g, "");
    setAnswer(numericValue);
    onAnswerChange?.(numericValue);
  };

  const normalizedType = normalizeType(data.questionType);
  const normalizedRenderKey = normalizeRenderKey(data.renderKey);

  if (!normalizedType) {
    return (
      <div className="division-measurement__error" role="alert">
        <strong>Division question type is missing.</strong>
        <p>Check the questionType in your generated question data.</p>
      </div>
    );
  }

  if (normalizedRenderKey !== "divisionmeasurement") {
    return (
      <div className="division-measurement__error" role="alert">
        <strong>Unsupported render key.</strong>
        <p>Received: {data.renderKey || "(none)"}</p>
        <p>Expected: DivisionMeasurement</p>
      </div>
    );
  }

  if (!SUPPORTED_TYPES.includes(normalizedType)) {
    return (
      <div className="division-measurement__error" role="alert">
        <strong>Unsupported division measurement type.</strong>
        <p>Received: {normalizedType}</p>
      </div>
    );
  }

  let title = data.title;
  let prompt = data.questionText;
  let firstValue = 0;
  let divisor = 0;
  let unit = data.unit;

  switch (normalizedType) {
    case "DIVISION_SQUARE_SIDE_FROM_PERIMETER":
      title = title || "Find One Side of the Square";
      firstValue = data.perimeter;
      divisor = Number.isFinite(data.sideCount) ? data.sideCount : 4;
      unit = unit || "units";
      prompt =
        prompt ||
        `A square has a perimeter of ${firstValue} ${unit}. All four sides are equal. Find the length of one side.`;
      break;

    case "DIVISION_MEASUREMENT_LENGTH_PER_GROUP":
      title = title || "Find the Length of Each Section";
      firstValue = data.totalLength;
      divisor = data.sectionCount;
      unit = unit || "cm";
      prompt =
        prompt ||
        `A ribbon is ${firstValue} ${unit} long. It is divided into ${divisor} equal sections. How long is each section?`;
      break;

    case "DIVISION_TIME_PER_ACTIVITY":
      title = title || "Share the Time Equally";
      firstValue = data.totalMinutes;
      divisor = data.activityCount;
      unit = unit || "minutes";
      prompt =
        prompt ||
        `A school has ${firstValue} minutes for ${divisor} equally long activities. How many minutes can each activity last?`;
      break;
  }

  if (
    !Number.isFinite(firstValue) ||
    !Number.isFinite(divisor) ||
    firstValue < 0 ||
    divisor <= 0
  ) {
    return (
      <div className="division-measurement__error" role="alert">
        <strong>Incomplete division question.</strong>
        <p>Check the numeric data for {normalizedType}.</p>
      </div>
    );
  }

  const calculatedAnswer = firstValue / divisor;
  const displayedAnswer =
    correctAnswer != null && String(correctAnswer).trim() !== ""
      ? correctAnswer
      : calculatedAnswer;

  return (
    <section className="division-measurement">
      <header className="division-measurement__header">
        <div className="division-measurement__icon" aria-hidden="true">
          ➗
        </div>

        <div className="division-measurement__heading">
          <h3 className="division-measurement__title">{title}</h3>
          <p className="division-measurement__subtitle">
            Read the question and enter your answer.
          </p>
        </div>

        <span className="division-measurement__badge">DIVISION</span>
      </header>

      {/* Question and answer box appear together in one row. */}
      <div
        className="division-measurement__workspace"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <p
          className="division-measurement__prompt"
          style={{ flex: "1 1 280px", margin: 0 }}
        >
          {prompt}
        </p>

        <input
          className="division-measurement__input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          placeholder=""
          aria-label="Enter your answer"
          value={answer}
          disabled={disabled || showAnswers}
          onChange={(event) => updateAnswer(event.target.value)}
          style={{
            width: "130px",
            minWidth: "100px",
            flex: "0 0 130px",
          }}
        />

        {unit && (
          <span className="division-measurement__unit">{unit}</span>
        )}
      </div>

      {showAnswers && (
        <div className="division-measurement__correct-answer">
          <span
            className="division-measurement__correct-icon"
            aria-hidden="true"
          >
            ✓
          </span>

          <div>
            <span className="division-measurement__correct-label">
              Correct answer
            </span>
            <strong>
              {String(displayedAnswer)}
              {unit ? ` ${unit}` : ""}
            </strong>
          </div>
        </div>
      )}

    </section>
  );
};

export default DivisionMeasurement;
