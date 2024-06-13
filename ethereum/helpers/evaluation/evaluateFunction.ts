import { EvaluationPerformance } from "../../types";

interface Measurements<T> {
  response: T;
  performance: EvaluationPerformance;
}

export const evaluateFunction = async <T>(fn: () => Promise<T>): Promise<Measurements<T>> => {
  const start = new Date().getTime();
  let response: T;

  try {
    response = await fn();
  } catch (error) {
    throw new Error(`Function execution failed: ${error}`);
  }

  const end = new Date().getTime();

  return {
    response,
    performance: {
      durationInMs: end - start,
      startTimestamp: start,
      endTimestamp: end,
    },
  };
};
