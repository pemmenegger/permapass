export const HaLoNFCMetadataRegistry = {
  "31337": "0xdebd68b36de42bfc056498a597c5cc8bc1b73cfe",
  "11155111": "0x915e7b3970896040393d3ec6be1e5b4f3d0439f0",
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
