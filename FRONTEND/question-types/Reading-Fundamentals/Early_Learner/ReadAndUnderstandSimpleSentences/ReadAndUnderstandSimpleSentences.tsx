
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

const ReadAndUnderstandSimpleSentences: React.FC<SimpleSentencesProps> = ({
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
        <div className="ras-simple-container">
            <div className="ras-simple-sentence">
                <span className="ras-simple-picture">{data.picture ?? "📖"}</span>
                <p>{data.sentence}</p>
            </div>

            <h3 className="ras-simple-question">
                {data.comprehensionQuestion ?? question.questionText ?? question.QuestionText}
            </h3>

            <div className="ras-simple-options">
                {(data.options ?? []).map((option, index) => (
                    <button
                        type="button"
                        key={`${option}-${index}`}
                        disabled={checked}
                        className={`ras-simple-option ${
                            selected === option ? "ras-simple-selected" : ""
                        }`}
                        onClick={() => choose(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {checked && (
                <div className={correct ? "ras-simple-correct" : "ras-simple-wrong"}>
                    {correct ? "Excellent! Correct answer." : "Try again next time."}
                    <SimpleSentenceAnswerBox answer={answers[0] ?? ""} />
                </div>
            )}
        </div>
    );
};

export default ReadAndUnderstandSimpleSentences;
