import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getLogger } from "./getLogger";

export const evaluateContract = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  crudFunctions: {
    create: () => Promise<void>;
    read: () => Promise<void>;
    update: () => Promise<void>;
    delete: () => Promise<void>;
  }
) => {
  const logger = getLogger(hre, contractName);

  try {
    logger.info("Evaluating creation...");
    await crudFunctions.create();
    logger.info(`Creation evaluation successful`);
  } catch (e) {
    logger.error(`Creation evaluation error: ${e}`);
    throw e;
  }

  try {
    logger.info("Evaluating read...");
    await crudFunctions.read();
    logger.info(`Read evaluation successful`);
  } catch (e) {
    logger.error(`Read evaluation error: ${e}`);
    throw e;
  }

  try {
    logger.info("Evaluating update...");
    await crudFunctions.update();
    logger.info(`Update evaluation successful`);
  } catch (e) {
    logger.error(`Update evaluation error: ${e}`);
    throw e;
  }

  try {
    logger.info("Evaluating delete...");
    await crudFunctions.delete();
    logger.info(`Delete evaluation successful`);
  } catch (e) {
    logger.error(`Delete evaluation error: ${e}`);
    throw e;
  }
};
