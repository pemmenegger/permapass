export const HaLoNFCMetadataRegistry = {
  "31337": "0x406a64147e7b7a41782c458e2b87d939e2a8bbbf",
  "11155111": "0xfa369fe5f2d7c508f173217a65b9a1393add9d6a",
  abi: [
    {
      inputs: [],
      name: "AlreadySet",
      type: "error",
    },
    {
      inputs: [],
      name: "BlockNumberTooOld",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidBlockNumber",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidSignature",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "chipAddress",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "signatureFromChip",
          type: "bytes",
        },
        {
          internalType: "uint256",
          name: "blockNumberUsedInSig",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "metadataURI",
          type: "string",
        },
      ],
      name: "initMetadataURI",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "metadataURIs",
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
} as const;
