from datetime import datetime


def unix_to_utc(timestamp):
    if timestamp is None:
        return None

    return datetime.utcfromtimestamp(timestamp).strftime(
        "%d %b %Y %H:%M UTC"
    )


def parse_taf(data):

    forecasts = []

    for period in data.get("fcsts", []):

        cloud_layers = []

        for cloud in period.get("clouds", []):

            layer = f"{cloud['cover']}{cloud['base']}"

            if cloud.get("type"):
                layer += cloud["type"]

            cloud_layers.append(layer)

        forecasts.append({

            "type": period.get("fcstChange") or "INITIAL",

            "from": unix_to_utc(period.get("timeFrom")),

            "to": unix_to_utc(period.get("timeTo")),

            "wind_dir_deg": period.get("wdir"),

            "wind_speed_kt": period.get("wspd"),

            "wind_gust_kt": period.get("wgst"),

            "visibility_km": period.get("visib"),

            "weather": period.get("wxString"),

            "clouds": cloud_layers

        })

    return {

        "icao": data.get("icaoId"),

        "airport": data.get("name"),

        "issue_time": unix_to_utc(data.get("issueTime")) if isinstance(data.get("issueTime"), int) else data.get("issueTime"),

        "valid_from": unix_to_utc(data.get("validTimeFrom")),

        "valid_to": unix_to_utc(data.get("validTimeTo")),

        "raw_taf": data.get("rawTAF"),

        "airport_elevation_ft": data.get("elev"),

        "forecast_periods": forecasts

    }