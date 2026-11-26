"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import "@/styles/worksheet.css";

interface IdentifyUpperLowerCaseData {
    questionType?: string;
    questionFormat?: string;
    targetLetter?: string;
    targetCase?: string;
    options?: string[];
    selectionMode?: string;
    answerType?: string;
}

interface IdentifyUpperLowerCaseQuestion {
    questionDataJson?: string | IdentifyUpperLowerCaseData;
    QuestionDataJson?: string | IdentifyUpperLowerCaseData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
}

interface IdentifyUpperLowerCaseProps {
    question: IdentifyUpperLowerCaseQuestion;

    // Existing renderer props
    userAnswer?: string;
    showAnswers?: boolean;
    correctAnswers?: string[];
    onAnswerChange?: (answer: string) => void;

    // Backward compatibility with previous component props
    value?: string;
    showAnswer?: boolean;
}

// Parse correct answers.
function parseCorrectAnswers(answer?: string | null): string[] {
    if (
        answer === null ||
        answer === undefined ||
        answer === ""
    ) {
        return [];
    }

    const normalized = String(answer).trim();

    if (!normalized) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(normalized);

        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim());
        }

        if (
            typeof parsed === "string" ||
            typeof parsed === "number" ||
            typeof parsed === "boolean"
        ) {
            return [String(parsed).trim()];
        }
    } catch {
        return [normalized];
    }

    return [normalized];
}

// Compare selected answer with correct answers.
function answerMatches(
    value: string | number,
    correctAnswers: string[]
): boolean {
    const normalizedValue = String(value)
        .trim()
        .toLowerCase();

    return correctAnswers.some(
        (answer) =>
            String(answer).trim().toLowerCase() === normalizedValue
    );
}

// Display correct answer.
function AnswerBox({ answer }: { answer: string }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                height: 0,
            }}
            animate={{
                opacity: 1,
                height: "auto",
            }}
            className="generated-question__answer-box"
        >
            <Sparkles size={16} />

            <span>Correct Answer: {answer}</span>
        </motion.div>
    );
}

const IdentifyUpperLowerCase: React.FC<
    IdentifyUpperLowerCaseProps
> = ({
    question,
    userAnswer,
    value,
    onAnswerChange,
    showAnswers = false,
    showAnswer = false,
    correctAnswers: correctAnswersProp,
}) => {
    const [internalValue, setInternalValue] = useState<string>("");

    // Read backend question data.
    const questionData = useMemo<IdentifyUpperLowerCaseData>(() => {
        const rawData =
            question?.questionDataJson ??
            question?.QuestionDataJson ??
            {};

        if (typeof rawData === "string") {
            try {
                return JSON.parse(rawData) as IdentifyUpperLowerCaseData;
            } catch (error) {
                console.error(
                    "Invalid Identify Upper Lower Case question data:",
                    error
                );

                return {};
            }
        }

        return rawData;
    }, [question]);

    // Support both existing renderer answer props and previous value prop.
    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer = userAnswer ?? value ?? internalValue;

    // Use the global Check Answers state.
    const isAnswerChecked = showAnswers || showAnswer;

    // Reset internal answer when the question changes.
    useEffect(() => {
        if (!isControlled) {
            setInternalValue("");
        }
    }, [question, isControlled]);

    const targetLetter = questionData.targetLetter ?? "";

    const targetCase = questionData.targetCase ?? "";

    const options = Array.isArray(questionData.options)
        ? questionData.options
        : [];

    const questionText =
        question?.questionText ??
        question?.QuestionText ??
        (targetCase.toLowerCase() === "uppercase"
            ? "Choose the uppercase letter for the given lowercase letter."
            : "Choose the lowercase letter for the given uppercase letter.");

    // Resolve correct answer from renderer first, then question object.
    const correctAnswers = useMemo(() => {
        if (
            Array.isArray(correctAnswersProp) &&
            correctAnswersProp.length > 0
        ) {
            return correctAnswersProp.map((answer) =>
                String(answer).trim()
            );
        }

        const backendAnswer =
            question?.correctAnswer ??
            question?.CorrectAnswer ??
            "";

        return parseCorrectAnswers(backendAnswer);
    }, [
        correctAnswersProp,
        question?.correctAnswer,
        question?.CorrectAnswer,
    ]);

    const correctAnswer = correctAnswers[0] ?? "";

    // Check selected answer.
    const isAnswerCorrect =
        selectedAnswer !== "" &&
        correctAnswers.length > 0 &&
        answerMatches(selectedAnswer, correctAnswers);

    const handleOptionSelect = (option: string): void => {
        if (isAnswerChecked) {
            return;
        }

        if (!isControlled) {
            setInternalValue(option);
        }

        onAnswerChange?.(option);
    };

    if (!targetLetter || options.length === 0) {
        return (
            <div className="iulc-error">
                Question data is missing or invalid.
            </div>
        );
    }

    return (
        <div className="iulc-container">

            {/* Question heading */}
            {/* <div className="iulc-heading">
                <span className="iulc-heading-icon">
                    🔤
                </span>

                <h3 className="iulc-title">
                    Uppercase and Lowercase Letters
                </h3>
            </div> */}

            {/* Instruction */}
            <div className="iulc-instruction">
                <p>{questionText}</p>
            </div>

            {/* Target letter */}
            <div className="iulc-target-section">
                {/* <span className="iulc-target-label">
                    {targetCase.toLowerCase() === "uppercase"
                        ? "Find the uppercase letter"
                        : "Find the lowercase letter"}
                </span> */}

                <div className="iulc-target-card">
                    <span className="iulc-target-letter">
                        {targetLetter}
                    </span>
                </div>

                {/* <span className="iulc-target-hint">
                    Choose the correct matching letter below
                </span> */}
            </div>

            {/* Answer options */}
            <div className="iulc-options-section">
                <h4 className="iulc-options-title">
                    Select your answer
                </h4>

                <div
                    className={`iulc-options-grid iulc-options-count-${options.length}`}
                >
                    {options.map((option, index) => {
                        const isSelected =
                            selectedAnswer === option;

                        const isCorrectOption =
                            correctAnswers.length > 0 &&
                            answerMatches(option, correctAnswers);

                        const isIncorrectSelected =
                            isAnswerChecked &&
                            isSelected &&
                            !isCorrectOption;

                        const isCorrectAfterCheck =
                            isAnswerChecked && isCorrectOption;

                        return (
                            <button
                                key={`${option}-${index}`}
                                type="button"
                                className={`iulc-option-card ${
                                    isSelected && !isAnswerChecked
                                        ? "iulc-option-selected"
                                        : ""
                                } ${
                                    isCorrectAfterCheck
                                        ? "iulc-option-correct"
                                        : ""
                                } ${
                                    isIncorrectSelected
                                        ? "iulc-option-incorrect"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleOptionSelect(option)
                                }
                                aria-pressed={isSelected}
                                aria-label={`Choose ${option}`}
                                disabled={isAnswerChecked}
                            >
                                <span className="iulc-option-letter">
                                    {option}
                                </span>

                                {/* Selected indicator before checking */}
                                {isSelected && !isAnswerChecked && (
                                    <span className="iulc-selected-icon">
                                        ✓
                                    </span>
                                )}

                                {/* Correct answer indicator */}
                                {isCorrectAfterCheck && (
                                    <span className="iulc-selected-icon">
                                        ✓
                                    </span>
                                )}

                                {/* Incorrect answer indicator */}
                                {isIncorrectSelected && (
                                    <span className="iulc-selected-icon iulc-incorrect-icon">
                                        ✕
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Answer feedback after navbar Check Answers */}
            {isAnswerChecked && correctAnswers.length > 0 && (
                <div className="iulc-feedback-section">

                    {selectedAnswer ? (
                        <div
                            className={`iulc-feedback-message ${
                                isAnswerCorrect
                                    ? "iulc-feedback-correct"
                                    : "iulc-feedback-incorrect"
                            }`}
                        >
                            {isAnswerCorrect
                                ? "Excellent! Your answer is correct."
                                : "Not quite right. Check the correct answer below."}
                        </div>
                    ) : (
                        <div className="iulc-feedback-message iulc-feedback-incorrect">
                            You have not selected an answer.
                        </div>
                    )}

                    <AnswerBox answer={correctAnswer} />

                </div>
            )}

            {/* Missing correct-answer data */}
            {isAnswerChecked && correctAnswers.length === 0 && (
                <div className="iulc-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default IdentifyUpperLowerCase;