from io import StringIO
import numpy as np
import pandas as pd
import os
import json
import csv
import random


out_dir = "../files/Networks"
os.makedirs(out_dir, exist_ok=True)

geojson_dir = "municipal-brazilian-geodata/data"
brazil_amazon = ["AC", "AM", "AP", "MA", "MT", "PA", "RO", "RR", "TO"]
bbox = [-74.0, -18.0, -44.0, 5.26]


def make_clusters(filename):
    clusters = {
        state: {
            "clusterID": i,
            "clusterType": "geo",
            "clusterLabel": state,
            "clusterDescription": "",
            "mapName": f"{state}.geojson",
            "bbox": bbox,
            "keyAttribute": "",  # TODO:
            "nodes": [],
        }
        for i, state in enumerate(brazil_amazon)
    }

    file_content = ""
    with open(filename, encoding="utf_8_sig") as f:
        for line in f:
            file_content += line[1:-2].replace('""', '"') + "\n"

    df = pd.read_csv(StringIO(file_content)).fillna(-1)
    geocodes_seen = set()

    for record in df.to_dict(orient="records"):
        state = record["state_abbrev"]
        geocode = record["geocode"]
        if type(state) != str or geocode in geocodes_seen:
            continue
        cluster = clusters[state]
        node = {
            "id": len(cluster["nodes"]),
            "nodeLabel": record["municipality"],
            "nodeDescription": "",
            "nodeAttributes": {"attRaw": record},
            "connectors": ["geo"],
            "pajekIndex": 0,
            "vNode": {
                "posX": -999,
                "posY": -999,
                "posZ": 0,
                "color": "#ffffff",
            },
        }
        cluster["nodes"].append(node)
        geocodes_seen.add(geocode)

    return list(clusters.values())


dataset = {
    "nodes": make_clusters(
        "TRAJETORIAS_DATASET_Environmental_dimension_indicators.csv",
        "defor",
    ),
    "edges": [],
}

# for i in range(1000):
#     source_cluster = random.choice(range(2))
#     source_index = random.choice(range(300))
#     target_cluster = random.choice(range(2))
#     target_index = random.choice(range(300))
#     dataset["edges"].append(
#         {
#             "source": {
#                 "cluster": str(source_cluster),
#                 "index": source_index,
#                 "pajekIndex": 0,
#             },
#             "target": {
#                 "cluster": str(target_cluster),
#                 "index": target_index,
#                 "pajekIndex": 0,
#             },
#             "kind": "geo",
#             "weight": 1,
#         }
#     )

with open(os.path.join(out_dir, "3_network.json"), "w") as file:
    json.dump(dataset, file, indent=2, allow_nan=False)
