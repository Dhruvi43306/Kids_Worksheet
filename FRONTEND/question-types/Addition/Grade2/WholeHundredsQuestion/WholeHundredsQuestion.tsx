
import React from "react";
import "@/styles/worksheet.css";
import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import type { QuestionData, GeneratedQuestion } from "@/app/worksheet/type";

type Accent =
  | "#4f46e5"
  | "#0891b2"
  | "#7c3aed"
  | "#ca8a04"
  | "#9333ea"
  | "#2563eb"
  | "#e11d48"
  | "#ea580c"
  | "#0f766e"
  | "#dc2626"
  | "#16a34a"
  | "#db2777"
  | "#f59e0b"
  | "#1d4ed8";

function accentName(accent: string): string {
  const names: Record<string, string> = {
    "#4f46e5": "indigo",
    "#0891b2": "cyan",
    "#7c3aed": "violet",
    "#ca8a04": "gold",
    "#9333ea": "purple",
    "#2563eb": "blue",
    "#e11d48": "rose",
    "#ea580c": "orange",
    "#0f766e": "teal",
    "#dc2626": "red",
    "#16a34a": "green",
    "#db2777": "pink",
    "#f59e0b": "amber",
    "#1d4ed8": "deep-blue",
  };

  return names[accent.toLowerCase()] ?? "indigo";
}

function WholeHundredsCard({
  children,
  accent = "#6366f1",
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className={`whole-hundreds__card whole-hundreds__card--${accentName(accent)}`}
    >
      {children}
    </div>
  );
}

function WholeHundredsTitle({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="whole-hundreds__title-block">
      <div className="whole-hundreds__title-row">
        <span className="whole-hundreds__title-icon">{icon}</span>
        <h3 className="whole-hundreds__title">{title}</h3>
      </div>
      <p className="whole-hundreds__subtitle">{subtitle}</p>
    </div>
  );
}

function WholeHundredsNumberCard({
  label,
  value,
  icon,
  accent = "#4f46e5",
  unit = "",
}: {
  label: string;
  value: number | undefined;
  icon: string;
  accent?: string;
  unit?: string;
}) {
  return (
    <div
      className={`whole-hundreds__number-card whole-hundreds__number-card--${accentName(accent)}`}
    >
      <div className="whole-hundreds__number-icon">{icon}</div>

      <div className="whole-hundreds__number-label">{label}</div>

      <div className="whole-hundreds__number-value">
        {value !== undefined ? value : "—"}
      </div>

      {unit && <div className="whole-hundreds__number-unit">{unit}</div>}
    </div>
  );
}

function WholeHundredsInputBox({
  value,
  expected,
  showAnswers,
  correct,
  wrong,
  onChange,
  size = "standard",
  placeholder = "?",
}: {
  value: string;
  expected?: number | string;
  showAnswers: boolean;
  correct: boolean;
  wrong: boolean;
  onChange: (value: string) => void;
  size?: "standard" | "wide" | "medium" | "compact" | "narrow";
  placeholder?: string;
}) {
  const stateClass = correct
    ? "whole-hundreds__input--correct"
    : wrong
      ? "whole-hundreds__input--incorrect"
      : "whole-hundreds__input--neutral";

  return (
    <input
      type="number"
      inputMode="numeric"
      className={`whole-hundreds__input whole-hundreds__input--${size} ${stateClass} ${
        showAnswers
          ? "whole-hundreds__input--checked"
          : "whole-hundreds__input--editable"
      }`}
      value={showAnswers && correct ? String(expected) : value}
      disabled={showAnswers}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function WholeHundredsResult({ answer }: { answer: string }) {
  return (
    <div className="whole-hundreds__result">
      ✓ Answer: {answer}
    </div>
  );
}

function WholeHundredsAnswerLine({
  label,
  answer,
  entered,
  correct,
  wrong,
  showAnswers,
  onChange,
}: {
  label: string;
  answer?: number | string;
  entered: string;
  correct: boolean;
  wrong: boolean;
  showAnswers: boolean;
  onChange: (value: string) => void;
}) {
  const stateClass = correct
    ? "whole-hundreds__answer-value--correct"
    : wrong
      ? "whole-hundreds__answer-value--incorrect"
      : "whole-hundreds__answer-value--neutral";

  return (
    <div className="whole-hundreds__answer-line">
      <span className="whole-hundreds__answer-line-label">{label}</span>

      {!showAnswers ? (
        <input
          type="number"
          inputMode="numeric"
          className="whole-hundreds__answer-line-input"
          value={entered}
          placeholder="?"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <span
          className={`whole-hundreds__answer-value ${stateClass}`}
        >
          {answer !== undefined ? answer : entered || "—"}
        </span>
      )}
    </div>
  );
}

type WholeHundredsRendererProps = {
  question: GeneratedQuestion;
  data: QuestionData;
  showAnswers: boolean;
  userAnswer: unknown;
  onAnswerChange: (value: any) => void;
};

function WholeHundredsQuestionRenderer({
  question,
  data,
  showAnswers,
  userAnswer,
  onAnswerChange,
}: WholeHundredsRendererProps) {
  const code = String(data.questionType ?? "").trim().toUpperCase();
  const format = String(data.format ?? "").trim();

  const numbers = Array.isArray(data.numbers)
    ? data.numbers.map(Number).filter(Number.isFinite)
    : [];

  const currentAnswers =
    userAnswer &&
    typeof userAnswer === "object" &&
    !Array.isArray(userAnswer)
      ? userAnswer as Record<string, unknown>
      : {};

  const getNumber = (
    value: unknown,
    fallback?: number,
  ): number | undefined => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const getAnswer = (key: string): string =>
    String(currentAnswers[key] ?? "").trim();

  const updateAnswer = (key: string, value: string) => {
    if (showAnswers) return;

    onAnswerChange({
      ...currentAnswers,
      [key]: value,
    });
  };

  const isCorrectAnswer = (
    key: string,
    expected: number | string | undefined,
  ) => {
    if (!showAnswers || expected === undefined) return false;

    const entered = getAnswer(key);
    return entered !== "" && entered === String(expected);
  };

  const isWrongAnswer = (
    key: string,
    expected: number | string | undefined,
  ) => {
    if (!showAnswers || expected === undefined) return false;

    const entered = getAnswer(key);
    return entered !== "" && entered !== String(expected);
  };

  const renderInputBox = ({
    answerKey,
    expected,
    size = "standard",
    placeholder = "?",
  }: {
    answerKey: string;
    expected?: number | string;
    size?: "standard" | "wide" | "medium" | "compact" | "narrow";
    placeholder?: string;
  }) => (
    <WholeHundredsInputBox
      value={getAnswer(answerKey)}
      expected={expected}
      showAnswers={showAnswers}
      correct={isCorrectAnswer(answerKey, expected)}
      wrong={isWrongAnswer(answerKey, expected)}
      onChange={(value) => updateAnswer(answerKey, value)}
      size={size}
      placeholder={placeholder}
    />
  );

  const renderAnswerLine = ({
    label,
    answer,
    answerKey,
  }: {
    label: string;
    answer?: number | string;
    answerKey: string;
  }) => (
    <WholeHundredsAnswerLine
      label={label}
      answer={answer}
      entered={getAnswer(answerKey)}
      correct={isCorrectAnswer(answerKey, answer)}
      wrong={isWrongAnswer(answerKey, answer)}
      showAnswers={showAnswers}
      onChange={(value) => updateAnswer(answerKey, value)}
    />
  );

  if (code === "ADD_WHOLE_HUNDREDS") {
    const first =
      getNumber(data.firstNumber) ?? numbers[0];

    const second =
      getNumber(data.secondNumber) ?? numbers[1];

    const total =
      getNumber(data.total) ??
      (first !== undefined && second !== undefined
        ? first + second
        : undefined);

    const firstHundreds =
      getNumber(data.firstHundreds) ??
      (first !== undefined ? first / 100 : undefined);

    const secondHundreds =
      getNumber(data.secondHundreds) ??
      (second !== undefined ? second / 100 : undefined);

    const totalHundreds =
      getNumber(data.totalHundreds) ??
      (total !== undefined ? total / 100 : undefined);

    if (format === "unitNotation") {
      return (
        <WholeHundredsCard accent="#4f46e5">
          <WholeHundredsTitle
            icon="💯"
            title="Hundreds Builder"
            subtitle="Think in groups of 100 and complete the addition."
          />

          <div className="whole-hundreds__equation-row">
            <span>{firstHundreds ?? "—"} hundreds</span>
            <span className="whole-hundreds__equation-symbol">+</span>
            <span>{secondHundreds ?? "—"} hundreds</span>
            <span className="whole-hundreds__equation-symbol">=</span>

            {renderInputBox({
              answerKey: "totalHundreds",
              expected: totalHundreds,
              size: "wide",
            })}

            <span>hundreds</span>
            <span className="whole-hundreds__equation-symbol">=</span>

            {renderInputBox({
              answerKey: "total",
              expected: total,
              size: "medium",
            })}
          </div>

          {renderAnswerLine({
            label: "Total Value",
            answer: total,
            answerKey: "total",
          })}

          {showAnswers && (
            <WholeHundredsResult
              answer={`${totalHundreds} hundreds = ${total}`}
            />
          )}
        </WholeHundredsCard>
      );
    }

    if (format === "placeValueBlocks") {
      const firstFlats =
        data.placeValueBlocks?.firstFlats ?? firstHundreds ?? 0;

      const secondFlats =
        data.placeValueBlocks?.secondFlats ?? secondHundreds ?? 0;

      const totalFlats =
        data.placeValueBlocks?.totalFlats ?? totalHundreds ?? 0;

      return (
        <WholeHundredsCard accent="#0891b2">
          <WholeHundredsTitle
            icon="🧱"
            title="Hundred Flats"
            subtitle="Each flat represents one hundred."
          />

          <div className="whole-hundreds__number-grid">
            <WholeHundredsNumberCard
              label="Stack A"
              value={first}
              icon="🟦"
              accent="#0891b2"
              unit={`${firstFlats} hundred-flats`}
            />

            <WholeHundredsNumberCard
              label="Stack B"
              value={second}
              icon="🟪"
              accent="#7c3aed"
              unit={`${secondFlats} hundred-flats`}
            />
          </div>

          {renderAnswerLine({
            label: "Total Value",
            answer: total,
            answerKey: "total",
          })}

          {showAnswers && (
            <WholeHundredsResult
              answer={`${totalFlats} hundred-flats = ${total}`}
            />
          )}
        </WholeHundredsCard>
      );
    }

    if (format === "currencyVault") {
      const firstBills =
        data.currencyVault?.firstBills ??
        data.firstBills ??
        firstHundreds ??
        0;

      const secondBills =
        data.currencyVault?.secondBills ??
        data.secondBills ??
        secondHundreds ??
        0;

      return (
        <WholeHundredsCard accent="#ca8a04">
          <WholeHundredsTitle
            icon="💰"
            title="Hundred-Dollar Vault"
            subtitle="Count each $100 bill and find the total."
          />

          <div className="whole-hundreds__number-grid">
            <div className="whole-hundreds__money-card">
              <div className="whole-hundreds__money-icon">💵</div>
              <strong className="whole-hundreds__money-label">
                Stack A
              </strong>
              <div className="whole-hundreds__money-amount">
                {firstBills} × $100
              </div>
              <div className="whole-hundreds__money-value">
                = ${first}
              </div>
            </div>

            <div className="whole-hundreds__money-card">
              <div className="whole-hundreds__money-icon">💵</div>
              <strong className="whole-hundreds__money-label">
                Stack B
              </strong>
              <div className="whole-hundreds__money-amount">
                {secondBills} × $100
              </div>
              <div className="whole-hundreds__money-value">
                = ${second}
              </div>
            </div>
          </div>

          {renderAnswerLine({
            label: "Total Money",
            answer: total !== undefined ? `$${total}` : undefined,
            answerKey: "total",
          })}
        </WholeHundredsCard>
      );
    }

    return (
      <WholeHundredsCard accent="#9333ea">
        <WholeHundredsTitle
          icon="🧰"
          title="Mystery Chest"
          subtitle="Open both chests and find the total loot."
        />

        <div className="whole-hundreds__number-grid">
          <WholeHundredsNumberCard
            label="Chest A"
            value={first}
            icon="🧰"
            accent="#9333ea"
            unit="gold coins"
          />

          <WholeHundredsNumberCard
            label="Chest B"
            value={second}
            icon="🧰"
            accent="#db2777"
            unit="gold coins"
          />
        </div>

        {renderAnswerLine({
          label: "Total Loot",
          answer: total,
          answerKey: "total",
        })}

        {showAnswers && (
          <WholeHundredsResult
            answer={`${first} + ${second} = ${total}`}
          />
        )}
      </WholeHundredsCard>
    );
  }

  if (code === "ADD_WHOLE_HUNDREDS_THREE") {
    const first =
      getNumber((data as any).first) ?? numbers[0];

    const second =
      getNumber((data as any).second) ?? numbers[1];

    const third =
      getNumber((data as any).third) ?? numbers[2];

    const total =
      getNumber(data.total) ??
      (first !== undefined &&
      second !== undefined &&
      third !== undefined
        ? first + second + third
        : undefined);

    if (format === "friendlyThousandBridge") {
      const pairFirst =
        data.firstPair?.first ??
        (data as any).pairFirst ??
        numbers[0];

      const pairSecond =
        data.firstPair?.second ??
        (data as any).pairSecond ??
        numbers[1];

      const remaining =
        data.remaining ??
        numbers.find(
          (value) => value !== pairFirst && value !== pairSecond,
        );

      const pairTotal =
        data.firstPair?.total ??
        (pairFirst !== undefined && pairSecond !== undefined
          ? pairFirst + pairSecond
          : undefined);

      return (
        <WholeHundredsCard accent="#7c3aed">
          <WholeHundredsTitle
            icon="🤝"
            title="Friendly Thousand Bridge"
            subtitle="Group two hundreds to make 1,000, then add the remaining hundreds."
          />

          <div className="whole-hundreds__equation-row">
            <div className="whole-hundreds__equation-tile whole-hundreds__equation-tile--violet">
              {pairFirst} + {pairSecond}
            </div>

            <span className="whole-hundreds__equation-symbol">=</span>

            {renderInputBox({
              answerKey: "friendlyTotal",
              expected: pairTotal,
              size: "narrow",
            })}

            <span className="whole-hundreds__equation-symbol">+</span>

            <div className="whole-hundreds__equation-tile whole-hundreds__equation-tile--blue">
              {remaining}
            </div>
          </div>

          {renderAnswerLine({
            label: "Grand Total",
            answer: total,
            answerKey: "total",
          })}

          {showAnswers && (
            <WholeHundredsResult
              answer={`(${pairFirst} + ${pairSecond}) + ${remaining} = ${total}`}
            />
          )}
        </WholeHundredsCard>
      );
    }

    if (format === "sequentialStepMap") {
      const stepOne =
        getNumber(data.stepOne) ??
        (first !== undefined && second !== undefined
          ? first + second
          : undefined);

      return (
        <WholeHundredsCard accent="#2563eb">
          <WholeHundredsTitle
            icon="🧭"
            title="Hundreds Step Map"
            subtitle="Follow each addition step until you reach the final total."
          />

          <div className="whole-hundreds__equation-row">
            <WholeHundredsNumberCard
              label="Start"
              value={first}
              icon="🚩"
              accent="#2563eb"
            />

            <div className="whole-hundreds__step-operator">
              + {second}
            </div>

            {renderInputBox({
              answerKey: "stepOne",
              expected: stepOne,
              size: "narrow",
            })}

            <div className="whole-hundreds__step-operator whole-hundreds__step-operator--violet">
              + {third}
            </div>

            {renderInputBox({
              answerKey: "total",
              expected: total,
              size: "narrow",
            })}
          </div>

          {showAnswers && (
            <WholeHundredsResult
              answer={`${first} + ${second} = ${stepOne}; ${stepOne} + ${third} = ${total}`}
            />
          )}
        </WholeHundredsCard>
      );
    }

    if (format === "targetScoreboard") {
      const levels =
        Array.isArray(data.levels) && data.levels.length >= 3
          ? data.levels
          : [first, second, third];

      return (
        <WholeHundredsCard accent="#e11d48">
          <WholeHundredsTitle
            icon="🏆"
            title="Grand Total Score"
            subtitle="Combine all three stages and find the final score."
          />

          <div className="whole-hundreds__number-grid whole-hundreds__number-grid--three">
            <WholeHundredsNumberCard
              label="Stage 1"
              value={levels[0]}
              icon="🎯"
              accent="#2563eb"
              unit="points"
            />

            <WholeHundredsNumberCard
              label="Stage 2"
              value={levels[1]}
              icon="🏆"
              accent="#e11d48"
              unit="points"
            />

            <WholeHundredsNumberCard
              label="Stage 3"
              value={levels[2]}
              icon="⭐"
              accent="#ca8a04"
              unit="points"
            />
          </div>

          {renderAnswerLine({
            label: "Grand Total Score",
            answer: total,
            answerKey: "total",
          })}

          {showAnswers && (
            <WholeHundredsResult
              answer={`${levels[0]} + ${levels[1]} + ${levels[2]} = ${total}`}
            />
          )}
        </WholeHundredsCard>
      );
    }

    if (format === "spaceRocketMission") {
      const fuelOne =
        getNumber(data.fuelLevelOne) ?? first;

      const fuelTwo =
        getNumber(data.fuelLevelTwo) ?? second;

      const booster =
        getNumber(data.boosterPower) ?? third;

      return (
        <WholeHundredsCard accent="#4f46e5">
          <WholeHundredsTitle
            icon="🚀"
            title="Space Mission"
            subtitle="Combine all three power sources to calculate the mission distance."
          />

          <div className="whole-hundreds__number-grid whole-hundreds__number-grid--three">
            <WholeHundredsNumberCard
              label="Power Source A"
              value={fuelOne}
              icon="🚀"
              accent="#4f46e5"
              unit="kilometers"
            />

            <WholeHundredsNumberCard
              label="Power Source B"
              value={fuelTwo}
              icon="🛰️"
              accent="#0891b2"
              unit="kilometers"
            />

            <WholeHundredsNumberCard
              label="Power Source C"
              value={booster}
              icon="🌌"
              accent="#7c3aed"
              unit="kilometers"
            />
          </div>

          <div className="whole-hundreds__mission-total">
            <div className="whole-hundreds__mission-total-label">
              TOTAL MISSION DISTANCE
            </div>

            {renderInputBox({
              answerKey: "total",
              expected: total,
              size: "wide",
            })}

            <span className="whole-hundreds__mission-unit">km</span>
          </div>

          {showAnswers && (
            <WholeHundredsResult
              answer={`${fuelOne} + ${fuelTwo} + ${booster} = ${total} km`}
            />
          )}
        </WholeHundredsCard>
      );
    }
  }

  if (code === "ADD_WHOLE_HUNDREDS_MISSING") {
    const known =
      getNumber(data.knownNumber) ??
      getNumber(data.knownPart) ??
      getNumber(data.currentProgress);

    const missing =
      getNumber(data.missingNumber) ??
      getNumber(data.missingPart);

    const total =
      getNumber(data.total) ??
      getNumber(data.goal);

    if (format === "balanceScale") {
      const scaleKnown =
        data.balanceScale?.left?.known ?? known;

      const scaleTotal =
        data.balanceScale?.right?.total ?? total;

      return (
        <WholeHundredsCard accent="#0891b2">
          <WholeHundredsTitle
            icon="⚖️"
            title="Balance the Scale"
            subtitle="Find the missing hundreds that make both sides equal."
          />

          <div className="whole-hundreds__balance-layout">
            <div className="whole-hundreds__balance-panel whole-hundreds__balance-panel--known">
              <div className="whole-hundreds__balance-icon">⚖️</div>
              <strong className="whole-hundreds__balance-label">Known</strong>
              <div className="whole-hundreds__balance-value">
                {scaleKnown}
              </div>
            </div>

            <span className="whole-hundreds__balance-symbol">+</span>

            {renderInputBox({
              answerKey: "missing",
              expected: missing,
              size: "medium",
            })}

            <span className="whole-hundreds__balance-symbol">=</span>

            <div className="whole-hundreds__balance-panel whole-hundreds__balance-panel--target">
              <strong className="whole-hundreds__balance-label">
                Target
              </strong>
              <div className="whole-hundreds__balance-value">
                {scaleTotal}
              </div>
            </div>
          </div>

          {renderAnswerLine({
            label: "Missing Hundred",
            answer: missing,
            answerKey: "missing",
          })}
        </WholeHundredsCard>
      );
    }

    if (format === "digitalProgressMeter") {
      const current = data.currentProgress ?? known ?? 0;
      const goal = data.goal ?? total ?? 0;
      const distance = data.missingNumber ?? goal - current;

      const percentage =
        goal > 0
          ? Math.min(100, Math.max(0, (current / goal) * 100))
          : 0;

      return (
        <WholeHundredsCard accent="#2563eb">
          <WholeHundredsTitle
            icon="📈"
            title="Progress Meter"
            subtitle="How many more hundreds are needed to reach the goal?"
          />

          <div className="whole-hundreds__progress-panel">
            <div className="whole-hundreds__progress-labels">
              <span>Current: {current}</span>
              <span>Goal: {goal}</span>
            </div>

            <progress
              className="whole-hundreds__progress whole-hundreds__progress--blue"
              value={percentage}
              max={100}
              aria-label="Progress toward goal"
            />

            <div className="whole-hundreds__progress-caption">
              {current} → {goal}
            </div>
          </div>

          {renderAnswerLine({
            label: "Points Needed",
            answer: distance,
            answerKey: "missing",
          })}
        </WholeHundredsCard>
      );
    }

    if (format === "hundredsCountGap") {
      const currentHundreds =
        data.knownNumber ??
        data.firstHundreds ??
        (known !== undefined ? known / 100 : undefined);

      const goalHundreds =
        data.totalHundreds ??
        (total !== undefined ? total / 100 : undefined);

      const missingHundreds =
        data.missingHundreds ??
        (currentHundreds !== undefined && goalHundreds !== undefined
          ? goalHundreds - currentHundreds
          : undefined);

      return (
        <WholeHundredsCard accent="#16a34a">
          <WholeHundredsTitle
            icon="🔢"
            title="Hundreds Count Gap"
            subtitle="Count how many groups of 100 are still needed."
          />

          <div className="whole-hundreds__number-grid">
            <WholeHundredsNumberCard
              label="Current"
              value={currentHundreds}
              icon="🔵"
              accent="#2563eb"
              unit="hundreds"
            />

            <div className="whole-hundreds__gap-arrow">→</div>

            <WholeHundredsNumberCard
              label="Goal"
              value={goalHundreds}
              icon="🎯"
              accent="#16a34a"
              unit="hundreds"
            />
          </div>

          {renderAnswerLine({
            label: "Hundreds Needed",
            answer: missingHundreds,
            answerKey: "missingHundreds",
          })}
        </WholeHundredsCard>
      );
    }

    const currentEnergy =
      (data as any).currentEnergy ?? known;

    const targetEnergy =
      (data as any).targetEnergy ?? total;

    const missingEnergy =
      (data as any).missingEnergy ??
      missing ??
      (currentEnergy !== undefined && targetEnergy !== undefined
        ? targetEnergy - currentEnergy
        : undefined);

    return (
      <WholeHundredsCard accent="#7c3aed">
        <WholeHundredsTitle
          icon="🔐"
          title="Secret Code Lock"
          subtitle="Give the lock enough energy to unlock the door."
        />

        <div className="whole-hundreds__number-grid">
          <WholeHundredsNumberCard
            label="Current Energy"
            value={currentEnergy}
            icon="⚡"
            accent="#f59e0b"
            unit="points"
          />

          <div className="whole-hundreds__gap-arrow">→</div>

          <WholeHundredsNumberCard
            label="Target Energy"
            value={targetEnergy}
            icon="🔐"
            accent="#7c3aed"
            unit="points"
          />
        </div>

        {renderAnswerLine({
          label: "Energy Needed",
          answer: missingEnergy,
          answerKey: "missing",
        })}
      </WholeHundredsCard>
    );
  }

  if (code === "ADD_WHOLE_HUNDREDS_TO_THOUSAND") {
    const current =
      getNumber(data.firstNumber) ??
      getNumber((data as any).current) ??
      numbers[0];

    const missing =
      getNumber(data.missingNumber) ??
      getNumber((data as any).missing) ??
      (current !== undefined ? 1000 - current : undefined);

    if (format === "thousandMilestoneBridge") {
      const currentHundreds =
        data.thousandMilestoneBridge?.currentHundreds ??
        data.firstHundreds ??
        (current !== undefined ? current / 100 : undefined);

      const missingHundreds =
        data.thousandMilestoneBridge?.missingHundreds ??
        (missing !== undefined ? missing / 100 : undefined);

      return (
        <WholeHundredsCard accent="#f59e0b">
          <WholeHundredsTitle
            icon="🏁"
            title="1,000 Milestone"
            subtitle="Complete the missing hundreds and reach the 1,000 target."
          />

          <div className="whole-hundreds__equation-row">
            <span className="whole-hundreds__equation-tile whole-hundreds__equation-tile--orange">
              {currentHundreds} hundreds
            </span>

            <span className="whole-hundreds__equation-symbol">+</span>

            {renderInputBox({
              answerKey: "missingHundreds",
              expected: missingHundreds,
              size: "compact",
            })}

            <span className="whole-hundreds__equation-symbol">=</span>

            <span className="whole-hundreds__equation-tile whole-hundreds__equation-tile--gold">
              10 hundreds
            </span>
          </div>

          {renderAnswerLine({
            label: "Missing Hundreds",
            answer: missingHundreds,
            answerKey: "missingHundreds",
          })}

          {showAnswers && (
            <WholeHundredsResult
              answer={`${currentHundreds} + ${missingHundreds} = 10 hundreds`}
            />
          )}
        </WholeHundredsCard>
      );
    }

    if (format === "thousandPointGauge") {
      const score =
        data.thousandPointGauge?.current ??
        (data as any).score ??
        current ??
        0;

      const target =
        data.thousandPointGauge?.target ?? 1000;

      const distance =
        data.thousandPointGauge?.distance ??
        missing ??
        target - score;

      const percentage =
        target > 0
          ? Math.min(100, Math.max(0, (score / target) * 100))
          : 0;

      return (
        <WholeHundredsCard accent="#ea580c">
          <WholeHundredsTitle
            icon="🎯"
            title="1,000 Point Target"
            subtitle="How far are you from the 1,000-point target?"
          />

          <div className="whole-hundreds__progress-panel">
            <div className="whole-hundreds__progress-labels">
              <span>{score}</span>
              <span>{target}</span>
            </div>

            <progress
              className="whole-hundreds__progress whole-hundreds__progress--orange"
              value={percentage}
              max={100}
              aria-label="Progress toward 1,000 points"
            />
          </div>

          {renderAnswerLine({
            label: "Distance to 1,000",
            answer: distance,
            answerKey: "missing",
          })}
        </WholeHundredsCard>
      );
    }

    if (format === "tenFrameHundreds") {
      const filled =
        data.tenFrameHundreds?.filledBlocks ??
        (data as any).filledBlocks ??
        (current !== undefined ? current / 100 : 0);

      const empty =
        data.tenFrameHundreds?.emptyBlocks ??
        (data as any).emptyBlocks ??
        10 - filled;

      return (
        <WholeHundredsCard accent="#0f766e">
          <WholeHundredsTitle
            icon="🔟"
            title="Hundreds Frame"
            subtitle="Fill the frame until you reach 1,000."
          />

          <div className="whole-hundreds__frame">
            {Array.from({ length: 10 }, (_, index) => {
              const filledBlock = index < filled;

              return (
                <div
                  key={index}
                  className={`whole-hundreds__frame-cell ${
                    filledBlock
                      ? "whole-hundreds__frame-cell--filled"
                      : "whole-hundreds__frame-cell--empty"
                  }`}
                >
                  {filledBlock ? "100" : ""}
                </div>
              );
            })}
          </div>

          {renderAnswerLine({
            label: "Empty Hundred Blocks",
            answer: empty,
            answerKey: "emptyBlocks",
          })}
        </WholeHundredsCard>
      );
    }

    const bossCurrent =
      data.bossLevel1000?.current ??
      (data as any).currentHP ??
      current;

    const bossTarget =
      data.bossLevel1000?.goal ??
      (data as any).targetHP ??
      1000;

    const missingPower =
      data.bossLevel1000?.missing ??
      (data as any).missingPower ??
      missing;

    const bossPercentage =
      Number(bossTarget) > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (Number(bossCurrent ?? 0) / Number(bossTarget)) * 100,
            ),
          )
        : 0;

    return (
      <WholeHundredsCard accent="#dc2626">
        <WholeHundredsTitle
          icon="🐉"
          title="Boss Level 1,000"
          subtitle="Power up the final boss battle to reach 1,000 HP."
        />

        <div className="whole-hundreds__boss-panel">
          <div className="whole-hundreds__boss-icon">🐉</div>

          <div className="whole-hundreds__boss-score">
            {bossCurrent} / {bossTarget} HP
          </div>

          <progress
            className="whole-hundreds__progress whole-hundreds__progress--boss"
            value={bossPercentage}
            max={100}
            aria-label="Boss health progress"
          />
        </div>

        {renderAnswerLine({
          label: "Missing Power",
          answer: missingPower,
          answerKey: "missing",
        })}
      </WholeHundredsCard>
    );
  }

  return (
    <WholeHundredsCard>
      <WholeHundredsTitle
        icon="💯"
        title="Whole Hundreds"
        subtitle="Complete the addition."
      />

      <div className="whole-hundreds__fallback-equation">
        {data.equation ?? question.questionText}
      </div>

      {numbers.length > 0 && (
        <div className="whole-hundreds__number-grid whole-hundreds__number-grid--fallback">
          {numbers.map((number, index) => (
            <WholeHundredsNumberCard
              key={`${number}-${index}`}
              label={`Number ${index + 1}`}
              value={number}
              icon="💯"
              accent="#6366f1"
            />
          ))}
        </div>
      )}
    </WholeHundredsCard>
  );
}

export default function WholeHundredsQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
}: QuestionRendererProps) {
  return (
    <WholeHundredsQuestionRenderer
      question={question}
      data={data}
      showAnswers={showAnswers}
      userAnswer={userAnswer}
      onAnswerChange={onAnswerChange}
    />
  );
}
