// copied types from the did-resolver package

export type DIDDocument = {
  "@context"?: "https://www.w3.org/ns/did/v1" | string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
  /**
   * @deprecated
   */
  publicKey?: VerificationMethod[];
} & {
  [x in KeyCapabilitySection]?: (string | VerificationMethod)[];
};

interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyBase58?: string;
  publicKeyBase64?: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyHex?: string;
  publicKeyMultibase?: string;
  blockchainAccountId?: string;
  ethereumAddress?: string;

  // ConditionalProof2022 subtypes
  conditionOr?: VerificationMethod[];
  conditionAnd?: VerificationMethod[];
  threshold?: number;
  conditionThreshold?: VerificationMethod[];
  conditionWeightedThreshold?: ConditionWeightedThreshold[];
  conditionDelegated?: string;
  relationshipParent?: string[];
  relationshipChild?: string[];
  relationshipSibling?: string[];
}

interface ConditionWeightedThreshold {
  condition: VerificationMethod;
  weight: number;
}

interface Service {
  id: string;
  type: string;
  serviceEndpoint: ServiceEndpoint | ServiceEndpoint[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}

type KeyCapabilitySection =
  | "authentication"
  | "assertionMethod"
  | "keyAgreement"
  | "capabilityInvocation"
  | "capabilityDelegation";

type ServiceEndpoint = string | Record<string, any>;
