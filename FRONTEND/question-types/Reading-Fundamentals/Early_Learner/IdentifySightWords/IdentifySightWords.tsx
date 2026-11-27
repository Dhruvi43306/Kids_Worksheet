"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

type SightWordsQuestion = {
    questionDataJson?: unknown;
    QuestionDataJson?: unknown;
    questionNumber?: unknown;
    QuestionNumber?: unknown;
    correctAnswer?: unknown;
    CorrectAnswer?: unknown;
    questionText?: string;
    QuestionText?: string;
};

type SightWordsProps = {
    question: SightWordsQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: unknown;
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
};

const parseSightWordsData = (rawData: unknown): { sentence: string; options: string[] } => {
    let parsed = rawData;
    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return { sentence: "", options: [] };
        }
    }

    if (!parsed || typeof parsed !== "object") return { sentence: "", options: [] };

    const data = parsed as Record<string, unknown>;
    const sentence = data.sentence ?? data.Sentence;
    const rawOptions = data.options ?? data.Options;
    const options = Array.isArray(rawOptions)
        ? rawOptions.map((option) => {
            if (typeof option === "string") return option;
            if (option && typeof option === "object") {
                const item = option as Record<string, unknown>;
                return String(item.text ?? item.Text ?? item.value ?? item.Value ?? "");
            }
            return String(option ?? "");
        }).filter(Boolean)
        : [];

    return { sentence: typeof sentence === "string" ? sentence : "", options };
};

const getSightWordAnswers = (correctAnswers: unknown, question: SightWordsQuestion): string[] => {
    const source = correctAnswers ?? question.correctAnswer ?? question.CorrectAnswer;
    return (Array.isArray(source) ? source : [source])
        .map((value) => {
            if (typeof value === "string" || typeof value === "number") return String(value);
            if (value && typeof value === "object") {
                const item = value as Record<string, unknown>;
                const answer = item.answer ?? item.Answer ?? item.value ?? item.Value;
                return typeof answer === "string" || typeof answer === "number" ? String(answer) : "";
            }
            return "";
        })
        .map((answer) => answer.trim())
        .filter(Boolean);
};

const sightWordAnswerMatches = (answer: string, answers: string[]): boolean =>
    answers.some((correct) => correct.trim().toLocaleLowerCase() === answer.trim().toLocaleLowerCase());

const SightWordAnswerBox: React.FC<{ answer: string }> = ({ answer }) => (
    <div className="isw-answer-box">Correct answer: {answer}</div>
);

const IdentifySightWords: React.FC<SightWordsProps> = ({
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
            <div className="isw-error">
                Identify sight words question data is missing.
            </div>
        );
    }

    return (
        <div className="isw-container">

            <div className="isw-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Read the sentence and identify the sight word."}
            </div>

            <div className="isw-sentence-card">
                {/* <span className="isw-sentence-label">
                    Read this sentence
                </span> */}

                <p>{data.sentence}</p>
            </div>

            <div className="isw-options-section">
                {/* <h4>Which word is the sight word?</h4> */}

                <div className="isw-options-grid">
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
                                className={`isw-option ${
                                    selected && !checked ? "isw-selected" : ""
                                } ${
                                    correct ? "isw-correct" : ""
                                } ${
                                    incorrect ? "isw-incorrect" : ""
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
                <div className="isw-feedback">
                    <div className={
                        isCorrect
                            ? "isw-feedback-correct"
                            : "isw-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Excellent! You identified the sight word."
                                : "Not quite right. Read the sentence again."
                            : "You have not selected an answer."}
                    </div>

                    <SightWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="isw-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default IdentifySightWords;