// imports:
// Core interfaces
import { createAgent, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, TAgent } from "@veramo/core";

// Core identity manager plugin. This allows you to create and manage DIDs by orchestrating different DID provider packages.
// This implements `IDIDManager`
import { DIDManager } from "@veramo/did-manager";

// Core key manager plugin. DIDs use keys and this key manager is required to know how to work with them.
// This implements `IKeyManager`
import { KeyManager } from "@veramo/key-manager";

// This plugin allows us to create and manage `did:peer` DIDs (used by DIDManager)
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

// A key management system that uses a local database to store keys (used by KeyManager)
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

// Storage plugin using TypeORM to link to a database
import { Entities, KeyStore, DIDStore, migrations, PrivateKeyStore } from "@veramo/data-store";

// TypeORM is installed with '@veramo/data-store'
import { DataSource } from "typeorm";

// the did:peer resolver package
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { deployments } from "../../contracts/EthereumDIDRegistry";
import { mainnet, polygon, arbitrum, hardhat, sepolia, goerli } from "viem/chains";

// This plugin allows us to issue and verify W3C Verifiable Credentials with JWT proof format
import { CredentialPlugin, ICredentialIssuer, ICredentialVerifier } from "@veramo/credential-w3c";
import { ethers } from "ethers";
import { Web3KeyManagementSystem } from "@veramo/kms-web3";
import config from "../config";

let dbConnection = new DataSource({
  type: "expo",
  driver: require("expo-sqlite"),
  database: "veramo.sqlite",
  migrations: migrations,
  migrationsRun: true,
  logging: ["error", "info", "warn"],
  entities: Entities,
}).initialize();

import { type WalletClient, useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { useEffect, useMemo, useState } from "react";

export function walletClientToBrowserProvider(walletClient: WalletClient) {
  const { chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  console.log(`BrowserProvider changed: ${transport}, ${network}`);
  return new BrowserProvider(transport, network);
}

export function useEthersBrowserProvider({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useWalletClient({ chainId });
  return useMemo(() => (client ? walletClientToBrowserProvider(client) : undefined), [client]);
}

export type AgentType = TAgent<
  IDIDManager & IKeyManager & IDataStore & IDataStoreORM & ICredentialIssuer & ICredentialVerifier
>;

export function useAgent() {
  const [agent, setAgent] = useState<AgentType | undefined>();
  const walletConnectProvider = useEthersBrowserProvider();

  useEffect(() => {
    let newAgent = undefined;
    if (!walletConnectProvider) {
      console.log("No wallet connect provider");
    } else {
      newAgent = createAgent<
        IDIDManager & IKeyManager & IDataStore & IDataStoreORM & ICredentialIssuer & ICredentialVerifier
      >({
        plugins: [
          new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
              web3: new Web3KeyManagementSystem({
                walletConnect: walletConnectProvider,
              }),
            },
          }),
          new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: "did:ethr:hardhat",
            providers: {
              "did:ethr:sepolia": new EthrDIDProvider({
                defaultKms: "web3",
                networks: [
                  {
                    name: "sepolia",
                    provider: new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${config.INFURA_PROJECT_ID}`),
                    registry: "0x03d5003bf0e79C5F5223588F347ebA39AfbC3818",
                    chainId: sepolia.id,
                  },
                ],
              }),
              "did:ethr:hardhat": new EthrDIDProvider({
                defaultKms: "web3",
                networks: [
                  {
                    name: "hardhat",
                    provider: new ethers.JsonRpcProvider(`http://${config.LOCALHOST_INTERNAL_IP}:8545`),
                    registry: deployments[hardhat.id].address,
                    chainId: hardhat.id,
                  },
                ],
              }),
            },
          }),
          new DIDResolverPlugin({
            ...ethrDidResolver({
              networks: [
                {
                  name: "sepolia",
                  provider: new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${config.INFURA_PROJECT_ID}`),
                  registry: "0x03d5003bf0e79C5F5223588F347ebA39AfbC3818",
                  chainId: sepolia.id,
                },
                {
                  name: "hardhat",
                  provider: new ethers.JsonRpcProvider(`http://${config.LOCALHOST_INTERNAL_IP}:8545`),
                  registry: deployments[hardhat.id].address,
                  chainId: hardhat.id,
                },
              ],
            }),
          }),
          new CredentialPlugin(),
        ],
      });
    }

    console.log("Agent changed");

    setAgent(newAgent);
  }, [walletConnectProvider]);

  return agent;
}
