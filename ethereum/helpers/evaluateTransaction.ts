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

  const toISOStringWithTimezone = (date: Date): string => {
    const tzoffset = -date.getTimezoneOffset();
    const pad = (num: number) => String(num).padStart(2, "0");

    const offsetHours = pad(Math.abs(tzoffset) / 60);
    const offsetMinutes = pad(Math.abs(tzoffset) % 60);
    const offsetSign = tzoffset >= 0 ? "+" : "-";

    const localISOTime = date.toISOString().slice(0, -1);
    const timezone = `${offsetSign}${offsetHours}:${offsetMinutes}`;

    return `${localISOTime}${timezone}`;
  };

  return {
    txReceipt,
    performance: {
      durationInMs: end.getTime() - start.getTime(),
      startDateTime: toISOStringWithTimezone(start),
      endDateTime: toISOStringWithTimezone(end),
    },
  };
};
