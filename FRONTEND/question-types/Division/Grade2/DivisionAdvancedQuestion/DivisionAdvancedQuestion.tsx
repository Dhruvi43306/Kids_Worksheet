"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type QuestionRecord = Record<string, unknown>;

interface DivisionAdvancedQuestionProps {
  questionData?: string | QuestionRecord;
  question?: QuestionRecord;
  data?: string | QuestionRecord;
  questionText?: string;
  value?: string | number;
  studentAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  showAnswers?: boolean;
}

const toRecord = (value: unknown): QuestionRecord => {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);

      return parsed !== null && typeof parsed === "object"
        ? (parsed as QuestionRecord)
        : {};
    } catch {
      return {};
    }
  }

  return value !== null && typeof value === "object"
    ? (value as QuestionRecord)
    : {};
};

const read = (
  record: QuestionRecord,
  ...keys: string[]
): unknown => {
  for (const key of keys) {
    const pascalKey =
      key.charAt(0).toUpperCase() + key.slice(1);

    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }

    if (
      record[pascalKey] !== undefined &&
      record[pascalKey] !== null
    ) {
      return record[pascalKey];
    }
  }

  return undefined;
};

const getNestedData = (
  record: QuestionRecord
): QuestionRecord => {
  const nested = read(record, "data", "questionData", "questionDetails");

  if (nested !== undefined && nested !== record) {
    const parsed = toRecord(nested);

    if (Object.keys(parsed).length > 0) {
      return parsed;
    }
  }

  return record;
};

export default function DivisionAdvancedQuestion({
  questionData,
  question,
  data: dataProp,
  questionText,
  value,
  studentAnswer,
  onAnswerChange,
  disabled = false,
  showAnswers = false,
}: DivisionAdvancedQuestionProps) {
  const source = useMemo(() => {
    const root = toRecord(question ?? {});
    const suppliedData = toRecord(
      questionData ?? dataProp ?? {}
    );

    const questionNested = toRecord(
      read(root, "question", "generatedQuestion")
    );

    const combined = {
      ...root,
      ...questionNested,
    };

    const nestedData = getNestedData(suppliedData);
    const rootData = getNestedData(combined);

    return {
      ...combined,
      ...nestedData,
      data: {
        ...rootData,
        ...nestedData,
      },
    };
  }, [questionData, question, dataProp]);

  const data = useMemo(() => {
    const nestedData = toRecord(source.data);

    const renderKey = String(
      read(nestedData, "renderKey") ??
      read(source, "renderKey") ??
      ""
    );

    const questionType = String(
      read(nestedData, "questionType", "code", "typeCode") ??
      read(source, "questionType", "code", "typeCode") ??
      ""
    );

    return {
      ...source,
      ...nestedData,
      renderKey,
      questionType,
    };
  }, [source]);

  const initialAnswer = String(
    studentAnswer ?? value ?? ""
  );

  const [answer, setAnswer] = useState(initialAnswer);
  const [itemsPerGroupAnswer, setItemsPerGroupAnswer] =
    useState("");
  const [remainingPerGroupAnswer, setRemainingPerGroupAnswer] =
    useState("");

  useEffect(() => {
    setAnswer(String(studentAnswer ?? value ?? ""));
  }, [studentAnswer, value, data.questionType]);

  const updateAnswer = (nextAnswer: string) => {
    const numericAnswer = nextAnswer.replace(/\D/g, "");
    setAnswer(numericAnswer);
    onAnswerChange?.(numericAnswer);
  };

  const numberValue = (key: string): number => {
    const raw = read(data, key);

    if (raw === undefined || raw === null || raw === "") {
      return Number.NaN;
    }

    const number = Number(raw);
    return Number.isFinite(number) ? number : Number.NaN;
  };

  const correctAnswer = String(
    read(source, "correctAnswer", "answer") ??
    read(data, "correctAnswer", "answer") ??
    ""
  );

  const renderAnswerBox = (
    placeholder = "?",
    maxLength = 5
  ) => (
    <input
      className="division-advanced-answer"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={maxLength}
      placeholder={placeholder}
      aria-label="Enter your answer"
      value={answer}
      disabled={disabled || showAnswers}
      onChange={(event) => updateAnswer(event.target.value)}
    />
  );

  // Never access questionType before validating the parsed object.
  if (!data.questionType || !data.renderKey) {
    console.error("Division Advanced: missing question data", {
      question,
      questionData,
      dataProp,
      parsedData: data,
    });

    return (
      <div className="division-advanced__unsupported">
        <strong>Division question data is missing.</strong>
        <p>Question type: {data.questionType || "Missing"}</p>
        <p>Render key: {data.renderKey || "Missing"}</p>
        <p>
          Verify the props passed by GeneratedQuestionRenderer
          and the generated worksheet API response.
        </p>
      </div>
    );
  }

  if (data.renderKey !== "DivisionAdvanced") {
    return (
      <div className="division-advanced__unsupported">
        Unsupported division render key: {data.renderKey}
      </div>
    );
  }

  // 1. Quotient and remainder equation
  if (
    data.questionType ===
    "DIVISION_QUOTIENT_REMAINDER_EQUATION"
  ) {
    const dividend = numberValue("dividend");
    const divisor = numberValue("divisor");
    const remainder = numberValue("remainder");

    if (![dividend, divisor, remainder].every(Number.isFinite)) {
      return (
        <div className="division-advanced__unsupported">
          Missing dividend, divisor, or remainder in API data.
        </div>
      );
    }

    return (
      <section className="division-advanced-card">
        {/* <h3 className="division-advanced-title">
          {String(read(data, "title") ?? "Understand the Remainder")}
        </h3> */}

        <p className="division-advanced-prompt">
          {questionText ?? "Complete the division relationship."}
        </p>

        <div className="division-advanced-equation">
          <strong>
            {dividend} = ({divisor} ×
          </strong>
          {renderAnswerBox()}
          <strong>) + {remainder}</strong>
        </div>

{showAnswers && (
  <div className="division-advanced-correct-answer">
    <span className="division-advanced-correct-label">
      Correct answer :
    </span>
    <strong className="division-advanced-correct-value">
      {correctAnswer}
    </strong>
  </div>
)}


      </section>
    );
  }

  // 2. Multi-step grouping
  if (data.questionType === "DIVISION_MULTI_STEP_GROUPING") {
    const total = numberValue("total");
    const groupCount = numberValue("groupCount");
    const itemsPerGroup = numberValue("itemsPerGroup");
    const removedPerGroup = numberValue("removedPerGroup");
    const remainingPerGroup = numberValue("remainingPerGroup");

    if (
      ![
        total,
        groupCount,
        itemsPerGroup,
        removedPerGroup,
        remainingPerGroup,
      ].every(Number.isFinite)
    ) {
      return (
        <div className="division-advanced__unsupported">
          Missing grouping values in API data. Check total,
          groupCount, itemsPerGroup, removedPerGroup, and
          remainingPerGroup.
        </div>
      );
    }

   
return (
  <section className="division-advanced-card division-advanced-grouping-card">
    <p className="division-advanced-prompt">
      {questionText ??
        `There are ${total} crayons shared equally among ${groupCount} groups. Then ${removedPerGroup} crayons are removed from every group. How many crayons remain altogether?`}
    </p>

    <div className="division-advanced-workspace division-advanced-grouping-workspace">
      <div className="division-advanced-step">
        <span className="division-advanced-step-label">
          <span className="division-advanced-step-number">1</span>
          Share equally
        </span>

        <div className="division-advanced-equation division-advanced-step-equation">
          <span>{total} ÷ {groupCount} =</span>

          {showAnswers ? (
            <strong>{itemsPerGroup}</strong>
          ) : (
            <input
              className="division-advanced-answer"
              type="number"
              aria-label="Items in each group"
              value={itemsPerGroupAnswer}
              disabled={disabled}
              onChange={(event) =>
                setItemsPerGroupAnswer(event.target.value)
              }
            />
          )}
        </div>
      </div>

      <div className="division-advanced-step">
        <span className="division-advanced-step-label">
          <span className="division-advanced-step-number">2</span>
          Subtract from each group
        </span>

        <div className="division-advanced-equation division-advanced-step-equation">
          <span>
            {showAnswers
              ? itemsPerGroup
              : itemsPerGroupAnswer || "?"}{" "}
            − {removedPerGroup} =
          </span>

          {showAnswers ? (
            <strong>{remainingPerGroup}</strong>
          ) : (
            <input
              className="division-advanced-answer"
              type="number"
              aria-label="Items remaining in each group"
              value={remainingPerGroupAnswer}
              disabled={disabled}
              onChange={(event) =>
                setRemainingPerGroupAnswer(event.target.value)
              }
            />
          )}
        </div>
      </div>

      <div className="division-advanced-step division-advanced-final-step">
        <span className="division-advanced-step-label">
          <span className="division-advanced-step-number">3</span>
          Find the total remaining
        </span>

        <div className="division-advanced-equation division-advanced-step-equation">
          <span>
            {showAnswers
              ? remainingPerGroup
              : remainingPerGroupAnswer || "?"}{" "}
            × {groupCount} =
          </span>

          {showAnswers ? (
            <strong>{correctAnswer}</strong>
          ) : (
            <input
              className="division-advanced-answer division-advanced-total-answer"
              type="text"
              inputMode="numeric"
              aria-label="Total crayons remaining"
              placeholder="Total"
              value={answer}
              disabled={disabled}
              onChange={(event) =>
                updateAnswer(event.target.value)
              }
            />
          )}
        </div>
      </div>
    </div>

    
{showAnswers && (
  <div className="division-advanced-correct-answer">
    <span className="division-advanced-correct-label">
      Correct answer :
    </span>
    <strong className="division-advanced-correct-value">
      {correctAnswer}
    </strong>
  </div>
)}

  </section>
);

  }

  // 3. Missing division digit
  if (
    data.questionType === "DIVISION_MISSING_DIVISION_DIGIT"
  ) {
    const tensDigit = numberValue("tensDigit");
    const divisor = numberValue("divisor");
    const quotient = numberValue("quotient");

    if (![tensDigit, divisor, quotient].every(Number.isFinite)) {
      return (
        <div className="division-advanced__unsupported">
          Missing tensDigit, divisor, or quotient in API data.
        </div>
      );
    }

    return (
      <section className="division-advanced-card">
        {/* <h3 className="division-advanced-title">
          {String(read(data, "title") ?? "Find the Missing Digit")}
        </h3> */}

        <p className="division-advanced-prompt">
          {questionText ??
            "Complete the division equation by entering the missing digit."}
        </p>

        <div className="division-advanced-equation">
          <strong>{tensDigit}</strong>
          {renderAnswerBox("_", 1)}
          <strong>
            {" "}÷ {divisor} = {quotient}
          </strong>
        </div>

        
{showAnswers && (
  <div className="division-advanced-correct-answer">
    <span className="division-advanced-correct-label">
      Correct answer :
    </span>
    <strong className="division-advanced-correct-value">
      {correctAnswer}
    </strong>
  </div>
)}

      </section>
    );
  }

  return (
    <div className="division-advanced__unsupported">
      <strong>Unsupported division question type</strong>
      <p>Question type: {data.questionType}</p>
      <p>Render key: {data.renderKey}</p>
    </div>
  );
}
