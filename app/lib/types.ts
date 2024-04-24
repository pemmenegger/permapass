interface ABIInput {
  internalType: string;
  name: string;
  type: string;
}

interface ABIOutput {
  internalType: string;
  name: string;
  type: string;
}

interface ABI {
  inputs: ABIInput[];
  name: string;
  outputs: ABIOutput[];
  stateMutability: string;
  type: string;
}

export interface PassportMetadata {
  chainId: number;
  address: string;
  abi: ABI[];
  functionName: string;
  args: string[];
}

export interface PassportData {
  name: string;
  condition: string;
}
