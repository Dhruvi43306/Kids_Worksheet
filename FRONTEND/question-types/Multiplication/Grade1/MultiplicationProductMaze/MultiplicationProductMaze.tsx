import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Equal,
  LockKeyhole,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { AnswerBox } from "@/renderer/questionHelpers";
import "@/styles/worksheet.css";

type MazeCell = {
  id: string;
  equation: string;
};

type CodeKeyEntry = {
  product: number;
  letter: string;
};

type CodeEquation = {
  id: string;
  equation: string;
};

type ProductMazeData = {
  renderKey?: string;
  questionType?: string;
  title?: string;
  targetProduct?: number;
  startCell?: string;
  finishCell?: string;
  rows?: number;
  columns?: number;
  cells?: MazeCell[];
  equations?: Array<string | CodeEquation>;
  codeKey?: CodeKeyEntry[];
};

type QuestionMetadata = {
  questionText?: string;
  questionTypeCode?: string;
  code?: string;
  questionId?: number | string;
  generatedQuestionId?: number | string;
  questionNumber?: number;
};

type FeedbackPrefix =
  | "multiplication_product_maze"
  | "multiplication_zero_one_rule"
  | "multiplication_product_code_breaker";

/* =====================================================
   SAFE EQUATION HELPERS
===================================================== */

function getEquationText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    value !== null &&
    typeof value === "object" &&
    "equation" in value
  ) {
    const equation = (value as { equation?: unknown }).equation;
    return typeof equation === "string" ? equation : "";
  }

  return "";
}

function parseEquationFactors(
  value: unknown
): { first: number; second: number } | null {
  const equation = getEquationText(value);

  if (!equation) return null;

  const match = equation.match(/(\d+)\s*[×x*]\s*(\d+)/i);

  if (!match) return null;

  return {
    first: Number(match[1]),
    second: Number(match[2]),
  };
}

function parseProduct(value: unknown): number | null {
  const factors = parseEquationFactors(value);

  if (!factors) return null;

  return factors.first * factors.second;
}

function normalizeAnswer(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function splitIds(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getExpectedAnswer(correctAnswers: string[]): string {
  return correctAnswers.map(String).join(",");
}

function checkExactAnswer(
  answer: string,
  correctAnswers: string[]
): boolean {
  if (!answer.trim() || correctAnswers.length === 0) {
    return false;
  }

  return correctAnswers.some(
    (correct) =>
      normalizeAnswer(correct) === normalizeAnswer(answer)
  );
}

function checkMultiSelectAnswer(
  answer: string,
  correctAnswers: string[]
): boolean {
  if (!answer.trim() || correctAnswers.length === 0) {
    return false;
  }

  const actualIds = splitIds(answer).sort();
  const expectedIds = splitIds(
    getExpectedAnswer(correctAnswers)
  ).sort();

  return (
    actualIds.length === expectedIds.length &&
    actualIds.every((id, index) => id === expectedIds[index])
  );
}

/* =====================================================
   SHARED ANSWER FEEDBACK
===================================================== */

function GameAnswerFeedback({
  classPrefix,
  showAnswers,
  answer,
  correct,
  answerDisplay,
}: {
  classPrefix: FeedbackPrefix;
  showAnswers: boolean;
  answer: string;
  correct: boolean;
  answerDisplay: string;
}) {
  if (!showAnswers) return null;

  return (
    <div
      className={[
        `${classPrefix}__feedback`,
        correct
          ? `${classPrefix}__feedback--correct`
          : `${classPrefix}__feedback--incorrect`,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      {correct ? (
        <CheckCircle2 size={19} />
      ) : (
        <XCircle size={19} />
      )}

      <div>
        <strong>
          {correct
            ? "Correct!"
            : answer.trim()
              ? "Not quite. Here is the correct answer."
              : "No answer entered. Here is the correct answer."}
        </strong>

        <div className={`${classPrefix}__feedback-answer`}>
          <AnswerBox
            answer={answerDisplay || "No answer available."}
          />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function Grade1MultiplicationProductMaze({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const productData = data as unknown as ProductMazeData;
  const questionMetadata = question as unknown as QuestionMetadata;

  const questionType = String(
    productData.questionType ??
      questionMetadata.questionTypeCode ??
      questionMetadata.code ??
      ""
  ).toUpperCase();

  const renderKey = productData.renderKey ?? "";
  const answer = String(userAnswer ?? "").trim();

  const expectedAnswers = Array.isArray(correctAnswers)
    ? correctAnswers.map(String)
    : [];

  const questionText = questionMetadata.questionText ?? "";

  /* =====================================================
     HOOKS: KEEP ALL HOOKS AT THE TOP LEVEL
  ===================================================== */

  const [productInputs, setProductInputs] = useState<string[]>([
    "",
    "",
    "",
  ]);

  // Local maze state makes cell selection update immediately.
  const [mazePath, setMazePath] = useState<string[]>([]);

  const questionIdentity =
    questionMetadata.generatedQuestionId ??
    questionMetadata.questionId ??
    questionMetadata.questionNumber ??
    questionType;

  useEffect(() => {
    setProductInputs(["", "", ""]);
    setMazePath(splitIds(String(userAnswer ?? "")));
  }, [questionIdentity, questionType]);

  // Synchronize external answer changes without blocking local clicks.
  useEffect(() => {
    setMazePath(splitIds(String(userAnswer ?? "")));
  }, [userAnswer]);

  const updateAnswer = (nextAnswer: string) => {
    if (showAnswers) return;

    onAnswerChange(nextAnswer);
  };

  const renderHeading = (
    prefix: FeedbackPrefix,
    icon: React.ReactNode,
    title: string,
    eyebrow: string
  ) => (
    <div className={`${prefix}__heading`}>
      <div className={`${prefix}__heading-icon`}>{icon}</div>

      <div className={`${prefix}__heading-content`}>
        <span className={`${prefix}__eyebrow`}>{eyebrow}</span>
        <h3 className={`${prefix}__title`}>{title}</h3>
      </div>
    </div>
  );

  /* =====================================================
     1. MULTIPLICATION_PRODUCT_MAZE
  ===================================================== */

  if (
    renderKey === "MultiplicationProductMaze" ||
    questionType === "MULTIPLICATION_PRODUCT_MAZE"
  ) {
    const cells = productData.cells ?? [];
    const rows = Math.max(1, productData.rows ?? 3);
    const columns = Math.max(1, productData.columns ?? 3);
    const startCell = productData.startCell ?? "A";
    const finishCell = productData.finishCell ?? "E";
    const targetProduct = Number(productData.targetProduct ?? 0);

    // Local state is the source for immediate visual updates.
    const path = mazePath;

    const expectedPath = splitIds(
      getExpectedAnswer(expectedAnswers)
    );

    const correctPath = checkExactAnswer(
      path.join(","),
      expectedAnswers
    );

    const getPosition = (cellId: string) => {
      const index = cells.findIndex((cell) => cell.id === cellId);

      if (index < 0) return null;

      return {
        row: Math.floor(index / columns),
        column: index % columns,
      };
    };

    const areNeighbors = (
      firstId: string,
      secondId: string
    ): boolean => {
      const first = getPosition(firstId);
      const second = getPosition(secondId);

      if (!first || !second) return false;

      return (
        Math.abs(first.row - second.row) +
          Math.abs(first.column - second.column) ===
        1
      );
    };

    const canSelectCell = (cell: MazeCell): boolean => {
      if (showAnswers) return false;

      // Already-selected cells can be clicked to rewind the path.
      if (path.includes(cell.id)) return true;

      // First selection must be the start cell.
      if (path.length === 0) {
        return cell.id === startCell;
      }

      const lastCell = path[path.length - 1];

      // No additional cells can be selected after reaching finish.
      if (lastCell === finishCell) return false;

      // New cells must be adjacent and have the target product.
      return (
        areNeighbors(lastCell, cell.id) &&
        parseProduct(cell.equation) === targetProduct
      );
    };

    const selectCell = (cell: MazeCell) => {
      if (!canSelectCell(cell)) return;

      const existingIndex = path.indexOf(cell.id);

      const nextPath =
        existingIndex >= 0
          ? path.slice(0, existingIndex + 1)
          : [...path, cell.id];

      // Update immediately so the clicked cell is highlighted.
      setMazePath(nextPath);

      // Notify the parent answer handler.
      updateAnswer(nextPath.join(","));
    };

    const resetMazePath = () => {
      if (showAnswers) return;

      setMazePath([]);
      updateAnswer("");
    };

    const expectedPathDisplay =
      expectedPath.length > 0
        ? expectedPath.join(" → ")
        : "A → B → E";

    return (
      <section className="multiplication_product_maze__container">
        <div className="multiplication_product_maze__card">
          {renderHeading(
            "multiplication_product_maze",
            <LockKeyhole size={22} />,
            productData.title ?? "Multiplication Product Maze",
            "MULTIPLICATION MAZE"
          )}

          <p className="multiplication_product_maze__prompt">
            {questionText}
          </p>

          <div
            className="multiplication_product_maze__grid"
            role="group"
            aria-label="Multiplication maze cells"
          >
            {cells.slice(0, rows * columns).map((cell) => {
              const selected = path.includes(cell.id);
              const isStart = cell.id === startCell;
              const isFinish = cell.id === finishCell;
              const product = parseProduct(cell.equation);
              const matchesTarget = product === targetProduct;
              const isCorrectRouteCell =
                expectedPath.includes(cell.id);

              return (
                <button
                  key={cell.id}
                  type="button"
                  className={[
                    "multiplication_product_maze__cell",
                    isStart
                      ? "multiplication_product_maze__cell--start"
                      : "",
                    isFinish
                      ? "multiplication_product_maze__cell--finish"
                      : "",
                    selected
                      ? "multiplication_product_maze__cell--selected"
                      : "",
                    !matchesTarget
                      ? "multiplication_product_maze__cell--decoy"
                      : "",
                    showAnswers && isCorrectRouteCell
                      ? "multiplication_product_maze__cell--correct-route"
                      : "",
                    showAnswers &&
                    selected &&
                    !isCorrectRouteCell
                      ? "multiplication_product_maze__cell--wrong-route"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectCell(cell)}
                  disabled={!canSelectCell(cell)}
                  aria-pressed={selected}
                  aria-label={`Cell ${cell.id}: ${cell.equation}`}
                >
                  <span className="multiplication_product_maze__cell-top">
                    <span className="multiplication_product_maze__cell-id">
                      {cell.id}
                    </span>

                    {isStart && (
                      <span className="multiplication_product_maze__cell-tag">
                        START
                      </span>
                    )}

                    {isFinish && (
                      <span className="multiplication_product_maze__cell-tag">
                        FINISH
                      </span>
                    )}
                  </span>

                  <strong className="multiplication_product_maze__cell-equation">
                    {cell.equation}
                  </strong>

                  {showAnswers && (
                    <span className="multiplication_product_maze__cell-product">
                      = {product ?? "?"}
                    </span>
                  )}

                  {selected && (
                    <span className="multiplication_product_maze__path-number">
                      {path.indexOf(cell.id) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="multiplication_product_maze__path-panel">
            <div className="multiplication_product_maze__path-panel-heading">
              <strong>Your path</strong>

              <button
                type="button"
                className="multiplication_product_maze__reset-button"
                onClick={resetMazePath}
                disabled={showAnswers || path.length === 0}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>

            <div className="multiplication_product_maze__path-display">
              {path.length > 0
                ? path.join(" → ")
                : "Select cell A to begin"}
            </div>
          </div>

          <GameAnswerFeedback
            classPrefix="multiplication_product_maze"
            showAnswers={showAnswers}
            answer={path.join(",")}
            correct={correctPath}
            answerDisplay={expectedPathDisplay}
          />
        </div>
      </section>
    );
  }

  /* =====================================================
     2. MULTIPLICATION_ZERO_ONE_RULE
  ===================================================== */

  if (
    renderKey === "MultiplicationZeroOneRule" ||
    questionType === "MULTIPLICATION_ZERO_ONE_RULE"
  ) {
    const rawEquations = productData.equations ?? [];

    const firstEquation = getEquationText(rawEquations[0]);
    const secondEquation = getEquationText(rawEquations[1]);

    const answerParts = answer.includes(",")
      ? answer.split(",")
      : [answer, ""];

    const firstAnswer = answerParts[0] ?? "";
    const secondAnswer = answerParts[1] ?? "";

    const expectedParts =
      getExpectedAnswer(expectedAnswers).split(",");

    const numberMatch = firstEquation.match(/^\s*(\d+)/);
    const number = numberMatch ? Number(numberMatch[1]) : null;

    const firstDisplay = firstEquation.replace(
      "□",
      expectedParts[0] ?? ""
    );

    const secondDisplay = secondEquation.replace(
      "□",
      expectedParts[1] ?? ""
    );

    const correct = checkExactAnswer(answer, expectedAnswers);

    const updateRuleAnswer = (
      index: 0 | 1,
      value: string
    ) => {
      const nextParts = [firstAnswer, secondAnswer];
      nextParts[index] = value;

      updateAnswer(
        nextParts.every((item) => item.trim() === "")
          ? ""
          : nextParts.join(",")
      );
    };

    return (
      <section className="multiplication_zero_one_rule__container">
        <div className="multiplication_zero_one_rule__card">
          {renderHeading(
            "multiplication_zero_one_rule",
            <Equal size={22} />,
            productData.title ?? "Multiply by Zero and One",
            ""
          )}

          <div className="multiplication_zero_one_rule__rule-cards">
            <div className="multiplication_zero_one_rule__rule-card multiplication_zero_one_rule__rule-card--one">
              <span className="multiplication_zero_one_rule__rule-badge">
                × 1
              </span>

              <div className="multiplication_zero_one_rule__rule-equation">
                {number !== null
                  ? `${number} × 1 =`
                  : firstEquation.replace("□", "").trim()}
              </div>

              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                className="multiplication_zero_one_rule__answer-input"
                value={firstAnswer}
                onChange={(event) =>
                  updateRuleAnswer(0, event.target.value)
                }
                placeholder="?"
                disabled={showAnswers}
                aria-label="Answer for multiplication by one"
              />
            </div>

            <div className="multiplication_zero_one_rule__rule-card multiplication_zero_one_rule__rule-card--zero">
              <span className="multiplication_zero_one_rule__rule-badge">
                × 0
              </span>

              <div className="multiplication_zero_one_rule__rule-equation">
                {number !== null
                  ? `${number} × 0 =`
                  : secondEquation.replace("□", "").trim()}
              </div>

              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                className="multiplication_zero_one_rule__answer-input"
                value={secondAnswer}
                onChange={(event) =>
                  updateRuleAnswer(1, event.target.value)
                }
                placeholder="?"
                disabled={showAnswers}
                aria-label="Answer for multiplication by zero"
              />
            </div>
          </div>

          <GameAnswerFeedback
            classPrefix="multiplication_zero_one_rule"
            showAnswers={showAnswers}
            answer={answer}
            correct={correct}
            answerDisplay={`${firstDisplay} · ${secondDisplay}`}
          />
        </div>
      </section>
    );
  }

  /* =====================================================
     3. MULTIPLICATION_PRODUCT_CODE_BREAKER
  ===================================================== */

  if (
    renderKey === "MultiplicationProductCodeBreaker" ||
    questionType === "MULTIPLICATION_PRODUCT_CODE_BREAKER"
  ) {
    const codeKey = productData.codeKey ?? [];

    const equations = (productData.equations ?? []).filter(
      (item): item is CodeEquation =>
        typeof item === "object" &&
        item !== null &&
        "equation" in item &&
        typeof item.equation === "string"
    );

    const updateProductInput = (
      index: number,
      value: string
    ) => {
      if (showAnswers) return;

      const nextInputs = [...productInputs];
      nextInputs[index] = value;
      setProductInputs(nextInputs);

      const hasAnyInput = nextInputs
        .slice(0, equations.length)
        .some((item) => item.trim() !== "");

      const decodedWord = hasAnyInput
        ? nextInputs
            .slice(0, equations.length)
            .map((item) => {
              if (!item.trim()) return "?";

              return (
                codeKey.find(
                  (entry) => entry.product === Number(item)
                )?.letter ?? "?"
              );
            })
            .join("")
        : "";

      updateAnswer(decodedWord);
    };

    const decodedWord = productInputs
      .slice(0, equations.length)
      .map((item) => {
        if (!item.trim()) return "·";

        return (
          codeKey.find(
            (entry) => entry.product === Number(item)
          )?.letter ?? "?"
        );
      })
      .join("");

    const correct = checkExactAnswer(answer, expectedAnswers);

    const correctBreakdown = equations.map((item) => {
      const product = parseProduct(item);

      const letter =
        codeKey.find((entry) => entry.product === product)?.letter ??
        "?";

      return {
        id: item.id,
        equation: item.equation.replace(
          /=\s*□/,
          `= ${product ?? "?"}`
        ),
        letter,
      };
    });

    return (
      <section className="multiplication_product_code_breaker__container">
        <div className="multiplication_product_code_breaker__card">
          <p className="multiplication_product_code_breaker__prompt">
            {questionText}
          </p>

          <div className="multiplication_product_code_breaker__code-key">
            <span className="multiplication_product_code_breaker__section-label">
              PRODUCT CODE KEY
            </span>

            <div className="multiplication_product_code_breaker__key-grid">
              {codeKey.map((entry) => (
                <div
                  key={`${entry.product}-${entry.letter}`}
                  className="multiplication_product_code_breaker__key-item"
                >
                  <strong className="multiplication_product_code_breaker__key-product">
                    {entry.product}
                  </strong>

                  <span className="multiplication_product_code_breaker__key-arrow">
                    →
                  </span>

                  <strong className="multiplication_product_code_breaker__key-letter">
                    {entry.letter}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="multiplication_product_code_breaker__equations">
            {equations.map((item, index) => (
              <div
                key={item.id}
                className="multiplication_product_code_breaker__equation-row"
              >
                <span className="multiplication_product_code_breaker__equation-id">
                  {item.id}
                </span>

                <strong className="multiplication_product_code_breaker__equation-text">
                  {item.equation.replace(/=\s*□/, "").trim()}
                </strong>

                <span className="multiplication_product_code_breaker__equation-equals">
                  =
                </span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="multiplication_product_code_breaker__product-input"
                  value={productInputs[index] ?? ""}
                  onChange={(event) =>
                    updateProductInput(index, event.target.value)
                  }
                  placeholder="?"
                  disabled={showAnswers}
                  aria-label={`Product for equation ${item.id}`}
                />
              </div>
            ))}
          </div>

          <div className="multiplication_product_code_breaker__decoded">
            <div className="multiplication_product_code_breaker__decoded-top">
              <span className="multiplication_product_code_breaker__section-label">
                SECRET WORD
              </span>

              <span className="multiplication_product_code_breaker__decoded-status">
                {
                  productInputs
                    .slice(0, equations.length)
                    .filter((item) => item.trim()).length
                }{" "}
                / {equations.length} solved
              </span>
            </div>

            <div
              className="multiplication_product_code_breaker__decoded-letters"
              aria-live="polite"
            >
              {decodedWord.split("").map((letter, index) => (
                <span
                  key={`secret-letter-${index}`}
                  className="multiplication_product_code_breaker__decoded-letter"
                >
                  {showAnswers
                    ? expectedAnswers[0]?.[index] ?? letter
                    : letter}
                </span>
              ))}
            </div>
          </div>

          {showAnswers && (
            <div
              className={[
                "multiplication_product_code_breaker__feedback",
                correct
                  ? "multiplication_product_code_breaker__feedback--correct"
                  : "multiplication_product_code_breaker__feedback--incorrect",
              ].join(" ")}
              role="status"
            >
              {correct ? (
                <CheckCircle2 size={19} />
              ) : (
                <XCircle size={19} />
              )}

              <div>
                <strong>
                  {correct
                    ? "Code cracked!"
                    : "Check the products and decode again."}
                </strong>

                <div className="multiplication_product_code_breaker__correct-breakdown">
                  {correctBreakdown.map((item) => (
                    <p key={item.id}>
                      {item.id}: {item.equation} → {item.letter}
                    </p>
                  ))}
                </div>

                <AnswerBox
                  answer={expectedAnswers[0] ?? "CAT"}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="multiplication_product_maze__unsupported">
      Unsupported multiplication product type:{" "}
      {questionType || "Unknown"}
    </div>
  );
}