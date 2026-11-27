
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

const ReadAndIdentifyWords: React.FC<VocabularyProps> = ({
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

    if (!data.picture || !data.options?.length) {
        return <div className="riw-error">Vocabulary question data is missing.</div>;
    }

    return (
        <div className="riw-container">
            <div className="riw-instruction">
                {question.questionText ?? question.QuestionText ??
                    "Look at the picture and identify the correct word."}
            </div>

            <div className="riw-picture-card">
                <span className="riw-picture">{data.picture}</span>
                {/* <strong>{data.pictureDescription}</strong> */}
            </div>

            {/* <h4 className="riw-options-title">Choose the correct word</h4> */}

            <div className="riw-options">
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
                            className={`riw-option ${
                                selected && !checked ? "riw-selected" : ""
                            } ${correct ? "riw-correct" : ""} ${
                                incorrect ? "riw-incorrect" : ""
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
                <div className="riw-feedback">
                    <p className={isCorrect ? "riw-good" : "riw-bad"}>
                        {selectedAnswer
                            ? isCorrect
                                ? "Wonderful! You identified the word!"
                                : "Not quite! Look carefully at the picture."
                            : "You have not selected an answer."}
                    </p>
                    <VocabularyAnswerBox answer={correctAnswer} />
                </div>
            )}

            {checked && !answers.length && (
                <div className="riw-error">Correct answer is missing from the backend.</div>
            )}
        </div>
    );
};

export default ReadAndIdentifyWords;
