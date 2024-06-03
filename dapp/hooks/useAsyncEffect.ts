import { type DependencyList, useEffect } from "react";

type AsyncEffectCallback = () => Promise<void | (() => void | undefined)>;

export const useAsyncEffect = (effect: AsyncEffectCallback, deps?: DependencyList) => {
  useEffect(() => {
    let cleanupFunction: (() => void) | undefined;

    const effectWrapper = async () => {
      const maybeCleanup = await effect();

      if (typeof maybeCleanup === "function") {
        cleanupFunction = maybeCleanup;
      }
    };

    void effectWrapper();

    return () => {
      if (cleanupFunction) cleanupFunction();
    };
  }, deps);
};
