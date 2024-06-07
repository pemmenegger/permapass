export interface EvaluationPerformance {
  durationInMs: number;
  startTimestamp: number;
  endTimestamp: number;
}

export interface Evaluation {
  deployment?: {
    gasUsed: number;
    performance: EvaluationPerformance;
  };
  create?: {
    gasUsed: number;
    performance: EvaluationPerformance;
  };
  read?: {
    performance: EvaluationPerformance;
  };
  update?: {
    gasUsed: number;
    performance: EvaluationPerformance;
  };
  delete?: {
    gasUsed: number;
    performance: EvaluationPerformance;
  };
}
