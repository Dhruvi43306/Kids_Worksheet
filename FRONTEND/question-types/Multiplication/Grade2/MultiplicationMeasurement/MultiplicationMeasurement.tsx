
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type QuestionRecord = Record<string, unknown>;

interface MultiplicationMeasurementProps {
  questionData?: string | QuestionRecord | null;
  data?: string | QuestionRecord | null;
  question?: QuestionRecord | null;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  showAnswers?: boolean;
  correctAnswer?: string | number;
}

interface MeasurementData {
  questionType: string;
  title: string;
  sideLength: number;
  sideCount: number;
  unitLength: number;
  itemCount: number;
  sessionCount: number;
  minutesPerSession: number;
  unit: string;
}

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

function collectRecords(input: unknown): QuestionRecord[] {
  const records: QuestionRecord[] = [];
  const seen = new Set<QuestionRecord>();

  const nestedKeys = [
    "question",
    "generatedQuestion",
    "questionData",
    "data",
    "questionDetails",
    "payload",
    "content",
    "generatedData",
  ];

  function visit(current: unknown, depth: number): void {
    if (depth > 8) return;

    const record = toRecord(current);

    if (!Object.keys(record).length || seen.has(record)) return;

    seen.add(record);
    records.push(record);

    for (const key of nestedKeys) {
      const nested = read(record, key);
      if (nested !== undefined) {
        visit(nested, depth + 1);
      }
    }
  }

  visit(input, 0);
  return records;
}

function findString(
  records: QuestionRecord[],
  ...keys: string[]
): string {
  for (let i = records.length - 1; i >= 0; i--) {
    const result = getString(records[i], ...keys);
    if (result.trim()) return result.trim();
  }

  return "";
}

function findNumber(
  records: QuestionRecord[],
  ...keys: string[]
): number {
  for (let i = records.length - 1; i >= 0; i--) {
    const result = getNumber(records[i], ...keys);
    if (Number.isFinite(result)) return result;
  }

  return Number.NaN;
}

const MultiplicationMeasurement: React.FC<
  MultiplicationMeasurementProps
> = ({
  questionData,
  data: dataProp,
  question,
  questionText,
  value,
  onAnswerChange,
  disabled = false,
  showAnswers = false,
  correctAnswer,
}) => {
  const inputData = questionData ?? dataProp ?? question ?? {};

  const records = useMemo(
    () => collectRecords(inputData),
    [inputData]
  );

  const data = useMemo<MeasurementData>(() => {
    const merged: QuestionRecord = Object.assign({}, ...records);

    return {
      questionType: findString(
        records,
        "questionType",
        "typeCode",
        "code",
        "questionCode"
      ).toUpperCase(),

      title: getString(merged, "title", "heading"),
      sideLength: findNumber(records, "sideLength"),
      sideCount: findNumber(records, "sideCount"),
      unitLength: findNumber(records, "unitLength"),
      itemCount: findNumber(records, "itemCount"),
      sessionCount: findNumber(records, "sessionCount"),
      minutesPerSession: findNumber(
        records,
        "minutesPerSession"
      ),
      unit: getString(merged, "unit"),
    };
  }, [records]);

  const [answer, setAnswer] = useState(
    value == null ? "" : String(value)
  );

  useEffect(() => {
    setAnswer(value == null ? "" : String(value));
  }, [value, data.questionType]);

  const updateAnswer = (nextValue: string) => {
    if (disabled || showAnswers) return;

    // Accept only non-negative whole-number answers.
    const numericValue = nextValue.replace(/\D/g, "");

    setAnswer(numericValue);
    onAnswerChange?.(numericValue);
  };

  const type = data.questionType;

  let firstFactor = Number.NaN;
  let secondFactor = Number.NaN;
  let description = "";
  let defaultTitle = "";
  let icon = "✖️";

  switch (type) {
    case "MULTIPLICATION_SQUARE_PERIMETER":
      firstFactor = data.sideLength;
      secondFactor = Number.isFinite(data.sideCount)
        ? data.sideCount
        : 4;

      description =
        `A square has sides of ${data.sideLength} ${data.unit || "units"}. What is its perimeter?`;

      defaultTitle = "Find the Square's Perimeter";
      icon = "📐";
      break;

    case "MULTIPLICATION_REPEATED_MEASUREMENT_TOTAL":
      firstFactor = data.itemCount;
      secondFactor = data.unitLength;

      description =
        `${data.itemCount} equal lengths are ${data.unitLength} ${data.unit || "units"} each. What is the total length?`;

      defaultTitle = "Calculate the Total Length";
      icon = "📏";
      break;

    case "MULTIPLICATION_REPEATED_TIME_BLOCKS":
      firstFactor = data.sessionCount;
      secondFactor = data.minutesPerSession;

      description =
        `There are ${data.sessionCount} sessions, each lasting ${data.minutesPerSession} minutes. What is the total time?`;

      defaultTitle = "Calculate Total Activity Time";
      icon = "⏱️";
      break;

    default:
      return (
        <div
          className="multiplication-measurement-error"
          role="alert"
        >
          <strong>Unsupported multiplication question type.</strong>
          <p>Received: {type || "Missing"}</p>
          <p>
            Expected a supported MultiplicationMeasurement
            question type.
          </p>
        </div>
      );
  }

  if (
    !Number.isFinite(firstFactor) ||
    !Number.isFinite(secondFactor) ||
    firstFactor < 0 ||
    secondFactor < 0
  ) {
    return (
      <div
        className="multiplication-measurement-error"
        role="alert"
      >
        <strong>Incomplete multiplication question.</strong>
        <p>Check the generated numeric data for {type}.</p>
      </div>
    );
  }

  const calculatedAnswer = firstFactor * secondFactor;

  const prompt =
    questionText?.trim() ||
    findString(
      records,
      "questionText",
      "text",
      "prompt",
      "statement"
    ) ||
    description;

  const displayedAnswer =
    correctAnswer != null &&
    String(correctAnswer).trim() !== ""
      ? String(correctAnswer)
      : String(calculatedAnswer);

  return (
    <section className="mm-card">
      <header className="mm-header">
        <div className="mm-heading">
          <span className="mm-icon" aria-hidden="true">
            {icon}
          </span>

          <div className="mm-heading-text">
            <h3 className="mm-title">
              {data.title || defaultTitle}
            </h3>
            <p className="mm-subtitle">
              Read the question and write your answer.
            </p>
          </div>
        </div>
      </header>

      <div className="mm-question-row">
        <p className="mm-prompt">{prompt}</p>

        <div className="mm-answer-group">
          <input
            className="mm-answer-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            aria-label="Enter your answer"
            placeholder="?"
            value={showAnswers ? displayedAnswer : answer}
            disabled={disabled || showAnswers}
            onChange={(event) =>
              updateAnswer(event.target.value)
            }
          />

          {data.unit && (
            <span className="mm-unit">{data.unit}</span>
          )}
        </div>
      </div>

      {showAnswers && (
        <div className="mm-correct-answer" role="status">
          <span aria-hidden="true">✓</span>
          <span>
            Correct answer:{" "}
            <strong>
              {displayedAnswer}
              {data.unit ? ` ${data.unit}` : ""}
            </strong>
          </span>
        </div>
      )}

      <style jsx>{`
        .mm-card {
          width: 100%;
          box-sizing: border-box;
          padding: 22px;
          border: 1px solid #dce6ff;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 5px 18px rgba(49, 82, 160, 0.06);
          color: #24324b;
        }

        .mm-header {
          margin-bottom: 18px;
        }

        .mm-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .mm-icon {
          display: flex;
          flex: 0 0 48px;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #edf3ff;
          font-size: 25px;
        }

        .mm-heading-text {
          min-width: 0;
        }

        .mm-title {
          margin: 0;
          color: #2346ad;
          font-size: 20px;
          line-height: 1.35;
          font-weight: 750;
        }

        .mm-subtitle {
          margin: 5px 0 0;
          color: #78859a;
          font-size: 13px;
          line-height: 1.4;
        }

        .mm-question-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          border: 1px solid #dce7ff;
          border-radius: 16px;
          background: #f6f9ff;
        }

        .mm-prompt {
          flex: 1 1 auto;
          min-width: 0;
          margin: 0;
          color: #293950;
          font-size: 16px;
          line-height: 1.65;
          overflow-wrap: anywhere;
        }

        .mm-answer-group {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
        }

        .mm-answer-input {
          display: block;
          width: 68px;
          min-width: 68px;
          height: 48px;
          box-sizing: border-box;
          padding: 5px;
          border: 1.5px solid #78a7ff;
          border-radius: 12px;
          outline: none;
          background: #ffffff;
          color: #1d3e91;
          font-size: 17px;
          font-weight: 700;
          text-align: center;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .mm-answer-input:focus {
          border-color: #4169e1;
          box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.13);
        }

        .mm-answer-input:disabled {
          background: #f0f4fb;
          color: #24324b;
          cursor: not-allowed;
        }

        .mm-unit {
          color: #40536f;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        .mm-correct-answer {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          padding: 12px 15px;
          border: 1px solid #b8e5ca;
          border-radius: 12px;
          background: #f0fbf4;
          color: #17663b;
          font-size: 14px;
        }

        @media (max-width: 560px) {
          .mm-card {
            padding: 15px;
            border-radius: 16px;
          }

          .mm-heading {
            gap: 10px;
          }

          .mm-icon {
            flex-basis: 42px;
            width: 42px;
            height: 42px;
            font-size: 22px;
          }

          .mm-title {
            font-size: 17px;
          }

          .mm-question-row {
            align-items: stretch;
            flex-direction: column;
            gap: 14px;
            padding: 15px;
          }

          .mm-prompt {
            font-size: 15px;
          }

          .mm-answer-group {
            justify-content: flex-start;
          }

          .mm-answer-input {
            width: 68px;
            min-width: 68px;
            height: 44px;
          }
        }
      `}</style>
    </section>
  );
};

export default MultiplicationMeasurement;
