from io import StringIO
import pandas as pd
import os
import json


out_dir = "../files/Networks"

bbox = [-74.0, -18.0, -44.0, 5.26]


def read_csv(filename):
    file_content = ""
    with open(filename, encoding="utf_8_sig") as f:
        for line in f:
            file_content += line[1:-2].replace('""', '"') + "\n"

    return pd.read_csv(StringIO(file_content)).fillna(-1)


def make_node(geocode, municipality):
    return {
        "id": geocode,
        "nodeLabel": municipality,
        "nodeDescription": "",
        "nodeAttributes": {
            "attGeo": {
                "geocode": geocode,
                "municipality": municipality,
            },
            "attAll": {},
        },
        "connectors": [],
        "pajekIndex": 0,
        "vNode": {
            "posX": -999,
            "posY": -999,
            "posZ": 0,
            "color": "#ffffff",
        },
    }


def process_environmental_data():
    df = read_csv("./source/TRAJETORIAS_DATASET_Environmental_dimension_indicators.csv")

    nodes = {}
    next_id = 0

    for row in df.to_dict(orient="records"):
        geocode = row["geocode"]
        municipality = row["municipality"]
        timestamp = row["period"]

        if geocode not in nodes:
            nodes[geocode] = make_node(geocode, municipality)
            next_id += 1
        node = nodes[geocode]

        attributes = node["nodeAttributes"]["attAll"]
        attributes[timestamp] = row

    return list(nodes.values())


def process_epidemiological_data():
    df = read_csv(
        "./source/TRAJETORIAS_DATASET_Epidemiological_dimension_indicators.csv"
    )

    def map_disease_to_key(disease):
        if disease == "chagas":
            return "chagas"
        if disease == "CL":
            return "cl"
        if disease == "VL":
            return "vl"
        if disease == "Dengue":
            return "dengue"
        if disease in ["Falciparum", "Vivax", "Vivax+Falciparum"]:
            return "malaria"
        return None

    nodes = {}
    next_id = 0

    for row in df.to_dict(orient="records"):
        geocode = row["geocode"]
        municipality = row["municipality"]
        zone = row["zone"]
        timestamp = row["period"]
        disease = row["disease"]
        cases = row["cases"]

        if zone != "total":
            continue

        if geocode not in nodes:
            nodes[geocode] = make_node(geocode, municipality)
            next_id += 1
        node = nodes[geocode]

        attributes = node["nodeAttributes"]["attAll"]
        if timestamp not in attributes:
            attributes[timestamp] = {}

        key = map_disease_to_key(disease)
        if not key:
            continue
        attributes[timestamp][key] = attributes[timestamp].get(key, 0) + cases

    return list(nodes.values())


def process_socioeconomic_data():
    df = read_csv(
        "./source/TRAJETORIAS_DATASET_Socio-Economic_dimension-indicators.csv"
    )

    nodes = {}
    next_id = 0

    for row in df.to_dict(orient="records"):
        geocode = row["geocode"]
        municipality = row["municipality"]
        timestamp = row["year"]

        if geocode not in nodes:
            nodes[geocode] = make_node(geocode, municipality)
            next_id += 1
        node = nodes[geocode]

        attributes = node["nodeAttributes"]["attAll"]
        attributes[timestamp] = row

    return list(nodes.values())


def process_population_data():
    df = read_csv("./source/TRAJETORIAS_DATASET_Population_indicators.csv")

    nodes = {}
    next_id = 0

    for row in df.to_dict(orient="records"):
        geocode = row["geocode"]
        municipality = row["municipality"]
        urb2006e = row["urb2006e"]
        rur2006e = row["rur2006e"]
        urb2017e = row["urb2017e"]
        rur2017e = row["rur2017e"]

        if geocode not in nodes:
            nodes[geocode] = make_node(geocode, municipality)
            next_id += 1
        node = nodes[geocode]

        node["nodeAttributes"]["attAll"] = {
            "2006": {
                "rural": rur2006e,
                "urban": urb2006e,
            },
            "2017": {
                "rural": rur2017e,
                "urban": urb2017e,
            },
        }

    return list(nodes.values())


def environmental(id, label):
    return {
        "clusterID": id,
        "clusterType": "geo",
        "clusterLabel": label,
        "clusterDescription": "Environmental Indicators",
        "mapName": "Brazil_Amazon.geojson",
        "bbox": bbox,
        "timestamps": ["2006", "2017"],
        "palette": {
            "deorg": ["seashell", "blueviolet"],
            "defor": ["seashell", "blueviolet"],
            "dgorg": ["seashell", "#8b3a3a"],
            "dgfor": ["seashell", "#8b3a3a"],
            "fire": ["seashell", "#ee7600"],
            "mining": ["seashell", "midnightblue"],
            "core": ["seashell", "forestgreen"],
            "edge": ["seashell", "forestgreen"],
            "refor": ["lavender", "#8b864e"],
            "secveg": ["lavender", "darkolivegreen"],
            "pasture": ["lavender", "#8b6508"],
            "crop": ["lavender", "#458b00"],
            "urban": ["lavender", "#8b0a50"],
            "road": ["#FFEFFF", "#68228b"],
            "river": ["#FFEFFF", "#8b3a62"],
            "port": ["#FFEFFF", "cadetblue"],
            "precp": ["azure", "steelblue"],
            "precn": ["azure", "#8b0a50"],
            "tempp": ["azure", "#8b2323"],
        },
        "dimensions": {
            "name": "Environmental",
            "children": [
                {
                    "name": "Habitat loss",
                    "children": [
                        {
                            "name": "Deforestation",
                            "children": [
                                {"name": "deorg", "key": "deorg"},
                                {"name": "defor", "key": "defor"},
                            ],
                        },
                        {
                            "name": "Forest degradation",
                            "children": [
                                {"name": "dgorg", "key": "dgorg"},
                                {"name": "dgfor", "key": "dgfor"},
                            ],
                        },
                        {
                            "name": "Fires",
                            "children": [{"name": "fire", "key": "fire"}],
                        },
                        {
                            "name": "Mining",
                            "children": [{"name": "mining", "key": "mining"}],
                        },
                        {
                            "name": "Vegetation fragmentation",
                            "children": [
                                {"name": "core", "key": "core"},
                                {"name": "edge", "key": "edge"},
                            ],
                        },
                    ],
                },
                {
                    "name": "Land Use and Land Cover",
                    "children": [
                        {
                            "name": "Remanent forest",
                            "children": [{"name": "refor", "key": "refor"}],
                        },
                        {
                            "name": "Secondary vegetation",
                            "children": [{"name": "secveg", "key": "secveg"}],
                        },
                        {
                            "name": "Pasture",
                            "children": [{"name": "pasture", "key": "pasture"}],
                        },
                        {
                            "name": "Crop",
                            "children": [{"name": "crop", "key": "crop"}],
                        },
                        {
                            "name": "Urban area",
                            "children": [{"name": "urban", "key": "urban"}],
                        },
                    ],
                },
                {
                    "name": "Transportation networks",
                    "children": [
                        {
                            "name": "Roads network",
                            "children": [{"name": "road", "key": "road"}],
                        },
                        {
                            "name": "Waterways network",
                            "children": [{"name": "river", "key": "river"}],
                        },
                        {
                            "name": "Ports",
                            "children": [{"name": "port", "key": "port"}],
                        },
                    ],
                },
                {
                    "name": "Climatic anomalies",
                    "children": [
                        {
                            "name": "Precipitation",
                            "children": [
                                {"name": "precp", "key": "precp"},
                                {"name": "precn", "key": "precn"},
                            ],
                        },
                        {
                            "name": "Temperature",
                            "children": [{"name": "tempp", "key": "tempp"}],
                        },
                    ],
                },
            ],
        },
        "nodes": process_environmental_data(),
    }


def epidemiological(id, label):
    return {
        "clusterID": id,
        "clusterType": "geo",
        "clusterLabel": label,
        "clusterDescription": "Epidemiological Indicators",
        "mapName": "Brazil_Amazon.geojson",
        "bbox": bbox,
        "palette": {
            "chagas": ["#d1eeee", "#00688b"],
            "cl": ["#d1eeee", "#27408b"],
            "vl": ["#d1eeee", "#473c8b"],
            "dengue": ["#d1eeee", "#36648b"],
            "malaria": ["#d1eeee", "midnightblue"],
        },
        "timestamps": ["2004-2008", "2015-2019"],
        "dimensions": {
            "name": "Epidemiological",
            "children": [
                {
                    "name": "Occurrence of diseases",
                    "children": [
                        {"name": "Chagas", "key": "chagas"},
                        {"name": "Cutaneous leishmaniasis", "key": "cl"},
                        {"name": "Visceral leishmaniasis", "key": "vl"},
                        {"name": "Dengue", "key": "dengue"},
                        {"name": "Malaria", "key": "malaria"},
                    ],
                }
            ],
        },
        "nodes": process_epidemiological_data(),
    }


def socioeconomic(id, label):
    return {
        "clusterID": id,
        "clusterType": "geo",
        "clusterLabel": label,
        "clusterDescription": "Socio-economic Indicators",
        "mapName": "Brazil_Amazon.geojson",
        "bbox": bbox,
        "palette": {
            "h": ["#e6f0ff", "#e5e5e5"],
            "A": ["#e6f0ff", "#e5e5e5"],
            "ipm": ["#e6f0ff", "#e5e5e5"],
        },
        "timestamps": ["2000", "2010"],
        "dimensions": {
            "name": "Socioeconomic",
            "children": [
                {
                    "name": "Multidimensional Poverty Index",
                    "children": [
                        {
                            "name": "Multidimensional Poverty Incidence (H)",
                            "key": "h",
                        },
                        {
                            "name": "Multidimensional Poverty Intensity (A)",
                            "key": "a",
                        },
                        {"name": "Deprivations", "key": "carpond"},
                        {"name": "Multidimensional Poverty Index", "key": "ipm"},
                    ],
                }
            ],
        },
        "nodes": process_socioeconomic_data(),
    }


def population(id, label):
    return {
        "clusterID": id,
        "clusterType": "geo",
        "clusterLabel": label,
        "clusterDescription": "Population Indicators",
        "mapName": "Brazil_Amazon.geojson",
        "bbox": bbox,
        "palette": {
            "rural": ["#e6f0ff", "#e5e5e5"],
            "urban": ["#e6f0ff", "#e5e5e5"],
        },
        "timestamps": ["2006", "2017"],
        "dimensions": {
            "name": "Population",
            "children": [
                {
                    "name": "Population",
                    "children": [
                        {"name": "Rural population", "key": "rural"},
                        {"name": "Urban population", "key": "urban"},
                    ],
                }
            ],
        },
        "nodes": process_population_data(),
    }


dataset = {
    "nodes": [
        environmental(0, "Environmental I"),
        environmental(1, "Environmental II"),
        epidemiological(2, "Epidemiological I"),
        epidemiological(3, "Epidemiological II"),
        socioeconomic(4, "Socioeconomic I"),
        socioeconomic(5, "Socioeconomic II"),
        population(6, "Population I"),
        population(7, "Population II"),
    ],
    "edges": [],
}

with open(os.path.join(out_dir, "3_network.json"), "w") as file:
    json.dump(dataset, file, indent=2, allow_nan=False)
