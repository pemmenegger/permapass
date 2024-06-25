import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from utils.helpers import OUTPUT_PATH


def plot_performance(
    data_list,
    labels,
    title,
    output_filename,
    x_axis,
):

    # Validate x_axis input
    if x_axis not in ["ms", "s"]:
        raise ValueError("Invalid x_axis value. Choose 'ms' or 's'.")

    plt.figure(figsize=(14, 8))

    for _, (data, label) in enumerate(zip(data_list, labels)):
        df = pd.DataFrame(data)

        df["startTimestamp"] = (
            pd.to_datetime(df["startTimestamp"], unit="ms")
            .dt.tz_localize("UTC")
            .dt.tz_convert("Europe/Zurich")
        )
        # Round down to the nearest 5 minutes
        df["formattedTimestamp"] = (
            df["startTimestamp"].dt.floor("5min").dt.strftime("%H:%M")
        )

        # Convert duration based on x_axis
        if x_axis == "s":
            df["duration"] = df["durationInMs"] / 1000
        else:
            df["duration"] = df["durationInMs"]

        mean_duration = df["duration"].mean()
        unit = "Seconds" if x_axis == "s" else "Milliseconds"

        plt.plot(
            df["formattedTimestamp"],
            df["duration"],
            label=f"{label} (Mean: {mean_duration:.2f} {unit})",
            marker="o",
        )

    plt.title(f"{title} (2024-06-14 on Sepolia)", fontsize=18)
    plt.xlabel("Execution Time (HH:MM CEST)", fontsize=14)
    plt.ylabel(f"Duration ({unit})", fontsize=14)

    plt.legend(ncol=1, fontsize=14)
    plt.grid(True, which="both", linestyle="--", linewidth=0.5)
    plt.tick_params(axis="both", which="major", labelsize=14)

    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()


def plot_stacked_bar_chart(
    data,
    labels,
    title,
    xlabels,
    output_filename,
    show_legend_below=False,
):
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
                    f"{height:.2f}",
                    ha="center",
                    va="center",
                    fontsize=14,
                )
            bottoms[j] += height

    total_durations = {key: sum(data[key]) for key in xlabels}
    for i, (key, total) in enumerate(total_durations.items()):
        ax.text(
            x[i],
            bottoms[i] + 0.007 * max(bottoms),
            f"Total:\n{total:.2f} Seconds",
            ha="center",
            va="bottom",
            fontsize=14,
            color="black",
        )

    max_height = max(bottoms)
    ax.set_ylim(0, max_height * 1.1)

    ax.set_title(title, fontsize=18)
    ax.set_ylabel("Duration (Seconds)", fontsize=14)
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels, fontsize=14)
    ax.tick_params(axis="y", labelsize=14)

    handles, labels = ax.get_legend_handles_labels()

    if show_legend_below:
        ax.legend(
            reversed(handles),
            reversed(labels),
            ncol=1,
            loc="upper center",
            bbox_to_anchor=(0.5, -0.05),
            fontsize=14,
        )
    else:
        ax.legend(
            reversed(handles),
            reversed(labels),
            ncol=1,
            fontsize=14,
        )

    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()


def plot_contracts_performance(registry_configs):
    titles = []
    operation_performance = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }

    for entry in registry_configs:
        title = entry["title"]
        titles.append(title)

        for operation in operation_performance.keys():
            durations = [item["durationInMs"] for item in entry["data"][operation]]
            mean_duration = np.mean(durations) / 1000 if durations else 0
            operation_performance[operation].append(mean_duration)

    # Creating the correct data structure
    data = {title: [] for title in titles}
    for operation in operation_performance.keys():
        for i, title in enumerate(titles):
            data[title].append(operation_performance[operation][i])

    labels = list(operation_performance.keys())
    labels = [label.capitalize() for label in labels]
    title = "Performance Comparison of Registry Contracts using Means"
    xlabels = titles

    plot_stacked_bar_chart(
        data,
        labels,
        title,
        xlabels,
        output_filename="performance_contract_comparison.png",
    )


def plot_passport_types_operation_performance(
    data,
    labels,
    title,
    output_filename,
):
    xlabels = list(data.keys())

    plot_stacked_bar_chart(
        data,
        labels,
        title,
        xlabels,
        output_filename,
        show_legend_below=True,
    )


def plot_passport_types_performance(performance_data):
    labels = performance_data[0]["data"].keys()

    to_exclude = ["Deployment"]
    operations = [
        entry["operation"]
        for entry in performance_data
        if entry["operation"] not in to_exclude
    ]

    data_dict = {label: {operation: [] for operation in operations} for label in labels}
    for entry in performance_data:
        operation = entry["operation"]
        for label in labels:
            data_dict[label][operation] = entry["data"][label]

    x = np.arange(len(labels))
    width = 0.2

    fig, ax = plt.subplots(figsize=(16, 10))

    for i, operation in enumerate(operations):
        y = [np.sum(data_dict[label][operation]) for label in labels]
        bars = ax.bar(x + i * width, y, width, label=operation)

        for bar in bars:
            height = bar.get_height()

            # ax.text(
            #     bar.get_x() + bar.get_width() / 2,
            #     height / 2,
            #     f"{height:.2f}",
            #     ha="center",
            #     va="center",
            #     fontsize=14,
            # )

            # ax.annotate(
            #     f"{height:.2f}",
            #     xy=(bar.get_x() + bar.get_width() / 2, height),
            #     xytext=(0, 2),
            #     textcoords="offset points",
            #     ha="center",
            #     va="bottom",
            # )

    ax.set_ylabel("Duration (Seconds)", fontsize=14)
    ax.set_title("Performance by Passport Type and Operation", fontsize=18)
    ax.set_xticks(x + width * 1.5)
    ax.set_xticklabels(labels)
    ax.tick_params(axis="both", labelsize=14)
    ax.legend(fontsize=14)

    plt.savefig(
        os.path.join(OUTPUT_PATH, "performance_passport_types.png"),
        bbox_inches="tight",
    )
    plt.close()
