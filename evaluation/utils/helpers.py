import os

OUTPUT_PATH = "plots"
os.makedirs(OUTPUT_PATH, exist_ok=True)

GAS_COSTS_LABEL_SIZE = 20
GAS_COSTS_TITLE_SIZE = 22
PERFORMANCE_LABEL_SIZE = 18
PERFORMANCE_TITLE_SIZE = 20
X_PAD = 10
Y_PAD = 5

ETH_CONVERSION = 1e18
# mainnet price on 2024-06-14 24:00 coingecko
ETH_TO_USD = 3465.32


def eth_to_usd(y):
    return y * ETH_TO_USD


def usd_to_eth(y):
    return y / ETH_TO_USD


def wei_to_eth(y):
    return y / ETH_CONVERSION
