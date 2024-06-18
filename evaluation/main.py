from utils.gas_costs import (
    plot_contracts_gas_costs,
    plot_gas_costs,
    plot_passport_types_gas_costs,
    plot_passport_types_operation_gas_costs,
)
from utils.performance import (
    plot_contracts_performance,
    plot_passport_types_operation_performance,
    plot_passport_types_performance,
    plot_performance,
)
from utils.preprocessing import (
    load_json,
    process_passport_type_gas_costs_data,
    process_passport_type_performance_data,
    process_registry_data,
)


def plot_arweave(arweave_data):
    plot_performance(
        data_list=[
            arweave_data["create"],
            arweave_data["read"],
            arweave_data["update"],
        ],
        labels=["Create", "Read", "Update"],
        title="Arweave Performance",
        output_filename="performance_arweave.png",
        x_axis="s",
    )


def plot_halo_nfc_metadata_registry(halo_nfc_metadata_registry_data):
    labels = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
    }

    title = "HaloNFCMetadataRegistry.sol"
    output_filename_suffix = "halo_nfc_metadata_registry"

    plot_performance(
        data_list=[
            halo_nfc_metadata_registry_data[key]
            for key in halo_nfc_metadata_registry_data.keys()
        ],
        labels=labels.values(),
        title=title,
        output_filename=f"performance_{output_filename_suffix}.png",
        x_axis="s",
    )
    plot_gas_costs(
        data_list=[
            halo_nfc_metadata_registry_data[key]
            for key in halo_nfc_metadata_registry_data.keys()
        ],
        labels=labels.values(),
        title=title,
        output_filename=f"gas_costs_{output_filename_suffix}.png",
    )


def plot_digital_identifier_contracts(
    did_registry_data, nft_registry_data, pbt_registry_data
):
    labels = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
        "update": "Update",
        "delete": "Delete",
    }

    registry_configs = [
        {
            "title": "DIDRegistry.sol",
            "output_filename_suffix": "did_registry",
            "data": did_registry_data,
        },
        {
            "title": "NFTRegistry.sol",
            "output_filename_suffix": "nft_registry",
            "data": nft_registry_data,
        },
        {
            "title": "PBTRegistry.sol",
            "output_filename_suffix": "pbt_registry",
            "data": pbt_registry_data,
        },
    ]

    plot_contracts_performance(registry_configs)
    plot_contracts_gas_costs(registry_configs)

    for config in registry_configs:
        registry_data = config["data"]
        plot_performance(
            data_list=[registry_data[key] for key in registry_data.keys()],
            labels=labels.values(),
            title=f'{config["title"]} Performance',
            output_filename=f'performance_{config["output_filename_suffix"]}.png',
            x_axis="s",
        )
        plot_gas_costs(
            data_list=[registry_data[key] for key in registry_data.keys()],
            labels=labels.values(),
            title=f'{config["title"]} Gas Costs',
            output_filename=f'gas_costs_{config["output_filename_suffix"]}.png',
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
        plot_performance(
            data_list=[
                combined_registry_data[action_type][key]
                for key in combined_registry_data[action_type].keys()
            ],
            labels=combined_registry_data[action_type].keys(),
            title=f"Performance Comparison of {action_type.capitalize()} Operations",
            output_filename=f"performance_comparison_{action_type}.png",
            x_axis="s",
        )
        plot_gas_costs(
            data_list=[
                combined_registry_data[action_type][key]
                for key in combined_registry_data[action_type].keys()
            ],
            labels=combined_registry_data[action_type].keys(),
            title=f"Gas Costs Comparison of {action_type.capitalize()} Operations",
            output_filename=f"gas_costs_comparison_{action_type}.png",
        )


def plot_passport_types(
    arweave_data,
    did_registry_data,
    halo_nfc_metadata_registry_data,
    nft_registry_data,
    pbt_registry_data,
):
    performance_data = process_passport_type_performance_data(
        arweave_data,
        did_registry_data,
        halo_nfc_metadata_registry_data,
        nft_registry_data,
        pbt_registry_data,
    )

    for operation_data in performance_data:
        operation = operation_data["operation"]
        data = operation_data["data"]
        labels = operation_data["labels"]

        plot_passport_types_operation_performance(
            data,
            labels,
            f"Mean Durations for {operation} Operations",
            output_filename=f"performance_passport_types_{operation.lower()}.png",
        )

    plot_passport_types_performance(performance_data)

    gast_costs_data = process_passport_type_gas_costs_data(
        did_registry_data,
        halo_nfc_metadata_registry_data,
        nft_registry_data,
        pbt_registry_data,
    )

    for operation_data in gast_costs_data:
        operation = operation_data["operation"]
        data = operation_data["data"]
        labels = operation_data["labels"]

        plot_passport_types_operation_gas_costs(
            data,
            labels,
            f"Mean Gas Costs for {operation} Operations",
            output_filename=f"gas_costs_passport_types_{operation.lower()}.png",
        )

    plot_passport_types_gas_costs(gast_costs_data)


def main():
    arweave_data = load_json("data/Arweave.json")
    did_registry_data = process_registry_data("data/contracts/DIDRegistry.json")
    halo_nfc_metadata_registry_data = process_registry_data(
        "data/contracts/HaloNFCMetadataRegistry.json"
    )
    nft_registry_data = process_registry_data("data/contracts/NFTRegistry.json")
    pbt_registry_data = process_registry_data("data/contracts/PBTRegistry.json")

    plot_arweave(arweave_data)
    plot_halo_nfc_metadata_registry(halo_nfc_metadata_registry_data)
    plot_digital_identifier_contracts(
        did_registry_data, nft_registry_data, pbt_registry_data
    )
    plot_passport_types(
        arweave_data,
        did_registry_data,
        halo_nfc_metadata_registry_data,
        nft_registry_data,
        pbt_registry_data,
    )


if __name__ == "__main__":
    main()
