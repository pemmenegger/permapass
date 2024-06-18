import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from utils.helpers import OUTPUT_PATH, eth_to_usd, usd_to_eth, wei_to_eth


def plot_gas_costs(data_list, labels, title, output_filename):
    fig, ax = plt.subplots(figsize=(14, 8))

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

        ax.plot(
            df["formattedTimestamp"],
            df["gasCostsInEther"],
            label=f"{label} (Mean: {mean_gas_costs_eth:.6f} {unit_eth} = {eth_to_usd(mean_gas_costs_eth):.2f} USD)",
            marker="o",
        )

    secax = ax.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel("USD")

    ax.set_title(f"{title} (2024-06-14 on Sepolia)")
    ax.set_xlabel("Execution Time (HH:MM CEST)")
    ax.set_ylabel(unit_eth)

    ax.legend(ncol=1)
    ax.grid(True, which="both", linestyle="--", linewidth=0.5)
    ax.tick_params(axis="both", which="major", labelsize=10)

    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()


def _plot_stacked_bar_chart(
    data,
    labels,
    title,
    xlabels,
    output_filename,
    show_legend_below=False,
):
    # wei to eth
    data = {key: [wei_to_eth(value) for value in data[key]] for key in data.keys()}

    fig, ax = plt.subplots(figsize=(16, 10))

    x = range(len(xlabels))
    bottoms = np.zeros(len(xlabels))

    for i, label in enumerate(labels):
        values = [data[key][i] for key in xlabels]
        bars = ax.bar(x, values, bottom=bottoms, label=label)
        for j, bar in enumerate(bars):
            height = bar.get_height()
            if height != 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bottoms[j] + height / 2,
                    f"{height:.6f}",
                    ha="center",
                    va="center",
                )
            bottoms[j] += height

    total_gas_costs = {key: sum(data[key]) for key in xlabels}
    for i, (key, total) in enumerate(total_gas_costs.items()):
        ax.text(
            x[i],
            bottoms[i] + 0.005 * max(bottoms),
            f"Total:\n{total:.6f} Sepolia ETH = {eth_to_usd(total):.2f} USD",
            ha="center",
            va="bottom",
            fontsize=10,
            color="black",
        )

    secax = ax.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel("USD")

    ax.set_title(title)
    ax.set_ylabel("Sepolia ETH")
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels)

    handles, labels = ax.get_legend_handles_labels()

    if show_legend_below:
        ax.legend(
            reversed(handles),
            reversed(labels),
            ncol=1,
            loc="upper center",
            bbox_to_anchor=(0.5, -0.05),
        )
    else:
        ax.legend(
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


def plot_contracts_gas_costs(registry_configs):
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

        for operation in operation_gas_costs.keys():
            gas_costs = [item["gasCostsInWei"] for item in entry["data"][operation]]
            mean_gas_costs = np.mean(gas_costs) if gas_costs else 0
            operation_gas_costs[operation].append(mean_gas_costs)

    # Creating the correct data structure
    data = {title: [] for title in titles}
    for operation in operation_gas_costs.keys():
        for i, title in enumerate(titles):
            data[title].append(operation_gas_costs[operation][i])

    labels = list(operation_gas_costs.keys())
    title = "Gas Costs Comparison of Registry Contracts using Means"
    xlabels = titles

    _plot_stacked_bar_chart(
        data,
        labels,
        title,
        xlabels,
        output_filename="gas_costs_comparison.png",
    )


def plot_passport_types_operation_gas_costs(
    data,
    labels,
    title,
    output_filename,
):
    xlabels = list(data.keys())

    _plot_stacked_bar_chart(
        data,
        labels,
        title,
        xlabels,
        output_filename,
        show_legend_below=True,
    )


def plot_passport_types_gas_costs(gas_costs_data):
    labels = gas_costs_data[0]["data"].keys()
    operations = [
        entry["operation"] for entry in gas_costs_data if entry["operation"] != "Read"
    ]

    data_dict = {label: {operation: [] for operation in operations} for label in labels}
    for entry in gas_costs_data:
        operation = entry["operation"]
        for label in labels:
            data_dict[label][operation] = entry["data"][label]

    x = np.arange(len(labels))
    width = 0.2

    fig, ax = plt.subplots(figsize=(16, 10))

    for i, operation in enumerate(operations):
        y = [np.sum(data_dict[label][operation]) for label in labels]
        y = [wei_to_eth(wei_value) for wei_value in y]
        bars = ax.bar(x + i * width, y, width, label=operation)

        for bar in bars:
            height = bar.get_height()

            # ax.text(
            #     bar.get_x() + bar.get_width() / 2,
            #     height / 2,
            #     f"{height:.2f}",
            #     ha="center",
            #     va="center",
            # )

            # ax.annotate(
            #     f"{height:.6f}",
            #     xy=(bar.get_x() + bar.get_width() / 2, height),
            #     xytext=(0, 2),
            #     textcoords="offset points",
            #     ha="center",
            #     va="bottom",
            # )

    secax = ax.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel("USD")

    ax.set_title("Gas Costs by Passport Type and Operation")
    ax.set_ylabel("Sepolia ETH")
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels(labels)
    ax.legend()

    plt.savefig(
        os.path.join(OUTPUT_PATH, "gas_costs_passport_types.png"),
        bbox_inches="tight",
    )
    plt.close()
