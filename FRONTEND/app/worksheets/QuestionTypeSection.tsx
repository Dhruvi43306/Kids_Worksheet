
import { motion } from "framer-motion";
import { WorksheetCategory } from "./types";

interface QuestionTypeUI {
  icon: string;
}

interface Props {
  categories: WorksheetCategory[];
  selectedIds: number[];
  ui: QuestionTypeUI[];
  onSelectionChange: (ids: number[]) => void;
}

export default function QuestionTypeSection({
  categories,
  selectedIds,
  ui,
  onSelectionChange,
}: Props) {
  let uiIndex = 0;

  // Get all question type IDs from all categories.
  const allQuestionTypeIds = [
    ...new Set(
      categories.flatMap((category) =>
        category.questionTypes.map((item) => item.questionTypeId)
      )
    ),
  ];

  // Check whether all question types are selected.
  const allSelected =
    allQuestionTypeIds.length > 0 &&
    allQuestionTypeIds.every((id) => selectedIds.includes(id));

  // Select or deselect an individual question type.
  const handleToggleQuestionType = (id: number) => {
    const updatedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    onSelectionChange(updatedIds);
  };

  // Select all question types.
  const handleSelectAll = () => {
    onSelectionChange(allQuestionTypeIds);
  };

  // Clear all question types.
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // Select or clear question types inside one category.
  const handleCategorySelection = (category: WorksheetCategory) => {
    const categoryIds = category.questionTypes.map(
      (item) => item.questionTypeId
    );

    const categoryAllSelected =
      categoryIds.length > 0 &&
      categoryIds.every((id) => selectedIds.includes(id));

    const updatedIds = categoryAllSelected
      ? selectedIds.filter((id) => !categoryIds.includes(id))
      : [
          ...new Set([
            ...selectedIds,
            ...categoryIds,
          ]),
        ];

    onSelectionChange(updatedIds);
  };

  return (
    <div className="wg__section">
      <div className="wg__section-head">
        <h3 className="wg__section-title">
          What to Practise
        </h3>
      </div>

      <p className="wg__section-hint">
        Choose one or more activities for this level.
      </p>

      {categories.length === 0 ? (
        <div className="wg__empty">
          <div className="wg__empty-icon">📚</div>

          <h4>More practice is coming soon</h4>

          <p>
            We don't have activities configured for this level yet.
          </p>
        </div>
      ) : (
        <>
          {/* Overall selection controls */}
          <div className="qtype-selection-toolbar">
            <div className="qtype-selection-toolbar__info">
              <span>
                {selectedIds.length} of {allQuestionTypeIds.length} selected
              </span>
            </div>

            <div className="qtype-selection-toolbar__actions">
              <button
                type="button"
                className="qtype-selection-toolbar__button"
                onClick={handleSelectAll}
                disabled={allSelected}
              >
                Select All
              </button>

              <button
                type="button"
                className="qtype-selection-toolbar__button qtype-selection-toolbar__button--clear"
                onClick={handleClearAll}
                disabled={selectedIds.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="worksheet-category-list">
            {categories.map((category) => {
              const categoryIds = category.questionTypes.map(
                (item) => item.questionTypeId
              );

              const categorySelectedCount = categoryIds.filter(
                (id) => selectedIds.includes(id)
              ).length;

              const categoryAllSelected =
                categoryIds.length > 0 &&
                categorySelectedCount === categoryIds.length;

              return (
                <div
                  key={category.worksheetCategoryId}
                  className="worksheet-category"
                >
                  <div className="worksheet-category__header">
                    <h4>{category.categoryName}</h4>

                    {category.description && (
                      <p>{category.description}</p>
                    )}
                  </div>

                  {/* Category selection controls */}
                  <div className="qtype-category-toolbar">
                    <span className="qtype-category-toolbar__count">
                      {categoryIds.length} activities
                      {categorySelectedCount > 0 && (
                        <span className="qtype-category-toolbar__selected">
                          {categorySelectedCount} selected
                        </span>
                      )}
                    </span>

                    <button
                      type="button"
                      className="qtype-category-toolbar__button"
                      onClick={() => handleCategorySelection(category)}
                      disabled={categoryIds.length === 0}
                    >
                      {categoryAllSelected
                        ? "Clear Selection"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="qtype-grid">
                    {category.questionTypes.map((item) => {
                      const selected = selectedIds.includes(
                        item.questionTypeId
                      );

                      const currentUI =
                        ui.length > 0
                          ? ui[uiIndex++ % ui.length]
                          : undefined;

                      return (
                        <motion.button
                          key={item.questionTypeId}
                          type="button"
                          className={`qtype-card${
                            selected ? " qtype-card--selected" : ""
                          }`}
                          onClick={() =>
                            handleToggleQuestionType(item.questionTypeId)
                          }
                          aria-pressed={selected}
                        >
                          <span className="qtype-card__icon">
                            {currentUI?.icon ?? "⭐"}
                          </span>

                          <span className="qtype-card__label">
                            {item.typeName}
                          </span>

                          <span
                            className={`qtype-card__selection-indicator${
                              selected
                                ? " qtype-card__selection-indicator--selected"
                                : ""
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
