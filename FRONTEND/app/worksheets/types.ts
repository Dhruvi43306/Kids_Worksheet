
export interface Difficulty {
  difficultyId: number;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

export interface VisualStyle {
  visualStyleId: number;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface QuestionCountOption {
  questionCountOptionId: number;
  questionCount: number;
}

export interface TopicLevelConfiguration {
  topicLevelConfigurationId: number;
  topicId: number;
  levelId: number;
  minNumber: number | null;
  maxNumber: number | null;
  isActive: boolean;
}

export interface WorksheetConfig {
  topicId: number;
  levelId: number;
  categoryId:number | null;
  difficultyId: number | null;
  questionCountOptionId: number | null;
  visualStyleId: number | null;
  questionTypeIds: number[];
}

export interface WorksheetTopic {
  topicId: number;
  subjectId: number;
  topicName: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export interface LearningLevel {
  levelId: number;
  levelName: string;
  description?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  displayOrder?: number | null;
  isActive?: boolean;
}

export interface WorksheetCategory {
  worksheetCategoryId: number;
  topicId?: number;
  categoryName: string;
  code: string;
  description?: string | null;
  displayorder: number;
  isActive?: boolean;
  questionTypes: QuestionType[];
}
export interface QuestionType {
  questionTypeId: number;
  typeName: string;
  description?: string;
  worksheetCategoryId: number;
}

export interface WorksheetCategory {
  worksheetCategoryId: number;
  categoryName: string;
  code: string;
  description?: string | null;
  displayorder: number;
  questionTypes: QuestionType[];
}


