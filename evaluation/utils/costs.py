import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from utils.constants import OUTPUT_PATH, eth_to_usd, usd_to_eth, wei_to_eth


def plot_gas_costs(data_list, labels, title, output_filename):
    fig, ax1 = plt.subplots(figsize=(14, 8))

    for data, label in zip(data_list, labels):
        df = pd.DataFrame(data)
        df["startTimestamp"] = (
            pd.to_datetime(df["startTimestamp"], unit="ms")
            .dt.tz_localize("UTC")
            .dt.tz_convert("Europe/Zurich")
        )
        df["formattedTimestamp"] = (
            df["startTimestamp"].dt.floor("5min").dt.strftime("%H:%M")
        )
        df["gasCostsInEther"] = wei_to_eth(df["gasCostsInWei"])

        mean_gas_costs_eth = df["gasCostsInEther"].mean()

        unit_eth = "Sepolia ETH"

        ax1.plot(
            df["formattedTimestamp"],
            df["gasCostsInEther"],
            label=f"{label} (Mean: {mean_gas_costs_eth:.6f} {unit_eth} = {eth_to_usd(mean_gas_costs_eth):.2f} USD)",
            marker="o",
        )

    secax = ax1.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel("USD (Mainnet Equivalent)")

    ax1.set_title(f"{title} (2024-06-14 on Sepolia)")
    ax1.set_xlabel("Execution Time (HH:MM CEST)")
    ax1.set_ylabel(unit_eth)

    ax1.legend(ncol=1)
    ax1.grid(True, which="both", linestyle="--", linewidth=0.5)
    ax1.tick_params(axis="both", which="major", labelsize=10)

    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()


def plot_gas_costs_comparison(
    registry_configs, output_filename="gas_costs_comparison.png"
):
    titles = []
    operation_gas_costs = {
        "deployment": [],
        "create": [],
        "update": [],
        "delete": [],
    }

    for entry in registry_configs:
        title = entry["title"]
        titles.append(title)

        for operation, gas_costs_list in entry["data"].items():
            if operation not in operation_gas_costs:
                continue
            gas_costs = [item["gasCostsInWei"] for item in gas_costs_list]
            mean_gas_costs = wei_to_eth(np.mean(gas_costs)) if gas_costs else 0
            operation_gas_costs[operation].append(mean_gas_costs)

    df = pd.DataFrame(operation_gas_costs, index=titles)
    df["total"] = df.sum(axis=1)

    x = np.arange(len(titles))
    width = 0.4

    fig, ax1 = plt.subplots(figsize=(16, 10))
    ax2 = ax1.twinx()

    bottoms = np.zeros(len(titles))
    for operation in operation_gas_costs.keys():
        bar = ax1.bar(
            x, df[operation], width, bottom=bottoms, label=operation.capitalize()
        )
        for rect, mean in zip(bar, df[operation]):
            height = rect.get_height()
            ax1.text(
                rect.get_x() + rect.get_width() / 2.0,
                rect.get_y() + height / 2.0,
                f"{mean:.6f}",
                ha="center",
                va="center",
                fontsize=10,
                color="black",
            )
        bottoms += df[operation].values

    for i, total in enumerate(df["total"]):
        ax1.text(
            x[i],
            bottoms[i] + 0.00003,
            f"Total:\n{total:.6f} Sepolia ETH = {eth_to_usd(total):.2f} USD",
            ha="center",
            va="bottom",
            fontsize=10,
            color="black",
            fontweight="bold",
        )

    ax1.set_title("Gas Costs Comparison of Registry Contracts using Means")
    ax1.set_ylabel("Sepolia ETH")
    ax2.set_ylabel("USD (Mainnet Equivalent)")
    ax1.set_xticks(x)
    ax1.set_xticklabels(titles)

    handles, labels = ax1.get_legend_handles_labels()
    ax1.legend(
        reversed(handles),
        reversed(labels),
        ncol=1,
    )

    plt.tight_layout()
    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()
