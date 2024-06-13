import os

from utils import load_json, plot_durations, process_registry_data


def main():
    # Plot Arweave Upload Durations
    arweave_data = load_json("data/ArweaveUpload.json")
    plot_durations(
        data_list=[arweave_data["create"], arweave_data["update"]],
        labels=["passport-create.json", "passport-update.json"],
        title="Arweave Upload Durations via Irys Node 2",
        output_path=os.path.join("plots"),
        output_filename="arweave_upload.png",
        x_axis="ms",
    )

    did_durations = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }
    labels_template = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
        "update": "Update",
        "delete": "Delete",
    }

    # Plot DID Registry Durations
    did_registry_data = load_json("data/contracts/DIDRegistry.json")
    process_registry_data(did_registry_data, did_durations)
    plot_durations(
        data_list=[did_durations[key] for key in did_durations.keys()],
        labels=[labels_template[key] for key in did_durations.keys()],
        title="DID Registry Durations",
        output_path=os.path.join("plots"),
        output_filename="did_registry_durations.png",
        x_axis="s",
    )

    nft_durations = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }
    labels_template = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
        "update": "Update",
        "delete": "Delete",
    }

    # Plot NFT Registry Durations
    nft_registry_data = load_json("data/contracts/NFTRegistry.json")
    process_registry_data(nft_registry_data, nft_durations)
    plot_durations(
        data_list=[nft_durations[key] for key in nft_durations.keys()],
        labels=[labels_template[key] for key in nft_durations.keys()],
        title="NFT Registry Durations",
        output_path=os.path.join("plots"),
        output_filename="nft_registry_durations.png",
        x_axis="s",
    )

    pbt_durations = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }
    labels_template = {
        "deployment": "Deployment",
        "create": "Create",
        "read": "Read",
        "update": "Update",
        "delete": "Delete",
    }

    # Plot PBT Registry Durations
    pbt_registry_data = load_json("data/contracts/PBTRegistry.json")
    process_registry_data(pbt_registry_data, pbt_durations)
    plot_durations(
        data_list=[pbt_durations[key] for key in pbt_durations.keys()],
        labels=[labels_template[key] for key in pbt_durations.keys()],
        title="PBT Registry Durations",
        output_path=os.path.join("plots"),
        output_filename="pbt_registry_durations.png",
        x_axis="s",
    )

    deployment_durations = {
        "DID Registry": did_durations["deployment"],
        "NFT Registry": nft_durations["deployment"],
        "PBT Registry": pbt_durations["deployment"],
    }

    plot_durations(
        data_list=[deployment_durations[key] for key in deployment_durations.keys()],
        labels=deployment_durations.keys(),
        title="Registry Deployments Durations",
        output_path=os.path.join("plots"),
        output_filename="registry_deployments_durations.png",
        x_axis="s",
    )

    create_durations = {
        "DID Registry": did_durations["create"],
        "NFT Registry": nft_durations["create"],
        "PBT Registry": pbt_durations["create"],
    }

    plot_durations(
        data_list=[create_durations[key] for key in create_durations.keys()],
        labels=create_durations.keys(),
        title="Registry Create Durations",
        output_path=os.path.join("plots"),
        output_filename="registry_create_durations.png",
        x_axis="s",
    )

    read_durations = {
        "DID Registry": did_durations["read"],
        "NFT Registry": nft_durations["read"],
        "PBT Registry": pbt_durations["read"],
    }

    plot_durations(
        data_list=[read_durations[key] for key in read_durations.keys()],
        labels=read_durations.keys(),
        title="Registry Read Durations",
        output_path=os.path.join("plots"),
        output_filename="registry_read_durations.png",
        x_axis="s",
    )

    update_durations = {
        "DID Registry": did_durations["update"],
        "NFT Registry": nft_durations["update"],
        "PBT Registry": pbt_durations["update"],
    }

    plot_durations(
        data_list=[update_durations[key] for key in update_durations.keys()],
        labels=update_durations.keys(),
        title="Registry Update Durations",
        output_path=os.path.join("plots"),
        output_filename="registry_update_durations.png",
        x_axis="s",
    )

    delete_durations = {
        "DID Registry": did_durations["delete"],
        "NFT Registry": nft_durations["delete"],
        "PBT Registry": pbt_durations["delete"],
    }

    plot_durations(
        data_list=[delete_durations[key] for key in delete_durations.keys()],
        labels=delete_durations.keys(),
        title="Registry Delete Durations",
        output_path=os.path.join("plots"),
        output_filename="registry_delete_durations.png",
        x_axis="s",
    )


if __name__ == "__main__":
    main()
