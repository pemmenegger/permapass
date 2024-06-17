from utils.costs import plot_gas_costs, plot_gas_costs_comparison
from utils.performance import plot_performance, plot_performance_comparison
from utils.preprocessing import load_json, process_registry_data


def plot_arweave():
    arweave_data = load_json("data/Arweave.json")
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


def plot_halo_nfc_metadata_registry():
    labels = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
    }

    data = process_registry_data("data/contracts/HaloNFCMetadataRegistry.json")
    title = "HaloNFCMetadataRegistry.sol"
    output_filename_suffix = "halo_nfc_metadata_registry"

    plot_performance(
        data_list=[data[key] for key in data.keys()],
        labels=labels.values(),
        title=title,
        output_filename=f"performance_{output_filename_suffix}.png",
        x_axis="s",
    )
    plot_gas_costs(
        data_list=[data[key] for key in data.keys()],
        labels=labels.values(),
        title=title,
        output_filename=f"gas_costs_{output_filename_suffix}.png",
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
            "title": "DIDRegistry.sol",
            "output_filename_suffix": "did_registry",
            "data": process_registry_data("data/contracts/DIDRegistry.json"),
        },
        {
            "title": "NFTRegistry.sol",
            "output_filename_suffix": "nft_registry",
            "data": process_registry_data("data/contracts/NFTRegistry.json"),
        },
        {
            "title": "PBTRegistry.sol",
            "output_filename_suffix": "pbt_registry",
            "data": process_registry_data("data/contracts/PBTRegistry.json"),
        },
    ]

    plot_performance_comparison(registry_configs)
    plot_gas_costs_comparison(registry_configs)

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
            title=f"Performance Comparison of {action_type.capitalize()} Operation",
            output_filename=f"performance_comparison_{action_type}.png",
            x_axis="s",
        )
        plot_gas_costs(
            data_list=[
                combined_registry_data[action_type][key]
                for key in combined_registry_data[action_type].keys()
            ],
            labels=combined_registry_data[action_type].keys(),
            title=f"Gas Costs Comparison of {action_type.capitalize()} Operation",
            output_filename=f"gas_costs_comparison_{action_type}.png",
        )


def main():
    plot_arweave()
    plot_halo_nfc_metadata_registry()
    plot_digital_identifier_contracts()


if __name__ == "__main__":
    main()
