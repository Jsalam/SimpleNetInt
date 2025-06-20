import json
import os

work_dir = "../files/Cartographies"
state_filter = [
    "BR-AC",
    "BR-AM",
    "BR-AP",
    "BR-MA",
    "BR-MT",
    "BR-PA",
    "BR-RO",
    "BR-RR",
    "BR-TO",
]


in_filepath = os.path.join(work_dir, "geoBoundaries-BRA-ADM1.geojson")
with open(in_filepath) as f:
    geojson = json.load(f)

geojson["features"] = [
    feature
    for feature in geojson["features"]
    if feature["properties"]["shapeISO"] in state_filter
]

out_filepath = os.path.join(work_dir, "states.geojson")
with open(out_filepath, "w") as f:
    json.dump(geojson, f)
