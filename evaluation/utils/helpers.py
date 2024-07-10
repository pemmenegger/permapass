import os

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap

OUTPUT_PATH = "plots"
os.makedirs(OUTPUT_PATH, exist_ok=True)

GAS_COSTS_LABEL_SIZE = 20
GAS_COSTS_TITLE_SIZE = 22
PERFORMANCE_LABEL_SIZE = 18
PERFORMANCE_TITLE_SIZE = 20
X_PAD = 10
Y_PAD = 5

DELIMITER = "*"

SHOW_TITLE = False

ETH_CONVERSION = 1e18
# mainnet price on 2024-06-14 24:00 coingecko
ETH_TO_USD = 3465.32


def eth_to_usd(y):
    return y * ETH_TO_USD


def usd_to_eth(y):
    return y / ETH_TO_USD


def wei_to_eth(y):
    return y / ETH_CONVERSION


def plot_heatmap(data, numeric_data, x_labels, y_labels, output_filename):
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

    plt.figure(figsize=(16, len(y_labels)))
    ax = sns.heatmap(
        normalized_data,
        xticklabels=x_labels,
        yticklabels=y_labels,
        cmap=cmap,
        cbar=True,
        annot=[
            [cell.split(DELIMITER)[1] if DELIMITER in cell else cell for cell in row]
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
        os.path.join(OUTPUT_PATH, output_filename),
        bbox_inches="tight",
    )
    plt.close()
