export interface EvaluationPerformance {
  durationInMs: number;
  startTimestamp: number;
  endTimestamp: number;
}

export interface Evaluation {
  deployment?: {
    gasUsedInWei: number;
    performance: EvaluationPerformance;
  };
  create?: {
    gasUsedInWei: number;
    performance: EvaluationPerformance;
  };
  read?: {
    performance: EvaluationPerformance;
  };
  update?: {
    gasUsedInWei: number;
    performance: EvaluationPerformance;
  };
  delete?: {
    gasUsedInWei: number;
    performance: EvaluationPerformance;
  };
}
