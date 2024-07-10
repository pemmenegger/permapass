import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from utils.helpers import (
    GAS_COSTS_LABEL_SIZE,
    GAS_COSTS_TITLE_SIZE,
    OUTPUT_PATH,
    SHOW_TITLE,
    X_PAD,
    Y_PAD,
    eth_to_usd,
    usd_to_eth,
    wei_to_eth,
)

plt.rcParams["font.family"] = "Arial"


def plot_gas_costs(data_list, labels, title, output_filename):
    fig, ax = plt.subplots(figsize=(16, 8))

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

        ax.plot(
            df["formattedTimestamp"],
            df["gasCostsInEther"],
            label=f"{label} (Mean: {mean_gas_costs_eth:.6f} SETH / {eth_to_usd(mean_gas_costs_eth):.2f} USD)",
            marker="o",
        )

    secax = ax.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel(
        "USD",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )

    if SHOW_TITLE:
        ax.set_title(
            title,
            fontsize=GAS_COSTS_TITLE_SIZE,
            pad=X_PAD,
        )
    ax.set_xlabel(
        "Execution Time on Sepolia (2024-06-14 HH:MM CEST)",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )
    ax.set_ylabel(
        "Sepolia ETH (SETH)",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )

    ax.legend(
        # loc="upper center",
        # bbox_to_anchor=(0.5, -0.075),
        fontsize=GAS_COSTS_LABEL_SIZE,
    )

    ax.grid(True, which="both", linestyle="--", linewidth=0.5)
    ax.tick_params(
        axis="both",
        which="major",
        labelsize=GAS_COSTS_LABEL_SIZE,
        pad=Y_PAD,
    )
    secax.tick_params(
        axis="both",
        which="major",
        labelsize=GAS_COSTS_LABEL_SIZE,
        pad=Y_PAD,
    )

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
    show_legend_inside_chart=False,
):
    # wei to eth
    data = {key: [wei_to_eth(value) for value in data[key]] for key in data.keys()}

    fig, ax = plt.subplots(figsize=(16, 8))

    x = range(len(xlabels))
    bottoms = np.zeros(len(xlabels))

    max_height = 0
    for i, label in enumerate(labels):
        values = [data[key][i] for key in xlabels]
        bars = ax.bar(x, values, bottom=bottoms, label=label)
        for j, bar in enumerate(bars):
            height = bar.get_height()
            if height != 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bottoms[j] + height / 2,
                    f"{height:.6f} / {eth_to_usd(height):.2f}",
                    ha="center",
                    va="center",
                    fontsize=GAS_COSTS_LABEL_SIZE,
                )
            bottoms[j] += height

            max_height = max(max_height, bottoms[j])

    total_gas_costs = {key: sum(data[key]) for key in xlabels}
    for i, (key, total) in enumerate(total_gas_costs.items()):
        data_count = sum(1 for value in data[key] if value > 0)
        if data_count > 1:
            ax.text(
                x[i],
                bottoms[i] + 0.007 * max(bottoms),
                f"Total:\n{total:.6f} / {eth_to_usd(total):.2f}",
                ha="center",
                va="bottom",
                fontsize=GAS_COSTS_LABEL_SIZE,
                color="black",
            )

    ax.set_ylim(0, max_height * 1.2)

    secax = ax.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel(
        "USD",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )

    if SHOW_TITLE:
        ax.set_title(
            title,
            fontsize=GAS_COSTS_TITLE_SIZE,
            pad=X_PAD,
        )
    ax.set_ylabel(
        "Sepolia ETH (SETH)",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels, fontsize=GAS_COSTS_LABEL_SIZE)

    ax.tick_params(
        axis="both",
        labelsize=GAS_COSTS_LABEL_SIZE,
        pad=Y_PAD,
    )
    secax.tick_params(
        axis="both",
        which="major",
        labelsize=GAS_COSTS_LABEL_SIZE,
        pad=Y_PAD,
    )

    handles, labels = ax.get_legend_handles_labels()

    if show_legend_inside_chart:
        ax.legend(
            reversed(handles),
            reversed(labels),
            ncol=1,
            fontsize=GAS_COSTS_LABEL_SIZE,
        )
    else:
        ax.legend(
            reversed(handles),
            reversed(labels),
            loc="upper center",
            bbox_to_anchor=(0.5, -0.075),
            fontsize=GAS_COSTS_LABEL_SIZE,
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
    labels = [label.capitalize() for label in labels]
    title = "Gas Costs Comparison of Registry Contracts using Means"
    xlabels = titles

    _plot_stacked_bar_chart(
        data,
        labels,
        title,
        xlabels,
        output_filename="gas_costs_comparison.png",
        show_legend_inside_chart=True,
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
    )


def plot_passport_types_gas_costs(gas_costs_data):
    labels = gas_costs_data[0]["data"].keys()

    to_exclude = ["Deployment", "Reading"]
    operations = [
        entry["operation"]
        for entry in gas_costs_data
        if entry["operation"] not in to_exclude
    ]

    data_dict = {label: {operation: [] for operation in operations} for label in labels}
    for entry in gas_costs_data:
        operation = entry["operation"]
        for label in labels:
            data_dict[label][operation] = entry["data"][label]

    x = np.arange(len(labels))
    width = 0.2

    fig, ax = plt.subplots(figsize=(16, 8))

    max_height = 0
    for i, operation in enumerate(operations):
        y = [np.sum(data_dict[label][operation]) for label in labels]
        y = [wei_to_eth(wei_value) for wei_value in y]
        bars = ax.bar(x + i * width, y, width, label=operation)

        for bar in bars:
            height = bar.get_height()

            usd = eth_to_usd(height)

            ax.annotate(
                f"{usd:.2f}",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 2),
                textcoords="offset points",
                ha="center",
                va="bottom",
                fontsize=GAS_COSTS_LABEL_SIZE,
            )

            max_height = max(max_height, height)

    ax.set_ylim(0, max_height * 1.15)

    secax = ax.secondary_yaxis("right", functions=(eth_to_usd, usd_to_eth))
    secax.set_ylabel(
        "USD",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )

    if SHOW_TITLE:
        ax.set_title(
            "Gas Costs by Passport Types",
            fontsize=GAS_COSTS_TITLE_SIZE,
            pad=X_PAD,
        )
    ax.set_ylabel(
        "Sepolia ETH (SETH)",
        fontsize=GAS_COSTS_LABEL_SIZE,
        labelpad=X_PAD,
    )
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels(labels, fontsize=GAS_COSTS_LABEL_SIZE)
    ax.tick_params(
        axis="both",
        labelsize=GAS_COSTS_LABEL_SIZE,
        pad=Y_PAD,
    )

    ncol = len(ax.get_legend_handles_labels()[0])
    ax.legend(
        ncol=ncol,
        loc="upper center",
        bbox_to_anchor=(0.5, -0.075),
        fontsize=GAS_COSTS_LABEL_SIZE,
    )

    secax.tick_params(
        axis="both",
        which="major",
        labelsize=GAS_COSTS_LABEL_SIZE,
        pad=Y_PAD,
    )

    plt.savefig(
        os.path.join(OUTPUT_PATH, "gas_costs_passport_types.png"),
        bbox_inches="tight",
    )
    plt.close()
