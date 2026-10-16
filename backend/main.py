from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.awc import get_metar
from services.parser import parse_metar
from services.vfr_logic import evaluate_vfr
from datetime import datetime, UTC
from services.taf import get_taf
from services.taf_parser import parse_taf
from services.taf_logic import evaluate_taf
from services.route_logic import evaluate_route
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers.briefing_summary import router as briefing_summary_router

load_dotenv()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="SkyBrief API",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://sky-brief.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(briefing_summary_router)

@app.get("/")
def home():
    return {
        "status": "running",
        "project": "SkyBrief"
    }

@app.get("/health")
def health():
    return {
        "healthy": True
    }

@app.get("/briefing/{icao}")
async def briefing(icao: str):

    metar = await get_metar(icao.upper())

    parsed = parse_metar(metar)

    parsed["raw_metar"] = metar.get("rawOb")

    parsed["pressure_hpa"] = metar.get("altim")

    obs = metar.get("obsTime")

    if obs:
        parsed["observation_time"] = (
            datetime.fromtimestamp(obs, UTC)
            .strftime("%d %b %Y %H:%M UTC")
        )
    else:
        parsed["observation_time"] = None

    parsed["airport_elevation_ft"] = metar.get("elev")

    parsed["cloud_layers"] = [
        f"{c['cover']}{c['base']}"
        for c in metar.get("clouds", [])
    ]

    verdict = evaluate_vfr(parsed)

    return {
        "weather": parsed,
        "verdict": verdict
    }

@app.get("/taf/{icao}")
async def taf_briefing(icao: str):

    taf = await get_taf(icao.upper())

    parsed = parse_taf(taf)

    analysis = evaluate_taf(parsed)

    return {

        "forecast": parsed,

        "analysis": analysis

    }

@app.get("/route/{departure}/{destination}")
async def route_briefing(departure: str, destination: str):
    if len(departure) != 4 or not departure.isalpha():
        raise HTTPException(
        status_code=400,
        detail="Invalid ICAO code. Please enter a valid airport ICAO."
    )

    if len(destination) != 4 or not destination.isalpha():
        raise HTTPException(
        status_code=400,
        detail="Invalid ICAO code. Please enter a valid airport ICAO."
    )

    departure = departure.upper()
    destination = destination.upper()

    try:

        departure_metar = await get_metar(departure)
        destination_metar = await get_metar(destination)

    except Exception:

        raise HTTPException(
            status_code=404,
            detail="Invalid ICAO code. Please enter a valid airport ICAO."
        )

    if departure == destination:
        raise HTTPException(
            status_code=400,
            detail="Departure and destination airports cannot be the same."
    )

    departure_weather = parse_metar(departure_metar)
    destination_weather = parse_metar(destination_metar)

    decision = evaluate_route(
        departure_weather,
        destination_weather
    )

    return {
    "route": {
        "departure": departure.upper(),
        "destination": destination.upper(),
        "route_name": f"{departure.upper()} → {destination.upper()}",
        "type": "Domestic"
    },

    "departure": departure_weather,

    "destination": destination_weather,

    "decision": decision
    }