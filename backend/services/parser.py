def parse_metar(data: dict):
    if not data:
        return None

    visibility_km = None

    if data.get("visib"):
        visibility_km = round(float(data["visib"]) * 1.60934, 1)

    ceiling_ft = None

    clouds = data.get("clouds", [])

    for layer in clouds:
        cover = layer.get("cover")
        base = layer.get("base")

        if cover in ["BKN", "OVC"]:
            ceiling_ft = base
            break

    return {
        "icao": data.get("icaoId"),
        "airport": data.get("name"),
        "temperature_c": data.get("temp"),
        "dewpoint_c": data.get("dewp"),
        "wind_dir_deg": data.get("wdir"),
        "wind_speed_kt": data.get("wspd"),
        "visibility_km": visibility_km,
        "ceiling_ft": ceiling_ft,
        "flight_category": data.get("fltCat"),
        "raw_metar": data.get("rawOb")
    }