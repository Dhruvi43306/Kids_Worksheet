
"use client";

import { Check, X } from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import "@/styles/worksheet.css";

type MultiplicationItem = {
  id?: string;
  icon?: string;
};

type MultiplicationGroup = {
  id: string;
  items: MultiplicationItem[];
  requiredSlots?: number;
  isIncomplete?: boolean;
};

type ArrangementOption = {
  id: string;
  groupCount: number;
  itemsPerGroup: number;
  groups: MultiplicationGroup[];
};

type EarlyMultiplicationData = {
  renderKey?: string;
  questionType?: string;
  puzzleTitle?: string;
  icon?: string;
  groupCount?: number;
  itemsPerGroup?: number;
  groups?: MultiplicationGroup[];
  targetTotal?: number;
  requiredSelections?: number;
  options?: ArrangementOption[];
};

function parseStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string => typeof item === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export default function EarlyMultiplicationGroupsQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const details = data as EarlyMultiplicationData;

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

  const isCountGroups =
    code === "MULTIPLICATION_COUNT_EQUAL_GROUPS";

  const isCompleteGroups =
    code === "MULTIPLICATION_COMPLETE_GROUPS";

  const isUnequalGroups =
    code === "MULTIPLICATION_FIND_UNEQUAL_GROUP";

  const isSameTotal =
    code === "MULTIPLICATION_SAME_TOTAL_GROUPS";

  const groups = details.groups ?? [];
  const options = details.options ?? [];

  const selectedOptionIds = parseStringArray(answer);
  const parsedCorrectIds = parseStringArray(correctAnswer);
  const optionIds = new Set(options.map((option) => option.id));

  const expectedOptionIds =
    parsedCorrectIds.length > 0
      ? parsedCorrectIds
      : (correctAnswers ?? [])
          .map(String)
          .filter((id) => optionIds.has(id));

  const requiredSelections = details.requiredSelections ?? 2;
  const hasAnswer = answer.trim().length > 0;

  const selectedIdsMatch =
    selectedOptionIds.length === expectedOptionIds.length &&
    expectedOptionIds.every((id) => selectedOptionIds.includes(id));

  const isCorrect =
    isCountGroups || isCompleteGroups
      ? hasAnswer &&
        correctAnswer !== "" &&
        Number(answer) === Number(correctAnswer)
      : isUnequalGroups
        ? hasAnswer && answer === correctAnswer
        : isSameTotal
          ? selectedOptionIds.length === requiredSelections &&
            selectedIdsMatch
          : false;

  const inputClassName = [
    "early-multiplication-groups__answer-input",
    showAnswers && hasAnswer
      ? isCorrect
        ? "early-multiplication-groups__answer-input--correct"
        : "early-multiplication-groups__answer-input--wrong"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Display only the groups and objects received from the backend.
  const renderGroup = (
    group: MultiplicationGroup,
    index: number,
  ) => {
    const requiredSlots = group.requiredSlots ?? group.items.length;

    const missingSlots = group.isIncomplete
      ? Math.max(0, requiredSlots - group.items.length)
      : 0;

    return (
      <div
        key={group.id}
        className={[
          "early-multiplication-groups__group",
          group.isIncomplete
            ? "early-multiplication-groups__group--incomplete"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="early-multiplication-groups__group-heading">
          <span className="early-multiplication-groups__group-letter">
            {String.fromCharCode(65 + index)}
          </span>

          <span>Group {String.fromCharCode(65 + index)}</span>

          {group.isIncomplete && (
            <span className="early-multiplication-groups__missing-badge">
              Fill the gaps
            </span>
          )}
        </div>

        <div className="early-multiplication-groups__objects">
          {group.items.map((item, itemIndex) => {
            const icon = item.icon || details.icon;

            return (
              <span
                key={item.id ?? `${group.id}-${itemIndex}`}
                className="early-multiplication-groups__object"
                role={icon ? "img" : undefined}
                aria-label={
                  icon
                    ? `Object ${itemIndex + 1} in group ${index + 1}`
                    : undefined
                }
              >
                {icon}
              </span>
            );
          })}

          {Array.from({ length: missingSlots }, (_, slotIndex) => (
            <span
              key={`missing-${group.id}-${slotIndex}`}
              className="early-multiplication-groups__object-slot"
              aria-label="Empty object slot"
            >
              ?
            </span>
          ))}
        </div>

        {group.isIncomplete && (
          <div className="early-multiplication-groups__group-footer">
            {group.items.length} of {requiredSlots} objects
          </div>
        )}
      </div>
    );
  };

  const toggleArrangement = (id: string) => {
    if (showAnswers) return;

    const currentlySelected = selectedOptionIds.includes(id);

    let nextIds: string[];

    if (currentlySelected) {
      nextIds = selectedOptionIds.filter((item) => item !== id);
    } else {
      if (selectedOptionIds.length >= requiredSelections) return;
      nextIds = [...selectedOptionIds, id];
    }

    onAnswerChange(JSON.stringify(nextIds));
  };

  const correctUnequalIndex = groups.findIndex(
    (group) => group.id === correctAnswer,
  );

  return (
    <section className="generated-question early-multiplication-groups">
      <h3 className="generated-question__text early-multiplication-groups__prompt">
        {question.questionText}
      </h3>

      {/* Count equal groups */}
      {isCountGroups && (
        <div className="early-multiplication-groups__worksheet">
          <div className="early-multiplication-groups__group-grid">
            {groups.map((group, index) => renderGroup(group, index))}
          </div>

          <div className="early-multiplication-groups__answer-row">
            <label
              htmlFor={`early-multiplication-answer-${question.generatedQuestionId}`}
            >
              Your answer
            </label>

            <input
              id={`early-multiplication-answer-${question.generatedQuestionId}`}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="?"
              value={answer}
              disabled={showAnswers}
              className={inputClassName}
              onChange={(event) =>
                onAnswerChange(event.target.value)
              }
            />
          </div>

          {showAnswers && (
            <p className="early-multiplication-groups__solution">
              <Check size={18} aria-hidden="true" />
              Total objects: <strong>{correctAnswer}</strong>
            </p>
          )}
        </div>
      )}

      {/* Complete equal groups */}
      {isCompleteGroups && (
        <div className="early-multiplication-groups__worksheet">
          <div className="early-multiplication-groups__group-grid">
            {groups.map((group, index) => renderGroup(group, index))}
          </div>

          <div className="early-multiplication-groups__answer-row">
            <label
              htmlFor={`early-multiplication-answer-${question.generatedQuestionId}`}
            >
              Objects still needed
            </label>

            <input
              id={`early-multiplication-answer-${question.generatedQuestionId}`}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="?"
              value={answer}
              disabled={showAnswers}
              className={inputClassName}
              onChange={(event) =>
                onAnswerChange(event.target.value)
              }
            />
          </div>

          {showAnswers && (
            <p className="early-multiplication-groups__solution">
              <Check size={18} aria-hidden="true" />
              Objects needed: <strong>{correctAnswer}</strong>
            </p>
          )}
        </div>
      )}

      {/* Find the unequal group */}
      {isUnequalGroups && (
        <div className="early-multiplication-groups__worksheet">
          <div className="early-multiplication-groups__group-grid">
            {groups.map((group, index) => {
              const selected = answer === group.id;
              const correct = correctAnswer === group.id;

              const optionClass = [
                "early-multiplication-groups__group-option",
                selected
                  ? "early-multiplication-groups__group-option--selected"
                  : "",
                showAnswers && correct
                  ? "early-multiplication-groups__group-option--correct"
                  : "",
                showAnswers && selected && !correct
                  ? "early-multiplication-groups__group-option--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={group.id}
                  type="button"
                  disabled={showAnswers}
                  aria-pressed={selected}
                  className={optionClass}
                  onClick={() => onAnswerChange(group.id)}
                >
                  {renderGroup(group, index)}

                  {showAnswers && correct && (
                    <Check
                      className="early-multiplication-groups__option-check"
                      size={20}
                      aria-hidden="true"
                    />
                  )}

                  {showAnswers && selected && !correct && (
                    <X
                      className="early-multiplication-groups__option-wrong"
                      size={20}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {showAnswers && correctUnequalIndex >= 0 && (
            <p className="early-multiplication-groups__solution">
              <Check size={18} aria-hidden="true" />
              Unequal group:{" "}
              <strong>
                Group {String.fromCharCode(65 + correctUnequalIndex)}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* Same total, different groups */}
      {isSameTotal && (
        <div className="early-multiplication-groups__worksheet">
          <div className="early-multiplication-groups__arrangements">
            {options.map((option, index) => {
              const selected = selectedOptionIds.includes(option.id);
              const correct = expectedOptionIds.includes(option.id);

              const optionClass = [
                "early-multiplication-groups__arrangement",
                selected
                  ? "early-multiplication-groups__arrangement--selected"
                  : "",
                showAnswers && correct
                  ? "early-multiplication-groups__arrangement--correct"
                  : "",
                showAnswers && selected && !correct
                  ? "early-multiplication-groups__arrangement--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={
                    showAnswers ||
                    (!selected &&
                      selectedOptionIds.length >= requiredSelections)
                  }
                  aria-pressed={selected}
                  className={optionClass}
                  onClick={() => toggleArrangement(option.id)}
                >
                  <div className="early-multiplication-groups__arrangement-heading">
                    <span className="early-multiplication-groups__arrangement-letter">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <strong>
                      {option.groupCount} groups × {option.itemsPerGroup}
                    </strong>

                    <span className="early-multiplication-groups__selection-mark">
                      {selected ? <Check size={16} /> : ""}
                    </span>
                  </div>

                  <div className="early-multiplication-groups__mini-groups">
                    {option.groups.map((group, groupIndex) => (
                      <div
                        key={group.id}
                        className="early-multiplication-groups__mini-group"
                        aria-label={`Group ${groupIndex + 1}`}
                      >
                        {group.items.map((item, itemIndex) => {
                          const icon = item.icon || details.icon;

                          return (
                            <span
                              key={`${group.id}-${item.id ?? itemIndex}`}
                              className="early-multiplication-groups__mini-object"
                              role={icon ? "img" : undefined}
                              aria-label={
                                icon
                                  ? `Object ${itemIndex + 1}`
                                  : undefined
                              }
                            >
                              {icon}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="early-multiplication-groups__selection-count">
            <span>Select {requiredSelections} arrangements</span>
            <strong>
              {selectedOptionIds.length} / {requiredSelections}
            </strong>
          </div>

          {showAnswers && (
            <p className="early-multiplication-groups__solution">
              <Check size={18} aria-hidden="true" />
              Correct choices:{" "}
              <strong>
                {expectedOptionIds
                  .map((id) => {
                    const index = options.findIndex(
                      (option) => option.id === id,
                    );

                    return index >= 0
                      ? String.fromCharCode(65 + index)
                      : id;
                  })
                  .join(", ")}
              </strong>
            </p>
          )}
        </div>
      )}

      {!isCountGroups &&
        !isCompleteGroups &&
        !isUnequalGroups &&
        !isSameTotal && (
          <p className="early-multiplication-groups__unsupported">
            Unsupported multiplication question type: {code || "Unknown"}
          </p>
        )}

      {showAnswers && (
        <p
          className={[
            "early-multiplication-groups__feedback",
            isCorrect
              ? "early-multiplication-groups__feedback--correct"
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
              ? "Correct! Well done."
              : "Not quite. Check the correct answer above."}
          </span>
        </p>
      )}
    </section>
  );
}
