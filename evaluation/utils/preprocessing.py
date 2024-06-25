import json

import pandas as pd


def compute_duration_mean(data):
    mean_duration_in_s = {}
    for key in data.keys():
        df = pd.DataFrame(data[key])
        if "durationInMs" not in df.columns:
            mean_duration_in_s[key] = 0
            continue
        mean_duration_in_s[key] = df["durationInMs"].mean() / 1000
    return mean_duration_in_s


def compute_gas_costs_mean(data):
    mean_gas_costs_in_wei = {}
    for key in data.keys():
        df = pd.DataFrame(data[key])
        if "gasCostsInWei" not in df.columns:
            mean_gas_costs_in_wei[key] = 0
            continue
        mean_gas_costs_in_wei[key] = df["gasCostsInWei"].mean()
    return mean_gas_costs_in_wei


def load_json(file_path):
    with open(file_path, "r") as f:
        return json.load(f)


def process_registry_data(data_path):
    all_registry_data = load_json(data_path)

    registry_actions = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }

    for record in all_registry_data["11155111"]:
        for key in registry_actions.keys():
            if not record[key]:
                continue
            elif len(record[key]) == 1:
                registry_actions[key].extend(record[key])
            else:
                gas_costs_sum = sum(item["gasCostsInWei"] for item in record[key][1:])
                duration_sum = sum(item["durationInMs"] for item in record[key][1:])
                start_timestamp = record[key][0]["startTimestamp"]
                registry_actions[key].append(
                    {
                        "gasCostsInWei": gas_costs_sum,
                        "durationInMs": duration_sum,
                        "startTimestamp": start_timestamp,
                    }
                )

    return registry_actions


deployment_labels = [
    "1. Blockchain: NFT, PBT, or DID Registry Contract Deployment",
    "2. Blockchain: HaLo NFC Metadata Registry Contract Deployment",
]

create_labels = [
    "1. Arweave: Upload Passport Data",
    "2. Blockchain: Create Identifier on Registry Contract",
    "3. Arweave: Upload Passport Metadata",
    "4. Blockchain: Store MetadataURI on HaLo NFC Metadata Registry Contract",
]

read_labels = [
    "1. Blockchain: Read MetadataURI from Registry Contract",
    "2. Arweave: Read Passport Metadata",
    "3. Blockchain: Read PassportURI from Registry Contract",
    "4. Arweave: Read Passport Data",
]

update_labels = [
    "1. Arweave: Upload Passport Data",
    "2. Blockchain: Update Identifier on Registry Contract",
]

delete_labels = [
    "1. Blockchain: Delete Identifier on Registry Contract",
]


def process_passport_type_performance_data(
    arweave_data,
    did_registry_data,
    halo_nfc_metadata_registry_data,
    nft_registry_data,
    pbt_registry_data,
):
    arweave_duration_mean = compute_duration_mean(arweave_data)
    did_registry_duration_mean = compute_duration_mean(did_registry_data)
    halo_nfc_metadata_registry_duration_mean = compute_duration_mean(
        halo_nfc_metadata_registry_data
    )
    nft_registry_duration_mean = compute_duration_mean(nft_registry_data)
    pbt_registry_duration_mean = compute_duration_mean(pbt_registry_data)

    depolyment_data = {
        "QR Code x NFT": [
            nft_registry_duration_mean["deployment"],
            0,
        ],
        "QR Code x DID": [
            did_registry_duration_mean["deployment"],
            0,
        ],
        "HaLo NFC x PBT": [
            pbt_registry_duration_mean["deployment"],
            halo_nfc_metadata_registry_duration_mean["deployment"],
        ],
        "HaLo NFC x DID": [
            did_registry_duration_mean["deployment"],
            halo_nfc_metadata_registry_duration_mean["deployment"],
        ],
    }

    create_data = {
        "QR Code x NFT": [
            arweave_duration_mean["create"],
            nft_registry_duration_mean["create"],
            arweave_duration_mean["create"],
            0,
        ],
        "QR Code x DID": [
            arweave_duration_mean["create"],
            did_registry_duration_mean["create"],
            arweave_duration_mean["create"],
            0,
        ],
        "HaLo NFC x PBT": [
            arweave_duration_mean["create"],
            pbt_registry_duration_mean["create"],
            arweave_duration_mean["create"],
            halo_nfc_metadata_registry_duration_mean["create"],
        ],
        "HaLo NFC x DID": [
            arweave_duration_mean["create"],
            did_registry_duration_mean["create"],
            arweave_duration_mean["create"],
            halo_nfc_metadata_registry_duration_mean["create"],
        ],
    }

    read_data = {
        "QR Code x NFT": [
            0,
            arweave_duration_mean["read"],
            nft_registry_duration_mean["read"],
            arweave_duration_mean["read"],
        ],
        "QR Code x DID": [
            0,
            arweave_duration_mean["read"],
            did_registry_duration_mean["read"],
            arweave_duration_mean["read"],
        ],
        "HaLo NFC x PBT": [
            halo_nfc_metadata_registry_duration_mean["read"],
            arweave_duration_mean["read"],
            pbt_registry_duration_mean["read"],
            arweave_duration_mean["read"],
        ],
        "HaLo NFC x DID": [
            halo_nfc_metadata_registry_duration_mean["read"],
            arweave_duration_mean["read"],
            did_registry_duration_mean["read"],
            arweave_duration_mean["read"],
        ],
    }

    update_data = {
        "QR Code x NFT": [
            arweave_duration_mean["update"],
            nft_registry_duration_mean["update"],
        ],
        "QR Code x DID": [
            arweave_duration_mean["update"],
            did_registry_duration_mean["update"],
        ],
        "HaLo NFC x PBT": [
            arweave_duration_mean["update"],
            pbt_registry_duration_mean["update"],
        ],
        "HaLo NFC x DID": [
            arweave_duration_mean["update"],
            did_registry_duration_mean["update"],
        ],
    }

    delete_data = {
        "QR Code x NFT": [
            nft_registry_duration_mean["delete"],
        ],
        "QR Code x DID": [
            did_registry_duration_mean["delete"],
        ],
        "HaLo NFC x PBT": [
            pbt_registry_duration_mean["delete"],
        ],
        "HaLo NFC x DID": [
            did_registry_duration_mean["delete"],
        ],
    }

    return [
        {
            "operation": "Deployment",
            "data": depolyment_data,
            "labels": deployment_labels,
        },
        {
            "operation": "Create",
            "data": create_data,
            "labels": create_labels,
        },
        {
            "operation": "Read",
            "data": read_data,
            "labels": read_labels,
        },
        {
            "operation": "Update",
            "data": update_data,
            "labels": update_labels,
        },
        {
            "operation": "Delete",
            "data": delete_data,
            "labels": delete_labels,
        },
    ]


def process_passport_type_gas_costs_data(
    did_registry_data,
    halo_nfc_metadata_registry_data,
    nft_registry_data,
    pbt_registry_data,
):
    did_registry_gas_costs_mean = compute_gas_costs_mean(did_registry_data)
    halo_nfc_metadata_registry_gas_costs_mean = compute_gas_costs_mean(
        halo_nfc_metadata_registry_data
    )
    nft_registry_gas_costs_mean = compute_gas_costs_mean(nft_registry_data)
    pbt_registry_gas_costs_mean = compute_gas_costs_mean(pbt_registry_data)

    deployment_data = {
        "QR Code x NFT": [
            nft_registry_gas_costs_mean["deployment"],
            0,
        ],
        "QR Code x DID": [
            did_registry_gas_costs_mean["deployment"],
            0,
        ],
        "HaLo NFC x PBT": [
            pbt_registry_gas_costs_mean["deployment"],
            halo_nfc_metadata_registry_gas_costs_mean["deployment"],
        ],
        "HaLo NFC x DID": [
            did_registry_gas_costs_mean["deployment"],
            halo_nfc_metadata_registry_gas_costs_mean["deployment"],
        ],
    }

    create_data = {
        "QR Code x NFT": [
            0,
            nft_registry_gas_costs_mean["create"],
            0,
            0,
        ],
        "QR Code x DID": [
            0,
            did_registry_gas_costs_mean["create"],
            0,
            0,
        ],
        "HaLo NFC x PBT": [
            0,
            pbt_registry_gas_costs_mean["create"],
            0,
            halo_nfc_metadata_registry_gas_costs_mean["create"],
        ],
        "HaLo NFC x DID": [
            0,
            did_registry_gas_costs_mean["create"],
            0,
            halo_nfc_metadata_registry_gas_costs_mean["create"],
        ],
    }

    read_data = {
        "QR Code x NFT": [
            0,
            0,
            nft_registry_gas_costs_mean["read"],
            0,
        ],
        "QR Code x DID": [
            0,
            0,
            did_registry_gas_costs_mean["read"],
            0,
        ],
        "HaLo NFC x PBT": [
            halo_nfc_metadata_registry_gas_costs_mean["read"],
            0,
            pbt_registry_gas_costs_mean["read"],
            0,
        ],
        "HaLo NFC x DID": [
            halo_nfc_metadata_registry_gas_costs_mean["read"],
            0,
            did_registry_gas_costs_mean["read"],
            0,
        ],
    }

    update_data = {
        "QR Code x NFT": [
            0,
            nft_registry_gas_costs_mean["update"],
        ],
        "QR Code x DID": [
            0,
            did_registry_gas_costs_mean["update"],
        ],
        "HaLo NFC x PBT": [
            0,
            pbt_registry_gas_costs_mean["update"],
        ],
        "HaLo NFC x DID": [
            0,
            did_registry_gas_costs_mean["update"],
        ],
    }

    delete_data = {
        "QR Code x NFT": [
            nft_registry_gas_costs_mean["delete"],
        ],
        "QR Code x DID": [
            did_registry_gas_costs_mean["delete"],
        ],
        "HaLo NFC x PBT": [
            pbt_registry_gas_costs_mean["delete"],
        ],
        "HaLo NFC x DID": [
            did_registry_gas_costs_mean["delete"],
        ],
    }

    return [
        {
            "operation": "Deployment",
            "data": deployment_data,
            "labels": deployment_labels,
        },
        {
            "operation": "Create",
            "data": create_data,
            "labels": create_labels,
        },
        {
            "operation": "Read",
            "data": read_data,
            "labels": read_labels,
        },
        {
            "operation": "Update",
            "data": update_data,
            "labels": update_labels,
        },
        {
            "operation": "Delete",
            "data": delete_data,
            "labels": delete_labels,
        },
    ]
