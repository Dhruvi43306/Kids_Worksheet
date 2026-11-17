
"use client";

import type { ReactNode } from "react";

import {
  ArrowDown,
  ArrowUp,
  Check,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";

import "@/styles/worksheet.css";

type CipherSymbol = {
  value: number;
  symbolName: string;
  symbol: string;
};

type VaultEquation = {
  id: string;
  equation: string;
};

type VaultCard = {
  id: string;
  equation: string;
};

type NumberTile = {
  id: string;
  number: number;
};

type EscapeVaultData = {
  questionType?: string;
  puzzleTitle?: string;
  instructions?: string;
  symbolKey?: CipherSymbol[];
  equations?: VaultEquation[];
  targetRule?: {
    parity?: string;
    greaterThan?: number;
    description?: string;
  };
  cards?: VaultCard[];
  maximumCorrectSelections?: number;
  targetDifference?: number;
  numberTiles?: NumberTile[];
};

function splitIds(value: string): string[] {
  return value.split(",").map((id) => id.trim()).filter(Boolean);
}

function sameIds(
  expected: string[],
  actual: string[],
  ordered = false,
): boolean {
  if (!expected.length || expected.length !== actual.length) {
    return false;
  }

  if (ordered) {
    return expected.every((id, index) => id === actual[index]);
  }

  const left = [...expected].sort();
  const right = [...actual].sort();

  return left.every((id, index) => id === right[index]);
}

const titles: Record<string, string> = {
  VAULT_CIPHER_CODE: "Secret Cipher Lock",
  VAULT_SECURITY_FILTER: "Security Scanner",
  VAULT_LOCK_RANKING: "Combination Lock Ranking",
  VAULT_NUMBER_TILE_KEY: "Build the Missing Key",
};

const missions: Record<string, string> = {
  VAULT_CIPHER_CODE: "Decode the symbols to open the secret vault.",
  VAULT_SECURITY_FILTER: "Find the equation cards that pass security.",
  VAULT_LOCK_RANKING: "Arrange the locks in the correct unlocking order.",
  VAULT_NUMBER_TILE_KEY: "Choose the number keys to unlock the treasure.",
};

export default function SubtractionEscapeVaultQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const vault = data as EscapeVaultData;

  const code = (
    question.questionTypeCode?.trim() ||
    vault.questionType?.trim() ||
    ""
  ).toUpperCase();

  const currentAnswer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const expectedAnswer = String(correctAnswers?.[0] ?? "");
  const hasAnswer = currentAnswer.trim().length > 0;

  const symbolKey = vault.symbolKey ?? [];
  const equations = vault.equations ?? [];
  const cards = vault.cards ?? [];
  const tiles = vault.numberTiles ?? [];

  const expectedIds = splitIds(expectedAnswer);
  const currentIds = splitIds(currentAnswer);

  const isCipher = code === "VAULT_CIPHER_CODE";
  const isSecurity = code === "VAULT_SECURITY_FILTER";
  const isRanking = code === "VAULT_LOCK_RANKING";
  const isTileKey = code === "VAULT_NUMBER_TILE_KEY";

  const title = vault.puzzleTitle ?? titles[code] ?? "Treasure Vault";
  const mission = missions[code] ?? "Solve the puzzle to unlock the treasure.";

  const isCorrect = hasAnswer && (
    isCipher
      ? currentAnswer === expectedAnswer
      : isSecurity
        ? sameIds(expectedIds, currentIds)
        : sameIds(expectedIds, currentIds, true)
  );

  // ------------------------------------------------------
  // CIPHER ANSWERS: STAR-KEY-ROCKET
  // ------------------------------------------------------

  const cipherSelections =
    currentAnswer === "" ? [] : currentAnswer.split("-");

  const expectedSymbols =
    expectedAnswer === "" ? [] : expectedAnswer.split("-");

  const updateCipher = (position: number, name: string) => {
    if (showAnswers) return;

    const next = Array.from(
      { length: equations.length },
      (_, index) => cipherSelections[index] ?? "",
    );

    next[position] = name;
    onAnswerChange(next.join("-"));
  };

  // ------------------------------------------------------
  // SECURITY ANSWERS: CARD_A,CARD_C
  // ------------------------------------------------------

  const maxSecuritySelections =
    vault.maximumCorrectSelections ?? 2;

  const toggleSecurityCard = (id: string) => {
    if (showAnswers) return;

    let next: string[];

    if (currentIds.includes(id)) {
      next = currentIds.filter((item) => item !== id);
    } else {
      if (currentIds.length >= maxSecuritySelections) return;
      next = [...currentIds, id];
    }

    onAnswerChange(next.sort().join(","));
  };

  // ------------------------------------------------------
  // RANKING ANSWERS: LOCK_B,LOCK_D,LOCK_A,LOCK_C
  // ------------------------------------------------------

  const cardIds = cards.map((card) => card.id);

  const rankingOrder = currentAnswer
    ? [
        ...currentIds.filter((id) => cardIds.includes(id)),
        ...cardIds.filter((id) => !currentIds.includes(id)),
      ]
    : cardIds;

  const displayedRankingOrder =
    showAnswers && expectedIds.length === cardIds.length
      ? expectedIds
      : rankingOrder;

  const cardMap = new Map(cards.map((card) => [card.id, card]));

  const moveRankingCard = (index: number, direction: -1 | 1) => {
    if (showAnswers) return;

    const next = [...rankingOrder];
    const destination = index + direction;

    if (destination < 0 || destination >= next.length) return;

    [next[index], next[destination]] = [
      next[destination],
      next[index],
    ];

    onAnswerChange(next.join(","));
  };

  // ------------------------------------------------------
  // NUMBER TILE ANSWERS: TILE_A,TILE_B
  // ------------------------------------------------------

  const toggleTile = (id: string) => {
    if (showAnswers) return;

    let next: string[];

    if (currentIds.includes(id)) {
      next = currentIds.filter((item) => item !== id);
    } else if (currentIds.length < 2) {
      next = [...currentIds, id];
    } else {
      next = [currentIds[0], id];
    }

    onAnswerChange(next.join(","));
  };

  const tileMap = new Map(tiles.map((tile) => [tile.id, tile]));

  const displayedTileIds =
    showAnswers && expectedIds.length === 2
      ? expectedIds
      : currentIds;

  const firstTile = tileMap.get(displayedTileIds[0] ?? "");
  const secondTile = tileMap.get(displayedTileIds[1] ?? "");

  // ------------------------------------------------------
  // REUSABLE WOODEN TREASURE CHEST DECORATION
  // ------------------------------------------------------

  const chestArtwork = (variant: number): ReactNode => (
    <div
      className={`escape-vault-kids__chest escape-vault-kids__chest--${variant}`}
      aria-hidden="true"
    >
      <div className="escape-vault-kids__chest-lid" />
      <div className="escape-vault-kids__chest-body">
        <LockKeyhole size={25} />
      </div>
      <div className="escape-vault-kids__chest-clasp" />
    </div>
  );

  // ------------------------------------------------------
  // ILLUSTRATED SCENE
  // ------------------------------------------------------

  const renderScene = (): ReactNode => {
    if (isCipher) {
      return (
        <div className="escape-vault-kids__scene escape-vault-kids__scene--cipher">
          <span className="escape-vault-kids__floating treasure-star treasure-star--one">✦</span>
          <span className="escape-vault-kids__floating treasure-star treasure-star--two">✧</span>

          {chestArtwork(1)}

          <span className="escape-vault-kids__scene-emoji">⭐</span>
          <span className="escape-vault-kids__scene-emoji escape-vault-kids__scene-emoji--key">🗝️</span>
          <span className="escape-vault-kids__scene-caption">SECRET CODE</span>
        </div>
      );
    }

    if (isSecurity) {
      return (
        <div className="escape-vault-kids__scene escape-vault-kids__scene--scanner">
          <div className="escape-vault-kids__scanner-orbit">
            <ScanLine size={39} />
          </div>
          <span className="escape-vault-kids__floating treasure-star treasure-star--one">✦</span>
          <span className="escape-vault-kids__floating treasure-star treasure-star--two">✧</span>
          <span className="escape-vault-kids__scene-caption">SECURITY CHECK</span>
        </div>
      );
    }

    if (isRanking) {
      return (
        <div className="escape-vault-kids__scene escape-vault-kids__scene--ranking">
          {["A", "B", "C"].map((letter) => (
            <div className="escape-vault-kids__tiny-lock" key={letter}>
              <LockKeyhole size={20} />
              <span>{letter}</span>
            </div>
          ))}
          <span className="escape-vault-kids__scene-caption">UNLOCK IN ORDER</span>
        </div>
      );
    }

    return (
      <div className="escape-vault-kids__scene escape-vault-kids__scene--key">
        <div className="escape-vault-kids__big-key">
          <KeyRound size={47} />
        </div>
        <span className="escape-vault-kids__key-number escape-vault-kids__key-number--one">4</span>
        <span className="escape-vault-kids__key-number escape-vault-kids__key-number--two">7</span>
        <span className="escape-vault-kids__key-number escape-vault-kids__key-number--three">9</span>
        <span className="escape-vault-kids__scene-caption">MAGIC NUMBER KEYS</span>
      </div>
    );
  };

  // ------------------------------------------------------
  // CIPHER UI
  // ------------------------------------------------------

  const renderCipher = () => (
    <div className="escape-vault-kids__activity">

      <div className="escape-vault-kids__activity-heading">
        <span className="escape-vault-kids__step-badge">1</span>
        <div>
          <h5>Crack the secret code!</h5>
          <p>Solve each sum and choose its matching symbol.</p>
        </div>
      </div>

      <div className="escape-vault-kids__symbol-key">
        {symbolKey.map((symbol, index) => (
          <div
            key={symbol.symbolName}
            className={`escape-vault-kids__symbol-key-card escape-vault-kids__symbol-key-card--${index % 4}`}
          >
            <strong>{symbol.value}</strong>
            <span>→</span>
            <b>{symbol.symbol}</b>
            <small>{symbol.symbolName}</small>
          </div>
        ))}
      </div>

      <div className="escape-vault-kids__cipher-grid">
        {equations.map((equation, index) => {
          const selectedName = showAnswers
            ? expectedSymbols[index] ?? ""
            : cipherSelections[index] ?? "";

          return (
            <div className="escape-vault-kids__chest-puzzle" key={equation.id}>
              <div className="escape-vault-kids__chest-top">
                <span>LOCK {index + 1}</span>
                <LockKeyhole size={17} />
              </div>

              <strong className="escape-vault-kids__chest-equation">
                {equation.equation}
              </strong>

              <div className="escape-vault-kids__chest-symbols">
                {symbolKey.map((symbol) => {
                  const selected = selectedName === symbol.symbolName;
                  const correct =
                    (expectedSymbols[index] ?? "") === symbol.symbolName;

                  return (
                    <button
                      key={symbol.symbolName}
                      type="button"
                      disabled={showAnswers}
                      aria-pressed={selected}
                      aria-label={`Choose ${symbol.symbolName}`}
                      className={[
                        "escape-vault-kids__symbol-choice",
                        selected ? "escape-vault-kids__symbol-choice--selected" : "",
                        showAnswers && correct ? "escape-vault-kids__symbol-choice--correct" : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => updateCipher(index, symbol.symbolName)}
                    >
                      {symbol.symbol}
                    </button>
                  );
                })}
              </div>

              {showAnswers && (
                <span className="escape-vault-kids__revealed-symbol">
                  {symbolKey.find((symbol) => symbol.symbolName === expectedSymbols[index])?.symbol ?? "—"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="escape-vault-kids__secret-strip">
        <div>
          <KeyRound size={19} />
          <span>YOUR SECRET CODE</span>
        </div>

        <div className="escape-vault-kids__secret-slots">
          {equations.map((equation, index) => {
            const symbolName = showAnswers
              ? expectedSymbols[index] ?? ""
              : cipherSelections[index] ?? "";

            const symbol = symbolKey.find(
              (item) => item.symbolName === symbolName,
            );

            return (
              <span key={equation.id}>
                {symbol?.symbol ?? "?"}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ------------------------------------------------------
  // SECURITY UI
  // ------------------------------------------------------

  const renderSecurity = () => (
    <div className="escape-vault-kids__activity">

      <div className="escape-vault-kids__scanner-rule">
        <div className="escape-vault-kids__scanner-rule-icon">
          <ShieldCheck size={31} />
        </div>

        <div>
          <small>THE VAULT'S SECRET RULE</small>
          <strong>
            {vault.targetRule?.description ??
              `Choose ${vault.targetRule?.parity ?? "odd"} answers greater than ${vault.targetRule?.greaterThan ?? 0}.`}
          </strong>
        </div>
      </div>

      <div className="escape-vault-kids__activity-heading">
        <span className="escape-vault-kids__step-badge">2</span>
        <div>
          <h5>Which chests pass?</h5>
          <p>Open your eyes and select the matching equation cards.</p>
        </div>

        <span className="escape-vault-kids__selection-count">
          {currentIds.filter((id) => cards.some((card) => card.id === id)).length}
          {" / "}
          {maxSecuritySelections}
        </span>
      </div>

      <div className="escape-vault-kids__security-grid">
        {cards.map((card, index) => {
          const selected = currentIds.includes(card.id);
          const expected = expectedIds.includes(card.id);

          return (
            <button
              key={card.id}
              type="button"
              disabled={showAnswers}
              aria-pressed={selected}
              className={[
                "escape-vault-kids__security-chest",
                `escape-vault-kids__security-chest--${index % 4}`,
                selected ? "escape-vault-kids__security-chest--selected" : "",
                showAnswers && expected ? "escape-vault-kids__security-chest--correct" : "",
                showAnswers && selected && !expected ? "escape-vault-kids__security-chest--wrong" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => toggleSecurityCard(card.id)}
            >
              <span className="escape-vault-kids__chest-letter">
                {String.fromCharCode(65 + index)}
              </span>

              <div className="escape-vault-kids__small-chest">
                <div className="escape-vault-kids__small-chest-lid" />
                <div className="escape-vault-kids__small-chest-front">
                  <strong>{card.equation}</strong>
                  <LockKeyhole size={18} />
                </div>
              </div>

              <span className="escape-vault-kids__chest-status">
                {showAnswers && expected ? (
                  <><Check size={16} /> Correct chest</>
                ) : selected ? (
                  <><Check size={16} /> Selected</>
                ) : (
                  "Tap to select"
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ------------------------------------------------------
  // RANKING UI
  // ------------------------------------------------------

  const renderRanking = () => (
    <div className="escape-vault-kids__activity">

      <div className="escape-vault-kids__wooden-instruction">
        <span>🪵</span>
        <p>Put the locks in order — smallest answer first, largest last!</p>
      </div>

      <div className="escape-vault-kids__ranking-grid">
        {displayedRankingOrder.map((id, index) => {
          const card = cardMap.get(id);
          if (!card) return null;

          const correctIndex = expectedIds.indexOf(id);
          const isPositionCorrect = correctIndex === index;

          return (
            <div
              className={[
                "escape-vault-kids__ranking-chest",
                `escape-vault-kids__ranking-chest--${index % 4}`,
                showAnswers && isPositionCorrect
                  ? "escape-vault-kids__ranking-chest--correct"
                  : "",
              ].filter(Boolean).join(" ")}
              key={id}
            >
              <span className="escape-vault-kids__rank-token">
                {index + 1}
              </span>

              <div className="escape-vault-kids__ranking-chest-art">
                <div className="escape-vault-kids__ranking-lid" />
                <div className="escape-vault-kids__ranking-front">
                  <small>{id.replace("_", " ")}</small>
                  <strong>{card.equation}</strong>
                  <LockKeyhole size={20} />
                </div>
              </div>

              <div className="escape-vault-kids__ranking-controls">
                <button
                  type="button"
                  title="Move earlier"
                  aria-label={`Move ${id} earlier`}
                  disabled={showAnswers || index === 0}
                  onClick={() => moveRankingCard(index, -1)}
                >
                  <ArrowUp size={16} />
                </button>

                <button
                  type="button"
                  title="Move later"
                  aria-label={`Move ${id} later`}
                  disabled={showAnswers || index === displayedRankingOrder.length - 1}
                  onClick={() => moveRankingCard(index, 1)}
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              {showAnswers && isPositionCorrect && (
                <span className="escape-vault-kids__rank-check">
                  <Check size={15} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="escape-vault-kids__unlock-order">
        <KeyRound size={19} />
        <div>
          <small>UNLOCKING ORDER</small>
          <strong>{displayedRankingOrder.join(" → ")}</strong>
        </div>
      </div>
    </div>
  );


  const renderTileKey = () => (
    <div className="escape-vault-kids__activity">

     

      <div className="escape-vault-kids__activity-heading">
        <span className="escape-vault-kids__step-badge">3</span>
        <div>
          <h5>Choose your golden keys</h5>
          <p>Select the starting number first, then the number to subtract.</p>
        </div>
      </div>

      <div className="escape-vault-kids__number-keys">
        {tiles.map((tile, index) => {
          const selectedIndex = currentIds.indexOf(tile.id);
          const selected = selectedIndex !== -1;
          const expected = expectedIds.includes(tile.id);

          return (
            <button
              key={tile.id}
              type="button"
              disabled={showAnswers}
              aria-pressed={selected}
              className={[
                "escape-vault-kids__golden-key",
                `escape-vault-kids__golden-key--${index % 4}`,
                selected ? "escape-vault-kids__golden-key--selected" : "",
                showAnswers && expected ? "escape-vault-kids__golden-key--correct" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => toggleTile(tile.id)}
            >
              <span className="escape-vault-kids__key-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="escape-vault-kids__key-head">
                <strong>{tile.number}</strong>
              </span>
              <span className="escape-vault-kids__key-shaft" />
              <span className="escape-vault-kids__key-rank">
                {selected ? selectedIndex + 1 : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="escape-vault-kids__equation-builder">
        <div className="escape-vault-kids__builder-heading">
          <KeyRound size={18} />
          <span>BUILD YOUR MATH KEY</span>
        </div>

        <div className="escape-vault-kids__equation-slots">
          <div>{firstTile?.number ?? "?"}</div>
          <span>−</span>
          <div>{secondTile?.number ?? "?"}</div>
          <span>=</span>
          <div className="escape-vault-kids__target-slot">
            {vault.targetDifference ?? "?"}
          </div>
        </div>
      </div>
    </div>
  );

  // ------------------------------------------------------
  // ROUTING
  // ------------------------------------------------------

  let activity: ReactNode;

  switch (code) {
    case "VAULT_CIPHER_CODE":
      activity = renderCipher();
      break;
    case "VAULT_SECURITY_FILTER":
      activity = renderSecurity();
      break;
    case "VAULT_LOCK_RANKING":
      activity = renderRanking();
      break;
    case "VAULT_NUMBER_TILE_KEY":
      activity = renderTileKey();
      break;
    default:
      activity = (
        <div className="escape-vault-kids__unsupported">
          Unsupported Escape Vault question type: {code || "Unknown"}
        </div>
      );
  }

  const expectedDisplay = isCipher
    ? expectedSymbols
        .map((name) => symbolKey.find((symbol) => symbol.symbolName === name)?.symbol ?? name)
        .join(" ")
    : expectedAnswer;

  return (
    <section
      className={[
        "escape-vault-kids",
        `escape-vault-kids--${code.toLowerCase().replaceAll("_", "-")}`,
      ].join(" ")}
    >
      {/* Parent worksheet renders the backend question text once. */}

      <header className="escape-vault-kids__hero">
        <div className="escape-vault-kids__hero-copy">
          <span className="escape-vault-kids__eyebrow">
            ✦ LEARNSPARK TREASURE ADVENTURE ✦
          </span>
          <h4>{title}</h4>
          <p>{mission}</p>
        </div>

        {renderScene()}
      </header>

      {activity}

      <footer className="escape-vault-kids__footer">
        <div className="escape-vault-kids__footer-mascot" aria-hidden="true">
          🦉
        </div>

        <div className="escape-vault-kids__footer-copy">
          <small>ADVENTURER STATUS</small>
          <strong>
            {showAnswers
              ? isCorrect
                ? "Amazing! You cracked the vault!"
                : "Here is the correct solution."
              : "Keep going, treasure explorer!"}
          </strong>
        </div>

        {!showAnswers && (
          <button
            type="button"
            className="escape-vault-kids__reset"
            onClick={() => onAnswerChange("")}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        )}
      </footer>

      {showAnswers && (
        <div
          className={[
            "escape-vault-kids__feedback",
            isCorrect
              ? "escape-vault-kids__feedback--correct"
              : "escape-vault-kids__feedback--revealed",
          ].join(" ")}
          role="status"
        >
          {isCorrect ? (
            <Check size={20} />
          ) : (
            <Sparkles size={20} />
          )}

          <span>
            {isCorrect
              ? "Correct! You have unlocked this treasure."
              : `Correct answer: ${expectedDisplay || "See the highlighted solution."}`}
          </span>

          {!isCorrect && <X size={17} />}
        </div>
      )}
    </section>
  );
}
