import json


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
                gas_costs_sum = sum(item["gasCostsInWei"] for item in record[key][1:])
                duration_sum = sum(item["durationInMs"] for item in record[key][1:])
                start_timestamp = record[key][0]["startTimestamp"]
                registry_actions[key].append(
                    {
                        "gasCostsInWei": gas_costs_sum,
                        "durationInMs": duration_sum,
                        "startTimestamp": start_timestamp,
                    }
                )

    return registry_actions
