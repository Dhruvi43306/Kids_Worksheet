"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

interface SightWordsQuestion {
    questionDataJson?: unknown;
    QuestionDataJson?: unknown;
    questionNumber?: unknown;
    QuestionNumber?: unknown;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: unknown;
    CorrectAnswer?: unknown;
    [key: string]: unknown;
}

interface SightWordsProps {
    question: SightWordsQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: unknown;
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

const parseSightWordsData = (rawData: unknown): { sentence: string; options: string[] } => {
    let data = rawData;

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            return { sentence: "", options: [] };
        }
    }

    if (!data || typeof data !== "object") {
        return { sentence: "", options: [] };
    }

    const record = data as Record<string, unknown>;
    const sentence = record.sentence ?? record.Sentence;
    const options = record.options ?? record.Options;

    return {
        sentence: typeof sentence === "string" ? sentence : "",
        options: Array.isArray(options)
            ? options.filter((option): option is string => typeof option === "string")
            : []
    };
};

const getSightWordAnswers = (correctAnswers: unknown, question: SightWordsQuestion): string[] => {
    const source = correctAnswers ?? question.correctAnswer ?? question.CorrectAnswer;
    const values = Array.isArray(source) ? source : [source];

    return values
        .map((value) => {
            if (typeof value === "string" || typeof value === "number") return String(value);
            if (value && typeof value === "object") {
                const record = value as Record<string, unknown>;
                const answer = record.answer ?? record.Answer ?? record.correctAnswer ?? record.CorrectAnswer;
                return typeof answer === "string" || typeof answer === "number" ? String(answer) : "";
            }
            return "";
        })
        .filter(Boolean);
};

const sightWordAnswerMatches = (answer: string, answers: string[]): boolean =>
    answers.some((correctAnswer) => answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase());

const SightWordAnswerBox: React.FC<{ answer: string }> = ({ answer }) => (
    <div className="cmsw-answer-box">
        <strong>Correct answer:</strong> {answer}
    </div>
);

const CompleteMissingSightWords: React.FC<SightWordsProps> = ({
    question,
    userAnswer,
    value,
    correctAnswers,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange
}) => {
    const [internalAnswer, setInternalAnswer] = useState("");

    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const data = useMemo(
        () => parseSightWordsData(rawData),
        [rawData]
    );

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getSightWordAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";
    const options = data.options ?? [];

    useEffect(() => {
        if (!isControlled) {
            setInternalAnswer("");
        }
    }, [rawData, question.questionNumber, question.QuestionNumber, isControlled]);

    const selectOption = (option: string) => {
        if (checked) return;

        if (!isControlled) setInternalAnswer(option);

        onAnswerChange?.(option);
    };

    const isCorrect =
        selectedAnswer !== "" &&
        sightWordAnswerMatches(selectedAnswer, answers);

    if (!data.sentence || !options.length) {
        return (
            <div className="cmsw-error">
                Missing sight words question data is missing.
            </div>
        );
    }

    return (
        <div className="cmsw-container">

            <div className="cmsw-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Choose the sight word that completes the sentence."}
            </div>

            <div className="cmsw-sentence-section">
                {/* <span className="cmsw-label">
                    Complete the sentence
                </span> */}

                <div className="cmsw-sentence-card">
                    {data.sentence.split("_____").map((part, index, parts) => (
                        <React.Fragment key={index}>
                            {part}

                            {index < parts.length - 1 && (
                                <span className={`cmsw-blank ${
                                    checked
                                        ? isCorrect
                                            ? "cmsw-blank-correct"
                                            : "cmsw-blank-incorrect"
                                        : ""
                                }`}>
                                    {checked && correctAnswer
                                        ? correctAnswer
                                        : selectedAnswer || "?"}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="cmsw-options-section">
                {/* <h4>Choose the missing word</h4> */}

                <div className="cmsw-options-grid">
                    {options.map((option, index) => {
                        const selected = selectedAnswer === option;

                        const correct = checked &&
                            sightWordAnswerMatches(option, answers);

                        const incorrect = checked &&
                            selected && !correct;

                        return (
                            <button
                                key={`${option}-${index}`}
                                type="button"
                                disabled={checked}
                                onClick={() => selectOption(option)}
                                className={`cmsw-option ${
                                    selected && !checked
                                        ? "cmsw-selected"
                                        : ""
                                } ${
                                    correct ? "cmsw-correct" : ""
                                } ${
                                    incorrect ? "cmsw-incorrect" : ""
                                }`}
                            >
                                {option}

                                {correct && <span>✓</span>}
                                {incorrect && <span>✕</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {checked && answers.length > 0 && (
                <div className="cmsw-feedback">
                    <div className={
                        isCorrect
                            ? "cmsw-feedback-correct"
                            : "cmsw-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Wonderful! You completed the sentence."
                                : "Try again next time. Check the correct word below."
                            : "You have not selected an answer."}
                    </div>

                    <SightWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="cmsw-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default CompleteMissingSightWords;