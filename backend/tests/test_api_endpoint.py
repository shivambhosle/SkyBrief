import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from main import app
from schemas.briefing import LLMBriefingOutput

client = TestClient(app)


def test_invalid_icao_rejected():
    # 5 characters instead of 4
    response = client.post("/api/briefing/summary", json={"icao": "KJFKX", "report_type": "METAR"})
    assert response.status_code == 422

    # Contains numbers
    response = client.post("/api/briefing/summary", json={"icao": "K123", "report_type": "METAR"})
    assert response.status_code == 422

    # Invalid report type
    response = client.post("/api/briefing/summary", json={"icao": "KJFK", "report_type": "NOTAM"})
    assert response.status_code == 422


@patch("routers.briefing_summary.get_metar", new_callable=AsyncMock)
@patch("routers.briefing_summary.generate_plain_english_briefing", new_callable=AsyncMock)
def test_successful_metar_summary_endpoint(mock_llm, mock_get_metar):
    mock_get_metar.return_value = {
        "icaoId": "KJFK",
        "name": "John F Kennedy International Airport",
        "temp": 20,
        "dewp": 12,
        "wdir": 180,
        "wspd": 10,
        "visib": "6+",
        "altim": 1013,
        "rawOb": "METAR KJFK 121853Z 18010KT 10SM CLR 20/12 A2992",
        "clouds": [],
        "fltCat": "VFR"
    }

    mock_llm.return_value = (
        LLMBriefingOutput(
            summary="Calm visual conditions at KJFK with winds from 180° at 10 kt.",
            wind_summary="Winds from 180° at 10 kt.",
            visibility_category="Good",
            ceiling_category="Clear",
            hazards=[],
            data_gaps=[]
        ),
        "ok"
    )

    response = client.post(
        "/api/briefing/summary",
        json={"icao": "KJFK", "report_type": "METAR"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["icao"] == "KJFK"
    assert data["report_type"] == "METAR"
    assert data["verification"]["passed"] is True
    assert data["status"] == "ok"
    assert data["summary"]["wind_summary"] == "Winds from 180° at 10 kt."


@patch("routers.briefing_summary.get_metar", new_callable=AsyncMock)
def test_404_when_airport_not_found(mock_get_metar):
    mock_get_metar.return_value = None

    response = client.post(
        "/api/briefing/summary",
        json={"icao": "ZZZZ", "report_type": "METAR"}
    )

    assert response.status_code == 404
    assert "No METAR observation found" in response.json()["detail"]
