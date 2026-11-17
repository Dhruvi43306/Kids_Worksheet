"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleHelp,
  LockKeyhole,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import "@/styles/worksheet.css";

type DivisionClue = {
  id: string;
  equation: string;
};

type DivisionOption = {
  id: string;
  equation: string;
};

type DivisionCodeKey = {
  quotient: number;
  letter: string;
};

type DivisionEquation = {
  id: string;
  equation: string;
};

type DivisionQuestionData = {
  renderKey: string;
  questionType: string;
  title?: string;
  clues?: DivisionClue[];
  crossingCell?: string;
  answerMode?: string;
  options?: Array<DivisionOption | string>;
  choices?: string[];
  codeKey?: DivisionCodeKey[];
  equations?: DivisionEquation[];
};

type DivisionQuestionInfo = {
  questionText?: string;
  questionId?: number | string;
  generatedQuestionId?: number | string;
  questionNumber?: number;
};

type Props = QuestionRendererProps & {
  data: DivisionQuestionData;
};

type AnswerMap = Record<string, string>;

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

/**
 * Converts a saved answer into a map.
 *
 * Supports:
 * "B:Exact,C:Remainder,A:Exact,D:Remainder"
 *
 * And:
 * ["B:Exact", "C:Remainder", "A:Exact", "D:Remainder"]
 */
function parseClassificationAnswer(value: unknown): AnswerMap {
  const result: AnswerMap = {};

  const values = Array.isArray(value) ? value : [value];

  for (const item of values) {
    const entries = String(item ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    for (const entry of entries) {
      const separator = entry.indexOf(":");

      if (separator < 1) continue;

      const id = entry.slice(0, separator).trim();
      const answer = entry.slice(separator + 1).trim();

      if (id && answer) {
        result[id] = answer;
      }
    }
  }

  return result;
}

function getExpectedAnswers(
  correctAnswers: string[] | undefined
): string[] {
  if (!Array.isArray(correctAnswers)) return [];

  return correctAnswers.map(String);
}

function normalizeOptions(
  options: Array<DivisionOption | string> | undefined
): DivisionOption[] {
  if (!Array.isArray(options)) return [];

  return options.map((option, index) => {
    if (typeof option === "string") {
      
      const match = option.match(/^\s*([A-Za-z0-9]+)\s*:\s*(.*)$/);

      if (match) {
        return {
          id: match[1],
          equation: match[2],
        };
      }

      return {
        id: String(index + 1),
        equation: option,
      };
    }

    return {
      id: String(option.id ?? index + 1),
      equation: String(option.equation ?? ""),
    };
  });
}

function serializeClassification(
  options: DivisionOption[],
  answers: AnswerMap
): string {
  return options
    .map((option) => {
      const selected = answers[option.id];

      return selected ? `${option.id}:${selected}` : "";
    })
    .filter(Boolean)
    .join(",");
}

function normalizeEquation(equation: string): string {
  return equation
    .replace(/\s+/g, "")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/")
    .toLowerCase();
}

export default function DivisionRemainderQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: Props) {
  const questionInfo = question as DivisionQuestionInfo;
  const answer = String(userAnswer ?? "");
  const expected = getExpectedAnswers(correctAnswers);

  const [crosswordAnswer, setCrosswordAnswer] = useState("");
  const [classification, setClassification] = useState<AnswerMap>({});
  const [quotientInputs, setQuotientInputs] = useState<AnswerMap>({});

  const questionIdentity =
    questionInfo.generatedQuestionId ??
    questionInfo.questionId ??
    questionInfo.questionNumber ??
    data.questionType;

  const options = useMemo(
    () => normalizeOptions(data.options),
    [data.options]
  );

  const parsedExpected = useMemo(
    () => parseClassificationAnswer(expected),
    [expected]
  );

  
  const parsedUserAnswer = useMemo(
    () => parseClassificationAnswer(answer),
    [answer]
  );

  useEffect(() => {
    setCrosswordAnswer("");
    setClassification({});
    setQuotientInputs({});
  }, [questionIdentity, data.renderKey]);

  useEffect(() => {
    if (data.renderKey === "DivisionQuotientCrossword") {
      setCrosswordAnswer(answer);
    }
  }, [answer, data.renderKey]);

  useEffect(() => {
    if (data.renderKey !== "DivisionExactOrRemainder") {
      return;
    }

    setClassification(parseClassificationAnswer(answer));
  }, [answer, data.renderKey]);

  useEffect(() => {
    if (data.renderKey !== "DivisionQuotientCodeBreaker") {
      return;
    }

    
    
    if (!showAnswers) return;

    const restored: AnswerMap = {};
    const equations = data.equations ?? [];
    const codeKey = data.codeKey ?? [];
    const expectedWord = expected[0] ?? "";

    equations.forEach((equation, index) => {
      const letter = expectedWord[index];

      const entry = codeKey.find(
        (item) => normalize(item.letter) === normalize(letter)
      );

      if (entry) {
        restored[equation.id] = String(entry.quotient);
      }
    });

    setQuotientInputs(restored);
  }, [
    questionIdentity,
    data.renderKey,
    data.equations,
    data.codeKey,
    showAnswers,
    expected,
  ]);

  const updateAnswer = (value: string) => {
    if (!showAnswers) {
      onAnswerChange(value);
    }
  };

  const renderFeedback = (
    isCorrect: boolean,
    correctAnswer: string
  ) => (
    <div
      className={`division-remainder__feedback ${
        isCorrect
          ? "division-remainder__feedback--correct"
          : "division-remainder__feedback--incorrect"
      }`}
      role="status"
      aria-live="polite"
    >
      {isCorrect ? (
        <CheckCircle2 size={20} />
      ) : (
        <XCircle size={20} />
      )}

      <div>
        <strong>
          {isCorrect ? "Correct answer!" : "Incorrect answer"}
        </strong>
        <p>{correctAnswer}</p>
      </div>
    </div>
  );

 

  if (data.renderKey === "DivisionQuotientCrossword") {
    const clues = data.clues ?? [];
    const expectedAnswer = expected[0] ?? "";

    const isCorrect =
      answer.trim() !== "" &&
      normalize(answer) === normalize(expectedAnswer);

    return (
      <section className="division-remainder">
        <div className="division-remainder__card">
          <div className="division-remainder__heading">
            <div className="division-remainder__icon">
              <CircleHelp size={23} />
            </div>
 <p className="division-remainder__eyebrow">
            {questionInfo.questionText ??
              "Solve both division clues. Enter the common quotient."}
          </p>

         
          </div>

         
          <div className="division-remainder__crossword">
            {clues.map((clue) => (
              <div
                className="division-remainder__clue"
                key={clue.id}
              >
                <span className="division-remainder__clue-label">
                  {clue.id}
                </span>

                <span className="division-remainder__equation">
                  {clue.equation} = ?
                </span>
              </div>
            ))}

            <div className="division-remainder__crossword-answer">
              <label htmlFor="division-crossword-answer">
                Shared quotient
              </label>

              <input
                id="division-crossword-answer"
                className="division-remainder__input"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="?"
                value={crosswordAnswer}
                disabled={showAnswers}
                onChange={(event) => {
                  const value = event.target.value;
                  setCrosswordAnswer(value);
                  updateAnswer(value);
                }}
              />
            </div>
          </div>

          {showAnswers &&
            renderFeedback(
              isCorrect,
              expectedAnswer || "No correct answer supplied."
            )}
        </div>
      </section>
    );
  }

 

  if (data.renderKey === "DivisionExactOrRemainder") {
    const choices = data.choices ?? ["Exact", "Remainder"];

   
    const hasAllAnswers =
      options.length > 0 &&
      options.every(
        (option) =>
          Boolean(parsedUserAnswer[option.id]) &&
          Boolean(parsedExpected[option.id])
      );

    const isCorrect =
      hasAllAnswers &&
      options.every(
        (option) =>
          normalize(parsedUserAnswer[option.id]) ===
          normalize(parsedExpected[option.id])
      );

    const handleClassificationChange = (
      id: string,
      value: string
    ) => {
      if (showAnswers) return;

      const next: AnswerMap = {
        ...classification,
        [id]: value,
      };

      setClassification(next);

      
      const serialized = serializeClassification(options, next);
      updateAnswer(serialized);
    };

    const resetClassification = () => {
      if (showAnswers) return;

      setClassification({});
      updateAnswer("");
    };

    const expectedDisplay =
      options
        .map((option) => {
          const value = parsedExpected[option.id];

          return value ? `${option.id}:${value}` : "";
        })
        .filter(Boolean)
        .join(",") || expected.join(",");

    return (
      <section className="division-remainder">
        <div className="division-remainder__card">
          <div className="division-remainder__heading">
            <div className="division-remainder__icon">
              <CheckCircle2 size={23} />
            </div>
  <p className="division-remainder__eyebrow">
            {questionInfo.questionText ??
              "Label each division calculation as Exact or Remainder."}
          </p>
           
          </div>

        

          <div className="division-remainder__classification-list">
            {options.map((option) => {
              const selected = classification[option.id];
              const correct = parsedExpected[option.id];

              return (
                <div
                  className="division-remainder__classification-row"
                  key={option.id}
                >
                  <span className="division-remainder__option-id">
                    {option.id}
                  </span>

                  <strong className="division-remainder__equation">
                    {option.equation}
                  </strong>

                  <div className="division-remainder__choices">
                    {choices.map((choice) => {
                      const isSelected =
                        normalize(selected) === normalize(choice);

                      const isExpected =
                        normalize(correct) === normalize(choice);

                      const choiceClass = [
                        "division-remainder__choice",
                        isSelected
                          ? "division-remainder__choice--selected"
                          : "",
                        showAnswers && isExpected
                          ? "division-remainder__choice--correct"
                          : "",
                        showAnswers && isSelected && !isExpected
                          ? "division-remainder__choice--wrong"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <button
                          type="button"
                          key={choice}
                          className={choiceClass}
                          disabled={showAnswers}
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleClassificationChange(
                              option.id,
                              choice
                            )
                          }
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!showAnswers && (
            <button
              type="button"
              className="division-remainder__reset"
              disabled={Object.keys(classification).length === 0}
              onClick={resetClassification}
            >
              <RotateCcw size={16} />
              Reset answers
            </button>
          )}

          {showAnswers &&
            renderFeedback(
              isCorrect,
              expectedDisplay || "No correct answer supplied."
            )}
        </div>
      </section>
    );
  }

 

  if (data.renderKey === "DivisionQuotientCodeBreaker") {
    const codeKey = data.codeKey ?? [];
    const equations = data.equations ?? [];
    const expectedWord = expected[0] ?? "";

    const getLetter = (value: string): string => {
      if (value.trim() === "") return "?";

      const quotient = Number(value);

      const entry = codeKey.find(
        (item) => item.quotient === quotient
      );

      return entry?.letter ?? "?";
    };

    const decodedWord = equations
      .map((equation) =>
        getLetter(quotientInputs[equation.id] ?? "")
      )
      .join("");

    const isCorrect =
      answer.trim() !== "" &&
      normalize(answer) === normalize(expectedWord);

    const handleQuotientChange = (
      id: string,
      value: string
    ) => {
      if (showAnswers) return;

      const next = {
        ...quotientInputs,
        [id]: value,
      };

      setQuotientInputs(next);

      const word = equations
        .map((equation) => getLetter(next[equation.id] ?? ""))
        .join("");

      updateAnswer(
        Object.values(next).some((item) => item.trim() !== "")
          ? word
          : ""
      );
    };

    const resetCodeBreaker = () => {
      if (showAnswers) return;

      setQuotientInputs({});
      updateAnswer("");
    };

    return (
      <section className="division-remainder">
        <div className="division-remainder__card">
          <div className="division-remainder__heading">
            <div className="division-remainder__icon">
              <LockKeyhole size={23} />
            </div>
            <p className="division-remainder__eyebrow">
            {questionInfo.questionText ??
              "Solve each division equation. Use the quotient key to reveal the secret word."}
          </p>
            {/* <div>
              <span className="division-remainder__eyebrow">
                CRACK THE CODE
              </span>
              <h3 className="division-remainder__title">
                {data.title ?? "Division Code Breaker"}
              </h3>
            </div> */}
          </div>

        

          <div className="division-remainder__code-key">
            <h4>Quotient code key</h4>

            <div className="division-remainder__code-key-grid">
              {codeKey.map((item) => (
                <div
                  className="division-remainder__code-key-item"
                  key={`${item.quotient}-${item.letter}`}
                >
                  <span>{item.quotient}</span>
                  <span className="division-remainder__code-arrow">
                    →
                  </span>
                  <strong>{item.letter}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="division-remainder__code-equations">
            {equations.map((equation) => (
              <div
                className="division-remainder__code-row"
                key={equation.id}
              >
                <span className="division-remainder__option-id">
                  {equation.id}
                </span>

                <strong className="division-remainder__equation">
                  {equation.equation.replace(/=\s*□/, "").trim()}
                </strong>

                <span className="division-remainder__equals">=</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="division-remainder__input division-remainder__code-input"
                  value={quotientInputs[equation.id] ?? ""}
                  placeholder="?"
                  disabled={showAnswers}
                  aria-label={`Quotient for ${equation.id}`}
                  onChange={(event) =>
                    handleQuotientChange(
                      equation.id,
                      event.target.value
                    )
                  }
                />

                <span className="division-remainder__decoded-letter">
                  {getLetter(quotientInputs[equation.id] ?? "")}
                </span>
              </div>
            ))}
          </div>


          {!showAnswers && (
            <button
              type="button"
              className="division-remainder__reset"
              disabled={
                !Object.values(quotientInputs).some(
                  (value) => value.trim() !== ""
                )
              }
              onClick={resetCodeBreaker}
            >
              <RotateCcw size={16} />
              Reset answers
            </button>
          )}

          {showAnswers &&
            renderFeedback(
              isCorrect,
              expectedWord || "No correct answer supplied."
            )}
        </div>
      </section>
    );
  }

  return (
    <section className="division-remainder">
      <div className="division-remainder__card">
        <h3 className="division-remainder__title">
          Unsupported division type
        </h3>

        <p className="division-remainder__description">
          No renderer is configured for{" "}
          <strong>{data.renderKey}</strong>.
        </p>
      </div>
    </section>
  );
}