"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";

import type { QuestionRendererProps } from "@/renderer/QuestionRendererTypes";
import { answerMatches } from "@/renderer/questionHelpers";

import "@/styles/worksheet.css";

type DivisionObjectData = {
  id?: string;
  icon?: string;
};

type DivisionObject = {
  id: string;
  icon?: string;
};

type DivisionRecipient = {
  id: string;
  objects?: string[];
};

type DivisionGroupData = {
  id: string;
  childLabel?: string;
  objects: DivisionObjectData[];
};

type DivisionGroup = {
  id: string;
  childLabel?: string;
  objects: DivisionObject[];
};

type ObjectBuckets = Record<string, DivisionObject[]>;

type DivisionSharingData = {
  renderKey?: string;
  questionType?: string;
  puzzleTitle?: string;
  icon?: string;

  objects?: DivisionObjectData[];
  groupCount?: number;
  recipients?: DivisionRecipient[];

  totalItems?: number;
  itemsPerGroup?: number;
  groupSize?: number;

  groups?: DivisionGroupData[];
  moveFrom?: string;
  moveTo?: string;
};

type DragReference = {
  current: string | null;
};

/* =========================================================
   SHARED HELPERS
========================================================= */

function emptyBuckets(ids: string[]): ObjectBuckets {
  return Object.fromEntries(ids.map((id) => [id, []]));
}

function removeFromBuckets(
  buckets: ObjectBuckets,
  objectId: string,
): ObjectBuckets {
  return Object.fromEntries(
    Object.entries(buckets).map(([bucketId, items]) => [
      bucketId,
      items.filter((item) => item.id !== objectId),
    ]),
  );
}

function assignedObjects(
  buckets: ObjectBuckets,
): DivisionObject[] {
  return Object.values(buckets).flat();
}

function unassignedObjects(
  objects: DivisionObject[],
  buckets: ObjectBuckets,
): DivisionObject[] {
  const assignedIds = new Set(
    assignedObjects(buckets).map((item) => item.id),
  );

  return objects.filter((item) => !assignedIds.has(item.id));
}

function allObjectsAssigned(
  objects: DivisionObject[],
  buckets: ObjectBuckets,
): boolean {
  const assignedIds = new Set(
    assignedObjects(buckets).map((item) => item.id),
  );

  return (
    objects.length > 0 &&
    objects.every((item) => assignedIds.has(item.id))
  );
}

/**
 * Use both DataTransfer and a ref.
 *
 * Some browsers return an empty DataTransfer value in certain
 * drag situations. The ref provides a fallback for the active
 * drag within this worksheet component.
 */
function getDraggedObjectId<T extends HTMLElement>(
  event: ReactDragEvent<T>,
  draggedObjectRef: DragReference,
  selectedObjectId: string | null,
): string | null {
  return (
    event.dataTransfer.getData("application/x-division-object") ||
    event.dataTransfer.getData("text/plain") ||
    draggedObjectRef.current ||
    selectedObjectId
  );
}

function allowObjectDrop<T extends HTMLElement>(
  event: ReactDragEvent<T>,
  showAnswers: boolean,
): void {
  if (showAnswers) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

/* =========================================================
   ANIMATED OBJECT
========================================================= */

function AnimatedObject({
  item,
  questionKey,
  selected,
  disabled,
  draggedObjectRef,
  onSelect,
}: {
  item: DivisionObject;
  questionKey: string;
  selected: boolean;
  disabled: boolean;
  draggedObjectRef: DragReference;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.button
      layout
      layoutId={`division-object-${questionKey}-${item.id}`}
      type="button"
      draggable={!disabled}
      disabled={disabled}
      aria-label={`Object ${item.id}`}
      aria-pressed={selected}
      className={[
        "division-sharing-question__object",
        selected
          ? "division-sharing-question__object--selected"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      transition={{
        layout: {
          type: "spring",
          stiffness: 340,
          damping: 28,
        },
      }}
      whileHover={
        disabled
          ? undefined
          : {
              scale: 1.08,
              y: -2,
            }
      }
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={(event) => {
        event.stopPropagation();

        if (!disabled) {
          onSelect(item.id);
        }
      }}
      onDragStartCapture={(event: ReactDragEvent<HTMLButtonElement>) => {
        draggedObjectRef.current = item.id;

        event.dataTransfer.setData("text/plain", item.id);
        event.dataTransfer.setData(
          "application/x-division-object",
          item.id,
        );
        event.dataTransfer.effectAllowed = "move";

        onSelect(item.id);
      }}
      onDragEnd={() => {
        /*
         * Clear the fallback only after the browser finishes
         * the drop sequence.
         */
        draggedObjectRef.current = null;
      }}
    >
      <span className="division-sharing-question__object-icon">
        {item.icon}
      </span>
    </motion.button>
  );
}

/* =========================================================
   AVAILABLE OBJECTS / RETURN AREA

   When empty, this area becomes compact instead of leaving
   a large, unused container.
========================================================= */

function ObjectPool({
  items,
  selectedObjectId,
  showAnswers,
  draggedObjectRef,
  onSelectObject,
  onReturnObject,
}: {
  items: DivisionObject[];
  selectedObjectId: string | null;
  showAnswers: boolean;
  draggedObjectRef: DragReference;
  onSelectObject: (id: string) => void;
  onReturnObject: (id: string) => void;
}) {
  const isEmpty = items.length === 0;

  const handleDrop = (
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (showAnswers) {
      return;
    }

    const objectId = getDraggedObjectId(
      event,
      draggedObjectRef,
      selectedObjectId,
    );

    if (objectId) {
      onReturnObject(objectId);
    }
  };

  return (
    <section className="division-sharing-question__source">
      <div className="division-sharing-question__source-heading">
        <strong>
          {isEmpty ? "Return area" : "Available objects"}
        </strong>

        <span>{items.length} remaining</span>
      </div>

      <div
        className={[
          "division-sharing-question__pool",
          isEmpty
            ? "division-sharing-question__pool--empty"
            : "",
          selectedObjectId
            ? "division-sharing-question__pool--ready"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="group"
        aria-label={
          isEmpty
            ? "Return an object to the available area"
            : "Available objects to move"
        }
        onClick={() => {
          if (showAnswers || !selectedObjectId) {
            return;
          }

          onReturnObject(selectedObjectId);
        }}
        onDragOver={(event) => {
          allowObjectDrop(event, showAnswers);
        }}
        onDrop={handleDrop}
      >
        {items.length > 0 ? (
          <div className="division-sharing-question__pool-list">
            {items.map((item) => (
              <AnimatedObject
                key={item.id}
                item={item}
                questionKey="division-pool"
                selected={selectedObjectId === item.id}
                disabled={showAnswers}
                draggedObjectRef={draggedObjectRef}
                onSelect={onSelectObject}
              />
            ))}
          </div>
        ) : (
          <span className="division-sharing-question__pool-empty">
            Drop an object here to return it
          </span>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   ANSWER INPUT
========================================================= */

function DivisionAnswer({
  answer,
  correctAnswer,
  showAnswers,
  isCorrect,
  onAnswerChange,
  answerId,
  label,
}: {
  answer: string;
  correctAnswer: string;
  showAnswers: boolean;
  isCorrect: boolean;
  onAnswerChange: (value: string) => void;
  answerId: string;
  label: string;
}) {
  const hasAnswer = answer.trim().length > 0;

  return (
    <>
      <div className="division-sharing-question__answer-row">
        <label
          className="division-sharing-question__answer-label"
          htmlFor={answerId}
        >
          {label}
        </label>

        <input
          id={answerId}
          className={[
            "division-sharing-question__answer-input",
            showAnswers && hasAnswer
              ? isCorrect
                ? "division-sharing-question__answer-input--correct"
                : "division-sharing-question__answer-input--wrong"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="?"
          value={answer}
          disabled={showAnswers}
          onChange={(event) => {
            onAnswerChange(event.target.value);
          }}
        />
      </div>

      {showAnswers && (
        <motion.div
          className={[
            "division-sharing-question__feedback",
            isCorrect
              ? "division-sharing-question__feedback--correct"
              : "division-sharing-question__feedback--revealed",
          ].join(" ")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {hasAnswer &&
            (isCorrect ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <X size={17} aria-hidden="true" />
            ))}

          <span>
            Correct answer: <strong>{correctAnswer}</strong>
          </span>
        </motion.div>
      )}
    </>
  );
}

/* =========================================================
   MAIN RENDERER
========================================================= */

export default function DivisionSharingQuestion({
  question,
  data,
  userAnswer,
  showAnswers,
  onAnswerChange,
  correctAnswers,
}: QuestionRendererProps) {
  const details = data as DivisionSharingData;

  const questionType = (
    question.questionTypeCode?.trim() ||
    details.questionType?.trim() ||
    ""
  ).toUpperCase();

  const questionKey = String(
    question.generatedQuestionId ??
      question.questionNumber ??
      "division-question",
  );

  const answer =
    userAnswer === undefined || userAnswer === null
      ? ""
      : String(userAnswer);

  const correctAnswer = String(correctAnswers?.[0] ?? "");
  const hasAnswer = answer.trim().length > 0;

  const fallbackIcon = details.icon;

  const draggedObjectRef = useRef<string | null>(null);

  const objects = useMemo<DivisionObject[]>(
    () =>
      (details.objects ?? []).map((item, index) => ({
        id: item.id ?? `OBJECT_${index + 1}`,
        icon: item.icon || fallbackIcon,
      })),
    [details.objects, fallbackIcon],
  );

  const recipients = useMemo<DivisionRecipient[]>(
    () =>
      details.recipients ??
      Array.from(
        { length: Math.max(0, details.groupCount ?? 0) },
        (_, index) => ({
          id: `RECIPIENT_${index + 1}`,
          objects: [],
        }),
      ),
    [details.recipients, details.groupCount],
  );

  const groups = useMemo<DivisionGroup[]>(
    () =>
      (details.groups ?? []).map((group, groupIndex) => ({
        id: group.id || `GROUP_${groupIndex + 1}`,
        childLabel: group.childLabel,
        objects: (group.objects ?? []).map((item, itemIndex) => ({
          id: item.id ?? `${group.id}_${itemIndex + 1}`,
          icon: item.icon || fallbackIcon,
        })),
      })),
    [details.groups, fallbackIcon],
  );

  const recipientIds = useMemo(
    () => recipients.map((recipient) => recipient.id),
    [recipients],
  );

  const itemsPerGroup = Math.max(0, details.itemsPerGroup ?? 0);
  const groupSize = Math.max(0, details.groupSize ?? 0);

  const equalGroupIds = useMemo(
    () =>
      itemsPerGroup > 0
        ? Array.from(
            {
              length: Math.floor(objects.length / itemsPerGroup),
            },
            (_, index) => `EQUAL_GROUP_${index + 1}`,
          )
        : [],
    [objects.length, itemsPerGroup],
  );

  const leftoverGroupIds = useMemo(
    () =>
      groupSize > 0
        ? Array.from(
            {
              length: Math.floor(objects.length / groupSize),
            },
            (_, index) => `LEFTOVER_GROUP_${index + 1}`,
          )
        : [],
    [objects.length, groupSize],
  );

  /*
   * A stable semantic key prevents a parent rerender from
   * resetting placed objects. Include icon data too, so a
   * genuinely changed question is recognized.
   */
  const resetKey = [
    questionKey,
    questionType,
    itemsPerGroup,
    groupSize,
    objects.map((item) => `${item.id}:${item.icon ?? ""}`).join(","),
    recipientIds.join(","),
    equalGroupIds.join(","),
    leftoverGroupIds.join(","),
    groups
      .map(
        (group) =>
          `${group.id}:${group.objects
            .map((item) => `${item.id}:${item.icon ?? ""}`)
            .join(",")}`,
      )
      .join("|"),
  ].join("::");

  const [selectedObjectId, setSelectedObjectId] =
    useState<string | null>(null);

  const [recipientAssignments, setRecipientAssignments] =
    useState<ObjectBuckets>(() => emptyBuckets(recipientIds));

  const [equalAssignments, setEqualAssignments] =
    useState<ObjectBuckets>(() => emptyBuckets(equalGroupIds));

  const [leftoverAssignments, setLeftoverAssignments] =
    useState<ObjectBuckets>(() =>
      emptyBuckets([...leftoverGroupIds, "LEFTOVER"]),
    );

  const [unfairGroups, setUnfairGroups] =
    useState<DivisionGroup[]>(() =>
      groups.map((group) => ({
        ...group,
        objects: [...group.objects],
      })),
    );

  /*
   * Reset only when the question data changes.
   * Do not rearrange objects when showAnswers changes.
   */
  useEffect(() => {
    draggedObjectRef.current = null;
    setSelectedObjectId(null);

    setRecipientAssignments(emptyBuckets(recipientIds));
    setEqualAssignments(emptyBuckets(equalGroupIds));
    setLeftoverAssignments(
      emptyBuckets([...leftoverGroupIds, "LEFTOVER"]),
    );

    setUnfairGroups(
      groups.map((group) => ({
        ...group,
        objects: [...group.objects],
      })),
    );

    // resetKey captures the semantic question data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const answerMatchesBackend =
    hasAnswer && answerMatches(answer, correctAnswers);

  const selectObject = (id: string) => {
    if (!showAnswers) {
      setSelectedObjectId(id);
    }
  };

  const renderObject = (item: DivisionObject) => (
    <AnimatedObject
      key={item.id}
      item={item}
      questionKey={questionKey}
      selected={selectedObjectId === item.id}
      disabled={showAnswers}
      draggedObjectRef={draggedObjectRef}
      onSelect={selectObject}
    />
  );

  const resetInteraction = () => {
    if (showAnswers) {
      return;
    }

    draggedObjectRef.current = null;
    setSelectedObjectId(null);

    setRecipientAssignments(emptyBuckets(recipientIds));
    setEqualAssignments(emptyBuckets(equalGroupIds));
    setLeftoverAssignments(
      emptyBuckets([...leftoverGroupIds, "LEFTOVER"]),
    );

    setUnfairGroups(
      groups.map((group) => ({
        ...group,
        objects: [...group.objects],
      })),
    );

    onAnswerChange("");
  };

  const ResetButton = () => (
    <button
      type="button"
      className="division-sharing-question__reset"
      disabled={showAnswers}
      onClick={resetInteraction}
    >
      <RotateCcw size={14} aria-hidden="true" />
      Reset
    </button>
  );

  /* =======================================================
     1. SHARE EQUALLY
  ======================================================= */

  if (questionType === "DIVISION_SHARE_EQUALLY") {
    const pool = unassignedObjects(objects, recipientAssignments);

    const placedCount =
      assignedObjects(recipientAssignments).length;

    const counts = recipientIds.map(
      (id) => recipientAssignments[id]?.length ?? 0,
    );

    const layoutCorrect =
      allObjectsAssigned(objects, recipientAssignments) &&
      counts.length > 0 &&
      counts.every((count) => count === counts[0]);

    const isCorrect = answerMatchesBackend && layoutCorrect;

    const assignRecipient = (
      objectId: string,
      recipientId: string,
    ) => {
      if (showAnswers || !recipientIds.includes(recipientId)) {
        return;
      }

      const item = objects.find((object) => object.id === objectId);

      if (!item) {
        return;
      }

      const next = removeFromBuckets(
        recipientAssignments,
        objectId,
      );

      next[recipientId] = [
        ...(next[recipientId] ?? []),
        item,
      ];

      setRecipientAssignments(next);
      setSelectedObjectId(null);

      const nextCounts = recipientIds.map(
        (id) => next[id]?.length ?? 0,
      );

      const balanced =
        allObjectsAssigned(objects, next) &&
        nextCounts.length > 0 &&
        nextCounts.every((count) => count === nextCounts[0]);

      onAnswerChange(balanced ? String(nextCounts[0]) : "");
    };

    const returnToPool = (objectId: string) => {
      if (showAnswers) {
        return;
      }

      setRecipientAssignments((current) =>
        removeFromBuckets(current, objectId),
      );

      setSelectedObjectId(null);
      onAnswerChange("");
    };

    return (
      <LayoutGroup id={`division-sharing-${questionKey}`}>
        <section className="generated-question division-sharing-question">
          <header className="division-sharing-question__heading">
            <span className="division-sharing-question__eyebrow">
              {details.puzzleTitle || "Share Fairly"}
            </span>

            <h3 className="generated-question__text division-sharing-question__prompt">
              {question.questionText}
            </h3>
          </header>

          <div className="division-sharing-question__help-row">
            <p className="division-sharing-question__help">
              Drag an object into a basket, or tap an object and then
              tap the basket where it belongs.
            </p>

            <ResetButton />
          </div>

          <div className="division-sharing-question__paper">
            <div className="division-sharing-question__section-title">
              Share the objects

              <span className="division-sharing-question__status-count">
                {placedCount}/{objects.length} placed
              </span>
            </div>

            <ObjectPool
              items={pool}
              selectedObjectId={selectedObjectId}
              showAnswers={showAnswers}
              draggedObjectRef={draggedObjectRef}
              onSelectObject={selectObject}
              onReturnObject={returnToPool}
            />

            <div className="division-sharing-question__section-title">
              Give each recipient an equal share
            </div>

            <div className="division-sharing-question__recipient-grid">
              {recipients.map((recipient, index) => {
                const items =
                  recipientAssignments[recipient.id] ?? [];

                const handleBasketDrop = (
                  event: ReactDragEvent<HTMLDivElement>,
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (showAnswers) {
                    return;
                  }

                  const objectId = getDraggedObjectId(
                    event,
                    draggedObjectRef,
                    selectedObjectId,
                  );

                  if (objectId) {
                    assignRecipient(objectId, recipient.id);
                  }
                };

                return (
                  <div
                    key={recipient.id}
                    className={[
                      "division-sharing-question__recipient",
                      selectedObjectId
                        ? "division-sharing-question__recipient--ready"
                        : "",
                    ].join(" ")}
                    role="group"
                    tabIndex={0}
                    aria-label={`Recipient ${index + 1}`}
                    onClick={() => {
                      if (selectedObjectId) {
                        assignRecipient(
                          selectedObjectId,
                          recipient.id,
                        );
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        selectedObjectId &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();

                        assignRecipient(
                          selectedObjectId,
                          recipient.id,
                        );
                      }
                    }}
                  >
                    <strong className="division-sharing-question__recipient-label">
                      Recipient {index + 1}
                    </strong>

                    <div
                      className="division-sharing-question__recipient-basket"
                      onDragOver={(event) => {
                        allowObjectDrop(event, showAnswers);
                      }}
                      onDrop={handleBasketDrop}
                    >
                      <div className="division-sharing-question__basket-objects">
                        {items.map(renderObject)}
                      </div>

                      {items.length === 0 && (
                        <span className="division-sharing-question__basket-placeholder">
                          Drop here
                        </span>
                      )}
                    </div>

                    <span className="division-sharing-question__recipient-count">
                      {items.length} object{items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
            </div>

            {layoutCorrect && (
              <motion.div
                className="division-sharing-question__progress division-sharing-question__progress--success"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check size={17} aria-hidden="true" />
                All recipients have equal shares.
              </motion.div>
            )}
          </div>

          <DivisionAnswer
            answer={answer}
            correctAnswer={correctAnswer}
            showAnswers={showAnswers}
            isCorrect={isCorrect}
            onAnswerChange={onAnswerChange}
            answerId={`division-answer-${questionKey}`}
            label="How many objects does each recipient get?"
          />
        </section>
      </LayoutGroup>
    );
  }

  /* =======================================================
     2. MAKE EQUAL GROUPS
  ======================================================= */

  if (questionType === "DIVISION_MAKE_EQUAL_GROUPS") {
    const pool = unassignedObjects(objects, equalAssignments);

    const placedCount = assignedObjects(equalAssignments).length;

    const layoutCorrect =
      allObjectsAssigned(objects, equalAssignments) &&
      equalGroupIds.length > 0 &&
      equalGroupIds.every(
        (id) =>
          (equalAssignments[id]?.length ?? 0) === itemsPerGroup,
      );

    const isCorrect = answerMatchesBackend && layoutCorrect;

    const assignGroup = (
      objectId: string,
      groupId: string,
    ) => {
      if (
        showAnswers ||
        !equalGroupIds.includes(groupId) ||
        itemsPerGroup <= 0
      ) {
        return;
      }

      const item = objects.find((object) => object.id === objectId);

      if (!item) {
        return;
      }

      const next = removeFromBuckets(equalAssignments, objectId);

      if ((next[groupId] ?? []).length >= itemsPerGroup) {
        return;
      }

      next[groupId] = [...(next[groupId] ?? []), item];

      setEqualAssignments(next);
      setSelectedObjectId(null);

      const allGroupsFull =
        equalGroupIds.length > 0 &&
        equalGroupIds.every(
          (id) =>
            (next[id]?.length ?? 0) === itemsPerGroup,
        );

      onAnswerChange(
        allGroupsFull && allObjectsAssigned(objects, next)
          ? String(equalGroupIds.length)
          : "",
      );
    };

    const returnToPool = (objectId: string) => {
      if (showAnswers) {
        return;
      }

      setEqualAssignments((current) =>
        removeFromBuckets(current, objectId),
      );

      setSelectedObjectId(null);
      onAnswerChange("");
    };

    return (
      <LayoutGroup id={`division-sharing-${questionKey}`}>
        <section className="generated-question division-sharing-question">
          <header className="division-sharing-question__heading">
            <span className="division-sharing-question__eyebrow">
              {details.puzzleTitle || "Make Equal Groups"}
            </span>

            <h3 className="generated-question__text division-sharing-question__prompt">
              {question.questionText}
            </h3>
          </header>

          <div className="division-sharing-question__help-row">
            <p className="division-sharing-question__help">
              Put exactly {itemsPerGroup} objects in each group.
              Drag objects into the group or select an object first.
            </p>

            <ResetButton />
          </div>

          <div className="division-sharing-question__paper">
            <div className="division-sharing-question__rule">
              <span>Objects</span>
              <strong>{objects.length}</strong>

              <span className="division-sharing-question__rule-divider">
                ÷
              </span>

              <span>Per group</span>
              <strong>{itemsPerGroup}</strong>

              <span className="division-sharing-question__rule-progress">
                {placedCount}/{objects.length} placed
              </span>
            </div>

            <ObjectPool
              items={pool}
              selectedObjectId={selectedObjectId}
              showAnswers={showAnswers}
              draggedObjectRef={draggedObjectRef}
              onSelectObject={selectObject}
              onReturnObject={returnToPool}
            />

            <div className="division-sharing-question__section-title">
              Complete groups
            </div>

            <div className="division-sharing-question__groups-grid">
              {equalGroupIds.map((groupId, index) => {
                const items = equalAssignments[groupId] ?? [];
                const full = items.length === itemsPerGroup;

                const handleGroupDrop = (
                  event: ReactDragEvent<HTMLDivElement>,
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (showAnswers) {
                    return;
                  }

                  const objectId = getDraggedObjectId(
                    event,
                    draggedObjectRef,
                    selectedObjectId,
                  );

                  if (objectId) {
                    assignGroup(objectId, groupId);
                  }
                };

                return (
                  <div
                    key={groupId}
                    className={[
                      "division-sharing-question__group",
                      full
                        ? "division-sharing-question__group--full"
                        : "",
                      selectedObjectId
                        ? "division-sharing-question__group--ready"
                        : "",
                    ].join(" ")}
                    role="group"
                    tabIndex={0}
                    aria-label={`Group ${index + 1}: ${items.length} of ${itemsPerGroup} objects`}
                    onClick={() => {
                      if (selectedObjectId) {
                        assignGroup(selectedObjectId, groupId);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        selectedObjectId &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        assignGroup(selectedObjectId, groupId);
                      }
                    }}
                    onDragOver={(event) => {
                      allowObjectDrop(event, showAnswers);
                    }}
                    onDrop={handleGroupDrop}
                  >
                    <div className="division-sharing-question__group-heading">
                      <span>{index + 1}</span>
                      <strong>Group {index + 1}</strong>
                    </div>

                    <div className="division-sharing-question__capacity">
                      {Array.from(
                        { length: itemsPerGroup },
                        (_, slotIndex) => {
                          const item = items[slotIndex];

                          return (
                            <div
                              key={`${groupId}-slot-${slotIndex}`}
                              className={[
                                "division-sharing-question__capacity-slot",
                                item
                                  ? "division-sharing-question__capacity-slot--filled"
                                  : "",
                              ].join(" ")}
                              aria-label={
                                item
                                  ? `Occupied slot ${slotIndex + 1}`
                                  : `Empty slot ${slotIndex + 1}`
                              }
                            >
                              {item ? (
                                renderObject(item)
                              ) : (
                                <span className="division-sharing-question__slot-dot">
                                  +
                                </span>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>

                    <span className="division-sharing-question__group-count">
                      {items.length}/{itemsPerGroup} objects
                    </span>
                  </div>
                );
              })}
            </div>

            {layoutCorrect && (
              <motion.div
                className="division-sharing-question__progress division-sharing-question__progress--success"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check size={17} aria-hidden="true" />
                Every group has exactly {itemsPerGroup} objects.
              </motion.div>
            )}
          </div>

          <DivisionAnswer
            answer={answer}
            correctAnswer={correctAnswer}
            showAnswers={showAnswers}
            isCorrect={isCorrect}
            onAnswerChange={onAnswerChange}
            answerId={`division-answer-${questionKey}`}
            label="How many complete groups can you make?"
          />
        </section>
      </LayoutGroup>
    );
  }

  /* =======================================================
     3. FIX THE UNFAIR SHARE
  ======================================================= */

  if (questionType === "DIVISION_FIX_UNFAIR_SHARE") {
    const originalSourceCount =
      groups.find((group) => group.id === details.moveFrom)
        ?.objects.length ?? 0;

    const sourceGroup = unfairGroups.find(
      (group) => group.id === details.moveFrom,
    );

    const targetGroup = unfairGroups.find(
      (group) => group.id === details.moveTo,
    );

    const layoutCorrect =
      !!sourceGroup &&
      !!targetGroup &&
      sourceGroup.objects.length === targetGroup.objects.length;

    const isCorrect = answerMatchesBackend && layoutCorrect;

    const moveObject = (objectId: string) => {
      if (
        showAnswers ||
        !details.moveFrom ||
        !details.moveTo
      ) {
        return;
      }

      const source = unfairGroups.find(
        (group) => group.id === details.moveFrom,
      );

      const target = unfairGroups.find(
        (group) => group.id === details.moveTo,
      );

      if (
        !source ||
        !target ||
        source.objects.length <= target.objects.length
      ) {
        return;
      }

      const movingObject = source.objects.find(
        (item) => item.id === objectId,
      );

      if (!movingObject) {
        return;
      }

      const next = unfairGroups.map((group) => {
        if (group.id === source.id) {
          return {
            ...group,
            objects: group.objects.filter(
              (item) => item.id !== objectId,
            ),
          };
        }

        if (group.id === target.id) {
          return {
            ...group,
            objects: [...group.objects, movingObject],
          };
        }

        return group;
      });

      setUnfairGroups(next);
      setSelectedObjectId(null);

      const newSourceCount =
        next.find((group) => group.id === details.moveFrom)
          ?.objects.length ?? 0;

      onAnswerChange(
        String(originalSourceCount - newSourceCount),
      );
    };

    const resetUnfair = () => {
      if (showAnswers) {
        return;
      }

      draggedObjectRef.current = null;
      setSelectedObjectId(null);

      setUnfairGroups(
        groups.map((group) => ({
          ...group,
          objects: [...group.objects],
        })),
      );

      onAnswerChange("");
    };

    return (
      <LayoutGroup id={`division-sharing-${questionKey}`}>
        <section className="generated-question division-sharing-question">
          <header className="division-sharing-question__heading">
            <span className="division-sharing-question__eyebrow">
              {details.puzzleTitle || "Fix the Unfair Share"}
            </span>

            <h3 className="generated-question__text division-sharing-question__prompt">
              {question.questionText}
            </h3>
          </header>

          <div className="division-sharing-question__help-row">
            <p className="division-sharing-question__help">
              Move one object at a time from the larger group to the
              smaller group until both have equal counts.
            </p>

            <button
              type="button"
              className="division-sharing-question__reset"
              disabled={showAnswers}
              onClick={resetUnfair}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="division-sharing-question__paper">
            <div className="division-sharing-question__unfair-layout">
              {sourceGroup && (
                <div className="division-sharing-question__unfair-group division-sharing-question__unfair-group--source">
                  <span className="division-sharing-question__unfair-tag">
                    Larger group
                  </span>

                  <strong className="division-sharing-question__unfair-name">
                    {sourceGroup.childLabel || "Child A"}
                  </strong>

                  <span className="division-sharing-question__unfair-count">
                    {sourceGroup.objects.length} objects
                  </span>

                  <div className="division-sharing-question__unfair-basket">
                    <div className="division-sharing-question__basket-objects">
                      {sourceGroup.objects.map(renderObject)}
                    </div>
                  </div>

                  <span className="division-sharing-question__unfair-hint">
                    Select an object to move
                  </span>
                </div>
              )}

              <motion.div
                className="division-sharing-question__move-arrow"
                animate={
                  layoutCorrect ? { x: 0 } : { x: [0, 3, 0] }
                }
                transition={{
                  duration: 1.15,
                  repeat: layoutCorrect ? 0 : Infinity,
                }}
                aria-hidden="true"
              >
                →
              </motion.div>

              {targetGroup && (
                <div
                  className={[
                    "division-sharing-question__unfair-group",
                    "division-sharing-question__unfair-group--target",
                    selectedObjectId
                      ? "division-sharing-question__unfair-group--ready"
                      : "",
                  ].join(" ")}
                  role="group"
                  tabIndex={0}
                  aria-label="Smaller group. Drop the moved object here."
                  onClick={() => {
                    if (selectedObjectId) {
                      moveObject(selectedObjectId);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      selectedObjectId &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      moveObject(selectedObjectId);
                    }
                  }}
                  onDragOver={(event) => {
                    allowObjectDrop(event, showAnswers);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (showAnswers) {
                      return;
                    }

                    const objectId = getDraggedObjectId(
                      event,
                      draggedObjectRef,
                      selectedObjectId,
                    );

                    if (objectId) {
                      moveObject(objectId);
                    }
                  }}
                >
                  <span className="division-sharing-question__unfair-tag">
                    Smaller group
                  </span>

                  <strong className="division-sharing-question__unfair-name">
                    {targetGroup.childLabel || "Child B"}
                  </strong>

                  <span className="division-sharing-question__unfair-count">
                    {targetGroup.objects.length} objects
                  </span>

                  <div
                    className="division-sharing-question__unfair-basket"
                    onDragOver={(event) => {
                      allowObjectDrop(event, showAnswers);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      if (showAnswers) {
                        return;
                      }

                      const objectId = getDraggedObjectId(
                        event,
                        draggedObjectRef,
                        selectedObjectId,
                      );

                      if (objectId) {
                        moveObject(objectId);
                      }
                    }}
                  >
                    <div className="division-sharing-question__basket-objects">
                      {targetGroup.objects.map((item) => (
                        <AnimatedObject
                          key={item.id}
                          item={item}
                          questionKey={questionKey}
                          selected={false}
                          disabled={true}
                          draggedObjectRef={draggedObjectRef}
                          onSelect={selectObject}
                        />
                      ))}
                    </div>

                    {targetGroup.objects.length === 0 && (
                      <span className="division-sharing-question__basket-placeholder">
                        Drop here
                      </span>
                    )}
                  </div>

                  <span className="division-sharing-question__unfair-hint">
                    Drop the moved object here
                  </span>
                </div>
              )}
            </div>

            <div
              className={[
                "division-sharing-question__balance-status",
                layoutCorrect
                  ? "division-sharing-question__balance-status--success"
                  : "",
              ].join(" ")}
            >
              {layoutCorrect ? (
                <>
                  <Check size={17} aria-hidden="true" />
                  Both groups now have equal shares.
                </>
              ) : (
                "Move objects until both groups have equal counts."
              )}
            </div>
          </div>

          <DivisionAnswer
            answer={answer}
            correctAnswer={correctAnswer}
            showAnswers={showAnswers}
            isCorrect={isCorrect}
            onAnswerChange={onAnswerChange}
            answerId={`division-answer-${questionKey}`}
            label="How many objects must be moved?"
          />
        </section>
      </LayoutGroup>
    );
  }

  /* =======================================================
     4. FIND THE LEFTOVER
  ======================================================= */

  if (questionType === "DIVISION_FIND_LEFTOVER") {
    const pool = unassignedObjects(objects, leftoverAssignments);

    const placedCount =
      assignedObjects(leftoverAssignments).length;

    const leftovers = leftoverAssignments.LEFTOVER ?? [];

    const groupsFull =
      leftoverGroupIds.length > 0 &&
      leftoverGroupIds.every(
        (id) =>
          (leftoverAssignments[id]?.length ?? 0) === groupSize,
      );

    const layoutCorrect =
      allObjectsAssigned(objects, leftoverAssignments) &&
      groupsFull;

    const isCorrect = answerMatchesBackend && layoutCorrect;

    const assignToArea = (
      objectId: string,
      areaId: string,
    ) => {
      if (showAnswers) {
        return;
      }

      const item = objects.find((object) => object.id === objectId);

      if (!item) {
        return;
      }

      const validArea =
        areaId === "LEFTOVER" ||
        leftoverGroupIds.includes(areaId);

      if (!validArea) {
        return;
      }

      const next = removeFromBuckets(
        leftoverAssignments,
        objectId,
      );

      if (areaId !== "LEFTOVER") {
        if (groupSize <= 0) {
          return;
        }

        if ((next[areaId] ?? []).length >= groupSize) {
          return;
        }
      }

      next[areaId] = [...(next[areaId] ?? []), item];

      setLeftoverAssignments(next);
      setSelectedObjectId(null);

      const completeGroups =
        leftoverGroupIds.length > 0 &&
        leftoverGroupIds.every(
          (id) => (next[id]?.length ?? 0) === groupSize,
        );

      const everyObjectPlaced =
        allObjectsAssigned(objects, next);

      onAnswerChange(
        everyObjectPlaced && completeGroups
          ? String(next.LEFTOVER?.length ?? 0)
          : "",
      );
    };

    const returnToPool = (objectId: string) => {
      if (showAnswers) {
        return;
      }

      setLeftoverAssignments((current) =>
        removeFromBuckets(current, objectId),
      );

      setSelectedObjectId(null);
      onAnswerChange("");
    };

    return (
      <LayoutGroup id={`division-sharing-${questionKey}`}>
        <section className="generated-question division-sharing-question">
          <header className="division-sharing-question__heading">
            <span className="division-sharing-question__eyebrow">
              {details.puzzleTitle || "Find the Leftover"}
            </span>

            <h3 className="generated-question__text division-sharing-question__prompt">
              {question.questionText}
            </h3>
          </header>

          <div className="division-sharing-question__help-row">
            <p className="division-sharing-question__help">
              Fill every group with exactly {groupSize} objects. Put
              only the objects that cannot make a complete group in
              the leftover area.
            </p>

            <ResetButton />
          </div>

          <div className="division-sharing-question__paper">
            <div className="division-sharing-question__rule">
              <span>All objects</span>
              <strong>{objects.length}</strong>

              <span className="division-sharing-question__rule-divider">
                ÷
              </span>

              <span>Per group</span>
              <strong>{groupSize}</strong>

              <span className="division-sharing-question__rule-progress">
                {placedCount}/{objects.length} placed
              </span>
            </div>

            <ObjectPool
              items={pool}
              selectedObjectId={selectedObjectId}
              showAnswers={showAnswers}
              draggedObjectRef={draggedObjectRef}
              onSelectObject={selectObject}
              onReturnObject={returnToPool}
            />

            <div className="division-sharing-question__section-title">
              Complete groups
            </div>

            <div className="division-sharing-question__groups-grid">
              {leftoverGroupIds.map((groupId, index) => {
                const items = leftoverAssignments[groupId] ?? [];
                const full = items.length === groupSize;

                const handleGroupDrop = (
                  event: ReactDragEvent<HTMLDivElement>,
                ) => {
                  event.preventDefault();
                  event.stopPropagation();

                  if (showAnswers) {
                    return;
                  }

                  const objectId = getDraggedObjectId(
                    event,
                    draggedObjectRef,
                    selectedObjectId,
                  );

                  if (objectId) {
                    assignToArea(objectId, groupId);
                  }
                };

                return (
                  <div
                    key={groupId}
                    className={[
                      "division-sharing-question__group",
                      full
                        ? "division-sharing-question__group--full"
                        : "",
                      selectedObjectId
                        ? "division-sharing-question__group--ready"
                        : "",
                    ].join(" ")}
                    role="group"
                    tabIndex={0}
                    aria-label={`Group ${index + 1}: ${items.length} of ${groupSize} objects`}
                    onClick={() => {
                      if (selectedObjectId) {
                        assignToArea(selectedObjectId, groupId);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        selectedObjectId &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        assignToArea(selectedObjectId, groupId);
                      }
                    }}
                    onDragOver={(event) => {
                      allowObjectDrop(event, showAnswers);
                    }}
                    onDrop={handleGroupDrop}
                  >
                    <div className="division-sharing-question__group-heading">
                      <span>{index + 1}</span>
                      <strong>Group {index + 1}</strong>
                    </div>

                    <div className="division-sharing-question__capacity">
                      {Array.from(
                        { length: groupSize },
                        (_, slotIndex) => {
                          const item = items[slotIndex];

                          return (
                            <div
                              key={`${groupId}-slot-${slotIndex}`}
                              className={[
                                "division-sharing-question__capacity-slot",
                                item
                                  ? "division-sharing-question__capacity-slot--filled"
                                  : "",
                              ].join(" ")}
                              aria-label={
                                item
                                  ? `Occupied slot ${slotIndex + 1}`
                                  : `Empty slot ${slotIndex + 1}`
                              }
                            >
                              {item ? (
                                renderObject(item)
                              ) : (
                                <span className="division-sharing-question__slot-dot">
                                  +
                                </span>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>

                    <span className="division-sharing-question__group-count">
                      {items.length}/{groupSize} objects
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className={[
                "division-sharing-question__leftover",
                selectedObjectId
                  ? "division-sharing-question__leftover--ready"
                  : "",
              ].join(" ")}
              role="group"
              tabIndex={0}
              aria-label="Leftover objects drop area"
              onClick={() => {
                if (selectedObjectId) {
                  assignToArea(selectedObjectId, "LEFTOVER");
                }
              }}
              onKeyDown={(event) => {
                if (
                  selectedObjectId &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  assignToArea(selectedObjectId, "LEFTOVER");
                }
              }}
              onDragOver={(event) => {
                allowObjectDrop(event, showAnswers);
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (showAnswers) {
                  return;
                }

                const objectId = getDraggedObjectId(
                  event,
                  draggedObjectRef,
                  selectedObjectId,
                );

                if (objectId) {
                  assignToArea(objectId, "LEFTOVER");
                }
              }}
            >
              <div className="division-sharing-question__leftover-heading">
                <span>?</span>
                <strong>Leftover objects</strong>

                <span className="division-sharing-question__leftover-count">
                  {leftovers.length}
                </span>
              </div>

              <div className="division-sharing-question__basket-objects">
                {leftovers.map(renderObject)}
              </div>

              {leftovers.length === 0 && (
                <span className="division-sharing-question__basket-placeholder">
                  Drop remaining objects here
                </span>
              )}
            </div>

            {layoutCorrect && (
              <motion.div
                className="division-sharing-question__progress division-sharing-question__progress--success"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Check size={17} aria-hidden="true" />
                Every object is accounted for.
              </motion.div>
            )}
          </div>

          <DivisionAnswer
            answer={answer}
            correctAnswer={correctAnswer}
            showAnswers={showAnswers}
            isCorrect={isCorrect}
            onAnswerChange={onAnswerChange}
            answerId={`division-answer-${questionKey}`}
            label="How many objects are left over?"
          />
        </section>
      </LayoutGroup>
    );
  }

  return (
    <section className="generated-question division-sharing-question">
      <h3 className="generated-question__text">
        {question.questionText}
      </h3>

      <p className="division-sharing-question__unsupported">
        Unsupported early division question type:{" "}
        {questionType || "Unknown"}
      </p>
    </section>
  );
}