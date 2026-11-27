
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

import {
    parseVocabularyData,
    getVocabularyAnswers,
    vocabularyAnswerMatches,
    VocabularyAnswerBox,
    VocabularyProps
} from "@/app/components/Worksheet/Reading/VocabularyDevelopmentQuestionHelpers";

const CompleteMissingLettersInWords: React.FC<VocabularyProps> = ({
    question,
    userAnswer,
    value,
    correctAnswers,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange
}) => {
    const [internalAnswer, setInternalAnswer] = useState("");

    const rawData = question.questionDataJson ?? question.QuestionDataJson;
    const data = useMemo(() => parseVocabularyData(rawData), [rawData]);

    const isControlled = userAnswer !== undefined || value !== undefined;
    const selectedAnswer = userAnswer ?? value ?? internalAnswer;
    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getVocabularyAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";

    useEffect(() => {
        if (!isControlled) setInternalAnswer("");
    }, [rawData, question.questionNumber, question.QuestionNumber, isControlled]);

    const selectOption = (option: string) => {
        if (checked) return;
        if (!isControlled) setInternalAnswer(option);
        onAnswerChange?.(option);
    };

    const isCorrect = selectedAnswer !== "" &&
        vocabularyAnswerMatches(selectedAnswer, answers);

    if (!data.pattern || !data.options?.length) {
        return <div className="cmlw-error">Missing-letter question data is missing.</div>;
    }

    return (
        <div className="cmlw-container">
            <div className="cmlw-instruction">
                {question.questionText ?? question.QuestionText ??
                    "Choose the correct word to complete the missing letters."}
            </div>

            {/* <div className="cmlw-picture-card">
                <span className="cmlw-picture">{data.picture ?? "🧩"}</span>
                 <strong>{data.pictureDescription ?? "Complete the word"}</strong>
            </div> */}

            <div className="cmlw-pattern-card">
                {/* <span className="cmlw-pattern-label">Complete the word</span> */}
                <strong className="cmlw-pattern">{data.pattern}</strong>
            </div>

            {/* <h4 className="cmlw-options-title">Choose the complete word</h4> */}

            <div className="cmlw-options">
                {data.options.map((option, index) => {
                    const selected = selectedAnswer === option;
                    const correct = checked &&
                        vocabularyAnswerMatches(option, answers);
                    const incorrect = checked && selected && !correct;

                    return (
                        <button
                            key={`${option}-${index}`}
                            type="button"
                            disabled={checked}
                            onClick={() => selectOption(option)}
                            className={`cmlw-option ${
                                selected && !checked ? "cmlw-selected" : ""
                            } ${correct ? "cmlw-correct" : ""} ${
                                incorrect ? "cmlw-incorrect" : ""
                            }`}
                        >
                            {option}
                            {correct && <span>✓</span>}
                            {incorrect && <span>✕</span>}
                        </button>
                    );
                })}
            </div>

            {checked && answers.length > 0 && (
                <div className="cmlw-feedback">
                    <p className={isCorrect ? "cmlw-good" : "cmlw-bad"}>
                        {selectedAnswer
                            ? isCorrect
                                ? "Well done! You completed the word."
                                : "Not quite! Look at the missing letters again."
                            : "You have not selected an answer."}
                    </p>
                    <VocabularyAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="cmlw-error">Correct answer is missing from the backend.</div>
            )}
        </div>
    );
};

export default CompleteMissingLettersInWords;
