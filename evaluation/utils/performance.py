import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from utils.helpers import (
    OUTPUT_PATH,
    PERFORMANCE_LABEL_SIZE,
    PERFORMANCE_TITLE_SIZE,
    SHOW_TITLE,
    X_PAD,
    Y_PAD,
)

plt.rcParams["font.family"] = "Arial"


def plot_performance(
    data_list,
    labels,
    title,
    output_filename,
    x_axis,
    is_arweave=False,
):

    # Validate x_axis input
    if x_axis not in ["ms", "s"]:
        raise ValueError("Invalid x_axis value. Choose 'ms' or 's'.")

    plt.figure(figsize=(16, 8))

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
    if SHOW_TITLE:
        plt.title(
            title,
            fontsize=PERFORMANCE_TITLE_SIZE,
            pad=X_PAD,
        )
    plt.xlabel(
        f'Execution Time {"on Sepolia " if not is_arweave else ""}(2024-06-14 HH:MM CEST)',
        fontsize=PERFORMANCE_LABEL_SIZE,
        labelpad=X_PAD,
    )
    plt.ylabel(
        f"Duration ({unit})",
        fontsize=PERFORMANCE_LABEL_SIZE,
        labelpad=X_PAD,
    )

    plt.legend(
        # loc="upper center",
        # bbox_to_anchor=(0.5, -0.1),
        fontsize=PERFORMANCE_LABEL_SIZE,
    )

    plt.grid(True, which="both", linestyle="--", linewidth=0.5)
    plt.tick_params(
        axis="both",
        which="major",
        labelsize=PERFORMANCE_LABEL_SIZE,
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
    fig, ax = plt.subplots(figsize=(16, 8))

    x = range(len(xlabels))
    bottoms = np.zeros(len(xlabels))

    for i, label in enumerate(labels):
        values = [data[key][i] for key in xlabels]
        bars = ax.bar(x, values, bottom=bottoms, label=label)
        for j, bar in enumerate(bars):
            height = bar.get_height()

            adjustment = 0
            if round(height, 2) == 0.33:
                adjustment = 0.3

            if height != 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bottoms[j] + height / 2 + adjustment,
                    f"{height:.2f}",
                    ha="center",
                    va="center",
                    fontsize=PERFORMANCE_LABEL_SIZE,
                )

            bottoms[j] += height

    total_durations = {key: sum(data[key]) for key in xlabels}
    for i, (key, total) in enumerate(total_durations.items()):
        data_count = sum(1 for value in data[key] if value > 0)

        if data_count > 1:

            adjustment = 0
            if round(data[key][-1], 2) == 0:
                adjustment = 0.8

            ax.text(
                x[i],
                bottoms[i] + 0.007 * max(bottoms) + adjustment,
                f"Total: {total:.2f}",
                ha="center",
                va="bottom",
                fontsize=PERFORMANCE_LABEL_SIZE,
                color="black",
            )

    max_height = max(bottoms)
    ax.set_ylim(0, max_height * 1.15)

    if SHOW_TITLE:
        ax.set_title(
            title,
            fontsize=PERFORMANCE_TITLE_SIZE,
            pad=X_PAD,
        )
    ax.set_ylabel(
        "Duration (Seconds)",
        fontsize=PERFORMANCE_LABEL_SIZE,
        labelpad=X_PAD,
    )
    ax.set_xticks(x)
    ax.set_xticklabels(xlabels, fontsize=PERFORMANCE_LABEL_SIZE)
    ax.tick_params(
        axis="both",
        labelsize=PERFORMANCE_LABEL_SIZE,
        pad=Y_PAD,
    )

    handles, labels = ax.get_legend_handles_labels()

    if show_legend_inside_chart:
        ax.legend(
            reversed(handles),
            reversed(labels),
            ncol=1,
            fontsize=PERFORMANCE_LABEL_SIZE,
        )
    else:
        ax.legend(
            reversed(handles),
            reversed(labels),
            loc="upper center",
            bbox_to_anchor=(0.5, -0.065),
            fontsize=PERFORMANCE_LABEL_SIZE,
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

    data = {title: [] for title in titles}
    for operation in operation_performance.keys():
        for i, title in enumerate(titles):
            data[title].append(operation_performance[operation][i])

    labels = list(operation_performance.keys())
    labels = [label.capitalize() for label in labels]
    title = "Performance Comparison of Registry Contracts using Means"
    xlabels = titles

    _plot_stacked_bar_chart(
        data,
        labels,
        title,
        xlabels,
        output_filename="performance_contracts_combined.png",
        show_legend_inside_chart=True,
    )


def plot_passport_types_operation_performance(
    data,
    labels,
    title,
    output_filename,
):
    xlabels = list(data.keys())

    _plot_stacked_bar_chart(data, labels, title, xlabels, output_filename)


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
    width = 0.18

    fig, ax = plt.subplots(figsize=(16, 8))

    max_height = 0
    for i, operation in enumerate(operations):
        y = [np.sum(data_dict[label][operation]) for label in labels]
        bars = ax.bar(x + i * width, y, width, label=operation)

        adjustment = 0
        if i == 2:
            adjustment = -2
        if i == 3:
            adjustment = 2

        for bar in bars:
            height = bar.get_height()

            ax.annotate(
                f"{height:.2f}",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0 + adjustment, 2),
                textcoords="offset points",
                ha="center",
                va="bottom",
                fontsize=PERFORMANCE_LABEL_SIZE,
            )

            max_height = max(max_height, height)

    ax.set_ylim(0, max_height * 1.1)

    ax.set_ylabel(
        "Duration (Seconds)",
        fontsize=PERFORMANCE_LABEL_SIZE,
        labelpad=X_PAD,
    )

    if SHOW_TITLE:
        ax.set_title(
            "Performances by Passport Types",
            fontsize=PERFORMANCE_TITLE_SIZE,
            pad=X_PAD,
        )
    ax.set_xticks(x + width * 2)
    ax.set_xticklabels(labels, fontsize=PERFORMANCE_LABEL_SIZE)
    ax.tick_params(
        axis="both",
        labelsize=PERFORMANCE_LABEL_SIZE,
        pad=Y_PAD,
    )

    ncol = len(ax.get_legend_handles_labels()[0])
    ax.legend(
        ncol=ncol,
        loc="upper center",
        bbox_to_anchor=(0.5, -0.065),
        fontsize=PERFORMANCE_LABEL_SIZE,
    )

    plt.savefig(
        os.path.join(OUTPUT_PATH, "performance_passport_types.png"),
        bbox_inches="tight",
    )
    plt.close()
