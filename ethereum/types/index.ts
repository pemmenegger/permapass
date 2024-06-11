export interface EvaluationPerformance {
  functionName: string;
  durationInMs: number;
  startTimestamp: number;
  endTimestamp: number;
}

interface EvaluationEntry extends EvaluationPerformance {
  gasUsedInWei: number;
}

export interface Evaluation {
  deployment?: EvaluationEntry[];
  create?: EvaluationEntry[];
  read?: EvaluationEntry[];
  update?: EvaluationEntry[];
  delete?: EvaluationEntry[];
}
