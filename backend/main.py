from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.awc import get_metar
from services.parser import parse_metar
from services.vfr_logic import evaluate_vfr

app = FastAPI(
    title="Aviation Weather Briefing API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "status": "running",
        "project": "Aviation Weather Briefing System"
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

    verdict = evaluate_vfr(parsed)

    return {
        "weather": parsed,
        "verdict": verdict
    }