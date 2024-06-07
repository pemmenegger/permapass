import { EvaluationPerformance } from "../types";

interface MeasureExecutionResult<T> {
  txReceipt?: T;
  performance: EvaluationPerformance;
}

/**
 * Evaluates the performance of a transaction by measuring the time it takes to execute.
 * The gas used can be extracted from the transaction receipt.
 */
export const evaluateTransaction = async <T>(fn: () => Promise<T>): Promise<MeasureExecutionResult<T>> => {
  const start = new Date();
  const txReceipt = await fn();
  const end = new Date();

  return {
    txReceipt,
    performance: {
      durationInMs: end.getTime() - start.getTime(),
      startTimestamp: start.getTime(),
      endTimestamp: end.getTime(),
    },
  };
};
