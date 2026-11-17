
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type QuestionRecord = Record<string, unknown>;

interface DivisionAdvancedPuzzleProps {
  questionData?: string | QuestionRecord | null;
  data?: string | QuestionRecord | null;
  question?: QuestionRecord | null;
  renderKey?: string;
  questionType?: string;
  questionText?: string;
  value?: string | number;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  showAnswers?: boolean;
  correctAnswer?: string | number;
}

function toRecord(input: unknown): QuestionRecord {
  if (typeof input === "string") {
    try {
      return toRecord(JSON.parse(input));
    } catch {
      return {};
    }
  }

  return input !== null &&
    typeof input === "object" &&
    !Array.isArray(input)
    ? (input as QuestionRecord)
    : {};
}

function read(
  record: QuestionRecord,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    const pascal = key.charAt(0).toUpperCase() + key.slice(1);

    if (record[key] != null) return record[key];
    if (record[pascal] != null) return record[pascal];
  }

  return undefined;
}

function extractRecords(input: unknown): QuestionRecord[] {
  const result: QuestionRecord[] = [];
  const seen = new Set<object>();

  const nestedKeys = [
    "question",
    "generatedQuestion",
    "questionData",
    "data",
    "questionDetails",
    "payload",
    "content",
    "definition",
    "generatedData",
  ];

  function visit(value: unknown, depth: number): void {
    if (depth > 7) return;

    const record = toRecord(value);
    if (!Object.keys(record).length || seen.has(record)) return;

    seen.add(record);
    result.push(record);

    for (const key of nestedKeys) {
      const nested = read(record, key);
      if (nested !== undefined) visit(nested, depth + 1);
    }
  }

  visit(input, 0);
  return result;
}

function getString(
  record: QuestionRecord,
  ...keys: string[]
): string {
  const value = read(record, ...keys);
  return value == null ? "" : String(value);
}

function getNumber(
  record: QuestionRecord,
  ...keys: string[]
): number {
  const value = read(record, ...keys);

  if (value == null || value === "") return Number.NaN;

  const result = Number(value);
  return Number.isFinite(result) ? result : Number.NaN;
}

function findString(
  records: QuestionRecord[],
  ...keys: string[]
): string {
  for (const record of records) {
    const result = getString(record, ...keys);
    if (result.trim()) return result;
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

function findQuestionText(records: QuestionRecord[]): string {
  return findString(
    records,
    "questionText",
    "text",
    "prompt",
    "statement"
  );
}

const DivisionAdvancedPuzzle: React.FC<
  DivisionAdvancedPuzzleProps
> = ({
  questionData,
  data: dataProp,
  question,
  renderKey: propsRenderKey,
  questionType: propsQuestionType,
  questionText,
  value,
  onAnswerChange,
  disabled = false,
  showAnswers = false,
  correctAnswer,
}) => {
  const [answer, setAnswer] = useState("");
  const [intermediateAnswer, setIntermediateAnswer] = useState("");
  const [teamsAnswer, setTeamsAnswer] = useState("");
  const [remainderAnswer, setRemainderAnswer] = useState("");

  const data = useMemo(() => {
    const input = questionData ?? dataProp ?? question ?? {};
    const records = extractRecords(input);

    const merged = Object.assign({}, ...records);

    const renderKey =
      propsRenderKey ||
      findString(records, "renderKey", "componentKey", "rendererKey");

    const questionType =
      propsQuestionType ||
      findString(
        records,
        "questionType",
        "typeCode",
        "code",
        "questionCode"
      );

    return {
      renderKey,
      questionType,
      title: getString(merged, "title", "heading"),
      start: findNumber(records, "start", "startValue"),
      firstDivisor: findNumber(
        records,
        "firstDivisor",
        "divisor1"
      ),
      intermediate: findNumber(
        records,
        "intermediate",
        "intermediateValue"
      ),
      secondDivisor: findNumber(
        records,
        "secondDivisor",
        "divisor2"
      ),
      totalStudents: findNumber(
        records,
        "totalStudents",
        "total"
      ),
      studentsPerTeam: findNumber(
        records,
        "studentsPerTeam",
        "teamSize"
      ),
      completeTeams: findNumber(
        records,
        "completeTeams",
        "quotient"
      ),
      remainingStudents: findNumber(
        records,
        "remainingStudents",
        "remainder"
      ),
      questionText: findQuestionText(records),
    };
  }, [
    questionData,
    dataProp,
    question,
    propsRenderKey,
    propsQuestionType,
  ]);

  useEffect(() => {
    const nextValue =
      value == null ? "" : String(value);

    const parts = nextValue.split(",");

    setAnswer(nextValue);
    setIntermediateAnswer(parts[0]?.trim() ?? "");
    setTeamsAnswer(parts[0]?.trim() ?? "");
    setRemainderAnswer(parts[1]?.trim() ?? "");
  }, [value, data.questionType]);

  const updateChainAnswer = (
    firstValue: string,
    secondValue: string
  ) => {
    const formatted = `${firstValue},${secondValue}`;
    onAnswerChange?.(formatted);
  };

  const updateIntermediate = (nextValue: string) => {
    if (disabled || showAnswers) return;

    const numeric = nextValue.replace(/\D/g, "");
    setIntermediateAnswer(numeric);
    updateChainAnswer(numeric, answer);
  };

  const updateFinalAnswer = (nextValue: string) => {
    if (disabled || showAnswers) return;

    const numeric = nextValue.replace(/\D/g, "");
    setAnswer(numeric);
    updateChainAnswer(intermediateAnswer, numeric);
  };

  const updateTeams = (nextValue: string) => {
    if (disabled || showAnswers) return;

    const numeric = nextValue.replace(/\D/g, "");
    setTeamsAnswer(numeric);
    onAnswerChange?.(`${numeric},${remainderAnswer}`);
  };

  const updateRemainder = (nextValue: string) => {
    if (disabled || showAnswers) return;

    const numeric = nextValue.replace(/\D/g, "");
    setRemainderAnswer(numeric);
    onAnswerChange?.(`${teamsAnswer},${numeric}`);
  };

  const renderInput = (
    label: string,
    inputValue: string,
    onChange: (value: string) => void,
    extraClass = ""
  ) => (
    <input
      className={`division-advanced-puzzle__input ${extraClass}`}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={label}
      placeholder="?"
      value={inputValue}
      disabled={disabled || showAnswers}
      onChange={(event) => onChange(event.target.value)}
    />
  );

  const prompt = questionText?.trim() || data.questionText;

  if (!data.renderKey || !data.questionType) {
    return (
      <div
        className="division-advanced-puzzle__error"
        role="alert"
      >
        <strong>Division question data is missing.</strong>
        <p>Render key: {data.renderKey || "Missing"}</p>
        <p>Question type: {data.questionType || "Missing"}</p>
        <p>
          Ensure the parent component passes the question payload
          and its renderKey and questionType.
        </p>
      </div>
    );
  }

  const normalizedKey = data.renderKey
    .trim()
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  if (normalizedKey !== "divisionadvancedpuzzle") {
    return (
      <div
        className="division-advanced-puzzle__error"
        role="alert"
      >
        <strong>Unsupported division render key.</strong>
        <p>Received: {data.renderKey}</p>
        <p>Expected: DivisionAdvancedPuzzle</p>
      </div>
    );
  }

  const type = data.questionType.trim().toUpperCase();

  // TYPE 1: Division quotient chain.
  if (type === "DIVISION_QUOTIENT_CHAIN_PUZZLE") {
    const valid = [
      data.start,
      data.firstDivisor,
      data.intermediate,
      data.secondDivisor,
    ].every(Number.isFinite);

    if (
      !valid ||
      data.firstDivisor <= 0 ||
      data.secondDivisor <= 0
    ) {
      return (
        <div
          className="division-advanced-puzzle__error"
          role="alert"
        >
          <strong>Incomplete division question.</strong>
          <p>
            Check start, firstDivisor, intermediate, and
            secondDivisor in the API response.
          </p>
        </div>
      );
    }

    return (
      <section className="division-advanced-puzzle">
        <header className="division-advanced-puzzle__header">
          <span
            className="division-advanced-puzzle__icon"
            aria-hidden="true"
          >
            ➗
          </span>

          <div>
            <h3 className="division-advanced-puzzle__title">
              {data.title || "Follow the Division Chain"}
            </h3>
            <p className="division-advanced-puzzle__subtitle">
              Solve each step in order.
            </p>
          </div>
        </header>

        <p className="division-advanced-puzzle__prompt">
          {prompt ||
            `Start with ${data.start}, divide by ${data.firstDivisor}, then divide the result by ${data.secondDivisor}.`}
        </p>

        {/* All values and answer inputs appear in one equation. */}
        <div className="division-advanced-puzzle__equation">
          <span className="division-advanced-puzzle__number">
            {data.start}
          </span>

          <span className="division-advanced-puzzle__operator">
            ÷
          </span>

          <span className="division-advanced-puzzle__number">
            {data.firstDivisor}
          </span>

          <span className="division-advanced-puzzle__operator">
            =
          </span>

          {renderInput(
            "Intermediate answer",
            intermediateAnswer,
            updateIntermediate
          )}

          <span className="division-advanced-puzzle__operator">
            ÷
          </span>

          <span className="division-advanced-puzzle__number">
            {data.secondDivisor}
          </span>

          <span className="division-advanced-puzzle__operator">
            =
          </span>

          {renderInput(
            "Final answer",
            answer,
            updateFinalAnswer
          )}
        </div>

        {showAnswers && (
          <div className="division-advanced-puzzle__answer">
            <strong>Correct answer:</strong>{" "}
            {String(
              correctAnswer ??
                `${data.intermediate},${data.intermediate / data.secondDivisor}`
            )}
          </div>
        )}
      </section>
    );
  }

  // TYPE 2: Division with a remainder.
  if (type === "DIVISION_REMAINDER_CONTEXT_DECISION") {
    const valid =
      Number.isFinite(data.totalStudents) &&
      Number.isFinite(data.studentsPerTeam) &&
      data.totalStudents >= 0 &&
      data.studentsPerTeam > 0;

    if (!valid) {
      return (
        <div
          className="division-advanced-puzzle__error"
          role="alert"
        >
          <strong>Incomplete division question.</strong>
          <p>
            Check totalStudents and studentsPerTeam in the API
            response.
          </p>
        </div>
      );
    }

    const calculatedTeams = Math.floor(
      data.totalStudents / data.studentsPerTeam
    );

    const calculatedRemainder =
      data.totalStudents % data.studentsPerTeam;

    const teams = Number.isFinite(data.completeTeams)
      ? data.completeTeams
      : calculatedTeams;

    const remainder = Number.isFinite(data.remainingStudents)
      ? data.remainingStudents
      : calculatedRemainder;

    return (
      <section className="division-advanced-puzzle">
        <header className="division-advanced-puzzle__header">
          <span
            className="division-advanced-puzzle__icon"
            aria-hidden="true"
          >
            👥
          </span>

          <div>
            <h3 className="division-advanced-puzzle__title">
              {data.title || "Make Complete Teams"}
            </h3>
            <p className="division-advanced-puzzle__subtitle">
              Divide fairly and interpret the remainder.
            </p>
          </div>
        </header>

        <p className="division-advanced-puzzle__prompt">
          {prompt ||
            `There are ${data.totalStudents} students. Each team must have exactly ${data.studentsPerTeam} students. How many complete teams can be formed, and how many students remain?`}
        </p>

        {/* Inline quotient and remainder answer fields. */}
        <div className="division-advanced-puzzle__equation">
          <span className="division-advanced-puzzle__number">
            {data.totalStudents}
          </span>

          <span className="division-advanced-puzzle__operator">
            ÷
          </span>

          <span className="division-advanced-puzzle__number">
            {data.studentsPerTeam}
          </span>

          <span className="division-advanced-puzzle__operator">
            =
          </span>

          {renderInput(
            "Number of complete teams",
            teamsAnswer,
            updateTeams,
            "division-advanced-puzzle__input--wide"
          )}

          <span className="division-advanced-puzzle__remainder-label">
            remainder
          </span>

          {renderInput(
            "Number of students remaining",
            remainderAnswer,
            updateRemainder,
            "division-advanced-puzzle__input--wide"
          )}
        </div>

        {showAnswers && (
          <div className="division-advanced-puzzle__answer">
            <strong>Correct answer:</strong>{" "}
            {String(correctAnswer ?? `${teams},${remainder}`)}
          </div>
        )}
      </section>
    );
  }

  return (
    <div
      className="division-advanced-puzzle__error"
      role="alert"
    >
      <strong>Unsupported division question type.</strong>
      <p>Render key: {data.renderKey}</p>
      <p>Question type: {data.questionType}</p>
    </div>
  );
};

export default DivisionAdvancedPuzzle;
