import json
import os

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

OUTPUT_PATH = "plots"
os.makedirs(OUTPUT_PATH, exist_ok=True)


def load_json(file_path):
    with open(file_path, "r") as f:
        return json.load(f)


def process_registry_data(data_path):
    all_registry_data = load_json(data_path)

    registry_actions = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }

    for record in all_registry_data["11155111"]:
        for key in registry_actions.keys():
            if not record[key]:
                continue
            elif len(record[key]) == 1:
                registry_actions[key].extend(record[key])
            else:
                gas_used_sum = sum(item["gasUsedInWei"] for item in record[key][1:])
                duration_sum = sum(item["durationInMs"] for item in record[key][1:])
                start_timestamp = record[key][0]["startTimestamp"]
                registry_actions[key].append(
                    {
                        "gasUsedInWei": gas_used_sum,
                        "durationInMs": duration_sum,
                        "startTimestamp": start_timestamp,
                    }
                )

    return registry_actions


def plot_durations(
    data_list,
    labels,
    title,
    output_filename,
    x_axis="ms",
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
        # Round down to the nearest 10 minutes
        df["formattedTimestamp"] = (
            df["startTimestamp"].dt.floor("10min").dt.strftime("%H:%M")
        )

        # Convert duration based on x_axis
        if x_axis == "s":
            df["duration"] = df["durationInMs"] / 1000
        else:
            df["duration"] = df["durationInMs"]

        mean_duration = df["duration"].mean()
        unit = x_axis

        plt.plot(
            df["formattedTimestamp"],
            df["duration"],
            label=f"{label} (mean: {mean_duration:.2f} {unit})",
            marker="o",
        )

    plt.xlabel("Start Time on 2024-06-13 (HH:MM CEST)")
    plt.ylabel(f"Duration ({unit})")
    plt.title(f"{title} Durations")
    plt.xticks(rotation=45)
    plt.legend()
    plt.grid(True, which="both", linestyle="--", linewidth=0.5)
    plt.tick_params(axis="both", which="major", labelsize=10)

    plt.savefig(os.path.join(OUTPUT_PATH, output_filename))
    plt.close()


def plot_gas_used(
    data_list,
    labels,
    title,
    output_filename,
):
    plt.figure(figsize=(14, 8))

    for _, (data, label) in enumerate(zip(data_list, labels)):
        df = pd.DataFrame(data)

        df["startTimestamp"] = (
            pd.to_datetime(df["startTimestamp"], unit="ms")
            .dt.tz_localize("UTC")
            .dt.tz_convert("Europe/Zurich")
        )
        # Round down to the nearest 10 minutes
        df["formattedTimestamp"] = (
            df["startTimestamp"].dt.floor("10min").dt.strftime("%H:%M")
        )

        mean_gas_used = df["gasUsedInWei"].mean()
        unit = "wei"

        plt.plot(
            df["formattedTimestamp"],
            df["gasUsedInWei"],
            label=f"{label} (mean: {mean_gas_used:.2f} {unit})",
            marker="o",
        )

    plt.xlabel("Start Time on 2024-06-13 (HH:MM CEST)")
    plt.ylabel(f"Gas Used ({unit})")
    plt.title(f"{title} Gas Used")
    plt.xticks(rotation=45)
    plt.legend()
    plt.grid(True, which="both", linestyle="--", linewidth=0.5)
    plt.tick_params(axis="both", which="major", labelsize=10)

    plt.savefig(os.path.join(OUTPUT_PATH, output_filename))
    plt.close()


def plot_duration_overview(registry_configs, output_filename="mean_crud_durations.png"):
    titles = []
    operation_durations = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }

    for entry in registry_configs:
        title = entry["title"]
        titles.append(title)

        for operation in operation_durations.keys():
            durations = [item["durationInMs"] for item in entry["data"][operation]]
            if durations:
                mean_duration = np.mean(durations) / 1000
            else:
                mean_duration = 0
            operation_durations[operation].append(mean_duration)

    df = pd.DataFrame(operation_durations, index=titles)
    df["total"] = df.sum(axis=1)

    x = np.arange(len(titles))
    width = 0.4

    fig, ax = plt.subplots(figsize=(14, 8))

    bottoms = np.zeros(len(titles))
    for operation in operation_durations.keys():
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
            f"Total: {total:.2f}s",
            ha="center",
            va="bottom",
            fontsize=10,
            color="black",
            fontweight="bold",
        )

    ax.set_ylabel("Duration (s)")
    ax.set_title("Mean CRUD Operation Durations for Registry Contracts")
    ax.set_xticks(x)
    ax.set_xticklabels(titles)
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), ncol=3)

    fig.tight_layout()
    plt.xticks(rotation=45, ha="right")
    plt.subplots_adjust(bottom=0.25)

    plt.savefig(os.path.join(OUTPUT_PATH, output_filename))
    plt.close()


def plot_gas_used_overview(registry_configs, output_filename="mean_crud_gas_used.png"):
    titles = []
    operation_gas_used = {
        "deployment": [],
        "create": [],
        "read": [],
        "update": [],
        "delete": [],
    }

    for entry in registry_configs:
        title = entry["title"]
        titles.append(title)

        for operation in operation_gas_used.keys():
            gas_used = [item["gasUsedInWei"] for item in entry["data"][operation]]
            if gas_used:
                mean_gas_used = np.mean(gas_used)
            else:
                mean_gas_used = 0
            operation_gas_used[operation].append(mean_gas_used)

    df = pd.DataFrame(operation_gas_used, index=titles)
    df["total"] = df.sum(axis=1)

    x = np.arange(len(titles))
    width = 0.4

    fig, ax = plt.subplots(figsize=(14, 8))

    bottoms = np.zeros(len(titles))
    for operation in operation_gas_used.keys():
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
                f"{mean:.0f}",
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
            f"Total: {total:.0f} Wei",
            ha="center",
            va="bottom",
            fontsize=10,
            color="black",
            fontweight="bold",
        )

    ax.set_ylabel("Gas Used (Wei)")
    ax.set_title("Mean CRUD Operation Gas Used for Registry Contracts")
    ax.set_xticks(x)
    ax.set_xticklabels(titles)
    ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), ncol=3)

    fig.tight_layout()
    plt.xticks(rotation=45, ha="right")
    plt.subplots_adjust(bottom=0.25)

    plt.savefig(os.path.join(OUTPUT_PATH, output_filename))
    plt.close()
