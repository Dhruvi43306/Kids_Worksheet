"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface SightWordsData {
    questionType?: string;
    targetWord?: string;
    sentence?: string;
    options?: string[];
    picture?: string;
    pictureDescription?: string;
    pictureType?: string;
    clue?: string;
    missingWord?: boolean;
    selectionMode?: string;
    answerType?: string;
}

export interface SightWordsQuestion {
    questionDataJson?: string | SightWordsData;
    QuestionDataJson?: string | SightWordsData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

export interface SightWordsProps {
    question: SightWordsQuestion;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

export function parseSightWordsData(
    raw?: string | SightWordsData
): SightWordsData {
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

        return parsed as SightWordsData;
    } catch (error) {
        console.error("Invalid sight-words question data:", error);
        return {};
    }
}

export function getSightWordAnswers(
    propAnswers: string[] | undefined,
    question: SightWordsQuestion
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

export function sightWordAnswerMatches(
    selected: string,
    answers: string[]
): boolean {
    return answers.some(
        answer =>
            answer.trim().toLowerCase() ===
            selected.trim().toLowerCase()
    );
}

export function SightWordAnswerBox({
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