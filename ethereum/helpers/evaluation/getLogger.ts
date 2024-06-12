import { HardhatRuntimeEnvironment } from "hardhat/types";

export const getLogger = (hre: HardhatRuntimeEnvironment, prefix: string) => {
  const logPrefix = `${prefix} - ${hre.network.name}`;
  const logInfo = (message: string) => console.log(`${logPrefix} - ${message}`);
  const logError = (message: string) => console.error(`${logPrefix} - ${message}`);

  return {
    info: logInfo,
    error: logError,
  };
};
