"use client";

let currentAudio: HTMLAudioElement | null = null;

// Convert an audio path into a valid Next.js public URL.
function normalizeAudioUrl(path: string): string {
    let audioPath = path.trim();

    // Remove public/ if it was accidentally included.
    audioPath = audioPath.replace(/^\/?public\//i, "/");

    // Ensure the path starts with /.
    if (!audioPath.startsWith("/") &&
        !audioPath.startsWith("http://") &&
        !audioPath.startsWith("https://")) {
        audioPath = `/${audioPath}`;
    }

    return audioPath;
}

// Convert a word into its audio URL.
export function getPhonicsWordAudioUrl(
    word?: string,
    backendUrl?: string
): string {
    if (backendUrl?.trim()) {
        return normalizeAudioUrl(backendUrl);
    }

    if (!word?.trim()) {
        return "";
    }

    const wordKey = word.trim().toLowerCase().replace(/\s+/g, "-");

    return `/audio/phonics/words/${encodeURIComponent(wordKey)}.mp3`;
}

// Normalize sound labels.
// Examples: /k/ -> k, /sh/ -> sh.
function normalizeSoundKey(sound: string): string {
    return sound
        .trim()
        .replace(/^\/+|\/+$/g, "")
        .toLowerCase();
}

// Convert a phonics sound into its audio URL.
export function getPhonicsSoundAudioUrl(
    sound?: string,
    audioUrls?: Record<string, string>
): string {
    if (!sound?.trim()) {
        return "";
    }

    const soundKey = normalizeSoundKey(sound);

    // First try to find the URL sent by the backend.
    const matchingEntry = Object.entries(audioUrls ?? {}).find(
        ([key]) =>
            normalizeSoundKey(key) === soundKey
    );

    if (matchingEntry?.[1]) {
        return normalizeAudioUrl(matchingEntry[1]);
    }

    // Fallback: construct the path from the sound label.
    return `/audio/phonics/sounds/${encodeURIComponent(soundKey)}.mp3`;
}

// Play audio.
export async function playPhonicsAudio(
    audioUrl?: string | null
): Promise<void> {

    if (typeof window === "undefined") {
        return;
    }

    if (!audioUrl?.trim()) {
        console.error("Phonics audio URL is missing.");
        return;
    }

    try {
        // Stop previously playing audio.
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }

        // Resolve the URL against the frontend origin.
        const normalizedUrl = normalizeAudioUrl(audioUrl);

        const resolvedUrl = new URL(
            normalizedUrl,
            window.location.origin
        ).href;

        const audio = new Audio();

        audio.preload = "auto";
        audio.volume = 1;
        audio.src = resolvedUrl;

        currentAudio = audio;

        audio.addEventListener("ended", () => {
            if (currentAudio === audio) {
                currentAudio = null;
            }
        });

        audio.addEventListener("error", () => {
            console.error(
                "Phonics audio loading failed:",
                resolvedUrl,
                audio.error?.message
            );
        });

        // Play directly from the user's click interaction.
        await audio.play();

    } catch (error) {
        console.error(
            "Unable to play phonics audio:",
            audioUrl,
            error
        );

        currentAudio = null;
    }
}