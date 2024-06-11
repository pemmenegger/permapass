import { TransactionReceipt } from "viem";
import { EvaluationPerformance } from "../types";

interface MeasureExecutionResult {
  txReceipt?: TransactionReceipt;
  performance: EvaluationPerformance;
}

interface FunctionResult {
  txReceipt?: TransactionReceipt;
  functionName: string;
}

/**
 * Evaluates the performance of a transaction by measuring the time it takes to execute.
 * The gas used can be extracted from the transaction receipt.
 */
export const evaluateTransaction = async (fn: () => Promise<FunctionResult>): Promise<MeasureExecutionResult> => {
  const start = new Date();
  const { txReceipt, functionName } = await fn();
  const end = new Date();

  return {
    txReceipt,
    performance: {
      functionName: functionName,
      durationInMs: end.getTime() - start.getTime(),
      startTimestamp: start.getTime(),
      endTimestamp: end.getTime(),
    },
  };
};
