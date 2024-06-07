import json
import os
from datetime import datetime

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pytz

TARGET_CHAIN_ID = "11155111"
TARGET_CHAIN_NAME = {"31337": "Hardhat", "11155111": "Sepolia"}.get(
    TARGET_CHAIN_ID, "Unknown"
)
TARGET_TIMEZONE = pytz.timezone("Europe/Zurich")


def read_json_file(filename):
    with open(filename, "r") as file:
        return json.load(file)


def convert_timestamp_to_time_string(timestamp):
    dt = datetime.fromtimestamp(timestamp / 1000, tz=TARGET_TIMEZONE)
    return dt.strftime("%H:%M")


def plot_data(data, action, folder_path, plot_type):
    action_data = data.get(TARGET_CHAIN_ID, [])

    if not action_data:
        print(f"No data available for chain '{TARGET_CHAIN_NAME}'")
        return

    timestamps = [
        d[action]["performance"]["startTimestamp"] for d in action_data if action in d
    ]
    if plot_type == "duration":
        values = [
            d[action]["performance"]["durationInMs"] / 1000
            for d in action_data
            if action in d
        ]
        ylabel = "Duration (s)"
    elif plot_type == "gas_used":
        values = [
            d[action]["gasUsedInWei"]
            for d in action_data
            if action in d and "gasUsedInWei" in d[action]
        ]
        ylabel = "Gas Used (Wei)"

    if not timestamps or not values:
        print(f"No data available for action '{action}' with plot type '{plot_type}'")
        return

    time_datetimes = [
        datetime.fromtimestamp(ts / 1000, tz=TARGET_TIMEZONE) for ts in timestamps
    ]

    plt.figure(figsize=(10, 6))
    plt.plot(
        time_datetimes,
        values,
        marker="o",
        label=f"{action.capitalize()} {plot_type.capitalize()}",
    )

    plt.gca().xaxis.set_major_formatter(
        mdates.DateFormatter("%H:%M", tz=TARGET_TIMEZONE)
    )

    plt.xlabel("Execution Time (HH:MM) in timezone CEST")
    plt.ylabel(ylabel)
    title = " ".join([word.capitalize() for word in plot_type.split("_")])
    plt.title(f"{action.capitalize()} {title} on {TARGET_CHAIN_NAME}")
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.legend()

    plt.savefig(os.path.join(folder_path, f"{action}_{plot_type}.png"))
    plt.close()


def plot_summary(data, folder_path, plot_type):
    action_data = data.get(TARGET_CHAIN_ID, [])

    if not action_data:
        print(f"No data available for chain '{TARGET_CHAIN_NAME}'")
        return

    actions = ["deployment", "create", "read", "update", "delete"]
    plt.figure(figsize=(14, 8))

    for action in actions:
        timestamps = [
            d[action]["performance"]["startTimestamp"]
            for d in action_data
            if action in d
        ]
        if plot_type == "duration":
            values = [
                d[action]["performance"]["durationInMs"] / 1000
                for d in action_data
                if action in d
            ]
            ylabel = "Duration (s)"
        elif plot_type == "gas_used":
            values = [
                d[action]["gasUsedInWei"]
                for d in action_data
                if action in d and "gasUsedInWei" in d[action]
            ]
            ylabel = "Gas Used (Wei)"

        if not timestamps or not values:
            print(
                f"No data available for action '{action}' with plot type '{plot_type}'"
            )
            continue

        time_datetimes = [
            datetime.fromtimestamp(ts / 1000, tz=TARGET_TIMEZONE) for ts in timestamps
        ]

        plt.plot(
            time_datetimes,
            values,
            marker="o",
            label=f"{action.capitalize()}",
        )

    plt.gca().xaxis.set_major_formatter(
        mdates.DateFormatter("%H:%M", tz=TARGET_TIMEZONE)
    )

    plt.xlabel("Execution Time (HH:MM) in timezone CEST")
    plt.ylabel(ylabel)
    title = " ".join([word.capitalize() for word in plot_type.split("_")])
    plt.title(f"Summary of {title} on {TARGET_CHAIN_NAME}")
    plt.xticks(rotation=45)
    plt.grid(True)
    plt.legend()

    plt.savefig(os.path.join(folder_path, f"summary_{plot_type}.png"))
    plt.close()


def plot_contract_data(contract_name):
    folder_path = os.path.join("plots", contract_name)
    os.makedirs(folder_path, exist_ok=True)

    filename = os.path.join("data", f"{contract_name}.json")
    data = read_json_file(filename)

    actions = ["deployment", "create", "read", "update", "delete"]
    for action in actions:
        plot_data(data, action, folder_path, "duration")
        plot_data(data, action, folder_path, "gas_used")

    plot_summary(data, folder_path, "duration")
    plot_summary(data, folder_path, "gas_used")


def main():
    contract_name = "NFTRegistry"
    plot_contract_data(contract_name)


if __name__ == "__main__":
    main()
