
"use client";

import React, { useEffect, useMemo, useState } from "react";
import "@/styles/worksheet.css";

import {
    parseRhymingWordsData,
    getRhymingWordAnswers,
    rhymingWordAnswerMatches,
    RhymingWordAnswerBox,
    RhymingWordsProps
} from "@/app/components/Worksheet/Reading/RhymingWordsQuestionHelpers";

const FindMatchingRhymingWords: React.FC<RhymingWordsProps> = ({
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
        () => parseRhymingWordsData(rawData),
        [rawData]
    );

    const isControlled =
        userAnswer !== undefined || value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getRhymingWordAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    const correctAnswer = answers[0] ?? "";

    useEffect(() => {
        if (!isControlled) setInternalAnswer("");
    }, [
        rawData,
        question.questionNumber,
        question.QuestionNumber,
        isControlled
    ]);

    const selectOption = (option: string) => {
        if (checked) return;

        if (!isControlled) setInternalAnswer(option);

        onAnswerChange?.(option);
    };

    const isCorrect =
        selectedAnswer !== "" &&
        rhymingWordAnswerMatches(selectedAnswer, answers);

    if (!data.targetWord || !data.options?.length) {
        return (
            <div className="fmrw-error">
                Matching rhyming words question data is missing.
            </div>
        );
    }

    return (
        <div className="fmrw-container">
            <div className="fmrw-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    `Find the word that rhymes with ${data.targetWord}.`}
            </div>

            <div className="fmrw-target-section">
                {/* <span className="fmrw-target-label">
                    Find a word that sounds like
                </span> */}

                <div className="fmrw-target-word">
                    <span>🔊</span>
                    <strong>{data.targetWord}</strong>
                </div>
            </div>

            <div className="fmrw-options-section">
                {/* <h4>Choose the rhyming word</h4> */}

                <div className="fmrw-options-grid">
                    {data.options.map((option, index) => {
                        const selected = selectedAnswer === option;
                        const correct = checked &&
                            rhymingWordAnswerMatches(option, answers);
                        const incorrect = checked && selected && !correct;

                        return (
                            <button
                                key={`${option}-${index}`}
                                type="button"
                                disabled={checked}
                                onClick={() => selectOption(option)}
                                className={`fmrw-option ${
                                    selected && !checked ? "fmrw-selected" : ""
                                } ${
                                    correct ? "fmrw-correct" : ""
                                } ${
                                    incorrect ? "fmrw-incorrect" : ""
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
                <div className="fmrw-feedback">
                    <p className={
                        isCorrect
                            ? "fmrw-feedback-correct"
                            : "fmrw-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Excellent! That word rhymes!"
                                : "Not quite! Try listening to the word sounds."
                            : "You have not selected an answer."}
                    </p>

                    <RhymingWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="fmrw-error">
                    Correct answer is missing from the backend response.
                </div>
            )}
        </div>
    );
};

export default FindMatchingRhymingWords;
