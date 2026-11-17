export interface QuestionData {
  questionType?: string;
  visualType?: string;
  visualStyleId?: number;
  number?: number;
  numbers?: number[];
  count?: number;
  icon?: string;
  icons?: string[];
  firstGroup?: string[];
  secondGroup?: string[];
  extraGroup?: string[];
  extraValue?: number;
  firstcount?: number;
  secondcount?: number;
  firstDice?: number;
  secondDice?: number;
  firstHand?: number;
  secondHand?: number;
  knowncount?: number;
  totalcount?: number;
  missingcount?: number;
  objects?: string[];
  missing?: boolean;
  option?: number[];
  operatorSymbol?: string;
  statement?: string;
  options?: Array<string | number>;
  numberLineOptions?: NumberLineOption[];
  selectionMode?: "single" | "multiple" | "input";
  direction?: string;
  missingIndex?: number;
  pairs?: Array<{
    number: number;
    answer: string;
  }>;
  numberLine?: {
    min: number;
    max: number;
  };
  firstNumber?: number;
  secondNumber?: number;
  correctTotal?: number;
  displayedTotal?: number;
  equation?: string;
  total?: number;
  bridgeAmount?: number;
  reaminingAmmount?: number;

  tenFrame?: Array<{
    index: number;
    filled: boolean;
    group: string;
  }>;
  questionMode?: "findTotal" | "findStart" | "findHops";
  showPath?: boolean;
  allowDrawing?: boolean;
  drawingType?: string;
  answerType?: string;
  firstJump?: number;
  secondJump?: number;
  intermediate?: number;
  jumps?: Array<{
    start: number;
    end: number;
    size: number;
  }>;
  leftPart?: number | null;
  rightPart?: number | null;
  missingPosition?:
    | "left"
    | "right"
    | "body"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    |"channelAlpha"
    |"channelBeta"
  currentNumber?: number;
  target?: number;
  missingAmount?: number;
  difficulty?: string;
  correctDouble?: number;
  startNumber?: number;
  steps?: number[];
  stepCount?: number;
  answer?: number;
  fixedRule?: number;
  cards?: number[];
  answers?: number[];
  cardcount?: number;
  finalTotal?: number;
  onPathCount?: number;
  offPathCount?: number;
  onPathobjects?: string[];
  offPathobjects?: string[];
  movingcount?: number;
  stillcount?: number;
  movingObject?: string[];
  stillObject?: string[];
  movingHasMotionLines?: boolean;
  stillHasMotionLines?: boolean;
  finalEquation?: string;
  example?: {
    show: boolean;
    title: string;
    instruction: string;
    onPath: number;
    offPath: number;
    equation: string;
    answer: number;
  };
  chainLength?: number;
  startingDots?: number;
  dominoes?: Array<{
    dominoNumber?: number;
    leftDots?: number | null;
    expectedLeftDots?: number;
    isBlankLeft?: boolean;
    firstNumber?: number;
    secondNumber?: number;
    total?: number;
    equation?: string;
    operatorSymbol?: string;
    interactionType?: string;
  }>;
  leftBottom?: {
    first?: number | null;
    second?: number | null;
  };

  rightBottom?: {
    first?: number | null;
    second?: number | null;
  };
  whole?: number | null;

  completeTree?: {
    whole?: number;
    leftPart?: number;
    rightPart?: number;

    leftBottom?: {
      first?: number;
      second?: number;
    };

    rightBottom?: {
      first?: number;
      second?: number;
    };
  };

  missingNods?: string;
  explanation?: string;
  topLeft?: number | null;

  topRight?: number | null;

  bottomLeft?: number | null;

  bottomRight?: number | null;

  completeSpider?: {
    body?: number;
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
  };
completeSeesaw?: {
  topLeft?: number;
  bottomLeft?: number;
  total?: number;
  topRight?: number;
  bottomRight?: number;
};
  left?: {
    topBlocks?: number | null;
    bottomBlocks?: number | null;
    total?: number | null;
  };

  right?: {
    topBlocks?: number | null;
    bottomBlocks?: number | null;
    total?: number | null;
  };
  firstTensGroup?: string[];
firstOnesGroup?: string[];
secondTensGroup?: string[];
secondOnesGroup?: string[];

tens?: {
  first: number;
  second: number;
  answer: number;
};

ones?: {
  first: number;
  second: number;
  answer: number;
};

  grid?: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };

  rows?: {
    top?: {
      first: number;
      second: number;
      total: number;
      equation: string;
    };

    bottom?: {
      first: number;
      second: number;
      total: number;
      equation: string;
    };
  };

  columns?: {
    left?: {
      first: number;
      second: number;
      total: number;
      equation: string;
    };

    right?: {
      first: number;
      second: number;
      total: number;
      equation: string;
    };
  };

  grandTotal?: {
    rowTotal: number;
    columnTotal: number;
    answer: number;
    equation: string;
    verification: string;
  };

  verification?: {
    rowsEqualColumns: boolean;
    rowGrandTotal: number;
    columnGrandTotal: number;
    equation: string;
  };
operation?: string;
completedEquation?: string;
result?: number;
numberCount?: number;
missingAddend?: boolean;
  format?: string;

  missingNumber?: number;

  firstTens?: number;
  secondTens?: number;
  totalTens?: number;

  unitNotation?: {
    firstTens: number;
    secondTens: number;
    totalTens: number;
    total: number;
  };

  vertical?: {
    top: number;
    bottom: number;
    answer?: number | null;
  };

  // Type 2
  knownPart?: number;
  missingPart?: number;

  balanceScale?: {
    left: {
      missing: boolean;
      known: number;
    };
    right: {
      first: number;
      second: number;
      total: number;
    };
  };

  partWhole?: {
    total: number;
    knownPart: number;
    missingPart?: number | null;
  };

  // Type 3
  thirdNumber?: number;

  groupTo100?: {
    first: number;
    second: number;
    pairTotal: number;
    remaining: number;
    equation: string;
  };

  sequentialJumps?: Array<{
    start: number;
    jump: number;
    end: number;
  }>;


  // Type 4
  knownNumbers?: number[];
  knownSum?: number;

  subTotalEquation?: string;

  // Type 5
  fourthNumber?: number;

  friendlyPairs?: {
    firstPair: {
      first: number;
      second: number;
      total: number;
    };
    secondPair: {
      first: number;
      second: number;
      total: number;
    };
    equation: string;
    total: number;
  };

  // Type 6
  simplifiedEquation?: string;

  rightSide?: {
    first: number;
    second: number;
    total: number;
  };

  // Type 7
  benchmark?: number;
  gap?: number;
  unitsNeeded?: number;

  // Type 8
  nextTen?: number;
  remainingAmount?: number;

  split?: {
    original: number;
    first: number;
    second: number;
    equation: string;
  };


  splitEquation?: string;
  step1?: string;
  step2?: string;

  firstHundreds?: number;
  secondHundreds?: number;
  thirdHundreds?: number;
  totalHundreds?: number;
  knownNumber?: number;
  fullLevelOne?: number;
  fullLevelTwo?: number;
  fullLevelThree?: number;
  boosterPower?: number;
  levels?: number[];
  stepOne?: number;
  currentValue?: number;
  goalValue?: number;
  distance?: number;

  filledBlocks?: number;
  emptyBlocks?: number;
  emptyValue?: number;

  pairFirst?: number;
  pairSecond?: number;
  remaining?: number;

  placeValueBlocks?: {
    firstFlats?: number;
    secondFlats?: number;
    thirdFlats?: number;
    totalFlats?: number;
    totalValue?: number;
  };

  currencyVault?: {
    firstBills?: number;
    secondBills?: number;
    thirdBills?: number;
    totalBills?: number;
    totalMoney?: number;
  };

  

  digitalProgressMeter?: {
    current?: number;
    goal?: number;
    distance?: number;
  };

  hundredsCountGap?: {
    currentHundreds?: number;
    goalHundreds?: number;
    missingHundreds?: number;
  };

  secretCodeLock?: {
    current?: number;
    goal?: number;
    missing?: number;
  };

  thousandMilestoneBridge?: {
    currentHundreds?: number;
    missingHundreds?: number;
    targetHundreds?: number;
  };

  thousandPointGauge?: {
    current?: number;
    target?: number;
    distance?: number;
  };

  tenFrameHundreds?: {
    totalBlocks?: number;
    filledBlocks?: number;
    emptyBlocks?: number;
    emptyValue?: number;
  };

  bossLevel1000?: {
    current?: number;
    goal?: number;
    missing?: number;
  };
known?: number;
currentProgress?: number;
goal?: number;

firstPair?: {
  first?: number;
  second?: number;
  total?: number;
};

fuelLevelOne?: number;
fuelLevelTwo?: number;

score?: number;
currentEnergy?: number;
targetEnergy?: number;
missingEnergy?: number;

currentHundreds?: number;
missingHundreds?: number;
targetHundreds?: number;

totalBlocks?: number;
blockValue?: number;

currentHP?: number;
targetHP?: number;
missingPower?: number;

firstBills?: number;
secondBills?: number;
totalBills?: number;
totalMoney?: number;

story?: string;
hundredsEquation?: string;
digitCount?: number;
carryCount?: number;
carryMode?: "withCarry" | "withoutCarry";

  channelAlpha?: {
    name?: string;
    symbol?: string;
    numbers?: Array<number | null>;
    subtotal?: number | null;
  };

  channelBeta?: {
    name?: string;
    symbol?: string;
    numbers?: Array<number | null>;
    subtotal?: number | null;
  } | Array<number | null>;

  mergeHub?: {
    label?: string;
    icon?: string;
  };

  systemLog?: {
    label?: string;
    target?: number;
  };
nodes?: Array<{
  id: string;
  label?: string;
  value?: string;
  actualValue?: number;
  isStart?: boolean;
  isMissing?: boolean;
}>;

finish?: {
  id?: string;
  label?: string;
  value?: string;
  actualValue?: number;
  isFinish?: boolean;
  isMissing?: boolean;
};

paths?: Array<{
  from?: string;
  to?: string;
  operation?: string;
  operationValue?: number;
  operationType?: "add" | "subtract";
  fromValue?: number;
  toValue?: number;
}>;

startNode?: string;
finishNode?: string;
nodeCount?: number;
operationCount?: number;
startValue?: number;
finalValue?: number;

};

export interface GeneratedQuestion {
  generatedQuestionId: number;
  questionNumber: number;
  questionTypeId: number;
  questionTypeCode?: string;
  questionTypeName?: string;
  rendererKey?: string;
  cssClass?: string;
  questionText: string;
  questionDataJson: string;
  correctAnswer: string;
  marks: number;
}

export interface GeneratedWorksheetResponse {
  generatedWorksheetId: number;
  topicId: number;
  levelId: number;
  difficultyId: number;
  visualStyleId: number | null;
  questionCount: number;
  worksheetTitle: string;
  schoolName?: string | null;
  studentName?: string | null;
  gradeName?: string | null;
  section?: string | null;
  teacherName?: string | null;
  questions: GeneratedQuestion[];
}

export interface SchoolDetails {
  schoolName: string;
  studentName: string;
  grade: string;
  date: string;
  teacherName: string;
  section: string;
}

export interface NumberLineJump {
  start: number;
  end: number;
  size: number;
}

export interface NumberLineOption {
  label: string;
  path: number[];
  jumps: NumberLineJump[];
  finalNumber: number;
  isCorrect: boolean;
}
