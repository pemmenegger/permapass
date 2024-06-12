import { Abi, Hex } from "viem";

export interface EvaluationPerformance {
  durationInMs: number;
  startTimestamp: number;
  endTimestamp: number;
}

interface ContractEvaluationEntry extends EvaluationPerformance {
  functionName: string;
  gasUsedInWei: number;
}

export interface ContractEvaluation {
  deployment: ContractEvaluationEntry[];
  create: ContractEvaluationEntry[];
  read: ContractEvaluationEntry[];
  update: ContractEvaluationEntry[];
  delete: ContractEvaluationEntry[];
}

export interface DataUploadEvaluation {
  create: EvaluationPerformance[];
  update: EvaluationPerformance[];
}

export type ArweaveURI = `ar://${string}`;

export interface Logger {
  info: (message: string) => void;
  error: (message: string) => void;
}
