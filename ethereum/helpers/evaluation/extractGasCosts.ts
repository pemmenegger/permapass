import { TransactionReceipt } from "viem";

export const extractGasCosts = (txReceipt: TransactionReceipt) => {
  const gasUsed = Number(txReceipt.gasUsed);
  const effectiveGasPriceInWei = Number(txReceipt.effectiveGasPrice);
  const gasCostsInWei = gasUsed * effectiveGasPriceInWei;
  return { gasUsed, effectiveGasPriceInWei, gasCostsInWei };
};
