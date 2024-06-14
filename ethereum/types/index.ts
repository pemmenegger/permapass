export interface EvaluationPerformance {
  durationInMs: number;
  startTimestamp: number;
  endTimestamp: number;
}

interface EvaluationEntry extends EvaluationPerformance {
  functionName: string;
  gasUsed: number;
  effectiveGasPriceInWei: number;
  gasCostsInWei: number;
}

export interface Evaluation {
  deployment: EvaluationEntry[];
  create: EvaluationEntry[];
  read: EvaluationEntry[];
  update: EvaluationEntry[];
  delete: EvaluationEntry[];
}

export type ArweaveURI = `ar://${string}`;

export interface Logger {
  info: (message: string) => void;
  error: (message: string) => void;
}
