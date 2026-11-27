
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

const CompleteRhymingPairs: React.FC<RhymingWordsProps> = ({
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

    if (!data.firstWord || !data.options?.length) {
        return (
            <div className="crp-error">
                Complete rhyming pairs question data is missing.
            </div>
        );
    }

    return (
        <div className="crp-container">
            <div className="crp-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Choose the word that completes the rhyming pair."}
            </div>

            <div className="crp-pair-card">
                <div className="crp-word">
                    {data.firstWord}
                </div>

                <div className="crp-pair-connector">↔</div>

                <div className={`crp-answer-slot ${
                    selectedAnswer ? "crp-answer-filled" : ""
                }`}>
                    {selectedAnswer || "?"}
                </div>
            </div>

            {/* <p className="crp-hint">
                Find a word that has the same ending sound.
            </p> */}

            <div className="crp-options-grid">
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
                            className={`crp-option ${
                                selected && !checked ? "crp-selected" : ""
                            } ${
                                correct ? "crp-correct" : ""
                            } ${
                                incorrect ? "crp-incorrect" : ""
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
                <div className="crp-feedback">
                    <p className={
                        isCorrect
                            ? "crp-feedback-correct"
                            : "crp-feedback-incorrect"
                    }>
                        {selectedAnswer
                            ? isCorrect
                                ? "Wonderful! You completed the rhyming pair."
                                : "That word does not rhyme. Try listening to the ending sounds."
                            : "You have not selected an answer."}
                    </p>

                    <RhymingWordAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="crp-error">
                    Correct answer is missing from the backend response.
                </div>
            )}
        </div>
    );
};

export default CompleteRhymingPairs;
