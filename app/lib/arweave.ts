import { Passport, PassportMetadata } from "./types";

const apiUrl = process.env.EXPO_PUBLIC_ARWEAVE_API_URL;
if (!apiUrl) {
  const errorMessage = "API URL is not set in environment variables.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const fromArweaveHashToURL = (arweaveHash: string): string => {
  return `https://arweave.net/${arweaveHash}`;
};

const postArweaveApi = async (body: Passport | PassportMetadata): Promise<string> => {
  try {
    console.log("Uploading to Arweave...", body);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 504) {
        console.log("Retrying upload to Arweave...");
        postArweaveApi(body);
      }
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.arweaveHash) {
      throw new Error("No Arweave hash in response");
    }

    return data.arweaveHash;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    throw error;
  }
};

export const uploadPassport = async (passport: Passport): Promise<string> => {
  return postArweaveApi(passport);
};

export const uploadNFTPassportMetadata = async ({
  chainId,
  address,
  tokenId,
}: {
  chainId: number;
  address: string;
  tokenId: bigint;
}): Promise<string> => {
  return postArweaveApi({
    chainId,
    address,
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
        ],
        name: "tokenURI",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "tokenURI",
    args: [tokenId.toString()],
  });
};
