import httpx

BASE_URL = "https://aviationweather.gov/api/data/taf"


async def get_taf(icao: str):

    params = {
        "ids": icao,
        "format": "json"
    }

    async with httpx.AsyncClient(timeout=15) as client:

        response = await client.get(BASE_URL, params=params)

        response.raise_for_status()

        data = response.json()

        if not data:
            raise Exception(f"No TAF available for {icao}")

        return data[0]