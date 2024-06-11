import hre from "hardhat";
import { evaluateDIDRegistry } from "../helpers/evaluateDIDRegistry";
import { evaluateNFTRegistry } from "../helpers/evaluateNFTRegistry";
import { evaluatePBTRegistry } from "../helpers/evaluatePBTRegistry";

/*
 * Run this script using the following command:
 * npx hardhat run scripts/evaluate.ts --network <network>
 */
async function main() {
  const testPassportDataURI = "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-oEhprAs";
  const testUpdatedPassportDataURI = "ar://rgiLrvb-FXtlcbrA5LP-b-ytIkUXXNnk19X-ABCDEFG";

  console.log("Compiling contracts...");
  await hre.run("compile");

  await evaluatePBTRegistry({
    hre,
    testPassportDataURI,
    testUpdatedPassportDataURI,
  });

  await evaluateNFTRegistry({
    hre,
    testPassportDataURI,
    testUpdatedPassportDataURI,
  });

  await evaluateDIDRegistry({
    hre,
    testPassportDataURI,
    testUpdatedPassportDataURI,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
