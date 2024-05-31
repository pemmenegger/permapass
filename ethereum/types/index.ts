export interface EvaluationPerformance {
  durationInMs: number;
  startDateTime: string;
  endDateTime: string;
}

export interface Evaluation {
  contractName: string;
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
