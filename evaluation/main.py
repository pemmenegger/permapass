from utils import (
    load_json,
    plot_duration_overview,
    plot_durations,
    plot_gas_used,
    plot_gas_used_overview,
    process_registry_data,
)


def plot_arweave():
    arweave_data = load_json("data/Arweave.json")
    plot_durations(
        data_list=[
            arweave_data["create"],
            arweave_data["read"],
            arweave_data["update"],
        ],
        labels=["Create", "Read", "Update"],
        title="Arweave",
        output_filename="arweave.png",
        x_axis="ms",
    )


def plot_halo_nfc_metadata_registry():
    labels = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
    }

    data = process_registry_data("data/contracts/HaloNFCMetadataRegistry.json")
    title = "Halo NFC Metadata Registry"
    output_filename_prefix = "halo_nfc_metadata_registry"

    plot_durations(
        data_list=[data[key] for key in data.keys()],
        labels=labels.values(),
        title=title,
        output_filename=f"{output_filename_prefix}_durations.png",
        x_axis="s",
    )
    plot_gas_used(
        data_list=[data[key] for key in data.keys()],
        labels=labels.values(),
        title=title,
        output_filename=f"{output_filename_prefix}_gas_used.png",
    )


def plot_digital_identifier_contracts():
    labels = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
        "update": "Update",
        "delete": "Delete",
    }

    registry_configs = [
        {
            "title": "DID Registry",
            "output_filename_prefix": "did_registry",
            "data": process_registry_data("data/contracts/DIDRegistry.json"),
        },
        {
            "title": "NFT Registry",
            "output_filename_prefix": "nft_registry",
            "data": process_registry_data("data/contracts/NFTRegistry.json"),
        },
        {
            "title": "PBT Registry",
            "output_filename_prefix": "pbt_registry",
            "data": process_registry_data("data/contracts/PBTRegistry.json"),
        },
    ]

    plot_duration_overview(registry_configs)
    plot_gas_used_overview(registry_configs)

    # print(registry_configs)
    # Process data to calculate total durations and individual operation durations

    for config in registry_configs:
        registry_data = config["data"]
        plot_durations(
            data_list=[registry_data[key] for key in registry_data.keys()],
            labels=labels.values(),
            title=config["title"],
            output_filename=f'{config["output_filename_prefix"]}_durations.png',
            x_axis="s",
        )
        plot_gas_used(
            data_list=[registry_data[key] for key in registry_data.keys()],
            labels=labels.values(),
            title=config["title"],
            output_filename=f'{config["output_filename_prefix"]}_gas_used.png',
        )

    combined_registry_data = {
        "deployment": {
            config["title"]: config["data"]["deployment"] for config in registry_configs
        },
        "create": {
            config["title"]: config["data"]["create"] for config in registry_configs
        },
        "read": {
            config["title"]: config["data"]["read"] for config in registry_configs
        },
        "update": {
            config["title"]: config["data"]["update"] for config in registry_configs
        },
        "delete": {
            config["title"]: config["data"]["delete"] for config in registry_configs
        },
    }

    for action_type in combined_registry_data:
        plot_durations(
            data_list=[
                combined_registry_data[action_type][key]
                for key in combined_registry_data[action_type].keys()
            ],
            labels=combined_registry_data[action_type].keys(),
            title=f"Registry {action_type.capitalize()}",
            output_filename=f"combined_durations_{action_type}.png",
            x_axis="s",
        )
        plot_gas_used(
            data_list=[
                combined_registry_data[action_type][key]
                for key in combined_registry_data[action_type].keys()
            ],
            labels=combined_registry_data[action_type].keys(),
            title=f"Registry {action_type.capitalize()}",
            output_filename=f"combined_gas_used_{action_type}.png",
        )


def main():
    plot_arweave()
    plot_halo_nfc_metadata_registry()
    plot_digital_identifier_contracts()


if __name__ == "__main__":
    main()
