import numpy as np
from utils.helpers import DELIMITER, plot_heatmap

x_labels = [
    "QR Code x NFT",
    "QR Code x DID",
    "HaLo NFC x PBT",
    "HaLo NFC x DID",
]


def convert_to_numeric(item):
    if item == "":
        return np.nan
    if item.endswith("s"):
        return float(item.replace("s", ""))
    elif item.endswith("USD"):
        return float(item.replace(" USD", ""))
    elif len(item.split(DELIMITER)) > 1:
        return float(item.split(DELIMITER)[0])
    else:
        return float(item)


def plot_performance_summary():
    y_labels = [
        "Infrastructure Deployment",
        "",  # Spacer
        "",  # Spacer
        "Passport Creation",
        "",  # Spacer
        "Passport Reading",
        "",  # Spacer
        "Passport Update",
        "",  # Spacer
        "Passport Deletion",
    ]

    data = [
        ["16.39s", "16.25s", "32.02s", "32.47s"],
        ["", "", "", ""],  # Spacer
        ["", "", "", ""],  # Spacer
        ["14.55s", "14.62s", "30.13s", "29.10s"],
        ["", "", "", ""],  # Spacer
        ["0.54s", "0.86s", "0.75s", "1.00s"],
        ["", "", "", ""],  # Spacer
        ["14.18s", "13.15s", "13.67s", "13.15s"],
        ["", "", "", ""],  # Spacer
        ["13.55s", "17.45s", "13.20s", "17.45s"],
    ]

    numeric_data = [[convert_to_numeric(item) * -1 for item in row] for row in data]
    numeric_data = np.array(numeric_data)

    plot_heatmap(
        data,
        numeric_data,
        x_labels,
        y_labels,
        "summary_performance.png",
    )


def plot_costs_summary():
    y_labels = [
        "Infrastructure Deployment",
        "",  # Spacer
        "",  # Spacer
        "Passport Creation",
        "",  # Spacer
        "Passport Update",
        "",  # Spacer
        "Passport Deletion",
    ]

    data = [
        ["11.60 USD", "7.95 USD", "17.97 USD", "12.24 USD"],
        ["", "", "", ""],  # Spacer
        ["", "", "", ""],  # Spacer
        ["1.45 USD", "0.28 USD", "2.60 USD", "1.03 USD"],
        ["", "", "", ""],  # Spacer
        ["0.33 USD", "0.28 USD", "0.33 USD", "0.28 USD"],
        ["", "", "", ""],  # Spacer
        ["0.35 USD", "0.27 USD", "0.25 USD", "0.27 USD"],
    ]

    numeric_data = [[convert_to_numeric(item) * -1 for item in row] for row in data]
    numeric_data = np.array(numeric_data)

    plot_heatmap(
        data,
        numeric_data,
        x_labels,
        y_labels,
        "summary_costs.png",
    )


def plot_theoretical_criteria_summary():
    y_labels = [
        "Scalability",
        "",  # Spacer
        "Interoperability",
        "",  # Spacer
        "Security",
    ]

    data = [
        [
            f"0{DELIMITER}Hardware\nIndependent",
            f"0{DELIMITER}Hardware\nIndependent",
            f"1{DELIMITER}Hardware\nDependent",
            f"1{DELIMITER}Hardware\nDependent",
        ],
        ["", "", "", ""],  # Spacer
        [
            f"0{DELIMITER}Easier\nMetadata Exchange",
            f"0{DELIMITER}Easier\nMetadata Exchange",
            f"1{DELIMITER}Harder\nMetadata Exchange",
            f"1{DELIMITER}Harder\nMetadata Exchange",
        ],
        ["", "", "", ""],  # Spacer
        [
            f"1{DELIMITER}Least\nTamper-Proof",
            f"1{DELIMITER}Least\nTamper-Proof",
            f"0{DELIMITER}Most\nTamper-Proof",
            f"0.5{DELIMITER}Moderately\nTamper-Proof",
        ],
    ]

    numeric_data = [[convert_to_numeric(item) * -1 for item in row] for row in data]
    numeric_data = np.array(numeric_data)

    plot_heatmap(
        data,
        numeric_data,
        x_labels,
        y_labels,
        "summary_theoretical_criteria.png",
    )


def plot_summary():
    plot_performance_summary()
    plot_costs_summary()
    plot_theoretical_criteria_summary()
