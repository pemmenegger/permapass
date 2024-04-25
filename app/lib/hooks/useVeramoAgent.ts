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

// Storage plugin using TypeORM to link to a database
import { Entities, KeyStore, DIDStore, migrations, PrivateKeyStore } from "@veramo/data-store";

// TypeORM is installed with '@veramo/data-store'
import { DataSource } from "typeorm";

// the did:peer resolver package
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { deployments } from "../../contracts/PermaPassDIDRegistry";
import { sepolia } from "viem/chains";

// This plugin allows us to issue and verify W3C Verifiable Credentials with JWT proof format
import { CredentialPlugin, ICredentialIssuer, ICredentialVerifier } from "@veramo/credential-w3c";
import { ethers } from "ethers";
import { Web3KeyManagementSystem } from "@veramo/kms-web3";
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

let dbConnection = new DataSource({
  type: "expo",
  driver: require("expo-sqlite"),
  database: "veramo.sqlite",
  migrations: migrations,
  migrationsRun: true,
  logging: ["error", "info", "warn"],
  entities: Entities,
}).initialize();

import { hardhat, browserProvider } from "../wagmi";
import config from "../config";

export function useVeramoAgent() {
  const agent = createAgent<
    IDIDManager & IKeyManager & IDataStore & IDataStoreORM & ICredentialIssuer & ICredentialVerifier
  >({
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(config.DB_ENCRYPTION_KEY))),
          // not able to create new keys
          // we need a wallet
          // web3: new Web3KeyManagementSystem({
          //   browserProvider: browserProvider,
          // }),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: "did:ethr:hardhat",
        providers: {
          "did:ethr:sepolia": new EthrDIDProvider({
            defaultKms: "local",
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
            defaultKms: "local",
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

  return { agent };
}
