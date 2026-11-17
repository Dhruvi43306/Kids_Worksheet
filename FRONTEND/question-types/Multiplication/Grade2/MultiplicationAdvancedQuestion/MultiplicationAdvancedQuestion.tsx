//Problam - not -displaying the answer whenevr i was clcik the check answer button
"use client";

import { useEffect, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import "@/styles/worksheet.css";

type MultiplicationAdvancedData = {
  renderKey: string;
  questionType: string;
  title?: string;
  firstNumber?: number;
  secondNumber?: number;
  multiplier?: number;
  onesCalculation?: string;
  carry?: number;
  onesDigit?: number;
  tensCalculation?: string;
  tensValue?: number;
  onesValue?: number;
  partialTensProduct?: number;
  partialOnesProduct?: number;
  expandedEquation?: string;
  visibleOnesDigit?: number;
  product?: number;
  equation?: string;
  answerMode?: string;
  answerType?: string;
};

type QuestionInfo = {
  questionText?: string;
  questionId?: number | string;
  generatedQuestionId?: number | string;
  questionNumber?: number;
};

type Props = QuestionRendererProps & {
  data: MultiplicationAdvancedData;
};

const normalize = (value: unknown): string =>
  String(value ?? "").trim();

export default function MultiplicationAdvancedQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: Props) {
  const questionInfo = question as QuestionInfo;

  const correctAnswer = normalize(correctAnswers?.[0]);
  const answer = normalize(userAnswer);

  const questionIdentity =
    questionInfo.generatedQuestionId ??
    questionInfo.questionId ??
    questionInfo.questionNumber ??
    data.questionType;

  // Keep all hooks at component level.
  const [studentAnswer, setStudentAnswer] = useState(answer);
  const [fullProduct, setFullProduct] = useState("");
  const [tensProduct, setTensProduct] = useState("");
  const [onesProduct, setOnesProduct] = useState("");
  const [expandedAnswer, setExpandedAnswer] = useState("");
const [carryAnswer, setCarryAnswer] = useState("");
const [tensAnswer, setTensAnswer] = useState("");

  useEffect(() => {
    setStudentAnswer(answer);
  }, [answer, questionIdentity]);

  useEffect(() => {
    setFullProduct("");
    setTensProduct("");
    setOnesProduct("");
    setExpandedAnswer("");
    setOnesProduct("");
  setCarryAnswer("");
  setTensAnswer("");
  }, [questionIdentity, data.questionType]);

  const handleAnswerChange = (value: string) => {
    if (showAnswers) return;

    setStudentAnswer(value);
    onAnswerChange(value);
  };

  const isFinalAnswerCorrect =
    studentAnswer !== "" &&
    correctAnswer !== "" &&
    Number(studentAnswer) === Number(correctAnswer);

//   const renderHeader = () => (
//     <div className="multiplication-advanced__header">
//       <div className="multiplication-advanced__header-icon">
//         <Calculator size={22} />
//       </div>
//     </div>
//   );

  const renderFeedback = () => {
    if (!showAnswers) return null;

    return (
      <div
        className={`multiplication-advanced__feedback ${
          isFinalAnswerCorrect
            ? "multiplication-advanced__feedback--correct"
            : "multiplication-advanced__feedback--incorrect"
        }`}
        role="status"
        aria-live="polite"
      >
        {isFinalAnswerCorrect ? (
          <CheckCircle2 size={19} />
        ) : (
          <XCircle size={19} />
        )}

        <div>
          <strong>
            {isFinalAnswerCorrect
              ? "Correct answer!"
              : "Correct answer"}
          </strong>

          <p>{correctAnswer || "Answer unavailable"}</p>
        </div>
      </div>
    );
  };

  const renderSingleAnswerInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    expectedValue?: string
  ) => (
    <div className="multiplication-advanced__answer-area">
      <label className="multiplication-advanced__answer-label">
        {label}
      </label>

      <input
        className="multiplication-advanced__input"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        placeholder="Enter answer"
        value={value}
        disabled={showAnswers}
        onChange={(event) => onChange(event.target.value)}
      />

      {showAnswers && expectedValue !== undefined && (
        <span className="multiplication-advanced__expected-value">
          Correct answer: {expectedValue}
        </span>
      )}
    </div>
  );

  /* =====================================================
     1. MULTIPLICATION REGROUPING WORKED STEPS
  ===================================================== */

if (
  data.questionType ===
  "MULTIPLICATION_REGROUPING_WORKED_STEPS"
) {
  const number = Number(data.firstNumber ?? 0);
  const multiplier = Number(data.secondNumber ?? 0);

  return (
    <section className="multiplication-advanced">
      <div className="multiplication-advanced__card multiplication-advanced__card--compact">
        <div className="multiplication-advanced__compact-question">
          <span className="multiplication-advanced__question-number">
            {questionInfo.questionNumber ?? ""}
          </span>

          <div className="multiplication-advanced__compact-content">
            <h3 className="multiplication-advanced__compact-heading">
              Multiply with regrouping
            </h3>

            <div className="multiplication-advanced__compact-row multiplication-advanced__regrouping-grid">
              {/* Original product */}
              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Original
                </span>

                <div className="multiplication-advanced__regrouping-line">
                  <strong>{number} × {multiplier} =</strong>

                  <input
                    className="multiplication-advanced__compact-input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="?"
                    aria-label="Final product"
                    value={studentAnswer}
                    disabled={showAnswers}
                    onChange={(event) =>
                      handleAnswerChange(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* Ones calculation */}
              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Ones
                </span>

                <div className="multiplication-advanced__regrouping-line">
                  <strong>
                    {number % 10} × {multiplier} =
                  </strong>

                  <input
                    className="multiplication-advanced__compact-input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="?"
                    aria-label="Ones multiplication result"
                    value={onesProduct}
                    disabled={showAnswers}
                    onChange={(event) =>
                      setOnesProduct(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* Carry */}
              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Carry
                </span>

                <div className="multiplication-advanced__regrouping-line">
                  <strong>Carry =</strong>

                  <input
                    className="multiplication-advanced__compact-input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="?"
                    aria-label="Carry to tens"
                    value={carryAnswer}
                    disabled={showAnswers}
                    onChange={(event) =>
                      setCarryAnswer(event.target.value)
                    }
                  />
                </div>
              </div>

              {/* Tens calculation */}
              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Tens
                </span>

                <div className="multiplication-advanced__regrouping-line">
                  <strong>
                    {Math.floor(number / 10)} × {multiplier} + carry =
                  </strong>

                  <input
                    className="multiplication-advanced__compact-input"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    placeholder="?"
                    aria-label="Tens calculation result"
                    value={tensAnswer}
                    disabled={showAnswers}
                    onChange={(event) =>
                      setTensAnswer(event.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {showAnswers && (
              <div className="multiplication-advanced__feedback">
                <strong>
                  Correct values:{" "}
                  {number * multiplier},{" "}
                  {(number % 10) * multiplier},{" "}
                  Math.floor((number % 10) * multiplier / 10),{" "}
                  {Math.floor(number / 10) * multiplier +
                    Math.floor(((number % 10) * multiplier) / 10)}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


  /* =====================================================
     2. MULTIPLICATION EXPANDED FORM DECOMPOSITION
  ===================================================== */

  if (data.questionType ==="MULTIPLICATION_EXPANDED_FORM_DECOMPOSITION") {
    const number = Number(data.firstNumber ?? 0);
    const multiplier = Number(data.secondNumber ?? 0);
    const tens = Number(data.tensValue ?? 0);
    const ones = Number(data.onesValue ?? 0);

    const expectedFullProduct = String(number * multiplier);
    const expectedTensProduct = String(tens * multiplier);
    const expectedOnesProduct = String(ones * multiplier);

    const expectedExpandedTotal = String(
      Number(expectedTensProduct) + Number(expectedOnesProduct)
    );

    const step1Correct =
      fullProduct.trim() !== "" &&
      Number(fullProduct) === Number(expectedFullProduct);

    const step2Correct =
      tensProduct.trim() !== "" &&
      Number(tensProduct) === Number(expectedTensProduct);

    const step3Correct =
      onesProduct.trim() !== "" &&
      Number(onesProduct) === Number(expectedOnesProduct);

    const finalExpandedCorrect =
      expandedAnswer.trim() !== "" &&
      Number(expandedAnswer) === Number(expectedExpandedTotal);

    const allStepsCorrect =
      step1Correct &&
      step2Correct &&
      step3Correct &&
      finalExpandedCorrect;

    return (
      <section className="multiplication-advanced">
        <div className="multiplication-advanced__card multiplication-advanced__card--compact">
          {/* {renderHeader()} */}

          <p className="multiplication-advanced__description">
            {questionInfo.questionText ??
              `Break ${number} into tens and ones, then multiply.`}
          </p>

          <div className="multiplication-advanced__compact">
            {/* First row: three calculations side by side */}
            <div className="multiplication-advanced__compact-row">
              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Product
                </span>

                <strong>
                  {number} × {multiplier} =
                </strong>

                <input
                  className="multiplication-advanced__compact-input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="?"
                  aria-label="Complete product"
                  value={fullProduct}
                  disabled={showAnswers}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFullProduct(value);

                    // The backend's expected answer is the final product.
                    handleAnswerChange(value);
                  }}
                />

                {showAnswers && (
                  <span
                    className={`multiplication-advanced__compact-answer ${
                      step1Correct
                        ? "multiplication-advanced__compact-answer--correct"
                        : "multiplication-advanced__compact-answer--incorrect"
                    }`}
                  >
                    {expectedFullProduct}
                  </span>
                )}
              </div>

              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Tens
                </span>

                <strong>
                  {tens} × {multiplier} =
                </strong>

                <input
                  className="multiplication-advanced__compact-input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="?"
                  aria-label="Tens partial product"
                  value={tensProduct}
                  disabled={showAnswers}
                  onChange={(event) =>
                    setTensProduct(event.target.value)
                  }
                />

                {showAnswers && (
                  <span
                    className={`multiplication-advanced__compact-answer ${
                      step2Correct
                        ? "multiplication-advanced__compact-answer--correct"
                        : "multiplication-advanced__compact-answer--incorrect"
                    }`}
                  >
                    {expectedTensProduct}
                  </span>
                )}
              </div>

              <div className="multiplication-advanced__compact-item">
                <span className="multiplication-advanced__compact-label">
                  Ones
                </span>

                <strong>
                  {ones} × {multiplier} =
                </strong>

                <input
                  className="multiplication-advanced__compact-input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="?"
                  aria-label="Ones partial product"
                  value={onesProduct}
                  disabled={showAnswers}
                  onChange={(event) =>
                    setOnesProduct(event.target.value)
                  }
                />

                {showAnswers && (
                  <span
                    className={`multiplication-advanced__compact-answer ${
                      step3Correct
                        ? "multiplication-advanced__compact-answer--correct"
                        : "multiplication-advanced__compact-answer--incorrect"
                    }`}
                  >
                    {expectedOnesProduct}
                  </span>
                )}
              </div>
            </div>

            {/* Second row: one final expanded equation and input */}
            <div className="multiplication-advanced__final-row">
              <strong className="multiplication-advanced__final-equation">
                ({tens} × {multiplier}) + ({ones} × {multiplier}) =
              </strong>

              <input
                className="multiplication-advanced__compact-input multiplication-advanced__final-input"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="?"
                aria-label="Final expanded-form answer"
                value={expandedAnswer}
                disabled={showAnswers}
                onChange={(event) =>
                  setExpandedAnswer(event.target.value)
                }
              />

              {showAnswers && (
                <span
                  className={`multiplication-advanced__compact-answer ${
                    finalExpandedCorrect
                      ? "multiplication-advanced__compact-answer--correct"
                      : "multiplication-advanced__compact-answer--incorrect"
                  }`}
                >
                  {expectedExpandedTotal}
                </span>
              )}
            </div>
          </div>

          {showAnswers && (
            <div
              className={`multiplication-advanced__feedback ${
                allStepsCorrect
                  ? "multiplication-advanced__feedback--correct"
                  : "multiplication-advanced__feedback--incorrect"
              }`}
              role="status"
              aria-live="polite"
            >
              {allStepsCorrect ? (
                <CheckCircle2 size={19} />
              ) : (
                <XCircle size={19} />
              )}

              <div>
                <strong>
                  {allStepsCorrect
                    ? "All calculations are correct!"
                    : "Check the calculations"}
                </strong>

                <p>
                  {number} × {multiplier} = {expectedFullProduct};
                  {" "}
                  {tens} × {multiplier} = {expectedTensProduct};
                  {" "}
                  {ones} × {multiplier} = {expectedOnesProduct};
                  {" "}
                  final total = {expectedExpandedTotal}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* =====================================================
     3. MULTIPLICATION MISSING DIGIT COLUMN
  ===================================================== */

 if (
  data.questionType ===
  "MULTIPLICATION_MISSING_DIGIT_COLUMN"
) {
  const visibleOnesDigit = Number(data.visibleOnesDigit ?? 0);
  const multiplier = Number(
    data.multiplier ?? data.secondNumber ?? 0
  );
  const product = Number(data.product ?? 0);

  return (
    <section className="multiplication-advanced">
      <div className="multiplication-advanced__card multiplication-advanced__card--compact">
        <div className="multiplication-advanced__compact-question">
          <span className="multiplication-advanced__question-number">
            {questionInfo.questionNumber ?? ""}
          </span>

          <div className="multiplication-advanced__compact-content">
            <h3 className="multiplication-advanced__compact-heading">
              Find the missing digit
            </h3>

            <div className="multiplication-advanced__missing-inline">
              <strong className="multiplication-advanced__missing-equation">
                <span className="multiplication-advanced__missing-prefix">
                  □{visibleOnesDigit} × {multiplier} = {product}
                </span>
              </strong>

              <input
                className="multiplication-advanced__compact-input multiplication-advanced__missing-input"
                type="number"
                min="0"
                max="9"
                step="1"
                inputMode="numeric"
                placeholder="?"
                aria-label="Enter the missing tens digit"
                value={studentAnswer}
                disabled={showAnswers}
                onChange={(event) =>
                  handleAnswerChange(event.target.value)
                }
              />
            </div>

            {renderFeedback()}
          </div>
        </div>
      </div>
    </section>
  );
}

  /* =====================================================
     UNSUPPORTED QUESTION TYPE
  ===================================================== */

  return (
    <section className="multiplication-advanced">
      <div className="multiplication-advanced__card">
        {/* {renderHeader()} */}

        <p className="multiplication-advanced__description">
          No renderer is configured for{" "}
          <strong>{data.questionType}</strong>.
        </p>
      </div>
    </section>
  );
}
