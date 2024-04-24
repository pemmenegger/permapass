import { PassportData, PassportMetadata } from "./types";

export const uploadPassportData = async ({ name, condition }: { name: string; condition: string }) => {
  try {
    const url = await postArweaveApi({
      name,
      condition,
    });
    return url;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const uploadNFTPassportMetadata = async ({
  chainId,
  address,
  tokenId,
}: {
  chainId: number;
  address: string;
  tokenId: bigint;
}) => {
  try {
    const url = await postArweaveApi({
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
    return url;
  } catch (error) {
    console.error("Error:", error);
  }
};

const postArweaveApi = async (body: PassportData | PassportMetadata) => {
  const apiUrl = process.env.EXPO_PUBLIC_ARWEAVE_API_URL;
  if (!apiUrl) {
    throw new Error("API URL is not set");
  }

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
    const data = await response.json();

    if (data && data.url) {
      return data.url as string;
      //   setResponseURL(data.url);
      //   const urlResponse = await fetch(data.url);
      //   const urlData = await urlResponse.text();
      //   setResponseContent(urlData);
    } else {
      throw new Error("No Arweave URL found in the response");
    }
  } catch (error) {
    throw new Error("Error uploading to Arweave: " + error);
  }
};
