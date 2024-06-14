import { task } from "hardhat/config";
import { ArweaveURI, Evaluation } from "../types";
import { evaluateFunction } from "../helpers/evaluation/evaluateFunction";
import { evaluateDeployment } from "../helpers/evaluation/evaluateDeployment";
import { evaluateContract } from "../helpers/evaluation/evaluateContract";
import { Address, encodePacked, fromHex, keccak256, pad, stringToBytes, toHex, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount, sign } from "viem/accounts";
import { writeEvaluation } from "../helpers/evaluation/writeEvaluation";
import { getLogger } from "../helpers/evaluation/getLogger";
import { getDummyData } from "../helpers/evaluation/getDummyData";
import { extractGasCosts } from "../helpers/evaluation/extractGasCosts";

const SERVICE_KEY = "did/svc/ProductPassport";

const getDIDServiceProperties = (passportDataURI: ArweaveURI) => {
  const value = passportDataURI;

  const attrNameBytes = stringToBytes(SERVICE_KEY);
  const attrNameBytesPadded = pad(attrNameBytes, { size: 32, dir: "right" });
  const attrName = toHex(attrNameBytesPadded);

  const attrValueBytes = stringToBytes(value);
  const attrValue = toHex(attrValueBytes);

  return {
    attrName,
    attrValue,
  };
};

/**
 Example:
 npx hardhat evaluateDIDRegistry \
   --network localhost
 */
task("evaluateDIDRegistry", "Evaluates the DID Registry contract")
  .addParam<Address>("from", "The address to send from")
  .setAction(async (taskArgs, hre) => {
    const contractName = "DIDRegistry";

    const logger = getLogger(hre, contractName);
    const contractArtifact = await hre.artifacts.readArtifact(contractName);
    const publicClient = await hre.viem.getPublicClient();
    const walletClient = await hre.viem.getWalletClient(taskArgs.from);

    const evaluation: Evaluation = {
      deployment: [],
      create: [],
      read: [],
      update: [],
      delete: [],
    };

    const contractAddress = await evaluateDeployment(hre, contractName, taskArgs.from, evaluation);
    const contract = await hre.viem.getContractAt(contractName, contractAddress, { client: { wallet: walletClient } });

    // Preparation: Generate a new private key and account for the construction product
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const identity = account.address;

    // Preparation: Get dummy data
    const dummyData = await getDummyData(hre);
    const { attrName, attrValue } = getDIDServiceProperties(dummyData.passportDataURI);

    const crudFunctions = {
      create: async () => {
        const { response: changeOwnerSignedTxReceipt, performance: changeOwnerSignedPerformance } =
          await evaluateFunction(async () => {
            const identityOwner = identity;
            const newOwner = taskArgs.from;

            // computing signature with the construction product's private key
            // this allows the user to claim ownership of the construction product's identity
            const nonce = await contract.read.nonce([identityOwner]);
            const msgHash = keccak256(
              encodePacked(
                ["bytes1", "bytes1", "address", "uint", "address", "string", "address"],
                ["0x19", "0x00", contractAddress, nonce, identity, "changeOwner", newOwner]
              )
            );
            const signature = await sign({ hash: msgHash, privateKey });

            // claim ownership of the construction product's identity
            const txHash = await contract.write.changeOwnerSigned([
              identity,
              Number(signature.v),
              signature.r,
              signature.s,
              newOwner,
            ]);
            return await publicClient.waitForTransactionReceipt({ hash: txHash });
          });

        const changeOwnerGasCosts = extractGasCosts(changeOwnerSignedTxReceipt);
        evaluation.create.push({
          functionName: "changeOwnerSigned",
          gasUsed: changeOwnerGasCosts.gasUsed,
          effectiveGasPriceInWei: changeOwnerGasCosts.effectiveGasPriceInWei,
          gasCostsInWei: changeOwnerGasCosts.gasCostsInWei,
          ...changeOwnerSignedPerformance,
        });

        const { response: setAttributeTxReceipt, performance: setAttributePerformance } = await evaluateFunction(
          async () => {
            const txHash = await contract.write.setAttribute([identity, attrName, attrValue, BigInt(86400)]);
            return await publicClient.waitForTransactionReceipt({ hash: txHash });
          }
        );

        const setAttributeGasCosts = extractGasCosts(setAttributeTxReceipt);
        evaluation.create.push({
          functionName: "setAttribute",
          gasUsed: setAttributeGasCosts.gasUsed,
          effectiveGasPriceInWei: setAttributeGasCosts.effectiveGasPriceInWei,
          gasCostsInWei: setAttributeGasCosts.gasCostsInWei,
          ...setAttributePerformance,
        });
      },
      read: async () => {
        const { performance } = await evaluateFunction(async () => {
          let previousChange: bigint = await contract.read.changed([identity]);

          while (previousChange) {
            const [attributeChangedEvents, ownerChangedEvents] = await Promise.all([
              publicClient.getContractEvents({
                address: contractAddress,
                abi: contractArtifact.abi,
                eventName: "DIDAttributeChanged",
                args: { identity },
                fromBlock: previousChange,
                toBlock: previousChange,
              }),
              publicClient.getContractEvents({
                address: contractAddress,
                abi: contractArtifact.abi,
                eventName: "DIDOwnerChanged",
                args: { identity },
                fromBlock: previousChange,
                toBlock: previousChange,
              }),
            ]);

            if (attributeChangedEvents.length > 0) {
              for (const event of attributeChangedEvents) {
                const { name, value } = event.args;
                if (!name || !value) {
                  throw new Error(`Missing name or value in attributeChanged event: ${event.args}`);
                }
                const attributeName = fromHex(name, "string").replace(/\0/g, "");
                if (attributeName === SERVICE_KEY) {
                  logger.info(`read ${attributeName} with value ${fromHex(value, "string")}`);
                }
              }
              const lastEvent = attributeChangedEvents[attributeChangedEvents.length - 1];
              previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
            } else if (ownerChangedEvents.length > 0) {
              const lastEvent = ownerChangedEvents[ownerChangedEvents.length - 1];
              previousChange = lastEvent ? BigInt(lastEvent.args.previousChange!) : 0n;
            } else {
              previousChange = 0n;
            }
          }
        });

        evaluation.read.push({
          functionName: "changed",
          gasUsed: 0,
          effectiveGasPriceInWei: 0,
          gasCostsInWei: 0,
          ...performance,
        });
      },
      update: async () => {
        const { response: txReceipt, performance: setTokenPerformance } = await evaluateFunction(async () => {
          const txHash = await contract.write.setAttribute([identity, attrName, attrValue, BigInt(86400)]);
          return await publicClient.waitForTransactionReceipt({ hash: txHash });
        });

        const { gasUsed, effectiveGasPriceInWei, gasCostsInWei } = extractGasCosts(txReceipt);
        evaluation.update.push({
          functionName: "setTokenURI",
          gasUsed,
          effectiveGasPriceInWei,
          gasCostsInWei,
          ...setTokenPerformance,
        });
      },
      delete: async () => {
        const { response: txReceipt, performance } = await evaluateFunction(async () => {
          const txHash = await contract.write.changeOwner([identity, zeroAddress]);
          return await publicClient.waitForTransactionReceipt({ hash: txHash });
        });

        const { gasUsed, effectiveGasPriceInWei, gasCostsInWei } = extractGasCosts(txReceipt);
        evaluation.delete.push({
          functionName: "burn",
          gasUsed,
          effectiveGasPriceInWei,
          gasCostsInWei,
          ...performance,
        });
      },
    };

    await evaluateContract(hre, contractName, crudFunctions);
    await writeEvaluation(hre, contractName, evaluation);
  });
