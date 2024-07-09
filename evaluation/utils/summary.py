import os

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
from utils.helpers import OUTPUT_PATH, PERFORMANCE_LABEL_SIZE, Y_PAD

x_labels = [
    "QR Code x NFT",
    "QR Code x DID",
    "HaLo NFC x PBT",
    "HaLo NFC x DID",
]
y_labels = [
    "Performance: Deployment",
    "Performance: Creation",
    "Performance: Reading",
    "Performance: Updating",
    "Performance: Deleting",
    "",  # Spacer
    "Costs: Deployment",
    "Costs: Creation",
    "Costs: Updating",
    "Costs: Deleting",
    "",  # Spacer
    "Scalability",
    "",  # Spacer
    "Interoperability",
    "",  # Spacer
    "Security",
]

data = [
    ["16.39s", "16.25s", "32.02s", "32.47s"],
    ["14.55s", "14.62s", "30.13s", "29.10s"],
    ["0.54s", "0.86s", "0.75s", "1.00s"],
    ["14.18s", "13.15s", "13.67s", "13.15s"],
    ["13.55s", "17.45s", "13.20s", "17.45s"],
    ["", "", "", ""],  # Spacer
    ["11.60 USD", "7.95 USD", "17.97 USD", "12.24 USD"],
    ["1.45 USD", "0.28 USD", "2.60 USD", "1.03 USD"],
    ["0.33 USD", "0.28 USD", "0.33 USD", "0.28 USD"],
    ["0.35 USD", "0.27 USD", "0.25 USD", "0.27 USD"],
    ["", "", "", ""],  # Spacer
    [
        "0 # Hardware\nIndependent",
        "0 # Hardware\nIndependent",
        "1 # Hardware\nDependent",
        "1 # Hardware\nDependent",
    ],
    ["", "", "", ""],  # Spacer
    [
        "0 # Easier\nMetadata Exchange",
        "0 # Easier\nMetadata Exchange",
        "1 # Harder\nMetadata Exchange",
        "1 # Harder\nMetadata Exchange",
    ],
    ["", "", "", ""],  # Spacer
    [
        "1 # Least\nTamper-Proof",
        "1 # Least\nTamper-Proof",
        "0 # Most\nTamper-Proof",
        "0.5 # Moderately\nTamper-Proof",
    ],
]


def convert_to_numeric(item):
    if item == "":
        return np.nan
    if item.endswith("s"):
        return float(item.replace("s", ""))
    elif item.endswith("USD"):
        return float(item.replace(" USD", ""))
    elif len(item.split(" # ")) > 1:
        return float(item.split(" # ")[0])
    else:
        return float(item)


numeric_data = [[convert_to_numeric(item) * -1 for item in row] for row in data]
numeric_data = np.array(numeric_data)


def plot_summary():
    normalized_data = np.zeros_like(numeric_data, dtype=float)
    for i in range(numeric_data.shape[0]):
        min_val = np.nanmin(numeric_data[i])
        max_val = np.nanmax(numeric_data[i])
        if min_val != max_val:
            normalized_data[i] = (numeric_data[i] - min_val) / (max_val - min_val)
        else:
            normalized_data[i] = 0.5
        # Set NaN values to neutral (0.5) for the blank rows
        normalized_data[i] = np.where(
            np.isnan(numeric_data[i]), 0.5, normalized_data[i]
        )

    mask = np.isnan(numeric_data)

    cmap = LinearSegmentedColormap.from_list(
        "relative_coloring", ["red", "yellow", "green"]
    )

    plt.figure(figsize=(16, 16))
    ax = sns.heatmap(
        normalized_data,
        xticklabels=x_labels,
        yticklabels=y_labels,
        cmap=cmap,
        cbar=True,
        annot=[
            [cell.split(" # ")[1] if "#" in cell else cell for cell in row]
            for row in data
        ],
        fmt="",
        annot_kws={"size": PERFORMANCE_LABEL_SIZE},
        mask=mask,
        cbar_kws={"shrink": 0.5},
    )

    ax.tick_params(left=False, bottom=False)

    cbar = ax.collections[0].colorbar
    cbar.set_ticks([0, 0.5, 1])
    cbar.set_ticklabels(
        ["Unfavorable\n(row-wise)", "Neutral\n(row-wise)", "Favorable\n(row-wise)"],
        fontsize=PERFORMANCE_LABEL_SIZE,
    )

    plt.yticks(rotation=0)

    plt.tick_params(
        axis="both",
        labelsize=PERFORMANCE_LABEL_SIZE,
        pad=Y_PAD,
    )

    plt.savefig(
        os.path.join(OUTPUT_PATH, "evaluation_summary.png"),
        bbox_inches="tight",
    )
    plt.close()
