import httpx

BASE_URL = "https://aviationweather.gov/api/data"


async def get_metar(icao: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/metar",
            params={
                "ids": icao,
                "format": "json",
                "hours": 2
            },
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        if not data:
            return None

        return data[0]