
"use client";

import React, { useMemo, useState, useEffect } from "react";
import "@/styles/worksheet.css";

import {
    parseSimpleSentencesData,
    getSimpleSentenceAnswers,
    simpleSentenceAnswerMatches,
    SimpleSentenceAnswerBox,
    SimpleSentencesProps
} from "@/app/components/Worksheet/Reading/SimpleSentencesQuestionHelpers";

const CompleteMissingWords: React.FC<SimpleSentencesProps> = ({
    question, userAnswer, value, correctAnswers,
    showAnswers = false, showAnswer = false, onAnswerChange
}) => {
    const raw = question.questionDataJson ?? question.QuestionDataJson;
    const data = useMemo(() => parseSimpleSentencesData(raw), [raw]);
    const [selected, setSelected] = useState(userAnswer ?? value ?? "");
    const checked = showAnswers || showAnswer;

    const answers = useMemo(
        () => getSimpleSentenceAnswers(correctAnswers, question),
        [correctAnswers, question.correctAnswer, question.CorrectAnswer]
    );

    useEffect(() => {
        setSelected(userAnswer ?? value ?? "");
    }, [raw, question.questionNumber, question.QuestionNumber]);

    const choose = (option: string) => {
        if (checked) return;
        setSelected(option);
        onAnswerChange?.(option);
    };

    const correct = simpleSentenceAnswerMatches(selected, answers);

    return (
        <div className="cmw-container">
            <div className="cmw-picture">
                <span>{data.picture ?? "🧩"}</span>
                {/* <p>{data.pictureDescription}</p> */}
            </div>

            {/* <h3 className="cmw-instruction">
                {question.questionText ?? question.QuestionText ??
                    "Choose the missing word to complete the sentence."}
            </h3> */}

            <div className="cmw-sentence">
                {data.sentencePattern ?? "Sentence is missing from the question data."}
            </div>

            <div className="cmw-options">
                {(data.options ?? []).map((option, index) => (
                    <button
                        type="button"
                        key={`${option}-${index}`}
                        disabled={checked}
                        onClick={() => choose(option)}
                        className={`cmw-option ${
                            selected === option ? "cmw-selected" : ""
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {checked && (
                <div className={correct ? "cmw-correct" : "cmw-wrong"}>
                    {correct ? "Great job! You completed the sentence." : "Try to remember the sentence."}
                    <SimpleSentenceAnswerBox answer={answers[0] ?? ""} />
                </div>
            )}
        </div>
    );
};

export default CompleteMissingWords;
