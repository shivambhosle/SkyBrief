"""
API Router for LLM Plain-English Briefing Summaries.
Provides rate-limited POST /api/briefing/summary.
"""

from datetime import datetime, UTC
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from schemas.briefing import BriefingSummaryRequest, BriefingSummaryResponse
from services.awc import get_metar
from services.parser import parse_metar
from services.taf import get_taf
from services.taf_parser import parse_taf
from services.llm_briefing import generate_plain_english_briefing
from services.verifier import verify_briefing

router = APIRouter(prefix="/api/briefing", tags=["briefing"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/summary", response_model=BriefingSummaryResponse)
@limiter.limit("30/minute")
async def get_briefing_summary(request: Request, body: BriefingSummaryRequest):
    """
    Generate a plain-English operational briefing for a given ICAO and report type (METAR or TAF).
    Reuses existing fetch and parse modules; does not re-parse raw data.
    """
    icao = body.icao.upper()
    report_type = body.report_type.upper()

    try:
        if report_type == "METAR":
            raw_metar_dict = await get_metar(icao)
            if not raw_metar_dict:
                raise HTTPException(
                    status_code=404,
                    detail=f"No METAR observation found for {icao}. Please verify the ICAO code."
                )

            parsed = parse_metar(raw_metar_dict)
            if not parsed:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse METAR data for {icao}."
                )

            # Enrich parsed data using existing main.py conventions
            parsed["raw_metar"] = raw_metar_dict.get("rawOb")
            parsed["pressure_hpa"] = raw_metar_dict.get("altim")
            obs = raw_metar_dict.get("obsTime")
            if obs:
                parsed["observation_time"] = (
                    datetime.fromtimestamp(obs, UTC).strftime("%d %b %Y %H:%M UTC")
                )
            else:
                parsed["observation_time"] = None
            parsed["airport_elevation_ft"] = raw_metar_dict.get("elev")
            parsed["cloud_layers"] = [
                f"{c['cover']}{c['base']}"
                for c in raw_metar_dict.get("clouds", [])
            ]
            raw_report = parsed.get("raw_metar")

        elif report_type == "TAF":
            try:
                raw_taf_dict = await get_taf(icao)
            except Exception as taf_err:
                raise HTTPException(
                    status_code=404,
                    detail=f"No TAF forecast found for {icao}: {taf_err}"
                )

            if not raw_taf_dict:
                raise HTTPException(
                    status_code=404,
                    detail=f"No TAF forecast found for {icao}."
                )

            parsed = parse_taf(raw_taf_dict)
            if not parsed:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse TAF data for {icao}."
                )
            raw_report = parsed.get("raw_taf")

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported report type: {report_type}. Must be METAR or TAF."
            )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"External weather service error: {str(exc)}"
        )

    # Generate plain-English briefing from parsed data only
    summary_output, status = await generate_plain_english_briefing(
        parsed_data=parsed,
        report_type=report_type,
        raw_report=raw_report
    )

    # Verification layer: compare numeric claims & check forbidden phrases
    verification = verify_briefing(
        output=summary_output,
        parsed_data=parsed,
        report_type=report_type
    )

    return BriefingSummaryResponse(
        icao=icao,
        report_type=report_type,
        raw_report=raw_report,
        parsed_data=parsed,
        summary=summary_output,
        verification=verification,
        status=status,
    )
