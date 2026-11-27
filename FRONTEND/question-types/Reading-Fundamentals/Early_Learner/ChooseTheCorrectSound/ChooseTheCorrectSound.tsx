"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Volume2, Sparkles } from "lucide-react";
import "@/styles/worksheet.css";

// ============================================
// AUDIO PLAYER
// ============================================

let currentPhonicsAudio: HTMLAudioElement | null = null;

async function playPhonicsAudio(
    audioUrl?: string | null
): Promise<void> {

    if (typeof window === "undefined") return;

    if (!audioUrl?.trim()) {
        console.error("Phonics audio URL is missing.");
        return;
    }

    try {
        // Stop previously playing sound.
        if (currentPhonicsAudio) {
            currentPhonicsAudio.pause();
            currentPhonicsAudio.currentTime = 0;
            currentPhonicsAudio = null;
        }

        const resolvedUrl = new URL(
            audioUrl.trim(),
            window.location.origin
        ).href;

        const audio = new Audio(resolvedUrl);

        audio.preload = "auto";
        audio.volume = 1;

        currentPhonicsAudio = audio;

        audio.addEventListener("ended", () => {
            if (currentPhonicsAudio === audio) {
                currentPhonicsAudio = null;
            }
        });

        audio.addEventListener("error", () => {
            console.error(
                "Unable to load phonics audio:",
                resolvedUrl,
                audio.error?.message
            );
        });

        await audio.play();

    } catch (error) {
        console.error(
            "Unable to play phonics audio:",
            audioUrl,
            error
        );

        currentPhonicsAudio = null;
    }
}

// ============================================
// NORMALIZE AUDIO URL
// ============================================

function normalizeAudioUrl(audioUrl: string): string {

    let url = audioUrl.trim();

    // Remove accidental public/ prefix.
    url = url.replace(/^\/?public\//i, "/");

    // Add leading slash for relative paths.
    if (
        !url.startsWith("/") &&
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        url = `/${url}`;
    }

    return url;
}

// ============================================
// NORMALIZE SOUND KEY
// ============================================

function normalizeSoundKey(sound: string): string {

    return sound
        .trim()
        .replace(/^\/+|\/+$/g, "")
        .toLowerCase();
}

// ============================================
// GET SOUND AUDIO URL
// ============================================

function getPhonicsSoundAudioUrl(
    sound: string | undefined,
    soundAudioUrls?: Record<string, string>
): string | undefined {

    if (!sound?.trim()) {
        return undefined;
    }

    const soundKey = normalizeSoundKey(sound);

    // First check the URL provided by the backend.
    // Supports keys such as /k/, k, /K/.
    const matchingEntry = Object.entries(
        soundAudioUrls ?? {}
    ).find(
        ([key]) => normalizeSoundKey(key) === soundKey
    );

    const backendAudioUrl = matchingEntry?.[1]?.trim();

    if (backendAudioUrl) {
        return normalizeAudioUrl(backendAudioUrl);
    }

    // Fallback: generate URL from sound.
    // Example: /sh/ -> sh.mp3
    return `/audio/phonics/sounds/${encodeURIComponent(soundKey)}.mp3`;
}

// ============================================
// QUESTION DATA INTERFACE
// ============================================

interface ChooseSoundData {
    questionType?: string;
    targetLetter?: string;
    options?: string[];
    soundAudioUrls?: Record<string, string>;
    selectionMode?: string;
    answerType?: string;
}

interface Question {
    questionDataJson?: string | ChooseSoundData;
    QuestionDataJson?: string | ChooseSoundData;
    questionText?: string;
    QuestionText?: string;
    correctAnswer?: string | null;
    CorrectAnswer?: string | null;
    questionNumber?: number;
    QuestionNumber?: number;
}

interface Props {
    question: Question;
    userAnswer?: string;
    value?: string;
    correctAnswers?: string[];
    showAnswers?: boolean;
    showAnswer?: boolean;
    onAnswerChange?: (answer: string) => void;
}

// ============================================
// PARSE QUESTION DATA
// ============================================

function parseData(
    raw?: string | ChooseSoundData
): ChooseSoundData {

    if (!raw) return {};

    if (typeof raw === "object") return raw;

    try {
        return JSON.parse(raw) as ChooseSoundData;
    } catch (error) {
        console.error(
            "Invalid choose-the-correct-sound data:",
            error
        );

        return {};
    }
}

// ============================================
// GET CORRECT ANSWERS
// ============================================

function getAnswers(
    propAnswers: string[] | undefined,
    question: Question
): string[] {

    if (propAnswers?.length) {
        return propAnswers.map(x => String(x).trim());
    }

    const answer =
        question.correctAnswer ??
        question.CorrectAnswer ??
        "";

    if (!answer) return [];

    try {
        const parsed: unknown = JSON.parse(answer);

        return Array.isArray(parsed)
            ? parsed.map(x => String(x).trim())
            : [String(parsed).trim()];

    } catch {
        return [answer.trim()];
    }
}

// ============================================
// ANSWER BOX
// ============================================

function AnswerBox({ answer }: { answer: string }) {

    return (
        <div className="generated-question__answer-box">
            <Sparkles size={16} />

            <span>
                Correct Answer: {answer}
            </span>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

const ChooseTheCorrectSound: React.FC<Props> = ({
    question,
    userAnswer,
    value,
    correctAnswers,
    showAnswers = false,
    showAnswer = false,
    onAnswerChange,
}) => {

    const [internalAnswer, setInternalAnswer] = useState("");

    // Read backend JSON.
    const rawData =
        question.questionDataJson ??
        question.QuestionDataJson;

    const data = useMemo(
        () => parseData(rawData),
        [rawData]
    );

    const isControlled =
        userAnswer !== undefined ||
        value !== undefined;

    const selectedAnswer =
        userAnswer ?? value ?? internalAnswer;

    const checked = showAnswers || showAnswer;

    // Correct answers from the renderer or backend.
    const answers = useMemo(
        () => getAnswers(correctAnswers, question),
        [
            correctAnswers,
            question.correctAnswer,
            question.CorrectAnswer,
        ]
    );

    const correctAnswer = answers[0] ?? "";

    const options = data.options ?? [];

    // ============================================
    // RESET WHEN QUESTION CHANGES
    // ============================================

    useEffect(() => {

        if (!isControlled) {
            setInternalAnswer("");
        }

    }, [
        rawData,
        question.questionText,
        question.QuestionText,
        question.questionNumber,
        question.QuestionNumber,
        isControlled,
    ]);

    // ============================================
    // SELECT ANSWER
    // ============================================

    const selectOption = (option: string) => {

        if (checked) return;

        if (!isControlled) {
            setInternalAnswer(option);
        }

        onAnswerChange?.(option);
    };

    // ============================================
    // ANSWER VALIDATION
    // ============================================

    const matches = (option: string) =>
        answers.some(
            answer =>
                answer.trim().toLowerCase() ===
                option.trim().toLowerCase()
        );

    const isCorrect =
        selectedAnswer !== "" &&
        matches(selectedAnswer);

    // ============================================
    // INVALID QUESTION DATA
    // ============================================

    if (!data.targetLetter || !options.length) {
        return (
            <div className="ccs-error">
                Choose-the-correct-sound question data is missing.
            </div>
        );
    }

    // ============================================
    // FRONTEND UI
    // ============================================

    return (
        <div className="ccs-container">

            {/* Instruction */}
            <div className="ccs-instruction">
                {question.questionText ??
                    question.QuestionText ??
                    "Listen to the sounds and choose the correct sound for this letter."}
            </div>

            {/* Target letter */}
            <div className="ccs-target-section">

                {/* <span className="ccs-label">
                    Find the sound for
                </span> */}

                <div className="ccs-target-card">
                    <span>{data.targetLetter}</span>
                </div>

            </div>

            {/* Answer options */}
            <div className="ccs-options-section">

                {/* <h4>
                    Listen and choose the correct sound
                </h4> */}

                <div className="ccs-options-grid">

                    {options.map((option, index) => {

                        const selected =
                            selectedAnswer === option;

                        const correct =
                            checked && matches(option);

                        const incorrect =
                            checked &&
                            selected &&
                            !matches(option);

                        // Generate audio URL for this sound.
                        const soundAudioUrl =
                            getPhonicsSoundAudioUrl(
                                option,
                                data.soundAudioUrls
                            );

                        return (
                            <div
                                className="ccs-option-row"
                                key={`${option}-${index}`}
                            >

                                {/* Select sound */}
                                <button
                                    type="button"
                                    disabled={checked}
                                    onClick={() => selectOption(option)}
                                    className={`ccs-option ${
                                        selected && !checked
                                            ? "ccs-selected"
                                            : ""
                                    } ${
                                        correct
                                            ? "ccs-correct"
                                            : ""
                                    } ${
                                        incorrect
                                            ? "ccs-incorrect"
                                            : ""
                                    }`}
                                >
                                    <span>{option}</span>

                                    {correct && <span>✓</span>}

                                    {incorrect && <span>✕</span>}
                                </button>

                                {/* Play sound */}
                                <button
                                    type="button"
                                    className="ccs-audio-button"
                                    onClick={() =>
                                        void playPhonicsAudio(
                                            soundAudioUrl
                                        )
                                    }
                                    title={`Listen to ${option}`}
                                    aria-label={`Play ${option}`}
                                >
                                    <Volume2 size={20} />
                                </button>

                            </div>
                        );
                    })}

                </div>
            </div>

            {/* Answer feedback */}
            {checked && answers.length > 0 && (
                <div className="ccs-feedback">

                    <div
                        className={
                            isCorrect
                                ? "ccs-feedback-correct"
                                : "ccs-feedback-incorrect"
                        }
                    >
                        {selectedAnswer
                            ? isCorrect
                                ? "Well done! You chose the correct sound."
                                : "That is not the correct sound. Listen again and try to remember it."
                            : "You have not selected an answer."}
                    </div>

                    <AnswerBox answer={correctAnswer} />

                </div>
            )}

            {/* Missing correct answer */}
            {checked && !answers.length && (
                <div className="ccs-error">
                    Correct answer is missing from the backend response.
                </div>
            )}

        </div>
    );
};

export default ChooseTheCorrectSound;