import json
import os

import matplotlib.pyplot as plt
import pandas as pd


def plot_durations(
    data_list,
    labels,
    title,
    output_path,
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
    plt.title(title)
    plt.xticks(rotation=45)
    plt.legend()
    plt.grid(True, which="both", linestyle="--", linewidth=0.5)
    plt.tick_params(axis="both", which="major", labelsize=10)

    # Ensure the output directory exists and save the plot
    os.makedirs(output_path, exist_ok=True)
    plt.savefig(os.path.join(output_path, output_filename))
    plt.close()


def load_json(file_path):
    with open(file_path, "r") as f:
        return json.load(f)


def process_registry_data(data, durations):
    for record in data["11155111"]:
        for key in durations.keys():
            if not record[key]:
                continue
            elif len(record[key]) == 1:
                durations[key].extend(record[key])
            else:
                duration_sum = sum(item["durationInMs"] for item in record[key][1:])
                start_timestamp = record[key][0]["startTimestamp"]
                durations[key].append(
                    {
                        "startTimestamp": start_timestamp,
                        "durationInMs": duration_sum,
                    }
                )
