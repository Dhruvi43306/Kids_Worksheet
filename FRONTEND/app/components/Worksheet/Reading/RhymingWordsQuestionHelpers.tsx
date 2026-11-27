
"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface RhymingWordsData {
    questionType?: string;
    targetWord?: string;
    options?: string[];
    firstWord?: string;
    picture?: string;
    pictureWord?: string;
    pictureDescription?: string;
    pictureType?: string;
    selectionMode?: string;
    answerType?: string;
}

export interface RhymingWordsQuestion {
    questionDataJson?: string | RhymingWordsData;
    QuestionDataJson?: string | RhymingWordsData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

export interface RhymingWordsProps {
    question: RhymingWordsQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

export function parseRhymingWordsData(
    raw?: string | RhymingWordsData
): RhymingWordsData {
    if (!raw) return {};

    if (typeof raw === "object") return raw;

    try {
        const parsed: unknown = JSON.parse(raw);

        if (
            parsed === null ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {
            return {};
        }

        return parsed as RhymingWordsData;
    } catch (error) {
        console.error("Invalid rhyming-words question data:", error);
        return {};
    }
}

export function getRhymingWordAnswers(
    propAnswers: string[] | undefined,
    question: RhymingWordsQuestion
): string[] {
    if (propAnswers?.length) {
        return propAnswers.map(answer => String(answer).trim());
    }

    const answer =
        question.correctAnswer ??
        question.CorrectAnswer ??
        "";

    if (!answer.trim()) return [];

    try {
        const parsed: unknown = JSON.parse(answer);

        if (Array.isArray(parsed)) {
            return parsed.map(item => String(item).trim());
        }

        return [String(parsed).trim()];
    } catch {
        return [answer.trim()];
    }
}

export function rhymingWordAnswerMatches(
    selected: string,
    answers: string[]
): boolean {
    return answers.some(
        answer =>
            answer.trim().toLowerCase() ===
            selected.trim().toLowerCase()
    );
}

export function RhymingWordAnswerBox({
    answer
}: {
    answer: string;
}) {
    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />
            <span>Correct Answer: {answer}</span>
        </div>
    );
}
