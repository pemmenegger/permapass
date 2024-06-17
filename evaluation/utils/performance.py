import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from utils.constants import OUTPUT_PATH


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

    plt.title(f"{title} (2024-06-14 on Sepolia)")
    plt.xlabel("Execution Time (HH:MM CEST)")
    plt.ylabel(f"Duration ({unit})")

    plt.legend(ncol=1)
    plt.grid(True, which="both", linestyle="--", linewidth=0.5)
    plt.tick_params(axis="both", which="major", labelsize=10)

    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()


def plot_performance_comparison(
    registry_configs,
    output_filename="performance_comparison.png",
):
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
            if operation not in operation_performance:
                continue
            durations = [item["durationInMs"] for item in entry["data"][operation]]
            if durations:
                mean_duration = np.mean(durations) / 1000
            else:
                mean_duration = 0
            operation_performance[operation].append(mean_duration)

    df = pd.DataFrame(operation_performance, index=titles)
    df["total"] = df.sum(axis=1)

    x = np.arange(len(titles))
    width = 0.4

    fig, ax = plt.subplots(figsize=(16, 10))

    bottoms = np.zeros(len(titles))
    for operation in operation_performance.keys():
        bar = ax.bar(
            x,
            df[operation],
            width,
            bottom=bottoms,
            label=operation.capitalize(),
        )
        for rect, mean in zip(bar, df[operation]):
            height = rect.get_height()
            ax.text(
                rect.get_x() + rect.get_width() / 2.0,
                rect.get_y() + height / 2.0,
                f"{mean:.2f}",
                ha="center",
                va="center",
                fontsize=9,
                color="black",
            )
        bottoms += df[operation].values

    for i, total in enumerate(df["total"]):
        ax.text(
            x[i],
            bottoms[i] + 0.1,
            f"Total:\n{total:.2f} Seconds",
            ha="center",
            va="bottom",
            fontsize=10,
            color="black",
            fontweight="bold",
        )

    ax.set_title("Performance Comparison of Registry Contracts using Means")
    ax.set_ylabel("Duration (Seconds)")
    ax.set_xticks(x)
    ax.set_xticklabels(titles)

    handles, labels = ax.get_legend_handles_labels()
    ax.legend(
        reversed(handles),
        reversed(labels),
        ncol=1,
        bbox_to_anchor=(0.69, 0.92),
        loc="center",
    )

    plt.savefig(
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()
